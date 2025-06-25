// src/pages/Inventory.jsx

import React, { useContext, useEffect } from 'react';
import { AppContext }  from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import BarSelector     from '../components/BarSelector';
import DatePicker      from '../components/DatePicker';
import InventoryTable  from '../components/InventoryTable';

export default function Inventory() {
  const { user } = useContext(AuthContext);
  const role     = user?.role?.toLowerCase();
  const isEmployee = role === 'employee';

  const {
    bars,
    currentBar, setCurrentBar,
    selectedDate, setSelectedDate,
  } = useContext(AppContext);

  // Always default employee to today, and lock them there
  const todayStr = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    if (isEmployee) {
      setSelectedDate(todayStr);
    }
  }, [isEmployee, setSelectedDate, todayStr]);

  // Prepare the props for DatePicker:
  // - Admin: free pick
  // - Employee: locked to today only
  const datePickerProps = isEmployee
    ? {
        value: todayStr,
        onChange: () => {},            // ignore attempts to change
        min: todayStr,
        max: todayStr,
      }
    : {
        value: selectedDate,
        onChange: setSelectedDate
      };

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
        {/* Bar selector */}
        <BarSelector
          bars={bars}
          currentBar={currentBar}
          onChange={setCurrentBar}
        />

        {/* Date picker: locked for employees */}
        <DatePicker
          label="Select Date"
          {...datePickerProps}
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
