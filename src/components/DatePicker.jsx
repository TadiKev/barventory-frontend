import React from 'react';

export default function DatePicker({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="font-medium mb-2 text-gray-700">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
      />
    </div>
  );
}
