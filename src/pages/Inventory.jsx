// src/pages/Inventory.jsx

import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import BarSelector  from '../components/BarSelector';
import DatePicker   from '../components/DatePicker';
import InventoryTable from '../components/InventoryTable';

export default function Inventory() {
  const {
    bars,
    currentBar,
    setCurrentBar,
    selectedDate,
    setSelectedDate,
  } = useContext(AppContext);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Inventory Snapshot
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage your bar inventory by date.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* BarSelector remains the same */}
        <BarSelector
          bars={bars}
          currentBar={currentBar}
          onChange={setCurrentBar}
        />

        {/* Instead of local useState, use selectedDate from context */}
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={setSelectedDate}
        />
      </section>

      <section>
        {currentBar ? (
          <InventoryTable date={selectedDate} />
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-red-600 font-medium">
              Please select a bar to view inventory.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
