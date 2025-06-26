// src/components/MonthlyReportTable.jsx

import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function MonthlyReportTable({ month, year }) {
  const { currentBar, monthlySummary, fetchMonthlySummary, loading, error } = useContext(AppContext);

  useEffect(() => {
    if (currentBar && month && year) fetchMonthlySummary(currentBar, month, year);
  }, [currentBar, month, year]);

  if (loading.monthly) return <p className="text-xs p-2">Loading monthly data…</p>;
  if (error.monthly)   return <p className="text-red-600 text-xs p-2">{error.monthly}</p>;

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      {/* Table on md+ */}
      <div className="hidden md:block overflow-x-auto text-xs sm:text-sm">
        <h3 className="px-4 py-2 font-semibold">Monthly Summary: {month}/{year}</h3>
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {['Product','Opening','In','Out','Closing','Sales Qty','Sales $','Profit $'].map(col => (
                <th key={col} className="px-2 py-1 text-left">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlySummary.map(row => (
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

      {/* Card view on small */}
      <div className="md:hidden p-2 space-y-2 text-xs">
        <h3 className="font-semibold">Monthly Summary: {month}/{year}</h3>
        {monthlySummary.map(row => (
          <div key={row.productId} className="border rounded p-2">
            <p><strong>Product:</strong> {row.productId}</p>
            <p><strong>Opening:</strong> {row.opening}</p>
            <p><strong>In:</strong> {row.in}</p>
            <p><strong>Out:</strong> {row.out}</p>
            <p><strong>Closing:</strong> {row.closing}</p>
            <p><strong>Sales Qty:</strong> {row.salesQty}</p>
            <p><strong>Sales $:</strong> ${row.salesAmt.toFixed(2)}</p>
            <p><strong>Profit $:</strong> ${row.profit.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
