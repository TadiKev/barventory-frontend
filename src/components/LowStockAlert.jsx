// src/components/LowStockAlert.jsx
import React from 'react';

export default function LowStockAlert({ lowStockCount }) {
  if (!lowStockCount) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
      {lowStockCount} items low on stock
    </div>
  );
}
