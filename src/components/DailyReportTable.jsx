import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function DailyReportTable({ date }) {
  const { currentBar, dailySummary, fetchDailySummary } = useContext(AppContext);

  useEffect(() => {
    if (currentBar && date) {
      fetchDailySummary(currentBar, date);
    }
  }, [currentBar, date]);

  return (
    <div className="overflow-x-auto bg-white rounded shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Daily Summary for {date}</h3>
      <table className="min-w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1">Product</th>
            <th className="px-2 py-1">Opening</th>
            <th className="px-2 py-1">In</th>
            <th className="px-2 py-1">Out</th>
            <th className="px-2 py-1">Closing</th>
            <th className="px-2 py-1">Sales Qty</th>
            <th className="px-2 py-1">Sales $</th>
            <th className="px-2 py-1">Profit $</th>
          </tr>
        </thead>
        <tbody>
          {dailySummary.map(row => (
            <tr key={row.productId} className="border-t">
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
  );
}
