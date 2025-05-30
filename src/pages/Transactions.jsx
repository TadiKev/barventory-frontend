// src/pages/Transactions.jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import TransactionTable from '../components/TransactionTable';

export default function Transactions() {
  const {
    bars,
    currentBar,
    setCurrentBar,
    fetchTransactions,
    loading,
  } = useContext(AppContext);

  const [dates, setDates] = useState({
    from: new Date().toISOString().slice(0, 10),
    to:   new Date().toISOString().slice(0, 10),
  });

  const handleFetch = () => {
    if (currentBar) {
      fetchTransactions(currentBar, dates.from, dates.to);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transactions Ledger</h2>
      <div className="mb-4 flex flex-wrap space-x-4 items-end">
        <div>
          <label className="block text-sm">Bar</label>
          <select
            value={currentBar}
            onChange={e => setCurrentBar(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select Bar --</option>
            {bars.map(b => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {['from', 'to'].map(field => (
          <div key={field}>
            <label className="block text-sm">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="date"
              value={dates[field]}
              onChange={e =>
                setDates(d => ({ ...d, [field]: e.target.value }))
              }
              className="border rounded px-2 py-1"
            />
          </div>
        ))}

        <button
          onClick={handleFetch}
          disabled={loading.transactions}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50"
        >
          {loading.transactions ? 'Loading…' : 'Fetch'}
        </button>
      </div>

      <TransactionTable />
    </div>
  );
}
