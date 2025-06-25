// src/components/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: passes isOpen and onClose */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar: pass a handler for toggling */}
        <Navbar onMenuClick={openSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
