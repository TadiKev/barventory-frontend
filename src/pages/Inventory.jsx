import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import BarSelector from '../components/BarSelector';
import DatePicker from '../components/DatePicker';
import InventoryTable from '../components/InventoryTable';

export default function Inventory() {
  const { bars, currentBar, setCurrentBar } = useContext(AppContext);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Inventory Snapshot</h1>
        <p className="text-gray-600 mt-1">View and manage your bar inventory by date.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <BarSelector
          bars={bars}
          currentBar={currentBar}
          onChange={setCurrentBar}
        />

        <DatePicker
          label="Select Date"
          value={date}
          onChange={setDate}
        />
      </section>

      <section>
        {currentBar ? (
          <InventoryTable date={date} />
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-red-600 font-medium">Please select a bar to view inventory.</p>
          </div>
        )}
      </section>
    </main>
  );
}