import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch, clearInput }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (clearInput) {
      setQuery('');
      setSuggestions([]);
    }
  }, [clearInput]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    onSearch(suggestion.name);
    setSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Enter city (e.g., Cape Town, ZA)"
          value={query}
          onChange={handleChange}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.name}, {suggestion.country}
            </li>
          ))}
        </ul>
      )}
      <small className="text-white-50 mt-1 d-block px-2">
        For more accurate results, include the country code (e.g., London, GB)
      </small>
    </form>
  );
};

export default SearchBar;