import React from 'react';
import '../css/CommonDropdown.css';

export default function CommonDropdown({ options = [], value, onChange, onUpdate }) {
  return (
    <div className="dropdown-container">
      <select 
        className="common-select" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((item, index) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      
      <button className="dropdown-update-btn" onClick={onUpdate}>
        Cập nhật
      </button>
    </div>
  );
}