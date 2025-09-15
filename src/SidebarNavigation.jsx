import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  CpuChipIcon,
  Squares2X2Icon,
  XMarkIcon,
  Bars3Icon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const SidebarNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home',   label: 'Home',         icon: HomeIcon,       path: '/mapbox' },
    { id: 'upload', label: 'Upload Model', icon: ArrowUpTrayIcon, path: '/model-upload' },
    { id: 'ai',     label: 'AI Model',     icon: CpuChipIcon,    path: '/ai-upload' },
    { id: 'layers', label: 'Layers',       icon: Squares2X2Icon, path: '/mapbox' }, // special
  ];

  const settingsItems = [
    { id: 'settings', label: 'Settings',       icon: Cog6ToothIcon,         path: '/settings' },
    { id: 'help',     label: 'Help & Support', icon: QuestionMarkCircleIcon, path: '/help' },
  ];

  const handleNavigation = (item) => {
    if (item.id === 'layers') {
      if (location.pathname === '/mapbox') {
        // Already on map page → open instantly
        window.dispatchEvent(new CustomEvent('open-layers-panel', { detail: { tab: 'geojson' } }));
      } else {
        // Coming from elsewhere → set flag and navigate
        sessionStorage.setItem('open_layers_panel', 'geojson');
        navigate('/mapbox');
      }
    } else {
      navigate(item.path);
    }
    setIsOpen(false);
  };

  const isActive = (item) => {
    if (item.id === 'layers') {
      return location.pathname === '/mapbox';
    }
    if (item.id === 'home') {
      return location.pathname === '/mapbox';
    }
    return location.pathname === item.path;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white md:hidden"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto flex flex-col`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-white md:hidden"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Prodigal</h1>
        </div>

        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors
                      ${active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <ul className="space-y-2">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors
                      ${active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SidebarNavigation;