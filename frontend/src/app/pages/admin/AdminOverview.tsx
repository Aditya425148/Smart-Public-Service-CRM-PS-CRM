import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { appwriteService } from "../../appwriteService";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Zap,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import {
  kpiData,
  complaintTrendData,
  categoryBreakdown,
  mockOfficers,
} from "../../data/mockData";

const KPICard = ({
  label,
  value,
  suffix,
  subtext,
  color,
  icon: Icon,
  trend,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/85 backdrop-blur-xl rounded-[1.75rem] p-5 border border-white shadow-[0_18px_45px_rgba(148,163,184,0.16)]"
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span
          className={`text-xs font-[600] px-2 py-0.5 rounded-full ${
            trend > 0
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <div className="text-2xl font-[800] text-slate-900">
      {value}
      {suffix}
    </div>
    <div className="text-xs text-slate-500 mt-1 font-[500]">{label}</div>
    {subtext && <div className="text-xs text-slate-400 mt-0.5">{subtext}</div>}
  </motion.div>
);

export default function AdminOverview() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = appwriteService.subscribeToComplaints((data) => {
      setComplaints(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const liveKpis = {
    total: complaints.length || 142, // Fallback to mock for first-ever boot
    resolved:
      complaints.length > 0
        ? complaints.filter(
            (c) => c.status === "Resolved" || c.status === "Closed",
          ).length
        : 98,
    active:
      complaints.length > 0
        ? complaints.filter(
            (c) => !["Resolved", "Closed", "Rejected"].includes(c.status),
          ).length
        : 44,
    escalated:
      complaints.length > 0 ? complaints.filter((c) => c.escalated).length : 3,
  };

  // Skip the spinner if data is available from Firestore's persistent cache
  if (loading && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8 text-slate-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[800] text-[#ffcbd1]">Admin Overview</h1>
          <p className="text-white/90 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/queue")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[linear-gradient(90deg,#7c3aed,#2563eb)] hover:opacity-95 text-white text-sm font-[700] rounded-2xl transition-all shadow-[0_16px_32px_rgba(76,29,149,0.24)]"
          >
            <BarChart3 className="w-4 h-4" />
            Complaint Queue
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      <div className="bg-[linear-gradient(90deg,rgba(255,241,242,0.96),rgba(255,255,255,0.92))] border border-rose-200 rounded-[1.75rem] p-4 flex items-center gap-4 flex-wrap shadow-[0_18px_40px_rgba(251,113,133,0.08)]">
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-[700] text-red-800">Active Alerts</div>
          <div className="text-xs text-red-600 mt-0.5">
            3 complaints SLA breached · 1 Water Supply escalated to City Admin ·
            Complaint volume spike detected in Ward 3
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/queue")}
          className="flex items-center gap-1.5 text-xs font-[700] text-rose-600 hover:text-rose-700"
        >
          Review <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Complaints"
          value={liveKpis.total}
          suffix=""
          icon={Activity}
          color="bg-blue-50 text-blue-600"
          trend={12}
          subtext="Synced from Firestore"
        />
        <KPICard
          label="Resolved Overall"
          value={liveKpis.resolved}
          suffix=""
          icon={CheckCircle}
          color="bg-emerald-50 text-emerald-600"
          trend={8}
          subtext="Across all time"
        />
        <KPICard
          label="SLA Compliance"
          value={kpiData.slaCompliance}
          suffix="%"
          icon={TrendingUp}
          color="bg-violet-50 text-violet-600"
          trend={-2}
          subtext="Target: 80%"
        />
        <KPICard
          label="Pending Resolution"
          value={liveKpis.active}
          suffix=""
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          subtext={`${liveKpis.escalated} escalated`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Mean Time to Assignment",
            value: kpiData.mtta,
            suffix: "h",
            target: "< 4h",
            ok: kpiData.mtta < 4,
          },
          {
            label: "Mean Time to Resolution",
            value: kpiData.mttr,
            suffix: "h",
            target: "< 72h",
            ok: kpiData.mttr < 72,
          },
          {
            label: "Verification Rate",
            value: kpiData.verificationRate,
            suffix: "%",
            target: "> 60%",
            ok: kpiData.verificationRate > 60,
          },
          {
            label: "Citizen Satisfaction",
            value: kpiData.satisfactionScore,
            suffix: "★",
            target: "> 4.0",
            ok: kpiData.satisfactionScore >= 4,
          },
        ].map(({ label, value, suffix, target, ok }) => (
          <div
            key={label}
            className="bg-white/85 backdrop-blur-xl rounded-[1.75rem] p-4 border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-[600] text-slate-500">{label}</span>
              <span
                className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
              />
            </div>
            <div className="text-xl font-[800] text-slate-900">
              {value}
              {suffix}
            </div>
            <div className="text-xs text-slate-400 mt-1">Target: {target}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-[700] text-slate-900">
                Complaint Trends
              </h3>
              <p className="text-xs text-slate-400">Last 7 days</p>
            </div>
            <div className="flex gap-3 text-xs">
              {[
                { color: "#3B82F6", label: "Submitted" },
                { color: "#10B981", label: "Resolved" },
                { color: "#EF4444", label: "Escalated" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={complaintTrendData}>
              <defs>
                <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
              />
              <Area
                type="monotone"
                dataKey="submitted"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorSubmitted)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorResolved)"
              />
              <Bar
                dataKey="escalated"
                fill="#EF4444"
                barSize={8}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
          <div className="mb-4">
            <h3 className="text-base font-[700] text-slate-900">By Category</h3>
            <p className="text-xs text-slate-400">Current month breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                paddingAngle={2}
              >
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {categoryBreakdown.slice(0, 5).map(({ name, value, color }) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-slate-600 flex-1">{name}</span>
                <span className="text-xs font-[700] text-slate-700">
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Officer Performance + Recent Escalations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Officers */}
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="text-base font-[700] text-slate-900">
              Field Officers
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-[600]">
              {mockOfficers.length} active
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {mockOfficers.map((officer) => (
              <div
                key={officer.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-[700]">
                  {officer.avatar}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-[600] text-slate-800">
                    {officer.name}
                  </div>
                  <div className="text-xs text-slate-400">{officer.ward}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-[700] text-slate-800">
                    {officer.activeComplaints}
                  </div>
                  <div className="text-xs text-slate-400">active</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-[700] text-emerald-600">
                    {officer.resolvedThisWeek}
                  </div>
                  <div className="text-xs text-slate-400">this week</div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-[600] ${
                    officer.status === "Available"
                      ? "bg-emerald-100 text-emerald-700"
                      : officer.status === "On Site"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {officer.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Escalated Complaints */}
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="text-base font-[700] text-slate-900">
              Escalations & Overdue
            </h3>
            <button
              onClick={() => navigate("/admin/queue")}
              className="text-xs text-violet-600 hover:text-violet-700 font-[600] flex items-center gap-1"
            >
              View Queue <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {complaints
              .filter((c) => c.escalated || (c.slaRemainingHours || 0) < 0)
              .map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className={`w-2 h-10 rounded-full ${c.escalated ? "bg-red-500" : "bg-amber-500"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-[600] text-slate-800">
                      {c.id}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {c.category} · {c.address}
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-xs font-[700] ${c.escalated ? "text-red-600" : "text-amber-600"}`}
                    >
                      {c.escalated
                        ? "🔴 Escalated"
                        : `${Math.abs(c.slaRemainingHours || 0)}h Overdue`}
                    </div>
                    <div className="text-xs text-slate-400 text-right">
                      Ward {c.ward?.split(" ")[1] || "N/A"}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
