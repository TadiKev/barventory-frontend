import React, { useContext, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { AppContextProvider }         from './context/AppContext';

import Navbar          from './components/Navbar';
import Sidebar         from './components/Sidebar';
import AuthForm        from './pages/AuthForm';

import Dashboard       from './pages/Dashboard';
import Bars            from './pages/Bars';
import Products        from './pages/Products';
import Inventory       from './pages/Inventory';
import Expenses        from './pages/Expenses';
import IncomeStatement from './pages/Reports/IncomeStatement';
import Transfers       from './pages/Transfers';
import UserSettings    from './pages/UserSettings';         // ← your new page

import ProtectedRoute  from './components/ProtectedRoute';

/**
 * Decide where “/” should go:
 * - Unauthenticated → /auth
 * - Admin → /dashboard
 * - Employee → /inventory
 */
function HomeRedirect() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (user === undefined) return null; // still initializing

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return user.role === 'admin'
    ? <Navigate to="/dashboard" replace state={{ from: location }} />
    : <Navigate to="/inventory" replace state={{ from: location }} />;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <AppContextProvider>
        <Router>
          <div className="flex flex-col h-screen bg-slate-50">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              <main className="flex-1 overflow-auto p-4">
                <Routes>
                  {/* Home redirect */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <HomeRedirect />
                    </ProtectedRoute>
                  }/>

                  {/* Authentication */}
                  <Route path="/auth" element={<AuthForm />} />

                  {/* Admin-only */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute roles={['admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }/>
                  <Route path="/bars" element={
                    <ProtectedRoute roles={['admin']}>
                      <Bars />
                    </ProtectedRoute>
                  }/>
                  <Route path="/products" element={
                    <ProtectedRoute roles={['admin']}>
                      <Products />
                    </ProtectedRoute>
                  }/>
                  <Route path="/reports/income-statement" element={
                    <ProtectedRoute roles={['admin']}>
                      <IncomeStatement />
                    </ProtectedRoute>
                  }/>
                  <Route path="/transfers" element={
                    <ProtectedRoute roles={['admin']}>
                      <Transfers />
                    </ProtectedRoute>
                  }/>

                  {/* Settings → User Management (admin only) */}
                  <Route path="/settings/users" element={
                    <ProtectedRoute roles={['admin']}>
                      <UserSettings />
                    </ProtectedRoute>
                  }/>

                  {/* Shared for both roles */}
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <Inventory />
                    </ProtectedRoute>
                  }/>
                  <Route path="/expenses" element={
                    <ProtectedRoute>
                      <Expenses />
                    </ProtectedRoute>
                  }/>

                  {/* Catch-all */}
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
