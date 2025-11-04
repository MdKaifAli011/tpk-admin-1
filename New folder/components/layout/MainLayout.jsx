"use client";
import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import SideBar from "@/components/layout/SideBar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Sidebar */}
      <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main
        className={`
          flex-1 
          pt-20
          px-4 
          sm:px-6 
          lg:px-8
          pb-8
          transition-all 
          duration-300 
          ease-in-out
          min-h-[calc(100vh-4rem)]
          md:ml-64
        `}
      >
        <div className="max-w-7xl mx-auto h-full">
          <div className="space-y-6 sm:space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
