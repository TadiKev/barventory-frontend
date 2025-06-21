// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { AppContext } from '../context/AppContext';
import LowStockAlert from '../components/LowStockAlert';

export default function Dashboard() {
  const {
    bars = [],
    currentBar,
    setCurrentBar,
    transactions = [],
    fetchTransactions,
    inventory = [],
    fetchInventory,
    loading,
    error,
  } = useContext(AppContext);

  const [window, setWindow] = useState({ from: '', to: '' });

  // on bar change, load last 7 days
  useEffect(() => {
    if (!currentBar) return;
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const fromD = new Date(today);
    fromD.setDate(fromD.getDate() - 6);
    const from = fromD.toISOString().slice(0, 10);

    setWindow({ from, to });
    fetchTransactions(from, to);
    fetchInventory(currentBar, to);
  }, [currentBar, fetchTransactions, fetchInventory]);

  // 1) Total SKUs
  const totalSKUs = inventory.length;

  // 2) Low stock items
  const lowStockItems = inventory
    .filter(r => r.closing <= (r.product.lowStockThreshold || 0))
    .map(r => ({
      name: r.product.name,
      onHand: r.closing,
      threshold: r.product.lowStockThreshold || 0,
      daysLeft: '—'
    }));

  // 3) Top 5 fastest movers: salesQty / 7 days
  const salesVelocity = inventory
    .map(r => ({
      name: r.product.name,
      velocity: ((r.salesQty || 0) / 7)
    }))
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 5);

  // 4) Inventory value trend last 7 days
  const valueTrend = [];
  if (window.from && window.to && inventory.length) {
    const dayMap = {};
    inventory.forEach(r => {
      if (!r.date) return;
      const dObj = new Date(r.date);
      if (isNaN(dObj.getTime())) return;
      const dateKey = dObj.toISOString().slice(0, 10);
      dayMap[dateKey] = (dayMap[dateKey] || 0) + ((r.closing || 0) * (r.costPrice || 0));
    });
    const start = new Date(window.from);
    const end = new Date(window.to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      valueTrend.push({ date: key, value: dayMap[key] || 0 });
    }
  }

  // 5) Bar performance comparison
  const barComparison = bars.map(bar => {
    // guard tx.bar for null
    const barTx = transactions.filter(tx => tx.bar && tx.bar._id === bar._id);
    const revenue = barTx.reduce((sum, tx) => sum + (tx.revenue || 0), 0);
    const cogs = barTx.reduce(
      (sum, tx) => sum + ((tx.quantity || 0) * (tx.product?.costPrice || 0)),
      0
    );
    return { barName: bar.name, revenue, cogs };
  });

  // loading / error
  if (loading.transactions || loading.inventory) {
    return <div className="p-4 text-center">Loading dashboard…</div>;
  }
  if (error.transactions || error.inventory) {
    return (
      <div className="p-4 text-red-600 text-center">
        {error.transactions || error.inventory}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header & bar selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Operations Dashboard</h1>
        <select
          value={currentBar}
          onChange={e => setCurrentBar(e.target.value)}
          className="border rounded p-2 w-full sm:w-auto"
        >
          <option value="all">All Bars</option>
          {bars.map(b => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-600">
        Showing data from <strong>{window.from}</strong> to{' '}
        <strong>{window.to}</strong>
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Total SKUs" value={totalSKUs} />
        <Kpi title="Low Stock Alerts" value={lowStockItems.length} />
        <Kpi title="Avg Daily Sales/Item" value={salesVelocity[0]?.velocity?.toFixed(1) || 0} suffix=" units/day" />
        <Kpi title="Avg Inv. Value" value={(valueTrend.reduce((s,d)=>s+d.value,0)/7).toFixed(2)} prefix="$" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top 5 Fastest Movers">
          <PieChart width={300} height={300}>
            <Pie
              data={salesVelocity}
              dataKey="velocity"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={80}
              label
            >
              {salesVelocity.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={v => `${v.toFixed(1)} units/day`} />
          </PieChart>
        </Card>

        <Card title="Inventory Value Trend (7d)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={valueTrend}>
              <XAxis dataKey="date" />
              <YAxis tickFormatter={v => `$${v.toLocaleString()}`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Value" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {bars.length > 1 && (
        <Card title="Bar Performance Comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barComparison}>
              <XAxis dataKey="barName" />
              <YAxis />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="cogs" fill="#ef4444" name="COGS" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <LowStockAlert lowStockCount={lowStockItems.length} />
    </div>
  );
}

const COLORS = ['#34d399','#fbbf24','#f87171','#60a5fa','#a78bfa'];

function Kpi({ title, value, prefix = '', suffix = '' }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <span className="text-sm text-gray-600">{title}</span>
      <div className="text-2xl font-semibold mt-1">
        {prefix}{value}{suffix}
      </div>
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
