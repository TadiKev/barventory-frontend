// src/components/TransactionTable.jsx
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function TransactionTable() {
  const {
    transactions = [],      // default to empty array
    loading,
    error,
  } = useContext(AppContext);

  if (loading.transactions) {
    return <p>Loading transactions…</p>;
  }
  if (error.transactions) {
    return <p className="text-red-600">{error.transactions}</p>;
  }
  if (transactions.length === 0) {
    return <p className="text-gray-600">No transactions found for this period.</p>;
  }

  return (
    <div className="overflow-auto bg-white shadow rounded-lg p-4">
      <table className="min-w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            {['Date', 'Product', 'Type', 'Qty', 'Cost', 'Revenue'].map(col => (
              <th key={col} className="px-3 py-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx._id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">
                {new Date(tx.date).toLocaleDateString()}
              </td>
              <td className="px-3 py-2">{tx.product?.name || '—'}</td>
              <td className="px-3 py-2">{tx.type}</td>
              <td className="px-3 py-2">{tx.quantity}</td>
              <td className="px-3 py-2">${tx.cost.toFixed(2)}</td>
              <td className="px-3 py-2">${tx.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
