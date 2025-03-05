import React, { useState, useEffect } from 'react';

function Footer() {
  const currentYear = new Date().getUTCFullYear();
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      const sidebar = e.currentTarget;
      const isBottom = 
        sidebar.scrollHeight - sidebar.scrollTop <= sidebar.clientHeight + 1;
      setIsAtBottom(isBottom);
    };

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.addEventListener('scroll', handleScroll);
      return () => sidebar.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  return (
    <footer className={`footer-container ${isAtBottom ? 'visible' : ''}`}>
      <div className="footer-row">
        <p className="footer-text">&copy;Copyright | WeatherWise++ |</p>
        <span className="footer-year">{currentYear}</span>
      </div>
    </footer>
  );
}

export default Footer;