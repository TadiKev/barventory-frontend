import React, { useContext } from 'react';
import { NavLink }            from 'react-router-dom';
import { AuthContext }        from '../context/AuthContext';
import {
  HomeIcon,
  BuildingLibraryIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Add the "User Management" link for admins
const links = [
  { to: '/dashboard',                label: 'Home',             icon: HomeIcon,                 roles: ['admin'] },
  { to: '/bars',                     label: 'Bars',             icon: BuildingLibraryIcon,      roles: ['admin'] },
  { to: '/products',                 label: 'Products',         icon: CubeIcon,                 roles: ['admin'] },
  { to: '/inventory',                label: 'Inventory',        icon: ClipboardDocumentListIcon,roles: ['admin','employee'] },
  { to: '/expenses',                 label: 'Expenses',         icon: BanknotesIcon,            roles: ['admin','employee'] },
  { to: '/reports/income-statement', label: 'Income Statement', icon: ChartBarIcon,             roles: ['admin'] },
  { to: '/transfers',                label: 'Transfers',        icon: ArrowsRightLeftIcon,      roles: ['admin'] },

  // ← new Settings link for user management
  { to: '/settings/users',           label: 'User Management',  icon: UserGroupIcon,            roles: ['admin'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const role = user?.role;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 text-gray-100 flex flex-col shadow-xl
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0
      `}>
        <div className="flex items-center justify-between px-6 py-4 md:block">
          <h1 className="text-2xl font-extrabold">Thomlegends</h1>
          <button
            className="md:hidden p-2 rounded-md hover:bg-slate-700 transition"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6 text-gray-100" />
          </button>
        </div>

        <nav className="flex-1 px-2 overflow-y-auto">
          {links
            .filter(link => link.roles.includes(role))
            .map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end className="block">
                {({ isActive }) => (
                  <div className={`
                    flex items-center p-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                  `}>
                    <Icon className="h-6 w-6 flex-shrink-0" />
                    <span className="ml-3 font-medium text-xs md:text-base">
                      {label}
                    </span>
                  </div>
                )}
              </NavLink>
            ))
          }
        </nav>

        <div className="px-6 py-4">
          <button
            onClick={logout}
            className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
