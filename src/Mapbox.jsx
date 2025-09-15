// src/Mapbox.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';
import ThemeSelector from './ThemeSwitcher';
import { useNavigate } from 'react-router-dom';
import Loader from './components/Loader';

mapboxgl.accessToken =
  'pk.eyJ1IjoibWlya2hhZ2FuIiwiYSI6ImNtMDQzYnBtNjAycmkyanNibXRvaTg3dDIifQ.PPYVLIlidbRLbaiaHiie2g';

const MapboxMap = ({
  layers,
  zoomid,
  setZoom,
  Rasterzoomid,
  tiffLayers,
  setRasterzoomid,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [Loading, setLoading] = useState(true);

  // ---------- Auth guard ----------
  useEffect(() => {
    const id = sessionStorage.getItem('mapbox_unique');
    if (!id) navigate('/');
    setLoading(false);
  }, [navigate]);

  // ---------- CRS helpers (only convert if clearly 3857) ----------
  const epsg3857toEpsg4326 = (pos) => {
    let [x, y] = pos;
    x = (x * 180) / 20037508.34;
    y = (y * 180) / 20037508.34;
    y = (Math.atan(Math.exp((y * Math.PI) / 180)) * 360) / Math.PI - 90;
    return [x, y];
  };
  const to4326IfNeeded = (pair) =>
    Math.abs(pair?.[0]) > 180 || Math.abs(pair?.[1]) > 90 ? epsg3857toEpsg4326(pair) : pair;

  // ---------- Collect ALL coordinates from any geometry (Point/Line/Polygon/Multi*) ----------
  const collectCoords = (geometry) => {
    const out = [];
    const walk = (coords) => {
      if (!coords) return;
      if (Array.isArray(coords) && typeof coords[0] === 'number') {
        out.push(to4326IfNeeded(coords));
        return;
      }
      if (Array.isArray(coords)) coords.forEach(walk);
    };
    if (geometry) walk(geometry.coordinates);
    return out;
  };

  // (noop converter — we normalize during collection)
  const convertGeoJSON = (gj) => gj;

  // ---------- Init map ----------
  const initializeMap = useCallback(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
      // Small resize to avoid initial layout hiccup
      setTimeout(() => map.resize(), 300);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(initializeMap, 100);
    return () => clearTimeout(t);
  }, [initializeMap]);

  // ---------- Fit logic: single point => center/zoom, else fit bounds ----------
  const fitToFeatureCollection = useCallback((fc) => {
    const map = mapRef.current;
    if (!map || !fc?.features?.length) return;

    const coords = [];
    fc.features.forEach((f) => {
      const c = collectCoords(f.geometry);
      if (c?.length) coords.push(...c);
    });

    if (!coords.length) return;

    if (coords.length === 1) {
      map.easeTo({
        center: coords[0],
        zoom: 13, // adjust if you want tighter/looser
        duration: 300,
      });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    coords.forEach((c) => bounds.extend(c));
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 300 });
    }
  }, []);

  // ---------- Paint/update all layers ----------
  const updateMapLayers = useCallback(() => {
    if (!mapLoaded) return;
    const map = mapRef.current;
    if (!map) return;

    // ===== Raster (TIFF via tiles) =====
    tiffLayers?.forEach((tiff) => {
      const { id, mapboxUrl } = tiff || {};
      if (!id || !mapboxUrl) return;

      const srcId = `raster-layer-${id}`;
      if (!map.getSource(srcId)) {
        map.addSource(srcId, { type: 'raster', tiles: [mapboxUrl], tileSize: 512 });
      }
      if (!map.getLayer(srcId)) {
        map.addLayer({ id: srcId, type: 'raster', source: srcId, layout: { visibility: 'visible' } });
      }
    });

    // ===== Vector GeoJSON =====
    layers?.forEach((layer) => {
      const base = `geojson-layer-${layer.id}`;
      const data = convertGeoJSON(layer.data);
      const visible = layer.visible ? 'visible' : 'none';

      const points = {
        type: 'FeatureCollection',
        features: data?.features?.filter((f) => f.geometry?.type === 'Point') ?? [],
      };
      const lines = {
        type: 'FeatureCollection',
        features:
          data?.features?.filter((f) =>
            ['LineString', 'MultiLineString'].includes(f.geometry?.type)
          ) ?? [],
      };
      const polys = {
        type: 'FeatureCollection',
        features:
          data?.features?.filter((f) =>
            ['Polygon', 'MultiPolygon'].includes(f.geometry?.type)
          ) ?? [],
      };

      const ensureSource = (id, fc) => {
        if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: fc });
        else map.getSource(id).setData(fc);
      };
      const ensureLayer = (id, type, src, paint) => {
        if (!map.getLayer(id)) {
          map.addLayer({ id, type, source: src, paint, layout: { visibility: visible } });
        } else {
          map.setLayoutProperty(id, 'visibility', visible);
          Object.entries(paint).forEach(([k, v]) => map.setPaintProperty(id, k, v));
        }
      };

      // 1) Polygons (fill + border)
      if (polys.features.length) {
        const fillId = `${base}-polygons`;
        const borderId = `${base}-border`;
        ensureSource(fillId, polys);
        ensureLayer(fillId, 'fill', fillId, { 'fill-color': '#22c55e', 'fill-opacity': 0.35 });
        ensureSource(borderId, polys);
        ensureLayer(borderId, 'line', borderId, { 'line-color': '#16a34a', 'line-width': 2 });

        const clickHandler = (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const area = parseFloat(feature.properties?.area);
          const displayArea = isNaN(area)
            ? "Area's information not available"
            : `${area.toFixed(2)} m²`;
          new mapboxgl.Popup({ closeButton: true, closeOnClick: true, offset: [0, -10] })
            .setLngLat(e.lngLat)
            .setHTML(`<div style="text-align:center;"><strong>Area:</strong> ${displayArea}</div>`)
            .addTo(map);
        };
        map.off('click', fillId, clickHandler);
        map.on('click', fillId, clickHandler);
      }

      // 2) Lines
      if (lines.features.length) {
        const id = `${base}-lines`;
        ensureSource(id, lines);
        ensureLayer(id, 'line', id, { 'line-color': '#2563eb', 'line-width': 2 });
      }

      // 3) Points (add LAST so they sit on top; outline + zoom-scaled radius)
      if (points.features.length) {
        const id = `${base}-points`;
        ensureSource(id, points);
        ensureLayer(id, 'circle', id, {
          'circle-color': '#FF3B30',
          'circle-opacity': 0.95,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 1.5,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 3,
            6, 5,
            10, 7,
            14, 9,
          ],
        });
        try {
          map.moveLayer(id); // keep points on top
        } catch (_) {}
      }
    });
  }, [layers, tiffLayers, mapLoaded]);

  // Apply layers initially + on changes
  useEffect(() => {
    updateMapLayers();
  }, [updateMapLayers]);

  // ---------- Zoom triggers ----------
  // GeoJSON
  useEffect(() => {
    if (!mapLoaded || !zoomid) return;
    const selected = layers?.find((l) => l.id === zoomid);
    if (selected?.data) fitToFeatureCollection(selected.data);
    setZoom?.(null);
  }, [zoomid, mapLoaded, layers, fitToFeatureCollection, setZoom]);

  // TIFF
  useEffect(() => {
    if (!Rasterzoomid || !mapLoaded) return;
    const map = mapRef.current;
    const selected = tiffLayers?.find((t) => t.id === Rasterzoomid);
    if (selected?.boundingBox) {
      const { minx, miny, maxx, maxy } = selected.boundingBox;
      map.fitBounds([[+minx, +miny], [+maxx, +maxy]], {
        padding: { top: 10, bottom: 10, left: 10, right: 10 },
        maxZoom: 15,
        duration: 300,
      });
    }
    setRasterzoomid?.(null);
  }, [Rasterzoomid, tiffLayers, mapLoaded, setRasterzoomid]);

  // ---------- Theme switch ----------
  const handleThemeChange = (newTheme) => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(`mapbox://styles/mapbox/${newTheme}`);
    // Style reload clears layers → repaint
    map.once('styledata', () => updateMapLayers());
  };

  // ---------- Render ----------
  return (
    <>
      {Loading ? (
        <Loader />
      ) : (
        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className="map-container" />
          <ThemeSelector onThemeChange={handleThemeChange} />
        </div>
      )}
    </>
  );
};

export default MapboxMap;