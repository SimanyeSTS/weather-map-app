import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, clearInput }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (clearInput) {
      setQuery('');
    }
  }, [clearInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Enter city (e.g., Cape Town, ZA)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </div>
      <small className="text-white-50 mt-1 d-block px-2">
        For more accurate results, include the country code (e.g., London, GB)
      </small>
    </form>
  );
};

export default SearchBar;