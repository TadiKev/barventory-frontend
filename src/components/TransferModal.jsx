// src/components/TransferModal.jsx

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function TransferModal({ product, fromBar, bars, onClose }) {
  const { requestTransfer } = useContext(AppContext);
  const [toBar, setToBar] = useState('');
  const [qty, setQty]     = useState(1);

  const submit = async e => {
    e.preventDefault();
    await requestTransfer({ productId: product._id, qty, fromBar, toBar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2">
      <form
        onSubmit={submit}
        className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-xs text-xs sm:text-sm space-y-2"
      >
        <h2 className="text-sm sm:text-base font-semibold">
          Transfer {product.name}
        </h2>
        <div>
          <label className="block mb-1">Destination</label>
          <select
            required
            value={toBar}
            onChange={e => setToBar(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select destination bar</option>
            {bars.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Request
          </button>
        </div>
      </form>
    </div>
  );
}
