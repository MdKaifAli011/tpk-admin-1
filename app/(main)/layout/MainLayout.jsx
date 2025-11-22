"use client";

import React, { Suspense, useState, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const closeSidebar = () => setIsSidebarOpen(false);

  /* -------------------------------------------------------
     Mobile Scroll Lock — Simplified + Reliable
  -------------------------------------------------------- */
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;

    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* NAVBAR */}
        <Navbar onMenuToggle={toggleSidebar} isMenuOpen={isSidebarOpen} />

        <div className="flex flex-1 relative">
          {/* SIDEBAR (Premium 300px Glass UI) */}
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

          {/* OVERLAY (Mobile only) - Removed duplicate, handled in Sidebar */}

          {/* MAIN CONTENT */}
          <main
            className="
              flex-1
              pt-[110px] md:pt-[120px]
              lg:ml-[300px]
              bg-white
              overflow-y-auto
              min-h-0
              px-4 md:px-6 pb-6
              transition-all
              [&::-webkit-scrollbar]:hidden
              [-ms-overflow-style:none]
              [scrollbar-width:none]
            "
          >
            <div className="w-full max-w-7xl mx-auto">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                      <p className="text-gray-600 text-sm">Loading...</p>
                    </div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>
          </main>
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
