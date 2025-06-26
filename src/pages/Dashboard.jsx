// src/pages/Dashboard.jsx

import React, { useContext, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { AppContext } from '../context/AppContext';
import LowStockAlert from '../components/LowStockAlert';

const COLORS = ['#34d399','#fbbf24','#f87171','#60a5fa','#a78bfa'];

export default function Dashboard() {
  const {
    bars,
    currentBar,
    setCurrentBar,
    dashboard,
    loadingDashboard,
    errorDashboard,
    fetchDashboard
  } = useContext(AppContext);

  const [range, setRange] = useState({ from: '', to: '' });

  // init last 7 days
  useEffect(() => {
    const today = new Date();
    const to    = today.toISOString().slice(0,10);
    const d0    = new Date(today);
    d0.setDate(d0.getDate() - 6);
    const from  = d0.toISOString().slice(0,10);
    setRange({ from, to });
  }, []);

  // reload on change
  useEffect(() => {
    if (range.from && range.to) {
      fetchDashboard(currentBar, range.from, range.to);
    }
  }, [currentBar, range, fetchDashboard]);

  if (loadingDashboard) return <div className="p-4 text-center text-xs">Loading…</div>;
  if (errorDashboard)  return <div className="p-4 text-center text-red-600 text-xs">{errorDashboard}</div>;
  if (!dashboard)      return null;

  const { kpis, barPerformance, topMovers, inventoryTrend, lowStockList } = dashboard;

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Operations Dashboard</h1>
        <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm">
          <select
            value={currentBar}
            onChange={e => setCurrentBar(e.target.value)}
            className="border rounded px-2 py-1 text-xs sm:text-sm"
          >
            <option value="all">All Bars</option>
            {bars.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={range.from}
            onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
            className="border rounded px-1 py-1 text-xs sm:text-sm"
          />
          <span className="text-xs sm:text-sm">to</span>
          <input
            type="date"
            value={range.to}
            onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
            className="border rounded px-1 py-1 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Kpi title="Total SKUs"          value={kpis.totalSKUs} />
        <Kpi title="Low Stock Alerts"   value={kpis.lowStockCount} />
        <Kpi title="Avg Daily Sales/Item" value={kpis.avgDailySalesPerItem.toFixed(1)} suffix=" units/day" />
        <Kpi title="Avg Inv. Value"     value={kpis.avgInvValue.toFixed(2)} prefix="$" />
      </div>

      {/* All-bars Comparison */}
      {currentBar === 'all' && bars.length > 1 && (
        <Card title="Bar Performance Comparison">
          {barPerformance.length ? (
            <>
              <div className="w-full h-40 sm:h-56 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barPerformance}>
                    <XAxis dataKey="barName" tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                    <YAxis tickFormatter={v => `$${v.toLocaleString()}`} tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                    <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                    <Bar dataKey="totalRevenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="totalCost" fill="#ef4444" name="COGS" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1 text-xs sm:text-sm">
                {barPerformance.map(bp => (
                  <div key={bp.barName} className="flex justify-between bg-gray-50 px-2 py-1 rounded">
                    <span className="font-medium">{bp.barName}</span>
                    <span>
                      <span className="text-green-600">${bp.totalRevenue.toLocaleString()}</span>
                      {' / '}
                      <span className="text-red-600">${bp.totalCost.toLocaleString()}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 p-4 text-xs">No comparison data</p>
          )}
        </Card>
      )}

      {/* Single-bar */}
      {currentBar !== 'all' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
            <Card title="Top 5 Fastest Movers">
              {topMovers.length ? (
                <div className="w-full h-40 sm:h-56 md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topMovers}
                        dataKey="velocity"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={window.innerWidth < 768 ? 60 : 80}
                        label={{ fontSize: window.innerWidth < 768 ? 8 : 12 }}
                      >
                        {topMovers.map((_,i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => `${v.toFixed(1)} units/day`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 p-4 text-xs">No sales data</p>
              )}
            </Card>

            <Card title="Inventory Value Trend">
              {inventoryTrend.length ? (
                <div className="w-full h-40 sm:h-56 md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={inventoryTrend}>
                      <XAxis dataKey="date" tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                      <YAxis tickFormatter={v => `$${v.toLocaleString()}`} tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                      <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        name="Value"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 p-4 text-xs">No trend data</p>
              )}
            </Card>
          </div>

          <LowStockAlert lowStockList={lowStockList} />
        </div>
      )}
    </div>
  );
}

function Kpi({ title, value, prefix = '', suffix = '' }) {
  return (
    <div className="bg-white shadow rounded-lg p-2 sm:p-4 flex flex-col">
      <span className="text-xs sm:text-sm text-gray-600">{title}</span>
      <span className="text-xl sm:text-2xl font-semibold mt-1">
        {prefix}{value.toLocaleString()}{suffix}
      </span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white shadow rounded-lg p-2 sm:p-4">
      <h3 className="text-sm sm:text-base font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
