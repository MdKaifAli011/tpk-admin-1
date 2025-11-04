"use client";
import React from "react";
import Image from "next/image";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

export const Header = ({ onMenuToggle, sidebarOpen }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 h-16 z-50 border-b border-gray-200/50">
      <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between max-w-full">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Menu Icon for Mobile */}
          <button
            onClick={onMenuToggle}
            className="md:hidden text-gray-600 hover:text-gray-900 text-lg transition-all duration-200 hover:scale-110 p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Testprep Kart"
              width={100}
              height={32}
              className="object-contain transition-all duration-200 hover:scale-105 h-8 w-auto"
              priority
            />
          </div>
        </div>

        {/* Center Title - Hidden on mobile, visible on larger screens */}
        <div className="hidden md:block flex-1 text-center">
          <h1 className="text-lg lg:text-xl font-bold text-gray-800 tracking-tight">
            Admin{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Dashboard
            </span>
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* User Info */}
          <div className="flex items-center gap-2 text-gray-700 group">
            <div className="relative">
              <FaUserCircle className="text-xl sm:text-2xl text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold text-gray-800">Admin</span>
              <p className="text-xs text-gray-500 leading-tight">
                Administrator
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95">
            <FiLogOut className="text-sm sm:text-base" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
