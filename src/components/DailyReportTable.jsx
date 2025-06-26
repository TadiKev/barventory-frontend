// src/components/DailyReportTable.jsx

import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function DailyReportTable({ date }) {
  const { currentBar, dailySummary, fetchDailySummary } = useContext(AppContext);

  useEffect(() => {
    if (currentBar && date) fetchDailySummary(currentBar, date);
  }, [currentBar, date]);

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      {/* Table on md+ */}
      <div className="hidden md:block overflow-x-auto">
        <h3 className="px-4 py-2 text-sm sm:text-base font-semibold">
          Daily Summary for {date}
        </h3>
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                'Product','Opening','In','Out',
                'Closing','Sales Qty','Sales $','Profit $'
              ].map(col => (
                <th
                  key={col}
                  className="px-2 py-1 text-left"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dailySummary.map(row => (
              <tr key={row.productId} className="border-t hover:bg-gray-50">
                <td className="px-2 py-1">{row.productId}</td>
                <td className="px-2 py-1">{row.opening}</td>
                <td className="px-2 py-1">{row.in}</td>
                <td className="px-2 py-1">{row.out}</td>
                <td className="px-2 py-1">{row.closing}</td>
                <td className="px-2 py-1">{row.salesQty}</td>
                <td className="px-2 py-1">${row.salesAmt.toFixed(2)}</td>
                <td className="px-2 py-1">${row.profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view on small */}
      <div className="md:hidden p-2 space-y-2 text-xs">
        <h3 className="text-sm font-semibold">Daily Summary for {date}</h3>
        {dailySummary.map(row => (
          <div key={row.productId} className="border rounded p-2 bg-gray-50">
            <p className="leading-tight"><strong>Product:</strong> {row.productId}</p>
            <p className="leading-tight"><strong>Opening:</strong> {row.opening}</p>
            <p className="leading-tight"><strong>In:</strong> {row.in}</p>
            <p className="leading-tight"><strong>Out:</strong> {row.out}</p>
            <p className="leading-tight"><strong>Closing:</strong> {row.closing}</p>
            <p className="leading-tight"><strong>Sales Qty:</strong> {row.salesQty}</p>
            <p className="leading-tight"><strong>Sales $:</strong> ${row.salesAmt.toFixed(2)}</p>
            <p className="leading-tight"><strong>Profit $:</strong> ${row.profit.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
