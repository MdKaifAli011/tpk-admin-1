"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaClipboardList,
  FaBookOpen,
  FaLayerGroup,
  FaRegFolderOpen,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useState } from "react";

const menuItems = [
  {
    name: "Exam Management",
    href: "/exam",
    icon: <FaClipboardList />,
  },
  {
    name: "Subject Management",
    href: "/subjects",
    icon: <FaBookOpen />,
  },
  {
    name: "Unit Management",
    href: "/units",
    icon: <FaLayerGroup />,
  },
  {
    name: "Chapter Management",
    href: "/chapters",
    icon: <FaRegFolderOpen />,
  },
  {
    name: "Topic Management",
    href: "/topics",
    icon: <FaRegFolderOpen />,
  },
  {
    name: "Sub Topic Management",
    href: "/sub-topics",
    icon: <FaRegFolderOpen />,
  },
];

const SideBar = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Menu Items */}
        <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar mt-4 px-3 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700"
                  }`}
                onClick={onClose}
              >
                <span
                  className={`text-lg transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.name}</div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Profile Section */}
        <div className="px-3 pt-4 border-t border-gray-200/50 pb-4">
          <Link
            href="/profile"
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 transition-all duration-200 hover:scale-105"
          >
            <span className="text-lg transition-transform duration-200 group-hover:scale-110">
              <FaUser />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">Profile Settings</div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-3 pb-4">
          <div className="text-xs text-gray-400 text-center py-2">
            Admin Panel v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
