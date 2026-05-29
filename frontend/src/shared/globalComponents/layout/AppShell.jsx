"use client";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { useSidebar } from "@/shared/hooks/useSidebar";

export default function AppShell({
  menuItems,
  title,
  dashboardHref = "/",
  children,
}) {
  const {
    open,
    handleMouseEnter,
    handleMouseLeave,
    togglePinned,
  } = useSidebar(true);

  return (
    <div className="min-h-screen bg-emerald-50/40">
      <Topbar title={title} dashboardHref={dashboardHref} />

      <div className="flex min-h-[calc(100vh-5rem)]">
        <Sidebar
          menuItems={menuItems}
          open={open}
          onTogglePinned={togglePinned}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        <main className="flex-1 p-5 md:p-8">
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}