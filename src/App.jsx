import React, { useState, useEffect, useCallback, useRef, useReducer, createContext, useContext } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';
import Swal from 'sweetalert2';
import SearchBar from './components/SearchBar';
import WeatherSidebar from './components/WeatherSidebar';
import Footer from './components/Footer';
import CustomAttribution from './components/CustomAttribution';

const ThemeContext = createContext();

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, darkMode: !state.darkMode, useSystemTheme: false };
    case 'SET_SYSTEM_THEME':
      return { ...state, darkMode: action.payload, useSystemTheme: true };
    case 'SET_USER_THEME':
      return { ...state, darkMode: action.payload, useSystemTheme: false };
    default:
      return state;
  }
};

const getInitialThemeState = () => {
  const useSystemTheme = sessionStorage.getItem("useSystemTheme") === "true" || 
                         sessionStorage.getItem("useSystemTheme") === null;
  
  const storedTheme = localStorage.getItem("darkMode") === "true";
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return {
    darkMode: useSystemTheme ? systemPrefersDark : storedTheme,
    useSystemTheme
  };
};

const lightIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const darkIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapEvents = ({ onMapClick, disabled }) => {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const LocateButton = ({ onLocate, darkMode, disabled }) => {
  const map = useMap();
  const buttonRef = useRef(null);

  const getGeolocation = async () => {
    if (disabled) return;

    const defaultLocation = { lat: -33.9249, lng: 18.4241 };
    const currentZoom = map.getZoom();

    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };

        map.dragging.disable();

        map.flyTo([latitude, longitude], currentZoom, {
          animate: true,
          duration: 0.5,
          easeLinearity: 0.25,
        });

        setTimeout(() => {
          map.dragging.enable();
        }, 600);

        onLocate(userLocation);
      } catch (error) {
        await Swal.fire({
          icon: 'warning',
          title: 'Location Not Found',
          text: `Unable to retrieve your current location. ${error.message}. Defaulting to Cape Town.`,
          confirmButtonColor: darkMode ? '#4CA1AF' : '#2C3E50',
          background: darkMode ? '#333' : '#f5f5f5',
          color: darkMode ? '#f5f5f5' : '#333',
        });

        map.dragging.disable();

        map.flyTo([defaultLocation.lat, defaultLocation.lng], currentZoom, {
          animate: true,
          duration: 0.5,
          easeLinearity: 0.25,
        });

        setTimeout(() => {
          map.dragging.enable();
        }, 600);

        onLocate(defaultLocation);
      }
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Geolocation Not Supported',
        text: 'Your browser does not support geolocation. Defaulting to Cape Town.',
        confirmButtonColor: darkMode ? '#4CA1AF' : '#2C3E50',
        background: darkMode ? '#333' : '#f5f5f5',
        color: darkMode ? '#f5f5f5' : '#333',
      });

      map.dragging.disable();

      map.flyTo([defaultLocation.lat, defaultLocation.lng], currentZoom, {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.25,
      });

      setTimeout(() => {
        map.dragging.enable();
      }, 600);

      onLocate(defaultLocation);
    }
  };

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.nativeEvent) {
        e.nativeEvent.preventDefault();
        e.nativeEvent.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }

      if (!disabled) {
        getGeolocation();
      }

      return false;
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        button.style.transform = 'scale(0.95)';
      }
      return false;
    };

    const handleMouseUp = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        button.style.transform = 'scale(1)';
      }
      return false;
    };

    button.addEventListener('click', handleButtonClick, { capture: true });
    button.addEventListener('mousedown', handleMouseDown, { capture: true });
    button.addEventListener('mouseup', handleMouseUp, { capture: true });
    button.addEventListener('touchstart', handleButtonClick, { capture: true });

    return () => {
      button.removeEventListener('click', handleButtonClick, { capture: true });
      button.removeEventListener('mousedown', handleMouseDown, { capture: true });
      button.removeEventListener('mouseup', handleMouseUp, { capture: true });
      button.removeEventListener('touchstart', handleButtonClick, { capture: true });
    };
  }, [disabled, darkMode, map]);

  const locationIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={darkMode ? '#FF5D5D' : '#007BFF'}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );

  return (
    <div
      ref={buttonRef}
      title="Locate Me"
      className={`locate-button ${disabled ? 'disabled' : ''}`}
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 10000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: darkMode ? '#FF5D5D' : '#007BFF',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        border: `2px solid ${darkMode ? '#FF5D5D' : '#007BFF'}`,
        transition: 'transform 0.1s ease',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: 'auto',
        isolation: 'isolate',
      }}
    >
      {locationIcon}
    </div>
  );
};

const MapController = ({ onMapInit }) => {
  const map = useMap();

  useEffect(() => {
    if (map && onMapInit) {
      onMapInit(map);
    }
  }, [map, onMapInit]);

  return null;
};

function App() {
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([-33.9249, 18.4241]);
  const [modeToggled, setModeToggled] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [clearInput, setClearInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [themeState, dispatchTheme] = useReducer(themeReducer, null, getInitialThemeState);
  const mapRef = useRef(null);
  const swalActiveRef = useRef(false);

  const { darkMode, useSystemTheme } = themeState;

  const showSpinner = () => setLoading(true);
  const hideSpinner = () => setLoading(false);

  useEffect(() => {
    if (!sessionStorage.getItem('pageLoaded')) {
      sessionStorage.setItem('pageLoaded', 'true');
      sessionStorage.setItem('useSystemTheme', 'true');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('darkMode', darkMode.toString());
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', darkMode ? '#333' : '#f5f5f5');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      if (useSystemTheme) {
        dispatchTheme({ type: 'SET_SYSTEM_THEME', payload: e.matches });
      }
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [useSystemTheme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.keyCode === 82)) {
        sessionStorage.setItem('useSystemTheme', 'true');
      }
    };
    
    const handleBeforeUnload = (e) => {
      if (e.ctrlKey && e.shiftKey) {
        sessionStorage.setItem('useSystemTheme', 'true');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const toggleDarkMode = () => {
    dispatchTheme({ type: 'TOGGLE_THEME' });
    sessionStorage.setItem('useSystemTheme', 'false');
    setModeToggled(true);
  };

  const showAlert = async (options) => {
    swalActiveRef.current = true;
    try {
      await Swal.fire(options);
    } finally {
      swalActiveRef.current = false;
      setHasError(false);
    }
  };

  const handleMapInit = useCallback((map) => {
    mapRef.current = map;
    map.on('zoomend', () => setZoomLevel(map.getZoom()));
    
    map.setMaxBounds([[-90, -Infinity], [90, Infinity]]);
    
    map.on('drag', () => {
      const center = map.getCenter();
      const wrappedLng = ((center.lng + 180) % 360) - 180;
      
      if (center.lng !== wrappedLng) {
        map.panTo([center.lat, wrappedLng], { animate: false });
      }
      
      const maxLat = 85;
      const minLat = -85;
      
      if (center.lat > maxLat || center.lat < minLat) {
        const clampedLat = Math.max(minLat, Math.min(maxLat, center.lat));
        map.panTo([clampedLat, center.lng], { animate: false });
      }
    });
    
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const maxLat = 85;
    const minLat = -85;

    const handleMoveEnd = () => {
      const { lat, lng } = map.getCenter();

      if (lat > maxLat || lat < minLat) {
        const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
        map.setView([clampedLat, lng], map.getZoom(), {
          animate: true,
          duration: 0.25,
        });
      }
    };

    const handleDrag = () => {
      const { lat, lng } = map.getCenter();
      
      if (lat > maxLat || lat < minLat) {
        const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
        map.panTo([clampedLat, lng], {
          animate: false
        });
      }
    };

    map.on('moveend', handleMoveEnd);
    map.on('drag', handleDrag);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('drag', handleDrag);
    };
  }, [mapRef.current]);

  useEffect(() => {
    const storedLocation = localStorage.getItem('selectedLocation');
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);
        setPreviousLocation(parsedLocation);
        setPosition(parsedLocation);
        setMapCenter([parsedLocation.lat, parsedLocation.lng]);
      } catch (e) {
        localStorage.removeItem('selectedLocation');
      }
    }

    const storedWeather = localStorage.getItem('weatherData');
    if (storedWeather) {
      try {
        setWeather(JSON.parse(storedWeather));
      } catch (e) {
        localStorage.removeItem('weatherData');
      }
    }
  }, []);

  const getSwalStyling = useCallback(
    () => ({
      background: darkMode ? '#333' : '#f5f5f5',
      color: darkMode ? '#f5f5f5' : '#333',
      confirmButtonColor: darkMode ? '#4CA1AF' : '#2C3E50',
      cancelButtonColor: darkMode ? '#dc3545' : '#ffc107',
    }),
    [darkMode]
  );

  const handleLocationSelect = useCallback(
    async (latlng, preserveZoom = true) => {
      if (isProcessing || swalActiveRef.current) {
        return;
      }

      setIsProcessing(true);
      setClearInput(true);
      setHasError(false);
      
      const map = mapRef.current;
      if (!map) {
        setIsProcessing(false);
        return;
      }

      setPosition(latlng);
      setWeather(null);

      showSpinner();

      try {
        const apiResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latlng.lat}&lon=${latlng.lng}&appid=${
            import.meta.env.VITE_OPENWEATHER_API_KEY
          }&units=metric`, 
          { timeout: 10000 }
        );
        
        setWeather(apiResponse.data);
        localStorage.setItem('weatherData', JSON.stringify(apiResponse.data));
        localStorage.setItem('selectedLocation', JSON.stringify(latlng));
        
        setPreviousLocation(latlng);
        
        const currentZoom = preserveZoom ? map.getZoom() : zoomLevel;
        
        map.flyTo([latlng.lat, latlng.lng], currentZoom, {
          animate: true,
          duration: 0.5,
        });
        
      } catch (error) {
        setHasError(true);
        
        let errorMessage = 'We couldn\'t find that location. Please check the coordinates and try again.';
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'We couldn\'t find that location. Please check the coordinates and try again.';
          } else if (error.response.status === 429) {
            errorMessage = 'You\'re making requests too quickly! Please wait a moment and try again.';
          } else if (error.response.status === 401) {
            errorMessage = 'We\'re having trouble connecting. Please try again later or contact support if the issue continues.';
          }
        } else if (error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
          errorMessage = 'Network error. Please check your internet connection.';
        }

        setWeather(null);
        
        await showAlert({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          ...getSwalStyling(),
        });
      } finally {
        hideSpinner();
        setIsProcessing(false);
      }
    },
    [getSwalStyling, zoomLevel, isProcessing]
  );

  useEffect(() => {
    if (!position && !previousLocation) {
      if (navigator.geolocation) {
        showSpinner();
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const userLocation = { lat: latitude, lng: longitude };
            handleLocationSelect(userLocation);
          },
          async (error) => {
            hideSpinner();
            await showAlert({
              icon: 'error',
              title: 'Location Error',
              text: `Unable to get your current location: ${error.message}. Defaulting to Cape Town.`,
              ...getSwalStyling(),
            });

            const defaultLocation = { lat: -33.9249, lng: 18.4241 };
            handleLocationSelect(defaultLocation);
          }
        );
      } else {
        const defaultLocation = { lat: -33.9249, lng: 18.4241 };
        handleLocationSelect(defaultLocation);
      }
    }
  }, [handleLocationSelect, getSwalStyling, previousLocation, position]);

  const handleSearch = async (query) => {
    if (isProcessing || swalActiveRef.current) {
      return;
    }
    
    setClearInput(false);
    setHasError(false);
    
    if (!query.trim()) {
      await showAlert({
        icon: 'warning',
        title: 'Input Required',
        text: 'Please enter a city name.',
        ...getSwalStyling(),
      });
      return;
    }

    setIsProcessing(true);
    showSpinner();
    setModeToggled(false);

    try {
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`,
        { timeout: 10000 }
      );

      if (geoResponse.data && geoResponse.data.length > 0) {
        const { lat, lon } = geoResponse.data[0];
        const searchedLocation = { lat, lng: lon };
        
        await handleLocationSelect(searchedLocation, true);
      } else {
        setHasError(true);
        
        await showAlert({
          icon: 'warning',
          title: 'Location Not Found',
          text: 'Location not found. Please try another search.',
          ...getSwalStyling(),
        });
      }
    } catch (error) {
      setHasError(true);
      
      let errorMessage = 'Error searching for location.';
      if (error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      await showAlert({
        icon: 'error',
        title: 'Error',
        text: `${errorMessage} Please try again.`,
        ...getSwalStyling(),
      });
    } finally {
      hideSpinner();
      setIsProcessing(false);
    }
  };

  // Provide theme context value
  const themeContextValue = {
    darkMode,
    useSystemTheme,
    toggleTheme: toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="controls">
          <SearchBar onSearch={handleSearch} clearInput={clearInput} disabled={isProcessing || swalActiveRef.current} />
          <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            disabled={isProcessing || swalActiveRef.current}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="content">
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          className="map-container"
          maxZoom={18}
          minZoom={2}
          worldCopyJump={true}
          maxBoundsViscosity={1.0}
        >
          <MapController onMapInit={handleMapInit} />
          <TileLayer
            key={darkMode ? 'dark-tiles' : 'light-tiles'}
            url={
              darkMode
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors'
            noWrap={false}
          />
          <CustomAttribution />
          <LocateButton
            onLocate={(location) => {
              setModeToggled(false);
              handleLocationSelect(location);
            }}
            darkMode={darkMode}
            disabled={isProcessing || swalActiveRef.current}
          />
          <MapEvents
            onMapClick={(latlng) => {
              setModeToggled(false);
              handleLocationSelect(latlng, true);
            }}
            disabled={isProcessing || swalActiveRef.current}
          />
          {position && (
            <Marker position={[position.lat, position.lng]} icon={darkMode ? darkIcon : lightIcon}>
              <Popup>{weather?.name || 'Selected location'}</Popup>
            </Marker>
          )}
        </MapContainer>

          {weather ? (
            <WeatherSidebar weather={weather} loading={loading} />
          ) : (
            <div className="sidebar">
              <div className="sidebar-header">
                <h2>Location Unknown</h2>
              </div>
              <div className="weather-main">
                <div className="temperature">N/A</div>
                <div className="description">No weather data available</div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;