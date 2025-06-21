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

const links = [
  { to: '/dashboard',                label: 'Home',             icon: HomeIcon, roles: ['admin'] },
  { to: '/bars',                     label: 'Bars',             icon: BuildingLibraryIcon, roles: ['admin'] },
  { to: '/products',                 label: 'Products',         icon: CubeIcon, roles: ['admin'] },
  { to: '/inventory',                label: 'Inventory',        icon: ClipboardDocumentListIcon, roles: ['admin','employee'] },
  { to: '/expenses',                 label: 'Expenses',         icon: BanknotesIcon, roles: ['admin','employee'] },
  { to: '/reports/income-statement', label: 'Income Statement', icon: ChartBarIcon, roles: ['admin'] },
  { to: '/transfers',                label: 'Transfers',        icon: ArrowsRightLeftIcon, roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role;
  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <aside className="w-16 md:w-64 bg-slate-800 text-gray-100 h-screen flex flex-col shadow-xl">
      <div className="px-6 py-6 hidden md:block">
        <h1 className="text-3xl font-extrabold text-gray-100">BarOwner</h1>
        <p className="text-sm text-gray-300 mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-2 mt-4 space-y-1">
        {links.filter(l => l.roles.includes(role)).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end>
            {({ isActive }) => (
              <div className={`flex items-center p-2 rounded-lg transition  
                ${isActive 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span className="hidden md:inline ml-3 font-medium">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4">
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
