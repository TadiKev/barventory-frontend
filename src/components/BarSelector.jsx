// src/components/BarSelector.jsx
import React from 'react';

export default function BarSelector({ bars, currentBar, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="font-medium mb-2 text-gray-700">Bar</label>
      <select
        value={currentBar}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
      >
        {/* Make sure this matches your AppContextProvider’s initial `currentBar = 'all'` */}
        <option value="all">All Bars</option>
        {bars.map((bar) => (
          <option key={bar._id} value={bar._id}>
            {bar.name}
          </option>
        ))}
      </select>
    </div>
  );
}
