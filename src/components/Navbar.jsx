// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { BellIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-indigo-600 px-4 md:px-6 py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        {/* Hamburger menu on small screens */}
        <button
          className="md:hidden p-2 mr-2 rounded-md hover:bg-indigo-500 hover:bg-opacity-50 transition"
          onClick={onMenuClick}
        >
          <Bars3Icon className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Barventory
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-indigo-500 hover:bg-opacity-50 transition">
          <BellIcon className="h-6 w-6 text-white" />
          <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
        </button>
        <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-indigo-500 hover:bg-opacity-50 transition cursor-pointer">
          <UserCircleIcon className="h-8 w-8 text-white" />
          <div className="hidden md:flex flex-col">
            <span className="text-white font-medium leading-tight">
              {user?.name || user?.email || 'User'}
            </span>
            <span className="text-sm text-gray-200 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
