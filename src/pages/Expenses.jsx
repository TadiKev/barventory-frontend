// src/pages/Expenses.jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ExpenseTable from '../components/ExpenseTable';

export default function Expenses() {
  const { bars, currentBar, setCurrentBar, fetchExpenses, createExpense, loading, error } = useContext(AppContext);
  const [dates, setDates] = useState({
    from: new Date().toISOString().slice(0,10),
    to:   new Date().toISOString().slice(0,10)
  });
  const [form, setForm] = useState({ category:'', amount:'', date:dates.from, notes:'' });

  const handleFetch = () => {
    fetchExpenses(currentBar, dates.from, dates.to);
  };
  const handleAdd = async e => {
    e.preventDefault();
    await createExpense({ ...form, barId: currentBar });
    setForm(f => ({ ...f, category:'', amount:'', notes:'' }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Expenses</h2>
      <div className="mb-4 flex flex-wrap space-x-4 items-end">
        <div>
          <label className="block text-sm">Bar</label>
          <select
            value={currentBar}
            onChange={e => setCurrentBar(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select Bar --</option>
            {bars.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        {['from','to'].map(fld => (
          <div key={fld}>
            <label className="block text-sm">{fld.charAt(0).toUpperCase()+fld.slice(1)}</label>
            <input
              type="date"
              value={dates[fld]}
              onChange={e => setDates(d => ({ ...d, [fld]: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
        ))}
        <button
          onClick={handleFetch}
          disabled={loading.expenses}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          {loading.expenses ? 'Loading…' : 'Fetch'}
        </button>
      </div>

      <form onSubmit={handleAdd} className="mb-6 bg-white shadow rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="border rounded px-2 py-1"
          required
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          className="border rounded px-2 py-1"
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="border rounded px-2 py-1"
          required
        />
        <input
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          className="border rounded px-2 py-1"
        />
        <button
          type="submit"
          disabled={loading.createExpense}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          {loading.createExpense ? 'Saving…' : 'Add Expense'}
        </button>
      </form>

      {error.createExpense && <p className="text-red-600 mb-4">{error.createExpense}</p>}

      <ExpenseTable />
    </div>
  );
}
