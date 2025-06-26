// src/components/Navbar.jsx

import React, { useContext } from 'react';
import { BellIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-indigo-600 px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-2">
        {/* Hamburger on small */}
        <button
          className="md:hidden p-1 rounded-md hover:bg-indigo-500 hover:bg-opacity-50 transition"
          onClick={onMenuClick}
        >
          <Bars3Icon className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
          Thomlegends
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="relative p-1 rounded-full hover:bg-indigo-500 hover:bg-opacity-50 transition">
          <BellIcon className="h-5 w-5 text-white" />
          <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
        </button>
        <div className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-full hover:bg-indigo-500 hover:bg-opacity-50 transition cursor-pointer">
          <UserCircleIcon className="h-6 w-6 text-white" />
          <div className="hidden md:flex flex-col text-xs sm:text-sm">
            <span className="text-white font-medium">
              {user?.name || user?.email || 'User'}
            </span>
            <span className="text-gray-200 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </nav>
);
}
