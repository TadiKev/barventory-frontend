import React, { useContext, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AppContext } from '../context/AppContext';
import LowStockAlert from '../components/LowStockAlert';

export default function Dashboard() {
  const {
    bars = [],
    currentBar,
    setCurrentBar,
    report,
    fetchReport,
    transactions = [],
    fetchTransactions,
    inventory = [],
    fetchInventory,
    loading,
    error,
  } = useContext(AppContext);

  const [window, setWindow] = useState({ from: '', to: '' });

  // src/components/Dashboard.jsx
useEffect(() => {
  if (!currentBar) return;

  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromD = new Date(today);
  fromD.setDate(fromD.getDate() - 6);
  const from = fromD.toISOString().slice(0, 10);

  setWindow({ from, to });

  fetchReport(from, to);
  fetchTransactions(from, to);
  fetchInventory(currentBar, to);
}, [currentBar]);


  const {
    openingStock = 0,
    purchases = 0,
    closingStock = 0,
    revenue = 0,
    cogs = 0,
    grossProfit = 0,
    expenses = 0,
    netProfit = 0,
    byProduct = [],
    dailyTrend = []
  } = report || {};

  let trendData = Array.isArray(dailyTrend) ? [...dailyTrend] : [];
  if (!trendData.length && window.from && window.to && transactions.length) {
    const start = new Date(window.from);
    const end = new Date(window.to);
    end.setHours(23, 59, 59, 999);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().slice(0, 10);
      const dayTxns = transactions.filter(tx => {
        const t = new Date(tx.date);
        return t >= new Date(dateKey) && t <= new Date(`${dateKey}T23:59:59.999Z`);
      });
      const dayRevenue = dayTxns.reduce((s, tx) => s + (tx.revenue || 0), 0);
      const dayCogs = dayTxns.reduce((s, tx) => s + ((tx.quantity || 0) * (tx.product.costPrice || 0)), 0);
      trendData.push({ date: dateKey, revenue: dayRevenue, cogs: dayCogs });
    }
  }

  const topSelling = byProduct
    .sort((a, b) => b.salesQty - a.salesQty)
    .slice(0, 5)
    .map(p => ({ name: p.productName, salesQty: p.salesQty }));

  const lowStockItems = inventory
    .filter(r => r.closing <= (r.product.lowStockThreshold || 0))
    .map(r => ({
      name: r.product.name,
      onHand: r.closing,
      threshold: r.product.lowStockThreshold,
      daysLeft: '—'
    }));

  const COLORS = ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#a78bfa'];

  if (loading.report || loading.transactions || loading.inventory) {
    return <div className="p-4 text-center">Loading dashboard&hellip;</div>;
  }
  if (error.report || error.transactions || error.inventory) {
    return (
      <div className="p-4 text-red-600 text-center">
        {error.report || error.transactions || error.inventory}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0">
          Inventory Dashboard
        </h1>
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
        Showing data from <strong>{window.from}</strong> through <strong>{window.to}</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Kpi title="Opening Stock" value={openingStock} prefix="$" />
        <Kpi title="Purchases" value={purchases} prefix="$" />
        <Kpi title="Closing Stock" value={closingStock} prefix="$" />
        <Kpi title="Revenue" value={revenue} prefix="$" />
        <Kpi title="COGS" value={cogs} prefix="$" />
        <Kpi title="Net Profit" value={netProfit} prefix="$" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Daily Revenue vs COGS">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4ade80" />
              <Line type="monotone" dataKey="cogs" name="COGS" stroke="#f87171" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top 5 Selling Products">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topSelling}
                dataKey="salesQty"
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={80}
                label
              >
                {topSelling.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Low Stock Items">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                {['Product', 'On Hand', 'Threshold', 'Days Left'].map(h => (
                  <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((it, idx) => (
                <tr key={idx} className={it.onHand <= it.threshold ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 whitespace-nowrap">{it.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{it.onHand}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{it.threshold}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{it.daysLeft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <LowStockAlert lowStockCount={lowStockItems.length} />
    </div>
  );
}

function Kpi({ title, value, prefix = '' }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <span className="text-sm text-gray-600">{title}</span>
      <span className="text-2xl font-semibold mt-1">
        {prefix}{value?.toLocaleString()}
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
