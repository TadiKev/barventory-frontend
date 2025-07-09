// src/pages/UserSettings.jsx
import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

export default function UserSettings() {
  const { user } = useContext(AuthContext);
  const [bars,  setBars]  = useState([]);
  const [users, setUsers] = useState([]);
  const [form,  setForm]  = useState({
    username: '',
    password: '',
    role:     'employee',
    bar:      '',
  });
  const [editing, setEditing] = useState(null);
  const [error,   setError]   = useState(null);

  // Only admins load this
  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.get('/bars')
      .then(r => setBars(r.data))
      .catch(console.error);

    loadUsers();
  }, [user]);

  function loadUsers() {
    api.get('/users')
      .then(r => setUsers(r.data))
      .catch(console.error);
  }

  const startEdit = u => {
    setEditing(u._id);
    setForm({
      username: u.username,
      password: '',
      role:     u.role,
      bar:      u.bar?._id || '',
    });
    setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await api.put(`/users/${editing}`, {
          ...(form.password && { password: form.password }),
          role: form.role,
          bar:  form.role === 'employee' ? form.bar : null,
        });
      } else {
        await api.post('/users', {
          username: form.username,
          password: form.password,
          role:     form.role,
          bar:      form.role === 'employee' ? form.bar : null,
        });
      }
      setForm({ username:'', password:'', role:'employee', bar:'' });
      setEditing(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">User Management</h2>
      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <input
          type="text" placeholder="Username"
          className="border rounded px-2 py-1"
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          required={!editing}
          disabled={!!editing}
        />
        <input
          type="password"
          placeholder={editing ? 'New Password' : 'Password'}
          className="border rounded px-2 py-1"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          {...(!editing && { required: true })}
        />
        <select
          className="border rounded px-2 py-1"
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value, bar: '' }))}
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="border rounded px-2 py-1"
          value={form.bar}
          onChange={e => setForm(f => ({ ...f, bar: e.target.value }))}
          disabled={form.role !== 'employee'}
          required={form.role === 'employee'}
        >
          <option value="">— Assign Bar —</option>
          {bars.map(b => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-indigo-600 text-white rounded px-3">
          {editing ? 'Save Changes' : 'Create User'}
        </button>
      </form>

      <table className="min-w-full mt-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1">Username</th>
            <th className="px-2 py-1">Role</th>
            <th className="px-2 py-1">Bar</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-t">
              <td className="px-2 py-1">{u.username}</td>
              <td className="px-2 py-1">{u.role}</td>
              <td className="px-2 py-1">{u.bar?.name || '—'}</td>
              <td className="px-2 py-1 space-x-2">
                <button onClick={() => startEdit(u)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(u._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
