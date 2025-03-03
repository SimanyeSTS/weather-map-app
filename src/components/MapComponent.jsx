import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'; // Add useMapEvents import
import L from 'leaflet';

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

const MapComponent = React.memo(({ mapCenter, position, darkMode, weather, onMapClick }) => {
  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      className={`map-container ${darkMode ? 'dark-mode' : ''}`}
      key={JSON.stringify(mapCenter)} // Ensure stable key
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={darkMode 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      />
      {position && (
        <Marker 
          position={[position.lat, position.lng]}
          icon={darkMode ? darkIcon : lightIcon}
        >
          <Popup>
            {weather ? weather.name : 'Selected location'}
          </Popup>
        </Marker>
      )}
      <MapEvents onMapClick={onMapClick} />
    </MapContainer>
  );
});

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

export default MapComponent;