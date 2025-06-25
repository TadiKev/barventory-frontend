// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  HomeIcon,
  BuildingLibraryIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const links = [
  { to: '/dashboard',                label: 'Home',             icon: HomeIcon, roles: ['admin'] },
  { to: '/bars',                     label: 'Bars',             icon: BuildingLibraryIcon, roles: ['admin'] },
  { to: '/products',                 label: 'Products',         icon: CubeIcon, roles: ['admin'] },
  { to: '/inventory',                label: 'Inventory',        icon: ClipboardDocumentListIcon, roles: ['admin','employee'] },
  { to: '/expenses',                 label: 'Expenses',         icon: BanknotesIcon, roles: ['admin','employee'] },
  { to: '/reports/income-statement', label: 'Income Statement', icon: ChartBarIcon, roles: ['admin'] },
  { to: '/transfers',                label: 'Transfers',        icon: ArrowsRightLeftIcon, roles: ['admin'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const role = user?.role;
  const handleLogout = () => {
    logout();
    // navigation after logout should be handled by parent or AuthContext logic
  };

  return (
    <>
      {/* Overlay when sidebar is open on small screens */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 text-gray-100 flex flex-col shadow-xl
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0
        `}
      >
        {/* Header with title and close button on mobile */}
        <div className="flex items-center justify-between px-6 py-4 md:block">
          <div>
            <h1 className="text-2xl font-extrabold">BarOwner</h1>
            <p className="text-sm text-gray-300 mt-1 hidden md:block">Admin Dashboard</p>
          </div>
          {/* Close button only on small screens */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-slate-700 transition"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6 text-gray-100" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 overflow-y-auto">
          {links.filter(l => l.roles.includes(role)).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className="block">
              {({ isActive }) => (
                <div
                  className={`
                    flex items-center p-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                  `}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  {/* Always show label, but smaller on small screens */}
                  <span className="ml-3 font-medium text-xs md:text-base">
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-6 py-4 flex-none">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
