import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router";
import {
  LayoutDashboard, ListFilter, BarChart3, Settings, Users, Shield,
  MapPin, Bell, Menu, X, LogOut, ChevronRight, AlertTriangle, FileText
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/queue", icon: ListFilter, label: "Complaint Queue" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics & Heatmap" },
  { to: "/admin/sla", icon: Settings, label: "SLA Configuration" },
  { to: "/admin/users", icon: Users, label: "User Management" },
];

const Logo = ({
  className = "w-8 h-8",
  light = false,
  color = "violet"
}: {
  className?: string;
  light?: boolean;
  color?: "blue" | "violet";
}) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle
          cx="16"
          cy="16"
          r="14"
          className={secondary}
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <path
          d="M6 16H10L13 8L17 24L21 10L23 16H26"
          className={primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-[800] text-white">
              Civic<span className="text-violet-400">Pulse</span>
            </span>
            <div className="text-xs text-violet-400 font-[600]">Admin Console</div>
          </div>
        </div>
      </div>

      {/* Admin Badge */}
      <div className="px-4 py-4 mx-4 mt-4 bg-violet-900/30 rounded-xl border border-violet-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-[700]">
            MA
          </div>
          <div>
            <div className="text-sm font-[600] text-white">Municipal Admin</div>
            <div className="text-xs text-violet-400">Ward Manager · All Wards</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-[500] transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <div className="text-xs font-[600] text-slate-600 uppercase tracking-wider px-3 mb-2">Quick Links</div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-[500] text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <MapPin className="w-4 h-4" />
            Citizen View
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-6 border-t border-slate-800 pt-4">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-[500] text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 fixed left-0 top-0 h-full z-40 border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-900 flex flex-col border-r border-slate-800">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden text-slate-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-[700] bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-red-600 font-[600]">3 Escalations</span>
            </div>
            <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-[700] rounded-full flex items-center justify-center">5</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
