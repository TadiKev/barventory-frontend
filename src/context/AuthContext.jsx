// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set axios base URL based on environment:
axios.defaults.baseURL = import.meta.env.DEV
  ? ''                 
  : import.meta.env.VITE_API_URL; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1) Initialize `user` from localStorage (if it exists)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2) Initialize `token` from localStorage (if it exists)
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // 3) Whenever `token` changes, set or remove the default Authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 4) LOGIN function: call /api/auth/login, save user+token
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });

      // Let’s log here so we can confirm `role` is present:
      console.log('→ [AuthContext.login] server returned:', res.data.user);

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      throw err;
    }
  };

  // 5) REGISTER function: call /api/auth/register, save user+token
  const register = async (username, password, role) => {
    try {
      const res = await axios.post('/api/auth/register', { username, password, role });

      // Log so we can confirm `role` is present on registration:
      console.log('→ [AuthContext.register] server returned:', res.data.user);

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      throw err;
    }
  };

  // 6) LOGOUT: clear user and token from context + localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
