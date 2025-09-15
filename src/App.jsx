// App.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import MapboxApp from './MapboxApp';
import Header from './Header';
import UploadModelPage from './UploadModelPage';
import AiModelPage from './AiModelPage';
import SidebarNavigation from './SidebarNavigation';
import './App.css';
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  
  return (
    <div className="App">
      { 
        (location?.pathname !== '/') &&  
        <Header
          isNotificationOpen={false} 
          progress={0}
          converted={false}
          setIsNotificationOpen={() => {}}
          showLoader={false}
        />
      }
      
      <div className="flex">
        {/* Show sidebar on all pages except landing */}
        {location?.pathname !== '/' && <SidebarNavigation />}
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/mapbox" element={<MapboxApp />} />
            <Route path="/model-upload" element={<UploadModelPage />} />
            <Route path="/ai-upload" element={<AiModelPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;