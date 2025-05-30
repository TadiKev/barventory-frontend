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
      date: ex.date.slice(0,10),
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

  if (loading.expenses) return <p>Loading expenses…</p>;
  if (error.expenses)   return <p className="text-red-600">{error.expenses}</p>;

  return (
    <div className="overflow-auto bg-white shadow rounded-lg p-4">
      <table className="min-w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            {['Date','Category','Amount','Notes','Actions'].map(col => (
              <th key={col} className="px-3 py-2">{col}</th>
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
                      className="border rounded px-1 py-1 w-full"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={editForm.category}
                      onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      className="border rounded px-1 py-1 w-full"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                      className="border rounded px-1 py-1 w-full"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      value={editForm.notes}
                      onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                      className="border rounded px-1 py-1 w-full"
                    />
                  </td>
                  <td className="px-2 py-1 space-x-2">
                    <button onClick={() => saveEdit(ex._id)} className="text-green-600">Save</button>
                    <button onClick={cancelEdit}      className="text-gray-600">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2">{new Date(ex.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{ex.category}</td>
                  <td className="px-3 py-2">${ex.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">{ex.notes}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button onClick={() => startEdit(ex)} className="text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(ex._id)} className="text-red-600">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {error.updateExpense && <p className="text-red-600 mt-2">{error.updateExpense}</p>}
      {error.deleteExpense && <p className="text-red-600 mt-2">{error.deleteExpense}</p>}
    </div>
  );
}
