// src/pages/Inventory.jsx

import React, { useContext, useEffect } from 'react';
import { AppContext }  from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import InventoryTable  from '../components/InventoryTable';

export default function Inventory() {
  const { user } = useContext(AuthContext);
  const role     = user?.role?.toLowerCase();
  const isAdmin  = role === 'admin';
  const isEmployee = role === 'employee';

  const {
    bars,
    currentBar,   setCurrentBar,
    selectedDate, setSelectedDate,
  } = useContext(AppContext);

  // For employees: always lock date to today
  const todayStr = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    if (isEmployee) {
      setSelectedDate(todayStr);
    }
  }, [isEmployee, setSelectedDate, todayStr]);

  return (
    <main className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
          Inventory Snapshot
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          View and manage your bar inventory by date.
        </p>
      </header>

      {/* Controls */}
      <section className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        {isAdmin ? (
          <select
            value={currentBar}
            onChange={e => setCurrentBar(e.target.value)}
            className="flex-1 border rounded p-2 text-sm"
          >
            <option value="all">All Bars</option>
            {bars.map(b => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex-1 text-lg font-medium text-gray-700">
            {bars[0]?.name || 'No bar assigned'}
          </div>
        )}

        <input
          type="date"
          value={isEmployee ? todayStr : selectedDate}
          onChange={e => !isEmployee && setSelectedDate(e.target.value)}
          className="border rounded p-2 text-sm"
          min={isEmployee ? todayStr : undefined}
          max={isEmployee ? todayStr : undefined}
        />
      </section>

      {/* Main Content */}
      <section>
        {isAdmin && (!currentBar || currentBar === 'all') ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            Please select a bar to view inventory.
          </div>
        ) : (
          <InventoryTable date={selectedDate} />
        )}
      </section>
    </main>
  );
}
