// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { AppContext } from '../context/AppContext';
import LowStockAlert from '../components/LowStockAlert';

const COLORS = ['#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'];

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

  // initialize date range to last 7 days
  useEffect(() => {
    const today = new Date();
    const to    = today.toISOString().slice(0,10);
    const d0    = new Date(today);
    d0.setDate(d0.getDate() - 6);
    const from  = d0.toISOString().slice(0,10);
    setRange({ from, to });
  }, []);

  // whenever bar or range changes, reload everything
  useEffect(() => {
    if (!range.from || !range.to) return;
    fetchDashboard(currentBar, range.from, range.to);
  }, [currentBar, range, fetchDashboard]);

  // loading / error
  if (loadingDashboard) return <div className="p-4 text-center">Loading…</div>;
  if (errorDashboard)  return <div className="p-4 text-red-600 text-center">{errorDashboard}</div>;
  if (!dashboard)      return null;

  // destructure the payload
  const { kpis, barPerformance, topMovers, inventoryTrend } = dashboard;

  // debug logs
  console.group('📊 Dashboard Data');
  console.log('Selected Bar:', currentBar);
  console.log('Date Range:', range);
  console.log('KPIs:', kpis);
  console.log('Bar Performance:', barPerformance);
  console.log('Top Movers:', topMovers);
  console.log('Inventory Trend:', inventoryTrend);
  console.groupEnd();

  // compute low-stock items from KPIs or raw data if available
  // if your controller also returns a lowStockList you can log/inspect it here.
  // as fallback, derive from kpis or separate fetch:
  // console.log('Raw inventory records (from AppContext):', inventory);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Operations Dashboard</h1>
        <div className="flex space-x-2 items-center">
          <select
            value={currentBar}
            onChange={e => setCurrentBar(e.target.value)}
            className="border rounded p-2"
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
            className="border rounded p-1"
          />
          <span>to</span>
          <input
            type="date"
            value={range.to}
            onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
            className="border rounded p-1"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Total SKUs"          value={kpis.totalSKUs} />
        <Kpi title="Low Stock Alerts"   value={kpis.lowStockCount} />
        <Kpi
          title="Avg Daily Sales/Item"
          value={kpis.avgDailySalesPerItem.toFixed(1)}
          suffix=" units/day"
        />
        <Kpi
          title="Avg Inv. Value"
          value={kpis.avgInvValue.toFixed(2)}
          prefix="$"
        />
      </div>

      {/* All-bars Performance */}
      {currentBar === 'all' && bars.length > 1 && (
        <Card title="Bar Performance Comparison">
          {barPerformance.length
            ? <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barPerformance}>
                  <XAxis dataKey="barName" />
                  <YAxis tickFormatter={v => `$${v.toLocaleString()}`} />
                  <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="totalCost"    fill="#ef4444" name="COGS"    />
                </BarChart>
              </ResponsiveContainer>
            : <p className="text-center text-gray-500 p-4">No comparison data</p>
          }
        </Card>
      )}

      {/* Single-bar: Top Movers & Inventory Trend */}
      {currentBar !== 'all' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Top 5 Fastest Movers">
              {topMovers.length
                ? <PieChart width={300} height={300}>
                    <Pie
                      data={topMovers}
                      dataKey="velocity"
                      nameKey="name"
                      cx="50%" cy="50%"
                      outerRadius={80}
                      label
                    >
                      {topMovers.map((_,i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => `${v.toFixed(1)} units/day`} />
                  </PieChart>
                : <p className="text-center text-gray-500 p-4">No sales data</p>
              }
            </Card>

            <Card title="Inventory Value Trend">
              {inventoryTrend.length
                ? <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={inventoryTrend}>
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={v => `$${v.toLocaleString()}`} />
                      <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Value" />
                    </LineChart>
                  </ResponsiveContainer>
                : <p className="text-center text-gray-500 p-4">No trend data</p>
              }
            </Card>
          </div>

          {/* Show low-stock alert */}
          <LowStockAlert lowStockCount={kpis.lowStockCount} />
        </>
      )}
    </div>
  );
}

function Kpi({ title, value, prefix = '', suffix = '' }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <span className="text-sm text-gray-600">{title}</span>
      <span className="text-2xl font-semibold mt-1">
        {prefix}{value.toLocaleString()}{suffix}
      </span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
