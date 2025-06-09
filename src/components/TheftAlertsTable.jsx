// src/components/TheftAlertsTable.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TheftAlertsTable() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('/api/theft-alerts')
      .then(res => setAlerts(res.data))
      .catch(console.error);
  }, []);

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead> {/* columns: Date, Product, Expected, Actual, Variance, FlaggedBy */}</thead>
      <tbody>
        {alerts.map(a => (
          <tr key={a._id}>
            <td>{new Date(a.date).toLocaleDateString()}</td>
            <td>{a.product.name}</td>
            <td>{a.expectedClosing}</td>
            <td>{a.manualClosing}</td>
            <td className={a.variance < 0 ? 'text-red-600' : 'text-green-600'}>
              {a.variance}
            </td>
            <td>{a.flaggedBy.username}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
