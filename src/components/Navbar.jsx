import React from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-lg">
      {/* Brand Title */}
      <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
        Barventory
      </h1>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded hover:bg-white hover:bg-opacity-20 transition-transform hover:scale-105">
          <BellIcon className="h-6 w-6 text-white" />
          <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-rose-200" />
        </button>
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-white hover:bg-opacity-20 p-2 rounded transition-transform hover:scale-105">
          <UserCircleIcon className="h-8 w-8 text-white" />
          <span className="hidden md:inline text-white font-medium">Admin</span>
        </div>
      </div>
    </nav>
  )}
  