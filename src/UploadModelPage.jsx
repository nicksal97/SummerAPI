import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "./components/Loader";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "./utils/constants";
import Header from "./Header"; // ✅ use the same header/logo

const UploadModelPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("winter");
  const [file, setFile] = useState(null);
  const [summerFiles, setSummerFiles] = useState([]); 
  const [winterFiles, setWinterFiles] = useState([]);
  const [Loading, setLoading] = useState(true);

  useEffect(() => {
    const id = sessionStorage.getItem('mapbox_unique');
    if(!id) {
      navigate('/');
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    fetchModelNames(e.target.value);
  };

  useEffect(() => {
    const fetchModelData = async () => {
      axios
        .get(`${BASE_URL}/model-upload/?model=winter`)
        .then((res) => {
          if (res.status === 200) {
            setSummerFiles(res?.data?.summer_path);
            setWinterFiles(res?.data?.winter_path);
          }
        })
        .catch(() => {});
    };
    fetchModelData();
  }, []);

  const fetchModelNames = async (model) => {
    axios.get(`${BASE_URL}/model-upload/?model=${model}`)
      .then((res) => {
        if (res.status === 200) {
          setSummerFiles(res?.data?.summer_path);
          setWinterFiles(res?.data?.winter_path);
        }
      })
      .catch(() => {});
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select the model path");
      return;
    }

    const formData = new FormData();
    formData.append("model_path", file);
    formData.append("model", selectedModel);

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/model-upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        alert("Model Uploaded Successfully");
        fetchModelNames(selectedModel);
      } else {
        alert("Please send a valid model path");
      }
    } catch (error) {
      console.error("Error uploading model:", error);
      alert("An error occurred while uploading the model.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (filename, type) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        const response = await axios.postForm(`${BASE_URL}/delete-file/`, {
          filename,
          type,
        });

        if (response.data.success) {
          alert(`${filename} deleted successfully.`);
          if (type === "summer") {
            setSummerFiles((prev) => prev.filter((f) => f !== filename));
          } else {
            setWinterFiles((prev) => prev.filter((f) => f !== filename));
          }
        } else {
          alert(`Error deleting file: ${response.data.error}`);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      {Loading ? (
        <Loader />
      ) : (
        <div
          className="min-h-screen"
          style={{
            background:
              "linear-gradient(135deg, rgba(14,165,233,0.14) 0%, rgba(34,211,238,0.14) 45%, rgba(167,139,250,0.14) 100%)",
          }}
        >
          {/* ✅ same header/logo as main + AI page */}
          <Header
            isNotificationOpen={false}
            progress={0}
            converted={false}
            setIsNotificationOpen={() => {}}
            showLoader={false}
            onBurgerClick={() => {}}
          />

          {isLoading && <Loader />}

          {/* add top padding so content isn't hidden by header */}
          <div className="container pt-5" style={{ paddingTop: "80px", paddingBottom: "24px" }}>
            {/* Upload form card */}
            <form>
              <div
                className="max-w-xl mx-auto rounded-3 shadow p-4 p-sm-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(6,182,212,0.12))",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                <h2 className="text-center mb-3 fw-bold text-dark">Upload Model</h2>

                <div className="d-flex flex-column gap-3">
                  <div className="form-group w-100">
                    <label htmlFor="model" className="w-100">Select Model Type:</label>
                    <select
                      className="form-control"
                      id="model"
                      value={selectedModel}
                      onChange={handleModelChange}
                    >
                      <option value="winter">Winter</option>
                      <option value="summer">Summer</option>
                    </select>
                  </div>

                  <div className="form-group w-100">
                    <label className="w-100">Select Model Path:</label>
                    <input
                      type="file"
                      className="form-control"
                      id="model_path"
                      onChange={handleFileChange}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>

            {/* File lists */}
            <div className="mt-4 mt-md-5 d-flex flex-column flex-sm-row gap-4 w-100">
              <div
                className="flex-fill rounded-3 p-3 shadow"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(99,102,241,0.10))",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                <h3 className="h6 mb-2">Files in Summer Models Directory</h3>
                <ul id="summer-file-list" className="list-group">
                  {summerFiles.length > 0 ? (
                    summerFiles.map((item, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {item}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFile(item, "summer")}
                        >
                          Delete
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item">No files found</li>
                  )}
                </ul>
              </div>

              <div
                className="flex-fill rounded-3 p-3 shadow"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(6,182,212,0.10))",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                <h3 className="h6 mb-2">Files in Winter Models Directory</h3>
                <ul id="winter-file-list" className="list-group">
                  {winterFiles.length > 0 ? (
                    winterFiles.map((item, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {item}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFile(item, "winter")}
                        >
                          Delete
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item">No files found</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadModelPage;
