import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Loader from './components/Loader';
import { BASE_URL } from './utils/constants';
import Header from './Header'; // ✅ reuse the same header (and logo) as home

const AiModelPage = () => {
  const [selectedModel, setSelectedModel] = useState('winter');
  const [modelNames, setModelNames] = useState([]);
  const [selectedModelName, setSelectedModelName] = useState('');
  const [tifFile, setTifFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [originalImages, setOriginalImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [geojsonPath, setGeojsonPath] = useState('');
  const [zipPath, setZipPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleTifChange = (e) => {
    setTifFile(e.target.files[0]);
    setZipFile(null);
  };

  const handleZipChange = (e) => {
    setZipFile(e.target.files[0]);
    setTifFile(null);
  };

  useEffect(() => {
    const id = sessionStorage.getItem('mapbox_unique');
    if (!id) {
      navigate('/');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchModelNames(selectedModel);
  }, [selectedModel]);

  const fetchModelNames = async (model) => {
    try {
      const response = await axios.get(`${BASE_URL}/model-upload1/?model=${model}`);
      setModelNames(response.data.model_path.filter((path) => path !== '.DS_Store'));
    } catch (error) {
      console.error('Error fetching model names:', error);
    }
  };

  const handleSubmit = async () => {
    if (!tifFile && !zipFile) {
      alert('Please select either a .zip file or a .tif file.');
      return;
    }

    const formData = new FormData();
    if (zipFile) formData.append('file', zipFile);
    if (tifFile) formData.append('tif_file', tifFile);
    formData.append('model', selectedModel);
    formData.append('model_name', selectedModelName);

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { geojson_path, input_image_list, output_image_list, zip_path } = response.data;

      setOriginalImages(input_image_list);
      setProcessedImages(output_image_list);
      setGeojsonPath(geojson_path);
      setZipPath(zip_path);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while processing the files.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        // Cool page background (no change to your components)
        <div
          className="min-h-screen"
          style={{
            background:
              'linear-gradient(135deg, rgba(14,165,233,0.14) 0%, rgba(34,211,238,0.14) 45%, rgba(167,139,250,0.14) 100%)',
          }}
        >
          {/* ✅ EXACT same header/logo as home page */}
          <Header
            isNotificationOpen={false}
            progress={0}
            converted={false}
            setIsNotificationOpen={() => {}}
            showLoader={false}
            onBurgerClick={() => {}}
          />

          {/* Add top padding so content never hides under the (likely fixed) header */}
          <div className="container" style={{ paddingTop: '80px', paddingBottom: '24px' }}>
            {/* Original form (unchanged, just lightly tinted container) */}
            <form className="d-flex flex-column gap-3 mx-auto mb-4" style={{ maxWidth: 500 }}>
              <div
                className="rounded-3 shadow p-3 p-sm-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(6,182,212,0.12))',
                  border: '1px solid rgba(255,255,255,0.35)',
                }}
              >
                <h1 className="text-center mb-3">TREE PROJECT</h1>

                <div className="form-group">
                  <label htmlFor="model">Select Model Type:</label>
                  <select
                    className="form-control"
                    id="model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="winter">Winter</option>
                    <option value="summer">Summer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="model_name">Select Model Name:</label>
                  <select
                    className="form-control"
                    id="model_name"
                    value={selectedModelName}
                    onChange={(e) => setSelectedModelName(e.target.value)}
                  >
                    <option value="">Select a model</option>
                    {modelNames.map((name, index) => (
                      <option key={index} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {!zipFile && (
                  <div className="form-group">
                    <label htmlFor="tif_file">Select TIF File:</label>
                    <input
                      type="file"
                      className="form-control"
                      id="tif_file"
                      onChange={handleTifChange}
                      accept=".tif"
                    />
                  </div>
                )}

                {!tifFile && (
                  <div className="form-group">
                    <label htmlFor="file">Select ZIP Folder:</label>
                    <input
                      type="file"
                      className="form-control"
                      id="file"
                      onChange={handleZipChange}
                      accept=".zip"
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </form>

            {/* Results area (unchanged, lightly tinted cards) */}
            <div id="main_container" className="container px-0">
              <div className="row gy-3">
                <div className="col">
                  <div
                    className="rounded-3 shadow p-3 h-100"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(99,102,241,0.10))',
                      border: '1px solid rgba(255,255,255,0.35)',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <h3 className="mb-2">Original Images</h3>
                      {zipPath ? (
                        <a
                          id="download-zip"
                          href={`${BASE_URL}${zipPath}`}
                          download="output.zip"
                          className="btn btn-sm btn-primary"
                          style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                        >
                          Zip-File-Download
                        </a>
                      ) : null}
                    </div>
                    <div id="original-images" className="ScrollStyle" style={{ maxHeight: 420, overflowY: 'auto' }}>
                      {originalImages?.map((image, index) => (
                        <img
                          key={index}
                          src={`${BASE_URL}${image}`}
                          alt="original"
                          className="img-fluid mb-2 rounded"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div
                    className="rounded-3 shadow p-3 h-100"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(34,197,94,0.10), rgba(6,182,212,0.10))',
                      border: '1px solid rgba(255,255,255,0.35)',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <h3 className="mb-2">Processed Images</h3>
                      {geojsonPath ? (
                        <a
                          id="download-geojson"
                          href={`${BASE_URL}${geojsonPath}`}
                          download="output.geojson"
                          className="btn btn-sm btn-primary"
                          style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                        >
                          GeoJSON-Download
                        </a>
                      ) : null}
                    </div>
                    <div id="processed-images" className="ScrollStyle" style={{ maxHeight: 420, overflowY: 'auto' }}>
                      {processedImages.map((image, index) => (
                        <img
                          key={index}
                          src={`${BASE_URL}${image}`}
                          alt="processed"
                          className="img-fluid mb-2 rounded"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div id="model-name" className="text-center mt-3">
                Model Used: {selectedModel}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiModelPage;
