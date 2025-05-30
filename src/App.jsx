import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import both providers
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AppContextProvider } from './context/AppContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthForm from './pages/AuthForm';

import Dashboard from './pages/Dashboard';
import Bars from './pages/Bars';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import IncomeStatement from './pages/Reports/IncomeStatement';

// A wrapper for protected routes
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/auth" replace />;
}

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

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/bars"
                    element={
                      <PrivateRoute>
                        <Bars />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <PrivateRoute>
                        <Products />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <PrivateRoute>
                        <Inventory />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <PrivateRoute>
                        <Transactions />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/expenses"
                    element={
                      <PrivateRoute>
                        <Expenses />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/reports/income-statement"
                    element={
                      <PrivateRoute>
                        <IncomeStatement />
                      </PrivateRoute>
                    }
                  />

                  {/* Fallback to home */}
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