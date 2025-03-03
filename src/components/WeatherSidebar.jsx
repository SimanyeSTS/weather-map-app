import React from 'react';

const WeatherSidebar = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="sidebar">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const { main, weather: weatherDetails, wind, name, sys } = weather;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{name}, {sys.country}</h2>
      </div>
      
      <div className="weather-main">
        <img 
          src={`https://openweathermap.org/img/wn/${weatherDetails[0].icon}@2x.png`} 
          alt={weatherDetails[0].description} 
          className="weather-icon"
        />
        <div className="temperature">{Math.round(main.temp)}°C</div>
        <div className="description">{weatherDetails[0].description}</div>
      </div>
      
      <div className="weather-details">
        <div className="detail-card">
          <span className="detail-title">FEELS LIKE</span>
          <span className="detail-value">{Math.round(main.feels_like)}°C</span>
        </div>
        <div className="detail-card">
          <span className="detail-title">HUMIDITY</span>
          <span className="detail-value">{main.humidity}%</span>
        </div>
        <div className="detail-card">
          <span className="detail-title">WIND SPEED</span>
          <span className="detail-value">{wind.speed} m/s</span>
        </div>
        <div className="detail-card">
          <span className="detail-title">MIN/MAX</span>
          <span className="detail-value">{Math.round(main.temp_min)}°C / {Math.round(main.temp_max)}°C</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherSidebar;