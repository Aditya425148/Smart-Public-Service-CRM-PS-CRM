import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router";
import {
  LayoutDashboard,
  ListFilter,
  BarChart3,
  Settings,
  Users,
  Shield,
  MapPin,
  Bell,
  Menu,
  LogOut,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/queue", icon: ListFilter, label: "Complaint Queue" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics & Heatmap" },
  { to: "/admin/sla", icon: Settings, label: "SLA Configuration" },
  { to: "/admin/users", icon: Users, label: "User Management" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(167,139,250,0.12),rgba(96,165,250,0.03),rgba(0,0,0,0))] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#4f46e5,#3b82f6)] shadow-[0_12px_30px_rgba(76,29,149,0.38)]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-[900] tracking-tight text-white">
              Civic<span className="text-violet-300">Pulse</span>
            </div>
            <div className="text-[10px] font-[700] uppercase tracking-[0.22em] text-sky-200">
              Admin Console
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-[1.5rem] border border-violet-300/15 bg-[linear-gradient(145deg,rgba(88,49,120,0.46),rgba(31,41,72,0.28))] px-4 py-4 shadow-[0_18px_38px_rgba(15,23,42,0.28)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#a855f7,#6366f1,#3b82f6)] text-sm font-[800] text-white shadow-lg shadow-violet-950/40">
            MA
          </div>
          <div>
            <div className="text-sm font-[700] text-white">Municipal Admin</div>
            <div className="text-xs text-[#d8c8e8]/80">Ward Manager · All Wards</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-[600] transition-all ${
                isActive
                  ? "bg-[linear-gradient(90deg,#7c3aed,#4f46e5,#3b82f6)] text-white shadow-[0_16px_34px_rgba(76,29,149,0.34)]"
                  : "text-[#d7d9e7] hover:bg-white/7 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="mb-2 px-3 text-[10px] font-[700] uppercase tracking-[0.22em] text-[#bfaecc]/65">
            Quick Links
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-[600] text-[#d7d9e7] transition-all hover:bg-white/7 hover:text-white"
          >
            <MapPin className="h-4 w-4" />
            Citizen View
            <ChevronRight className="ml-auto h-3 w-3" />
          </button>
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 pb-6 pt-4">
        <button
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-[600] text-[#d7d9e7] transition-all hover:bg-rose-500/12 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="relative flex min-h-screen overflow-hidden bg-[#160f27]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#47355d_0%,#5d4465_18%,#8c5464_42%,#c85a49_70%,#d46547_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[52%] bg-[linear-gradient(180deg,rgba(22,15,39,0.28),rgba(22,15,39,0.06)_55%,transparent)]" />
        <div className="absolute left-[6%] top-[4%] h-1.5 w-1.5 rounded-full bg-white/75 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
        <div className="absolute left-[9%] top-[6%] h-1 w-1 rounded-full bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.65)]" />
        <div className="absolute left-[12%] top-[5%] h-1 w-1 rounded-full bg-white/65 shadow-[0_0_10px_rgba(255,255,255,0.65)]" />
        <div className="absolute left-[14%] top-[8%] h-1.5 w-1.5 rounded-full bg-white/60 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
        <div className="absolute left-[18%] top-[4.5%] h-1 w-1 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.65)]" />
        <div className="absolute right-[18%] top-[8%] h-1.5 w-1.5 rounded-full bg-white/55 shadow-[0_0_12px_rgba(255,255,255,0.55)]" />
        <div className="absolute right-[12%] top-[5%] h-1 w-1 rounded-full bg-white/65 shadow-[0_0_10px_rgba(255,255,255,0.65)]" />
        <div className="absolute right-[8%] top-[10%] h-1.5 w-1.5 rounded-full bg-white/55 shadow-[0_0_12px_rgba(255,255,255,0.55)]" />
        <div className="absolute left-[36%] top-[13%] h-10 w-56 rounded-[999px] bg-white/12 blur-[2px]" />
        <div className="absolute right-[8%] top-[14%] h-8 w-72 rounded-[999px] bg-white/10 blur-[2px]" />
        <div className="absolute bottom-[8%] right-[-6%] h-56 w-56 rounded-full bg-orange-400/95 blur-[2px]" />
        <div className="absolute inset-x-0 bottom-0 h-[37%] bg-[linear-gradient(180deg,rgba(79,27,48,0)_0%,rgba(79,27,48,0.08)_10%,rgba(58,18,41,0.55)_100%)]" />
        <div className="absolute bottom-0 left-0 h-[28%] w-[12%] bg-[#6a2746]" />
        <div className="absolute bottom-0 left-[4%] h-[20%] w-[8%] bg-[#5d213c]" />
        <div className="absolute bottom-0 left-[11%] h-[24%] w-[10%] bg-[#61243f]" />
        <div className="absolute bottom-0 left-[20%] h-[16%] w-[7%] bg-[#6a2746]" />
        <div className="absolute bottom-0 left-[27%] h-[22%] w-[9%] bg-[#5d213c]" />
        <div className="absolute bottom-0 left-[36%] h-[13%] w-[7%] bg-[#6a2746]" />
        <div className="absolute bottom-0 left-[45%] h-[18%] w-[8%] bg-[#5d213c]" />
        <div className="absolute bottom-0 left-[55%] h-[14%] w-[6%] bg-[#6a2746]" />
        <div className="absolute bottom-0 left-[63%] h-[20%] w-[6%] rounded-t-[2rem] bg-[#7d4160]" />
        <div className="absolute bottom-0 left-[69%] h-[12%] w-[7%] bg-[#5d213c]" />
        <div className="absolute bottom-0 left-[79%] h-[10%] w-[5%] bg-[#6a2746]" />
        <div className="absolute bottom-0 left-[88%] h-[14%] w-[6%] bg-[#5d213c]" />
        <div className="absolute bottom-0 right-[2%] h-[11%] w-[8%] bg-[#6a2746]" />
        <div className="absolute bottom-0 left-[17%] h-[26%] w-[3.5%] bg-[#3c7bc4]" />
        <div className="absolute bottom-[25.5%] left-[16.4%] h-0 w-0 border-x-[1.9rem] border-b-[4.4rem] border-x-transparent border-b-[#3c7bc4]" />
        <div className="absolute bottom-[8%] left-[17.5%] grid h-[12%] w-[2.2%] grid-cols-2 gap-[2px] px-[2px] py-[4px]">
          <div className="bg-white/75" />
          <div className="bg-white/75" />
          <div className="bg-white/75" />
          <div className="bg-white/75" />
          <div className="bg-white/75" />
          <div className="bg-white/75" />
        </div>
        <div className="absolute inset-0 bg-white/6 backdrop-blur-[2px]" />
      </div>

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-white/10 bg-[linear-gradient(180deg,#10182f_0%,#151b33_34%,#17162d_72%,#111629_100%)] shadow-[10px_0_40px_rgba(15,23,42,0.3)] lg:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex w-64 flex-col border-r border-white/10 bg-[linear-gradient(180deg,#10182f_0%,#151b33_34%,#17162d_72%,#111629_100%)]">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/15 bg-white/14 px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:px-8">
          <button
            className="text-white/85 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2">
            <span className="rounded-full border border-violet-200/60 bg-[linear-gradient(90deg,#ede9fe,#e0f2fe)] px-3 py-1.5 text-[10px] font-[800] uppercase tracking-[0.2em] text-violet-700 shadow-sm">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-[linear-gradient(90deg,#fff1f2,#fef2f2)] px-3 py-1.5 shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-xs font-[700] text-rose-600">3 Escalations</span>
            </div>
            <button className="relative rounded-xl p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-[700] text-white">
                5
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-white/8 p-4 backdrop-blur-[16px] lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
