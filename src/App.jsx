import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';
import Swal from 'sweetalert2';
import SearchBar from './components/SearchBar';
import WeatherSidebar from './components/WeatherSidebar';
import Footer from './components/Footer';

const lightIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const darkIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13, { animate: true });
  }, [center, map]);
  return null;
};

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

function App() {
  const [position, setPosition] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [mapCenter, setMapCenter] = useState([-33.9249, 18.4241]); // Default to Cape Town

  const showSpinner = () => setLoading(true);
  const hideSpinner = () => setLoading(false);

  const getSwalStyling = useCallback(() => ({
    background: darkMode ? '#333' : '#f5f5f5',
    color: darkMode ? '#f5f5f5' : '#333',
    confirmButtonColor: darkMode ? '#4CA1AF' : '#2C3E50',
    cancelButtonColor: darkMode ? '#dc3545' : '#ffc107',
  }), [darkMode]);

  const handleLocationSelect = useCallback(async (latlng) => {
    setPosition(latlng);
    setMapCenter([latlng.lat, latlng.lng]);
    
    localStorage.setItem('selectedLocation', JSON.stringify(latlng));

    showSpinner();

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latlng.lat}&lon=${latlng.lng}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
      );
      setWeather(response.data);

      localStorage.setItem('weatherData', JSON.stringify(response.data));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to fetch weather data: ${error.message}`,
        ...getSwalStyling(),
      });
    } finally {
      hideSpinner();
    }
  }, [getSwalStyling]);

  useEffect(() => {
    const storedLocation = localStorage.getItem('selectedLocation');
    const storedWeather = localStorage.getItem('weatherData');

    if (storedLocation) {
      const parsedLocation = JSON.parse(storedLocation);
      setPosition(parsedLocation);
      setMapCenter([parsedLocation.lat, parsedLocation.lng]);
    }

    if (storedWeather) {
      setWeather(JSON.parse(storedWeather));
    } else if (navigator.geolocation) {
      showSpinner();
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userLocation = { lat: latitude, lng: longitude };
          setMapCenter([latitude, longitude]);
          setPosition(userLocation);
          handleLocationSelect(userLocation);
        },
        (error) => {
          hideSpinner();
          Swal.fire({
            icon: 'error',
            title: 'Location Error',
            text: `Unable to get your current location: ${error.message}. Please search for a city manually.`,
            ...getSwalStyling(),
          });
        }
      );
    }
  }, [handleLocationSelect, getSwalStyling]);

  const handleSearch = async (query) => {
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

    try {
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );

      if (geoResponse.data && geoResponse.data.length > 0) {
        const { lat, lon } = geoResponse.data[0];
        const searchedLocation = { lat, lng: lon };
        setMapCenter([lat, lon]);
        setPosition(searchedLocation);
        localStorage.setItem('selectedLocation', JSON.stringify(searchedLocation));

        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
        );
        setWeather(weatherResponse.data);
        localStorage.setItem('weatherData', JSON.stringify(weatherResponse.data));
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Location Not Found',
          text: 'Location not found. Please try another search.',
          ...getSwalStyling(),
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error searching for location: ${error.message}. Please try again.`,
        ...getSwalStyling(),
      });
    } finally {
      hideSpinner();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', !darkMode);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="controls">
        <SearchBar onSearch={handleSearch} />
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="content">
        <MapContainer center={mapCenter} zoom={13} className="map-container">
          <MapUpdater center={mapCenter} />
          <TileLayer
            url={darkMode 
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          />
          <MapEvents onMapClick={handleLocationSelect} />
          {position && <Marker position={position} icon={darkMode ? darkIcon : lightIcon}><Popup>{weather?.name || 'Selected location'}</Popup></Marker>}
        </MapContainer>

        {weather && <WeatherSidebar weather={weather} loading={loading} />}
      </div>
      <Footer />
    </div>
  );
}

export default App;