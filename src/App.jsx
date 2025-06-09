// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider }     from './context/AuthContext';
import { AppContextProvider } from './context/AppContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthForm from './pages/AuthForm';

import Dashboard       from './pages/Dashboard';
import Bars            from './pages/Bars';
import Products        from './pages/Products';
import Inventory       from './pages/Inventory';
import Expenses        from './pages/Expenses';
import IncomeStatement from './pages/Reports/IncomeStatement';
import Transfers       from './pages/Transfers';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <Router>
          <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-auto p-4">
                <Routes>
                  {/* Redirect root to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Public auth page */}
                  <Route path="/auth" element={<AuthForm />} />

                  {/* Shared pages (both admin & employee) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      <ProtectedRoute>
                        <Expenses />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin-only pages */}
                  <Route
                    path="/bars"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <Bars />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <Products />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports/income-statement"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <IncomeStatement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transfers"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <Transfers />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AppContextProvider>
    </AuthProvider>
  );
}
