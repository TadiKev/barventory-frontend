import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function Bars() {
  const { bars, createBar, updateBar, deleteBar } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', location: '' });
  const [editingId, setEditingId] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAddOrEdit = e => {
    e.preventDefault();
    const { name, location } = form;
    if (!name.trim()) return;
    if (editingId) {
      updateBar(editingId, { name, location });
    } else {
      createBar({ name, location });
    }
    setForm({ name: '', location: '' });
    setEditingId(null);
  };

  const startEdit = bar => {
    setEditingId(bar._id);
    setForm({ name: bar.name, location: bar.location || '' });
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this bar?')) {
      deleteBar(id);
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: '', location: '' });
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Bars</h2>

      <form onSubmit={handleAddOrEdit} className="mb-6 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <input
          name="name"
          className="border rounded px-3 py-2 flex-1"
          placeholder="Bar Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="location"
          className="border rounded px-3 py-2 flex-1"
          placeholder="Location (optional)"
          value={form.location}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
        >
          {editingId ? 'Save Changes' : 'Add Bar'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setForm({ name: '', location: '' }); }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}
      </form>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-pink-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Location</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bars.map(bar => (
            <tr key={bar._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{bar.name}</td>
              <td className="px-4 py-2">{bar.location}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => startEdit(bar)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bar._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
