// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize from localStorage
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Whenever `token` changes, set or remove the Authorization header on our `api` client
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // LOGIN → POST /auth/login
  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  // REGISTER (Admin only) → POST /auth/register
  const register = async (username, password, role, barId) => {
    const { data } = await api.post('/auth/register', { username, password, role, barId });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
