import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // 1) Whenever token changes, configure our `api` instance:
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 2) LOGIN
  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  // 3) REGISTER (if you still need it)
  const register = async (username, password, role) => {
    const { data } = await api.post('/auth/register', { username, password, role });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  // 4) LOGOUT
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
