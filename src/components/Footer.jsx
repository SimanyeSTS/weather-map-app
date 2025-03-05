import React from 'react';

function Footer() {
  const currentYear = new Date().getUTCFullYear();
  
  return (
    <footer className="footer-container">
      <div className="footer-row">
        <p className="footer-text">&copy;Copyright | WeatherWise++ |</p>
        <span className="footer-year">{currentYear}</span>
      </div>
    </footer>
  );
}

export default Footer;