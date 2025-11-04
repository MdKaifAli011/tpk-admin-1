"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaBook,
  FaLayerGroup,
  FaRegFolderOpen,
  FaClipboardList,
  FaUserTag,
  FaTimes,
} from "react-icons/fa";

const MENU_ITEMS = [
  { name: "Exam Management", href: "/admin/exam", icon: FaClipboardList },
  { name: "Subject Management", href: "/admin/subject", icon: FaBook },
  { name: "Unit Management", href: "/admin/unit", icon: FaLayerGroup },
  { name: "Chapter Management", href: "/admin/chapter", icon: FaRegFolderOpen },
  { name: "Topic Management", href: "/admin/topic", icon: FaRegFolderOpen },
  {
    name: "Sub Topic Management",
    href: "/admin/sub-topic",
    icon: FaRegFolderOpen,
  },
  { name: "User Role Management", href: "/admin/user-role", icon: FaUserTag },
];

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Overlay for mobile with fade animation */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden animate-fade-in transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar with slide animation */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 flex flex-col bg-gradient-to-b from-gray-50 to-white shadow-2xl transition-all duration-300 ease-in-out border-r border-gray-100 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm lg:hidden animate-fade-in">
          <span className="font-bold text-gray-900 text-sm uppercase tracking-wide">
            Navigation
          </span>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:rotate-90 transition-all duration-300 rounded-lg hover:bg-gray-100 active:scale-95"
            aria-label="Close menu"
          >
            <FaTimes className="text-lg transition-transform duration-300" />
          </button>
        </div>

        {/* Desktop Header Spacer */}
        <div className="hidden lg:block h-16 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-transparent" />

        {/* Navigation Links with stagger animation */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto scrollbar-thin">
          <div className="flex flex-col gap-1.5">
            {MENU_ITEMS.map(({ name, href, icon: Icon }, index) => {
              const active = isActive(href);
              return (
                <Link
                  href={href}
                  key={name}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-2 px-2 py-2 text-sm rounded-xl transition-all duration-300 relative
                    ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30 scale-[1.01]"
                        : "text-gray-700 font-medium hover:bg-gray-100/80 hover:text-blue-600 hover:shadow-sm"
                    }
                  `}
                  style={
                    isOpen
                      ? {
                          animation: `slideInLeft 0.4s ease-out ${
                            index * 0.05
                          }s both`,
                        }
                      : {}
                  }
                >
                  <div
                    className={`
                      flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300
                      ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }
                    `}
                  >
                    <Icon className="text-base transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="flex-1 leading-tight">{name}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-fade-in-scale" />
                  )}
                  {!active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 mt-auto border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50 animate-fade-in">
          <Link
            href="/admin/profile"
            onClick={onClose}
            className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative ${
              pathname === "/admin/profile"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30"
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-100/80"
            }`}
          >
            <div
              className={`
                flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300
                ${
                  pathname === "/admin/profile"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                }
              `}
            >
              <FaUser className="text-base transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="flex-1">Profile Settings</span>
            {pathname === "/admin/profile" && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-fade-in-scale" />
            )}
          </Link>
          <div className="mt-4 px-3 py-2 bg-gray-100/50 rounded-lg">
            <div className="text-xs text-center text-gray-500 font-medium">
              Admin Panel
            </div>
            <div className="text-xs text-center text-gray-400 mt-0.5">v1.0</div>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
