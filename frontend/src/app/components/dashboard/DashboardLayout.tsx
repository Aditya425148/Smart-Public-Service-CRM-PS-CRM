import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router";
import { account } from "../../appwrite";
import { authService } from "../../appwriteService";
import {
  LayoutDashboard,
  Plus,
  FileText,
  Trophy,
  User,
  Settings,
  LogOut,
  MapPin,
  Bell,
  Menu,
  X,
  ChevronRight,
  Shield,
  Search,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home", end: true },
  { to: "/dashboard/report", icon: Plus, label: "Report Issue" },
  { to: "/dashboard/complaints", icon: FileText, label: "My Complaints" },
  { to: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
];

const Logo = ({
  className = "w-8 h-8",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) => (
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
        className={light ? "stroke-blue-400/20" : "stroke-blue-600/20"}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path
        d="M6 16H10L13 8L17 24L21 10L23 16H26"
        className={light ? "stroke-blue-400" : "stroke-blue-600"}
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

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    account
      .get()
      .then((user) => {
        setCurrentUser({
          name: user.name || user.email?.split("@")[0] || "Citizen",
          email: user.email || "",
          uid: user.$id,
          reputationScore: 0,
          ward: "Ward 1",
          tier: 1,
        });
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSessions();
    } catch (_) {
      try {
        await account.deleteSession("current");
      } catch (_) {}
    }
    navigate("/login");
  };

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      // Show admin link if user has label OR is anonymous (for demo purposes)
      if (user && (user.labels?.includes("admin") || !user.email)) {
        setIsAdmin(true);
      }
    });
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" light={true} />
          <span className="text-lg font-[800] text-white">
            Civic<span className="text-blue-400">Pulse</span>
          </span>
        </div>
      </div>

      {/* User Profile Mini */}
      <div className="px-4 py-4 mx-4 mt-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-[700]">
            {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-[600] text-white truncate">
              {currentUser?.name || "Loading..."}
            </div>
            <div className="text-xs text-slate-400">
              {currentUser?.reputationScore || 0} pts ·{" "}
              {currentUser?.ward || "Ward 1"}
            </div>
          </div>
          <div className="text-xs bg-blue-600/30 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-[600]">
            T{currentUser?.tier || "1"}
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
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="text-xs font-[600] text-slate-600 uppercase tracking-wider px-3 mb-2">
              Management
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-[500] text-slate-400 hover:bg-slate-800 hover:text-white transition-all transition-all"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
              <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 pb-6 space-y-1 border-t border-slate-800 pt-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-[500] text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-[500] text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 fixed left-0 top-0 h-full z-40 border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-slate-900 flex flex-col border-r border-slate-800">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative max-w-xs w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-[700] rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/dashboard/report")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-[600] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Report Issue
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
