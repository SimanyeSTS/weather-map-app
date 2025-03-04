import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const LocateButton = ({ onLocate, darkMode }) => {
  const map = useMap();

  const handleLocate = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }

    const defaultLocation = { lat: -33.9249, lng: 18.4241 };
    const currentZoom = map.getZoom();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userLocation = { lat: latitude, lng: longitude };

          map.dragging.disable();

          map.flyTo([latitude, longitude], currentZoom, {
            animate: true,
            duration: 0.5,
            easeLinearity: 0.25
          });

          setTimeout(() => {
            map.dragging.enable();
          }, 600);

          onLocate(userLocation);
        },
        (error) => {
          Swal.fire({
            icon: 'warning',
            title: 'Location Not Found',
            text: `Unable to retrieve your current location. ${error.message}. Defaulting to Cape Town.`,
            confirmButtonColor: darkMode ? '#4CA1AF' : '#2C3E50',
            background: darkMode ? '#333' : '#f5f5f5',
            color: darkMode ? '#f5f5f5' : '#333',
          }).then(() => {
            map.dragging.disable();

            map.flyTo([defaultLocation.lat, defaultLocation.lng], currentZoom, {
              animate: true,
              duration: 0.5,
              easeLinearity: 0.25
            });

            setTimeout(() => {
              map.dragging.enable();
            }, 600);

            onLocate(defaultLocation);
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Geolocation Not Supported',
        text: 'Your browser does not support geolocation. Defaulting to Cape Town.',
        confirmButtonColor: darkMode ? '#4CA1AF' : '#2C3E50',
        background: darkMode ? '#333' : '#f5f5f5',
        color: darkMode ? '#f5f5f5' : '#333',
      }).then(() => {
        map.dragging.disable();

        map.flyTo([defaultLocation.lat, defaultLocation.lng], currentZoom, {
          animate: true,
          duration: 0.5,
          easeLinearity: 0.25
        });

        setTimeout(() => {
          map.dragging.enable();
        }, 600);

        onLocate(defaultLocation);
      });
    }
  };

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
      title="Locate Me"
      className="locate-button" 
      style={{
        position: 'absolute', 
        bottom: '20px', 
        left: '20px', 
        zIndex: 2000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        color: darkMode ? '#FF5D5D' : '#007BFF',
        borderRadius: '50%',
        width: '50px',  
        height: '50px', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)', 
        border: `2px solid ${darkMode ? '#FF5D5D' : '#007BFF'}`,
        transition: 'transform 0.1s ease'
      }}
      onClick={handleLocate}
      onTouchStart={(e) => {
        e.preventDefault();
        handleLocate(e);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {locationIcon}
    </div>
  );
};

function App() {
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mapCenter, setMapCenter] = useState([-33.9249, 18.4241]); // Default to Cape Town
  const [modeToggled, setModeToggled] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [clearInput, setClearInput] = useState(false);
  const mapRef = useRef(null);

  const showSpinner = () => setLoading(true);
  const hideSpinner = () => setLoading(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const savedToggle = localStorage.getItem('modeToggled') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedMode !== null && savedToggle) {
      setDarkMode(savedMode === 'true');
    } else {
      setDarkMode(systemPrefersDark);
    }

    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const storedLocation = localStorage.getItem('selectedLocation');
    if (storedLocation) {
      setPreviousLocation(JSON.parse(storedLocation));
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
      setClearInput(true);
      const map = mapRef.current;

      const currentZoom = preserveZoom && map ? map.getZoom() : zoomLevel;

      setPosition(latlng);

      const currentCenter = map ? map.getCenter() : null;
      const centerChanged = !currentCenter || 
        Math.abs(currentCenter.lat - latlng.lat) > 0.0001 || 
        Math.abs(currentCenter.lng - latlng.lng) > 0.0001;

      if (centerChanged) {
        map.flyTo([latlng.lat, latlng.lng], currentZoom, {
          animate: true,
          duration: 0.5
        });
      }

      setMapCenter([latlng.lat, latlng.lng]);
      setPreviousLocation(latlng);
      localStorage.setItem('selectedLocation', JSON.stringify(latlng));

      showSpinner();

      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latlng.lat}&lon=${latlng.lng}&appid=${
            import.meta.env.VITE_OPENWEATHER_API_KEY
          }&units=metric`
        );
        setWeather(response.data);
        localStorage.setItem('weatherData', JSON.stringify(response.data));
      } catch (error) {
        let errorMessage = 'An error occurred while fetching weather data.';
        if (error.response && error.response.status === 404) {
          errorMessage = 'Location not found. Please ensure the coordinates are correct.';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          ...getSwalStyling(),
        });
      } finally {
        hideSpinner();
      }
    },
    [getSwalStyling, zoomLevel]
  );

  useEffect(() => {
    const storedWeather = localStorage.getItem('weatherData');

    if (!previousLocation) {
      if (navigator.geolocation) {
        showSpinner();
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const userLocation = { lat: latitude, lng: longitude };
            handleLocationSelect(userLocation);
          },
          (error) => {
            hideSpinner();
            Swal.fire({
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
    } else if (modeToggled && previousLocation) {
      setPosition(previousLocation);
      setMapCenter([previousLocation.lat, previousLocation.lng]);
      if (storedWeather) {
        setWeather(JSON.parse(storedWeather));
      }
    }
  }, [handleLocationSelect, getSwalStyling, modeToggled, previousLocation]);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const lightModeColor = '#f5f5f5';
      const darkModeColor = '#333';

      metaThemeColor.setAttribute('content', darkMode ? darkModeColor : lightModeColor);
    }
  }, [darkMode]);

  const handleSearch = async (query) => {
    setClearInput(false);
    if (!query.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Required',
        text: 'Please enter a city name.',
        ...getSwalStyling(),
      });
      return;
    }

    showSpinner();
    setModeToggled(false);

    try {
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );

      if (geoResponse.data && geoResponse.data.length > 0) {
        const { lat, lon } = geoResponse.data[0];
        const searchedLocation = { lat, lng: lon };
        handleLocationSelect(searchedLocation, true);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Location Not Found',
          text: 'Location not found. Please try another search.',
          ...getSwalStyling(),
        });
      }
    } catch (error) {
      let errorMessage = 'Error searching for location.';
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `${errorMessage} Please try again.`,
        ...getSwalStyling(),
      });
    } finally {
      hideSpinner();
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    setModeToggled(true);
    localStorage.setItem('darkMode', newMode.toString());
    localStorage.setItem('modeToggled', 'true');
    document.body.classList.toggle('dark-mode', newMode);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="controls">
        <SearchBar onSearch={handleSearch} clearInput={clearInput} />
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="content">
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={zoomLevel}
          className="map-container"
          whenCreated={(map) => {
            map.on('zoomend', () => setZoomLevel(map.getZoom()));
          }}
        >
          <TileLayer
            key={darkMode ? 'dark-tiles' : 'light-tiles'}
            url={
              darkMode
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors'
          />
          <CustomAttribution />
          <LocateButton 
            onLocate={(location) => {
              setModeToggled(false);
              handleLocationSelect(location);
            }} 
            darkMode={darkMode} 
          />
          <MapEvents
            onMapClick={(latlng) => {
              setModeToggled(false);
              handleLocationSelect(latlng, true);
            }}
          />
          {position && (
            <Marker position={position} icon={darkMode ? darkIcon : lightIcon}>
              <Popup>{weather?.name || 'Selected location'}</Popup>
            </Marker>
          )}
        </MapContainer>

        {weather && <WeatherSidebar weather={weather} loading={loading} />}
      </div>
      <Footer />
    </div>
  );
}

export default App;