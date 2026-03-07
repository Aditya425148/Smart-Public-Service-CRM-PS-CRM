import { useState } from "react";
import { motion } from "motion/react";
import { Download, AlertTriangle, TrendingUp, BarChart3, MapPin } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Cell
} from "recharts";
import { mockWardStats, complaintTrendData, categoryBreakdown, kpiData } from "../../data/mockData";

// Heatmap SVG Component
function CityHeatmap({ activeCategory }: { activeCategory: string }) {
  const zones = [
    { id: "W1", x: 15, y: 20, w: 20, h: 15, ward: "Delhi", intensity: 0.6, count: 12 },
    { id: "W2", x: 40, y: 15, w: 18, h: 20, ward: "Ward 2", intensity: 0.4, count: 8 },
    { id: "W3", x: 62, y: 18, w: 22, h: 18, ward: "Ward 3", intensity: 0.85, count: 22 },
    { id: "W4", x: 12, y: 45, w: 25, h: 20, ward: "Bengaluru", intensity: 0.75, count: 18 },
    { id: "W5", x: 42, y: 45, w: 20, h: 18, ward: "Ward 5", intensity: 0.55, count: 11 },
    { id: "W6", x: 67, y: 45, w: 18, h: 20, ward: "Ward 6", intensity: 0.45, count: 9 },
    { id: "W7", x: 20, y: 72, w: 25, h: 18, ward: "Mumbai", intensity: 0.3, count: 6 },
  ];

  const getColor = (intensity: number) => {
    if (intensity >= 0.8) return "rgba(239, 68, 68, 0.7)";
    if (intensity >= 0.6) return "rgba(245, 158, 11, 0.6)";
    if (intensity >= 0.4) return "rgba(59, 130, 246, 0.5)";
    return "rgba(16, 185, 129, 0.4)";
  };

  return (
    <div className="relative bg-slate-900 rounded-2xl overflow-hidden" style={{ height: 320 }}>
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
        backgroundSize: "30px 30px"
      }} />

      {/* Streets SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="40" x2="100" y2="40" stroke="#334155" strokeWidth="0.8" />
        <line x1="0" y1="65" x2="100" y2="65" stroke="#334155" strokeWidth="0.8" />
        <line x1="35" y1="0" x2="35" y2="100" stroke="#334155" strokeWidth="0.8" />
        <line x1="65" y1="0" x2="65" y2="100" stroke="#334155" strokeWidth="0.8" />
      </svg>

      {/* Heatmap Zones */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {zones.map((z) => (
          <g key={z.id}>
            <rect
              x={z.x} y={z.y} width={z.w} height={z.h}
              fill={getColor(z.intensity)}
              rx="2"
              style={{ filter: `blur(${z.intensity * 4}px)` }}
            />
          </g>
        ))}
      </svg>

      {/* Ward Labels */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {zones.map((z) => (
          <text
            key={z.id}
            x={z.x + z.w / 2} y={z.y + z.h / 2}
            textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="2.5" fontWeight="700" opacity="0.9"
          >
            {z.ward}
          </text>
        ))}
        {/* Red Zone indicators */}
        {zones.filter(z => z.intensity >= 0.8).map((z) => (
          <circle
            key={`alert-${z.id}`}
            cx={z.x + z.w - 2} cy={z.y + 2} r="1.5"
            fill="#EF4444"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-slate-700">
        <div className="text-xs text-slate-400 mb-2 font-[600]">Complaint Density</div>
        <div className="flex items-center gap-3">
          {[
            { color: "bg-emerald-400/70", label: "Low" },
            { color: "bg-blue-500/70", label: "Med" },
            { color: "bg-amber-400/70", label: "High" },
            { color: "bg-red-500/70", label: "Critical" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-sm ${color}`} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Red Zone alert */}
      <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white text-xs font-[700] px-3 py-1.5 rounded-full flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3" />
        Red Zone: Ward 3
      </div>
    </div>
  );
}

const resolutionTimeData = mockWardStats.map(w => ({
  ward: w.ward,
  avgTime: w.avgResolutionHours,
  target: 72,
}));

const slaHistoryData = [
  { month: "Oct", compliance: 71 },
  { month: "Nov", compliance: 74 },
  { month: "Dec", compliance: 77 },
  { month: "Jan", compliance: 79 },
  { month: "Feb", compliance: 80 },
  { month: "Mar", compliance: 82 },
];

const radarData = [
  { metric: "SLA Compliance", score: 82 },
  { metric: "Verification Rate", score: 67 },
  { metric: "Citizen Satisfaction", score: 84 },
  { metric: "Resolution Speed", score: 71 },
  { metric: "Escalation Mgmt", score: 78 },
  { metric: "Participation", score: 63 },
];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("7d");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-[800] text-slate-900">Analytics & Heatmap</h1>
          <p className="text-slate-500 text-sm mt-1">City-wide civic intelligence dashboard</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
            {["7d", "30d", "90d"].map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-4 py-2 text-sm font-[500] transition-colors ${
                  dateRange === d ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-[700] text-slate-900">Live Complaint Heatmap</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ward-level density with Red Zone alerts</p>
          </div>
          <div className="flex gap-2">
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none text-slate-700 cursor-pointer"
            >
              {["All", "Pothole", "Garbage", "Water", "Streetlight", "Safety"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <CityHeatmap activeCategory={activeCategory} />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "MTTA", value: `${kpiData.mtta}h`, target: "< 4h", ok: kpiData.mtta < 4, desc: "Mean Time to Assignment" },
          { label: "MTTR", value: `${kpiData.mttr}h`, target: "< 72h", ok: kpiData.mttr < 72, desc: "Mean Time to Resolution" },
          { label: "SLA Compliance", value: `${kpiData.slaCompliance}%`, target: "> 80%", ok: kpiData.slaCompliance > 80, desc: "Within SLA window" },
          { label: "Satisfaction", value: `${kpiData.satisfactionScore}★`, target: "> 4.0", ok: kpiData.satisfactionScore >= 4, desc: "Post-resolution rating" },
        ].map(({ label, value, target, ok, desc }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-500 font-[500]">{desc}</span>
              <span className={`w-2 h-2 rounded-full mt-1 ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
            </div>
            <div className="text-2xl font-[800] text-slate-900 mb-1">{value}</div>
            <div className="text-xs text-slate-400">Target: {target}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* SLA Compliance Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">SLA Compliance Trend</h3>
          <p className="text-xs text-slate-400 mb-4">6-month improvement trajectory</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={slaHistoryData}>
              <defs>
                <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[60, 90]} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", fontSize: "12px", color: "#f1f5f9" }} />
              <Area type="monotone" dataKey="compliance" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#slaGrad)" dot={{ fill: "#8B5CF6", strokeWidth: 0, r: 4 }} />
              <Line type="monotone" dataKey={() => 80} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} dot={false} name="Target 80%" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Time by Ward */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">Avg Resolution Time by Ward</h3>
          <p className="text-xs text-slate-400 mb-4">Hours · Target: 72h</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resolutionTimeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="ward" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", fontSize: "12px", color: "#f1f5f9" }} />
              <Bar dataKey="avgTime" radius={[0, 6, 6, 0]}>
                {resolutionTimeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.avgTime > 72 ? "#EF4444" : entry.avgTime > 48 ? "#F59E0B" : "#10B981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Radar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">Performance Overview</h3>
          <p className="text-xs text-slate-400 mb-4">City-wide scores</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Ward Stats Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-[700] text-slate-900">Ward Performance Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Ward</th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Resolved</th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Avg Time</th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockWardStats.map((w) => (
                  <tr key={w.ward} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-[600] text-slate-800">{w.ward}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{w.totalComplaints}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-600 font-[600]">{w.resolved}</span>
                      <span className="text-slate-400 text-xs ml-1">({Math.round(w.resolved / w.totalComplaints * 100)}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={w.avgResolutionHours > 72 ? "text-red-600 font-[600]" : w.avgResolutionHours > 48 ? "text-amber-600 font-[600]" : "text-emerald-600 font-[600]"}>
                        {w.avgResolutionHours}h
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${w.civicHealthScore >= 85 ? "bg-emerald-500" : w.civicHealthScore >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${w.civicHealthScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-[700] ${w.civicHealthScore >= 85 ? "text-emerald-600" : w.civicHealthScore >= 70 ? "text-amber-600" : "text-red-600"}`}>
                          {w.civicHealthScore}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transparency Log */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-600/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-base font-[700] text-white">Transparency Log — Public Summary</h3>
          <span className="text-xs text-violet-400 font-[600] ml-auto">March 2026</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {mockWardStats.slice(0, 4).map((w) => (
            <div key={w.ward} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-sm font-[700] text-white mb-1">{w.ward}</div>
              <div className="text-xs text-slate-400">
                Resolved <span className="text-emerald-400 font-[600]">{w.resolved} complaints</span> this month. Avg resolution: <span className="text-blue-400 font-[600]">{w.avgResolutionHours}h</span>.
                Civic Health Score: <span className={`font-[700] ${w.civicHealthScore >= 85 ? "text-emerald-400" : w.civicHealthScore >= 70 ? "text-amber-400" : "text-red-400"}`}>{w.civicHealthScore}/100</span>.
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-4">* Public-facing version available without PII. Data updated daily at midnight.</p>
      </div>
    </div>
  );
}