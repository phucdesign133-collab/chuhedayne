// src/components/SearchBar.jsx
import React from 'react';
import '../css/Grid.css';

export default function SearchBar({ searchTerm, setSearchTerm, placeholder }) {
  return (
    
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder || "Tìm kiếm..."}
      />
   
  );
}