// src/components/LowStockAlert.jsx

import React from 'react';

export default function LowStockAlert({ lowStockList }) {
  if (!lowStockList || lowStockList.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-6">
      <h4 className="text-red-700 font-semibold mb-2">
        📦 Low-Stock Items ({lowStockList.length})
      </h4>
      <ul className="space-y-1 text-sm">
        {lowStockList.map(item => (
          <li key={item.productId} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-mono">{item.onHand} left</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
