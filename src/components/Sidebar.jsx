import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  HomeIcon,
  BuildingLibraryIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const links = [
  { to: '/dashboard',             label: 'Home',             icon: HomeIcon },
  { to: '/bars',                  label: 'Bars',             icon: BuildingLibraryIcon },
  { to: '/products',              label: 'Products',         icon: CubeIcon },
  { to: '/inventory',             label: 'Inventory',        icon: ClipboardDocumentListIcon },
  // { to: '/transactions',        label: 'Transactions',     icon: CurrencyDollarIcon },
  { to: '/expenses',              label: 'Expenses',         icon: BanknotesIcon },
  { to: '/reports/income-statement', label: 'Income Statement', icon: ChartBarIcon },
];

export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside className="w-16 md:w-64 bg-[#fff0f3] text-pink-900 h-screen flex flex-col transition-all duration-300 shadow-xl">
      {/* Brand / Logo */}
      <div className="px-2 md:px-6 py-6 hidden md:block">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-pink-600">
          BarOwner
        </h1>
        <p className="mt-1 text-xs md:text-sm text-pink-500">Admin Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-1 md:px-2 mt-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end>
            {({ isActive }) => (
              <div className="border-b border-yellow-400/40 mb-2">
                <div
                  className={`flex items-center p-2 md:px-4 md:py-3 rounded-lg transition-colors
                    ${isActive ? 'bg-pink-500 text-white' : 'text-pink-600 hover:bg-pink-100'}`}
                >
                  <Icon
                    className={`h-5 w-5 md:h-6 md:w-6 mx-auto md:mr-3 md:ml-0 flex-shrink-0
                      ${isActive ? 'text-white' : 'text-pink-600'}`}
                  />
                  <span className="hidden md:inline font-medium">{label}</span>
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-2 md:px-6 py-4">
        <button
          onClick={handleLogout}
          className="w-full py-2 text-xs md:text-base bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition transform hover:scale-[1.02]"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
