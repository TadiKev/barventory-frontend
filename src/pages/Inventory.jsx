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
    <main className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <header className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
          Inventory Snapshot
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
          View and manage your bar inventory by date.
        </p>
      </header>

      <section className="flex flex-col sm:flex-row sm:space-x-4 md:space-x-6 mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-0">
        {/* Bar selector */}
        <div className="flex-1">
          <BarSelector
            bars={bars}
            currentBar={currentBar}
            onChange={setCurrentBar}
            // If BarSelector supports className or internal sizing, ensure it uses small text at xs
          />
        </div>
        {/* Date picker: locked for employees */}
        <div className="flex-1">
          <DatePicker
            label="Select Date"
            {...datePickerProps}
            // Similarly ensure DatePicker input/label use text-xs sm:text-sm
          />
        </div>
      </section>

      <section>
        {currentBar ? (
          <InventoryTable date={selectedDate} />
        ) : (
          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow">
            <p className="text-xs sm:text-sm md:text-base text-red-600 font-medium">
              Please select a bar to view inventory.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
