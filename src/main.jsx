// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AuthProvider }       from './context/AuthContext';
import { AppContextProvider } from './context/AppContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </AuthProvider>
);
