import { Outlet } from "react-router-dom";
import { cn } from "../../utils/helpers";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

export default function MainLayout({ sidebarCollapsed, toggleSidebar }) {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main content — shifts with sidebar */}
      <div
        className={cn(
          "flex flex-col flex-1 min-h-screen main-transition",
          sidebarCollapsed ? "ml-16" : "ml-[260px]",
        )}
      >
        <Topbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-7 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
