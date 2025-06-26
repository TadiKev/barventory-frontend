// src/components/ExpenseTable.jsx

import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function ExpenseTable() {
  const {
    expenses,
    loading,
    error,
    updateExpense,
    deleteExpense,
  } = useContext(AppContext);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    category: '',
    amount: '',
    date: '',
    notes: '',
  });

  const startEdit = ex => {
    setEditingId(ex._id);
    setEditForm({
      category: ex.category,
      amount: ex.amount,
      date: ex.date.slice(0, 10),
      notes: ex.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async id => {
    await updateExpense(id, editForm);
    setEditingId(null);
  };

  const handleDelete = async id => {
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(id);
    }
  };

  if (loading.expenses) return <p className="text-xs sm:text-sm p-2">Loading expenses…</p>;
  if (error.expenses)   return <p className="text-red-600 text-xs sm:text-sm p-2">{error.expenses}</p>;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Table on md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              {['Date', 'Category', 'Amount', 'Notes', 'Actions'].map(col => (
                <th key={col} className="px-3 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map(ex => (
              <tr key={ex._id} className="border-t hover:bg-gray-50">
                {editingId === ex._id ? (
                  <>
                    <td className="px-2 py-1">
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                        className="w-full border rounded px-1 py-1 text-xs sm:text-sm"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={editForm.category}
                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full border rounded px-1 py-1 text-xs sm:text-sm"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-full border rounded px-1 py-1 text-xs sm:text-sm"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={editForm.notes}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                        className="w-full border rounded px-1 py-1 text-xs sm:text-sm"
                      />
                    </td>
                    <td className="px-2 py-1 space-x-1">
                      <button onClick={() => saveEdit(ex._id)} className="text-green-600 text-xs sm:text-sm">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="text-gray-600 text-xs sm:text-sm">
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">{new Date(ex.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{ex.category}</td>
                    <td className="px-3 py-2">${ex.amount.toFixed(2)}</td>
                    <td className="px-3 py-2">{ex.notes}</td>
                    <td className="px-3 py-2 space-x-2">
                      <button onClick={() => startEdit(ex)} className="text-blue-600 text-xs sm:text-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(ex._id)} className="text-red-600 text-xs sm:text-sm">
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {(error.updateExpense || error.deleteExpense) && (
          <div className="p-2">
            {error.updateExpense && <p className="text-red-600 text-xs sm:text-sm">{error.updateExpense}</p>}
            {error.deleteExpense && <p className="text-red-600 text-xs sm:text-sm">{error.deleteExpense}</p>}
          </div>
        )}
      </div>

      {/* Card view on small */}
      <div className="md:hidden p-2 space-y-3">
        {expenses.map(ex => {
          const isEd = editingId === ex._id;
          return (
            <div key={ex._id} className="bg-gray-50 border rounded-lg p-3 shadow-sm text-xs">
              {isEd ? (
                <>
                  <div className="mb-2">
                    <label className="block">Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full border rounded px-1 py-1 text-xs"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block">Category</label>
                    <input
                      value={editForm.category}
                      onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border rounded px-1 py-1 text-xs"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block">Amount</label>
                    <input
                      type="number" step="0.01"
                      value={editForm.amount}
                      onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                      className="w-full border rounded px-1 py-1 text-xs"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block">Notes</label>
                    <input
                      value={editForm.notes}
                      onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full border rounded px-1 py-1 text-xs"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => saveEdit(ex._id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Date:</strong> {new Date(ex.date).toLocaleDateString()}</p>
                  <p><strong>Category:</strong> {ex.category}</p>
                  <p><strong>Amount:</strong> ${ex.amount.toFixed(2)}</p>
                  {ex.notes && <p><strong>Notes:</strong> {ex.notes}</p>}
                  <div className="flex justify-end mt-2 space-x-2">
                    <button onClick={() => startEdit(ex)} className="text-blue-600 text-xs">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(ex._id)} className="text-red-600 text-xs">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
