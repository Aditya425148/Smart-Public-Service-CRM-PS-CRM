import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";
import {
  mockAreaStats,
  complaintTrendData,
  categoryBreakdown,
  kpiData,
} from "../../data/mockData";

// Heatmap SVG Component
function CityHeatmap({ activeCategory }: { activeCategory: string }) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Define the main regions with refined grid alignment
  const regions = [
    {
      id: "delhi",
      name: "Delhi",
      displayName: "National Capital Territory",
      x: 5,
      y: 12,
      w: 43,
      h: 72,
      subAreas: [
        {
          id: "d-north",
          name: "North Delhi",
          x: 8,
          y: 18,
          w: 17,
          h: 20,
          pending: 12,
          intensity: 0.8,
        },
        {
          id: "d-east",
          name: "East Delhi",
          x: 28,
          y: 18,
          w: 17,
          h: 20,
          pending: 15,
          intensity: 0.9,
        },
        {
          id: "d-west",
          name: "West Delhi",
          x: 8,
          y: 41,
          w: 17,
          h: 20,
          pending: 5,
          intensity: 0.3,
        },
        {
          id: "d-south",
          name: "South Delhi",
          x: 28,
          y: 41,
          w: 17,
          h: 20,
          pending: 8,
          intensity: 0.5,
        },
        {
          id: "d-central",
          name: "Central",
          x: 18,
          y: 64,
          w: 17,
          h: 17,
          pending: 20,
          intensity: 0.95,
        },
      ],
    },
    {
      id: "up",
      name: "Uttar Pradesh",
      displayName: "Uttar Pradesh",
      x: 52,
      y: 12,
      w: 43,
      h: 72,
      subAreas: [
        {
          id: "up-noida",
          name: "Noida",
          x: 55,
          y: 18,
          w: 17,
          h: 20,
          pending: 10,
          intensity: 0.6,
        },
        {
          id: "up-gzb",
          name: "Ghaziabad",
          x: 75,
          y: 18,
          w: 17,
          h: 20,
          pending: 7,
          intensity: 0.4,
        },
        {
          id: "up-lko",
          name: "Lucknow",
          x: 55,
          y: 41,
          w: 17,
          h: 20,
          pending: 25,
          intensity: 0.9,
        },
        {
          id: "up-knp",
          name: "Kanpur",
          x: 75,
          y: 41,
          w: 17,
          h: 20,
          pending: 18,
          intensity: 0.75,
        },
        {
          id: "up-vns",
          name: "Varanasi",
          x: 65,
          y: 64,
          w: 17,
          h: 17,
          pending: 14,
          intensity: 0.65,
        },
      ],
    },
  ];

  const getColor = (intensity: number) => {
    if (intensity >= 0.8) return "rgba(220, 38, 38, 0.85)"; // Red-600
    if (intensity >= 0.6) return "rgba(217, 119, 6, 0.75)"; // Amber-600
    if (intensity >= 0.4) return "rgba(37, 99, 235, 0.65)"; // Blue-600
    return "rgba(5, 150, 105, 0.55)"; // Emerald-600
  };

  return (
    <div
      className="relative bg-[#020617] rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl"
      style={{ height: 500 }}
    >
      {/* Dynamic Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#475569 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main SVG Layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {regions.map((region) => (
          <g
            key={region.id}
            onMouseEnter={() => setHoveredRegion(region.name)}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            {/* Region Backdrop */}
            <motion.rect
              animate={{
                fill:
                  hoveredRegion === region.name
                    ? "rgba(15, 23, 42, 0.6)"
                    : "rgba(15, 23, 42, 0.2)",
                stroke:
                  hoveredRegion === region.name
                    ? "rgba(59, 130, 246, 0.5)"
                    : "rgba(51, 65, 85, 0.3)",
              }}
              x={region.x}
              y={region.y}
              width={region.w}
              height={region.h}
              rx="2"
              strokeWidth="0.5"
            />

            {/* Region Title */}
            <motion.text
              animate={{
                opacity: hoveredRegion === region.name ? 0.2 : 0.9,
                letterSpacing:
                  hoveredRegion === region.name ? "0.4em" : "0.2em",
              }}
              x={region.x + region.w / 2}
              y={region.y - 4}
              textAnchor="middle"
              fill="white"
              fontSize="4.2"
              fontWeight="900"
              className="tracking-tighter"
              style={{ textTransform: "uppercase" }}
            >
              {region.name}
            </motion.text>

            {/* Sub-Areas Grid */}
            {region.subAreas.map((area) => (
              <g key={area.id}>
                <motion.rect
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: hoveredRegion === region.name ? 1 : 0.3,
                    filter:
                      hoveredRegion === region.name
                        ? "blur(0px)"
                        : "blur(10px)",
                    scale: hoveredRegion === region.name ? 1 : 0.9,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  x={area.x}
                  y={area.y}
                  width={area.w}
                  height={area.h}
                  fill={getColor(area.intensity)}
                  rx="4"
                />

                <AnimatePresence>
                  {hoveredRegion === region.name && (
                    <motion.g
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <text
                        x={area.x + area.w / 2}
                        y={area.y + area.h / 2 - 1.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="2.8"
                        fontWeight="900"
                        style={{
                          pointerEvents: "none",
                          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        {area.name}
                      </text>
                      <text
                        x={area.x + area.w / 2}
                        y={area.y + area.h / 2 + 2.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="rgba(255,255,255,0.9)"
                        fontSize="1.8"
                        fontWeight="700"
                        style={{ pointerEvents: "none" }}
                      >
                        {area.pending} PENDING
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 flex items-center gap-6 px-5 py-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50">
        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
          Density Index
        </span>
        <div className="flex items-center gap-4">
          {[
            { color: "bg-emerald-400", label: "Safe" },
            { color: "bg-blue-500", label: "Moderate" },
            { color: "bg-amber-400", label: "High" },
            { color: "bg-rose-500", label: "Critical" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-slate-400 font-[800] uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const resolutionTimeData = mockAreaStats.map((w) => ({
  area: w.area,
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
          <h1 className="text-2xl font-[800] text-[#ffcbd1]">
            Analytics & Heatmap
          </h1>
          <p className="text-white/90 text-sm mt-1">
            City-wide civic intelligence dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white/88 backdrop-blur-xl border border-white rounded-2xl overflow-hidden shadow-sm">
            {["7d", "30d", "90d"].map((d) => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-4 py-2 text-sm font-[500] transition-colors ${
                  dateRange === d
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white/88 backdrop-blur-xl border border-white rounded-2xl hover:bg-white transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-[700] text-slate-900">
              Live Complaint Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Area-level density with Red Zone alerts
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none text-slate-700 cursor-pointer"
            >
              {[
                "All",
                "Pothole",
                "Garbage",
                "Water",
                "Streetlight",
                "Safety",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <CityHeatmap activeCategory={activeCategory} />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "MTTA",
            value: `${kpiData.mtta}h`,
            target: "< 4h",
            ok: kpiData.mtta < 4,
            desc: "Mean Time to Assignment",
          },
          {
            label: "MTTR",
            value: `${kpiData.mttr}h`,
            target: "< 72h",
            ok: kpiData.mttr < 72,
            desc: "Mean Time to Resolution",
          },
          {
            label: "SLA Compliance",
            value: `${kpiData.slaCompliance}%`,
            target: "> 80%",
            ok: kpiData.slaCompliance > 80,
            desc: "Within SLA window",
          },
          {
            label: "Satisfaction",
            value: `${kpiData.satisfactionScore}★`,
            target: "> 4.0",
            ok: kpiData.satisfactionScore >= 4,
            desc: "Post-resolution rating",
          },
        ].map(({ label, value, target, ok, desc }) => (
          <div
            key={label}
            className="bg-white/88 backdrop-blur-xl rounded-[1.75rem] p-5 border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)]"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-500 font-[500]">{desc}</span>
              <span
                className={`w-2 h-2 rounded-full mt-1 ${ok ? "bg-emerald-500" : "bg-red-500"}`}
              />
            </div>
            <div className="text-2xl font-[800] text-slate-900 mb-1">
              {value}
            </div>
            <div className="text-xs text-slate-400">Target: {target}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* SLA Compliance Trend */}
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">
            SLA Compliance Trend
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            6-month improvement trajectory
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={slaHistoryData}>
              <defs>
                <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                domain={[60, 90]}
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
                dataKey="compliance"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fill="url(#slaGrad)"
                dot={{ fill: "#8B5CF6", strokeWidth: 0, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={() => 80}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                name="Target 80%"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Time by Area */}
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">
            Avg Resolution Time by Area
          </h3>
          <p className="text-xs text-slate-400 mb-4">Hours · Target: 72h</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resolutionTimeData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="area"
                type="category"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={50}
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
              <Bar dataKey="avgTime" radius={[0, 6, 6, 0]}>
                {resolutionTimeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.avgTime > 72
                        ? "#EF4444"
                        : entry.avgTime > 48
                          ? "#F59E0B"
                          : "#10B981"
                    }
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
        <div className="bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-1">
            Performance Overview
          </h3>
          <p className="text-xs text-slate-400 mb-4">City-wide scores</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: "#94a3b8" }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Stats Table */}
        <div className="lg:col-span-2 bg-white/88 backdrop-blur-xl rounded-[1.85rem] border border-white shadow-[0_18px_45px_rgba(148,163,184,0.14)] overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-[700] text-slate-900">
              Area Performance Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">
                    Area
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">
                    Resolved
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-[700] text-slate-500 uppercase tracking-wider">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockAreaStats.map((w) => (
                  <tr
                    key={w.area}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-[600] text-slate-800">
                      {w.area}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {w.totalComplaints}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-600 font-[600]">
                        {w.resolved}
                      </span>
                      <span className="text-slate-400 text-xs ml-1">
                        ({Math.round((w.resolved / w.totalComplaints) * 100)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          w.avgResolutionHours > 72
                            ? "text-red-600 font-[600]"
                            : w.avgResolutionHours > 48
                              ? "text-amber-600 font-[600]"
                              : "text-emerald-600 font-[600]"
                        }
                      >
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
                        <span
                          className={`text-xs font-[700] ${w.civicHealthScore >= 85 ? "text-emerald-600" : w.civicHealthScore >= 70 ? "text-amber-600" : "text-red-600"}`}
                        >
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
          <h3 className="text-base font-[700] text-white">
            Transparency Log — Public Summary
          </h3>
          <span className="text-xs text-violet-400 font-[600] ml-auto">
            March 2026
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {mockAreaStats.slice(0, 4).map((w) => (
            <div
              key={w.area}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="text-sm font-[700] text-white mb-1">{w.area}</div>
              <div className="text-xs text-slate-400">
                Resolved{" "}
                <span className="text-emerald-400 font-[600]">
                  {w.resolved} complaints
                </span>{" "}
                this month. Avg resolution:{" "}
                <span className="text-blue-400 font-[600]">
                  {w.avgResolutionHours}h
                </span>
                . Civic Health Score:{" "}
                <span
                  className={`font-[700] ${w.civicHealthScore >= 85 ? "text-emerald-400" : w.civicHealthScore >= 70 ? "text-amber-400" : "text-red-400"}`}
                >
                  {w.civicHealthScore}/100
                </span>
                .
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-4">
          * Public-facing version available without PII. Data updated daily at
          midnight.
        </p>
      </div>
    </div>
  );
}
