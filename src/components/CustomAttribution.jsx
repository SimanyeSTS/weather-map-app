import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const CustomAttribution = () => {
  const map = useMap();
  
  useEffect(() => {
    const modifyAttributionLinks = () => {
      const attributionContainer = document.querySelector('.leaflet-control-attribution');
      if (attributionContainer) {
        const links = attributionContainer.querySelectorAll('a');
        links.forEach(link => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });
      }
    };
    
    modifyAttributionLinks();
    
    const observer = new MutationObserver(modifyAttributionLinks);
    const attributionContainer = document.querySelector('.leaflet-control-attribution');
    
    if (attributionContainer) {
      observer.observe(attributionContainer, { 
        childList: true,
        subtree: true
      });
    }
    
    return () => {
      observer.disconnect();
    };
  }, [map]);
  
  return null;
};

export default CustomAttribution;