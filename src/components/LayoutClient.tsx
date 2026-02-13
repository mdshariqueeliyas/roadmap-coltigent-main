'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

type SidebarContextValue = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within LayoutClient');
  return ctx;
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>
      <a
        href="#main-content"
        className="skip-link focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-secondary focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main id="main-content" className="flex-1 p-4 md:p-6" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      {/* Mobile overlay when sidebar is open */}
      <button
        type="button"
        onClick={closeSidebar}
        className="sidebar-overlay fixed inset-0 z-40 bg-black/50 lg:hidden"
        aria-label="Close menu"
        tabIndex={sidebarOpen ? 0 : -1}
        style={{ display: sidebarOpen ? undefined : 'none' }}
      />
    </SidebarContext.Provider>
  );
}
