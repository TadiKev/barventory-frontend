// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'                    // dev: proxy → localhost:5000/api
    : import.meta.env.VITE_API_URL  // prod: your real backend URL
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
