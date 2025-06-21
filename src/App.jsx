// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { AppContextProvider } from './context/AppContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthForm from './pages/AuthForm';

import Dashboard from './pages/Dashboard';
import Bars from './pages/Bars';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import IncomeStatement from './pages/Reports/IncomeStatement';
import Transfers from './pages/Transfers';

import ProtectedRoute from './components/ProtectedRoute';

/**
 * Inline component to decide where “/” should go:
 *  - Unauthenticated → /auth
 *  - Admin → /dashboard
 *  - Everyone else → /inventory
 */
function HomeRedirect() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // While AuthContext is still initializing
  if (user === undefined) return null;

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return user.role?.toLowerCase() === 'admin'
    ? <Navigate to="/dashboard" replace state={{ from: location }} />
    : <Navigate to="/inventory" replace state={{ from: location }} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContextProvider>
        <Router>
          {/* Entire app wrapper with light background */}
          <div className="flex flex-col h-screen bg-slate-50">
            <Navbar />
            <div className="flex flex-1">
              {/* Fixed, full-height sidebar */}
              <Sidebar />

              {/* Main content shifted over by sidebar width */}
              <main className="flex-1 overflow-auto p-4 ml-16 md:ml-64">
                <Routes>
                  {/* Home route */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <HomeRedirect />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public auth page */}
                  <Route path="/auth" element={<AuthForm />} />

                  {/* Admin-only dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shared pages for authenticated users */}
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

                  {/* Catch‑all → redirect home */}
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
