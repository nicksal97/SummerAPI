import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MapboxMap from './Mapbox';
import Sidebar from './Sidebar';
import { db } from './firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import './App.css';
import Header from './Header';

const USE_SUFFIX_FOR_DUPLICATES = false; // set true to keep both "output", "output (2)" etc.

const MapboxApp = () => {
  const [layers, setLayers] = useState([]);
  const [tiffLayers, setTiffLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState('');
  const [zoomToLayerId, setZoomToLayerId] = useState(null);
  const [Rasterzoomid, setRasterzoomid] = useState(null);
  const [activeSection, setActiveSection] = useState('geojson'); // 'geojson' | 'tiff'
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [converted, setConverted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation();

  // --- open Layers via session flag (from sidebar) ---
  useEffect(() => {
    const flag = sessionStorage.getItem('open_layers_panel');
    if (flag) {
      sessionStorage.removeItem('open_layers_panel');
      setIsSidebarOpen(true);
      setActiveSection(flag === 'tiff' ? 'tiff' : 'geojson');
    }
  }, []);

  // --- open Layers via in-app event (when already on /mapbox) ---
  useEffect(() => {
    const openHandler = (e) => {
      setIsSidebarOpen(true);
      setActiveSection(e?.detail?.tab === 'tiff' ? 'tiff' : 'geojson');
    };
    window.addEventListener('open-layers-panel', openHandler);
    return () => window.removeEventListener('open-layers-panel', openHandler);
  }, []);

  // ---- Safe fetchers: fail soft when nodeback SSL is bad/offline ----
  const safeFetchJSON = async (url) => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Skipping remote fetch (${url}):`, err?.message || err);
      return null; // caller handles null
    }
  };

  const fetchPostGislayers = async () => {
    const data = await safeFetchJSON('https://nodeback.duckdns.org/api/layers');
    if (Array.isArray(data)) setLayers(data);
  };

  const fetchTiffLayers = async () => {
    const data = await safeFetchJSON('https://nodeback.duckdns.org/api/tiff-layers');
    if (Array.isArray(data)) setTiffLayers(data);
  };

  useEffect(() => {
    fetchPostGislayers();
    fetchTiffLayers();
  }, []);

  // ---- Duplicate naming helpers ----
  const ensureUniqueName = (baseName) => {
    if (!USE_SUFFIX_FOR_DUPLICATES) return baseName;
    const names = new Set(layers.map((l) => l.name));
    if (!names.has(baseName)) return baseName;
    let i = 2;
    let candidate = `${baseName} (${i})`;
    while (names.has(candidate)) {
      i += 1;
      candidate = `${baseName} (${i})`;
    }
    return candidate;
  };

  // ---- Upload/Replace GeoJSON layer ----
  const handleGeoJsonUpload = async (geojson, name) => {
    const existing = layers.find((l) => l.name === name);

    if (existing && !USE_SUFFIX_FOR_DUPLICATES) {
      // Replace in place (preserve id/visibility)
      setLayers((prev) =>
        prev.map((l) =>
          l.name === name ? { ...l, data: geojson, visible: true } : l
        )
      );
      setZoomToLayerId(existing.id); // zoom to replaced
      return;
    }

    // Create new
    const finalName = ensureUniqueName(name);
    const id = `layer-${Date.now()}`;
    const newLayer = { id, data: geojson, name: finalName, visible: true };
    setLayers((prev) => [...prev, newLayer]);
    setZoomToLayerId(id);
  };

  // ---- Delete layer: remove locally even if Firestore denies ----
  const handleDeleteLayer = async (id) => {
    try {
      await deleteDoc(doc(db, 'layers', id));
    } catch (error) {
      console.warn('Firestore delete failed, removing locally:', error?.message || error);
    } finally {
      setLayers((prev) => prev.filter((l) => l.id !== id));
    }
  };

  // ---- Simple local file input handler for GeoJSON/TIFF sidebar "+" ----
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.name.toLowerCase().endsWith('.geojson')) {
        const text = await file.text();
        const geo = JSON.parse(text);
        handleGeoJsonUpload(geo, file.name.replace(/\.geojson$/i, ''));
      } else {
        // TODO: wire your TIFF upload if needed
        console.log('TIFF upload not wired here.');
      }
    } catch (err) {
      console.error('Invalid file:', err);
    }
    e.target.value = '';
  };

  return (
    <>
      <Header
        isNotificationOpen={isNotificationOpen}
        progress={isUploading ? progress : 0}
        converted={converted}
        setIsNotificationOpen={setIsNotificationOpen}
        showLoader={isUploading}
        onBurgerClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setIsSidebarOpen}
          onGeoJsonUpload={handleGeoJsonUpload}
          layers={layers}
          onToggleLayer={(id) =>
            setLayers((prev) =>
              prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
            )
          }
          onDeleteLayer={handleDeleteLayer}
          setSelectedLayerId={setSelectedLayerId}
          handleClickZoom={(id) => setZoomToLayerId(id)}
          tiffLayers={tiffLayers}
          onFileChange={onFileChange}
          setTiffLayers={setTiffLayers}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
          handleRasterZoom={setRasterzoomid}
          handleDeleteTiffLayer={() => {}}
        />

        <div className="flex-1">
          <MapboxMap
            layers={layers}
            zoomid={zoomToLayerId}
            setZoom={setZoomToLayerId}
            Rasterzoomid={Rasterzoomid}
            setRasterzoomid={setRasterzoomid}
            tiffLayers={tiffLayers}
          />
        </div>
      </div>
    </>
  );
};

export default MapboxApp;