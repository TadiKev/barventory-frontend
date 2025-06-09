// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  HomeIcon,
  BuildingLibraryIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

// Define each link along with which roles may see it
const links = [
  { to: '/dashboard',          label: 'Home',             icon: HomeIcon, roles: ['admin','employee'] },
  { to: '/bars',               label: 'Bars',             icon: BuildingLibraryIcon, roles: ['admin'] },
  { to: '/products',           label: 'Products',         icon: CubeIcon, roles: ['admin'] },
  { to: '/inventory',          label: 'Inventory',        icon: ClipboardDocumentListIcon, roles: ['admin','employee'] },
  { to: '/expenses',           label: 'Expenses',         icon: BanknotesIcon, roles: ['admin','employee'] },
  { to: '/reports/income-statement', label: 'Income Statement', icon: ChartBarIcon, roles: ['admin'] },
  { to: '/transfers',          label: 'Transfers',        icon: ArrowsRightLeftIcon, roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside className="w-16 md:w-64 bg-[#fff0f3] text-pink-900 h-screen flex flex-col shadow-xl">
      {/* Brand */}
      <div className="px-6 py-6 hidden md:block">
        <h1 className="text-3xl font-extrabold text-pink-600">BarOwner</h1>
        <p className="text-sm text-pink-500">Admin Dashboard</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 mt-4">
        {links
          .filter(link => link.roles.includes(role))
          .map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end>
              {({ isActive }) => (
                <div className="mb-2 border-b border-yellow-400/40">
                  <div
                    className={`flex items-center p-2 rounded-lg transition-colors
                      ${isActive ? 'bg-pink-500 text-white' : 'text-pink-600 hover:bg-pink-100'}`}
                  >
                    <Icon className={`h-6 w-6 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                    <span className="hidden md:inline ml-3 font-medium">{label}</span>
                  </div>
                </div>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Logout */}
      <div className="px-6 py-4">
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
