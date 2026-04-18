import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { appwriteService } from "../../appwriteService";
import { exportToPDF } from "../../utils/pdfExport";
import { toast } from "sonner";
import {
  Download,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MapPin,
  Loader2,
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
} from "../../data/mockData";
import {
  DELHI_ZONE_CONFIG,
  inferDelhiZone,
  isDelhiComplaint,
  type DelhiZoneId,
  type ZoneStats,
} from "../../utils/adminInsights";

// Heatmap SVG Component
function CityHeatmap({
  activeCategory,
  zoneStats,
}: {
  activeCategory: string;
  zoneStats: ZoneStats[];
}) {
  const [hoveredRegion, setHoveredRegion] = useState<DelhiZoneId | null>(null);
  const zoneMap = useMemo(() => {
    const map = {} as Record<DelhiZoneId, ZoneStats>;
    zoneStats.forEach((zone) => {
      map[zone.id] = zone;
    });
    return map;
  }, [zoneStats]);

  const maxPending = Math.max(...zoneStats.map((z) => z.pending), 1);
  const hoveredMetrics = hoveredRegion
    ? zoneMap[hoveredRegion]
    : zoneStats.reduce((top, zone) => (zone.pending > top.pending ? zone : top));
  const hoveredRegionConfig = hoveredRegion
    ? DELHI_ZONE_CONFIG.find((zone) => zone.id === hoveredRegion) || null
    : null;

  const getColor = (intensity: number) => {
    if (intensity >= 0.8) return "rgba(220, 38, 38, 0.85)"; // Red-600
    if (intensity >= 0.6) return "rgba(217, 119, 6, 0.75)"; // Amber-600
    if (intensity >= 0.4) return "rgba(37, 99, 235, 0.65)"; // Blue-600
    return "rgba(5, 150, 105, 0.55)"; // Emerald-600
  };

  const getShortLabel = (name: string) => {
    if (name === "Central & New Delhi") return "Central";
    if (name === "East Delhi & Shahdara") return "East";
    if (name === "North & North-West Delhi") return "North-West";
    if (name === "South Delhi") return "South";
    if (name === "West Delhi") return "West";
    return name;
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

      <div className="absolute left-5 top-5 right-5 z-10 flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 backdrop-blur-md">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
            Hover Insight
          </div>
          <div className="mt-2 text-sm font-[800] text-white">
            {hoveredRegionConfig ? hoveredRegionConfig.name : "Move over a Delhi zone"}
          </div>
          <div className="mt-1 text-[11px] leading-relaxed text-slate-300">
            {hoveredRegionConfig
              ? "Live complaint metrics for the selected zone."
              : "Detailed zone metrics will appear here on hover."}
          </div>
        </div>

        <div className="hidden rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 text-right backdrop-blur-md md:block">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
            Density Focus
          </div>
          <div className="mt-2 text-sm font-[800] text-white">
            {hoveredMetrics?.name || "Delhi Overview"}
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            {hoveredMetrics?.pending ?? 0} active complaints in focus
          </div>
        </div>
      </div>

      {/* Main SVG Layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <text
          x={50}
          y={5}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize="3"
          fontWeight="800"
          style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          Delhi NCT Live Complaint Heatmap
        </text>

        <rect
          x="6"
          y="11"
          width="88"
          height="72"
          rx="5"
          fill="rgba(2,6,23,0.1)"
          stroke="rgba(148,163,184,0.12)"
          strokeWidth="0.3"
        />

        {DELHI_ZONE_CONFIG.map((region) => {
          const metrics = zoneMap[region.id] || {
            id: region.id,
            name: region.name,
            localities: region.localities,
            target: region.target,
            total: 0,
            pending: 0,
            resolved: 0,
            escalated: 0,
          };
          const intensity = Math.max(0.2, metrics.pending / maxPending);

          return (
            <g
              key={region.id}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <motion.rect
                animate={{
                  fill:
                    hoveredRegion === region.id
                      ? "rgba(15, 23, 42, 0.6)"
                      : "rgba(15, 23, 42, 0.2)",
                  stroke:
                    hoveredRegion === region.id
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

              <motion.rect
                initial={{ opacity: 0 }}
                animate={{
                  opacity: hoveredRegion === region.id ? 1 : 0.82,
                  filter:
                    hoveredRegion === region.id ? "blur(0px)" : "blur(1.6px)",
                  scale: hoveredRegion === region.id ? 1.01 : 0.99,
                  stroke:
                    hoveredRegion === region.id
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(255,255,255,0.18)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                x={region.x}
                y={region.y}
                width={region.w}
                height={region.h}
                fill={getColor(intensity)}
                rx="4"
                strokeWidth="0.42"
              />

              <motion.rect
                animate={{
                  opacity: hoveredRegion === region.id ? 1 : 0,
                  filter:
                    hoveredRegion === region.id
                      ? "drop-shadow(0 0 16px rgba(96,165,250,0.6))"
                      : "drop-shadow(0 0 0 rgba(0,0,0,0))",
                }}
                x={region.x - 0.9}
                y={region.y - 0.9}
                width={region.w + 1.8}
                height={region.h + 1.8}
                rx="4.8"
                fill="transparent"
                stroke="rgba(147,197,253,0.9)"
                strokeWidth="0.5"
              />

              <rect
                x={region.x + 1.4}
                y={region.y + 2.3}
                width={Math.min(region.w - 2.8, 20)}
                height="5.5"
                rx="2"
                fill="rgba(2,6,23,0.56)"
                stroke="rgba(148,163,184,0.22)"
                strokeWidth="0.3"
              />
              <text
                x={region.x + 2.8}
                y={region.y + 5.8}
                fill="rgba(255,255,255,0.96)"
                fontSize="1.45"
                fontWeight="800"
                style={{ pointerEvents: "none" }}
              >
                {getShortLabel(metrics.name)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute right-6 top-[6.75rem] z-20 w-[280px] rounded-[1.6rem] border border-slate-700/60 bg-slate-950/78 p-4 text-white shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
              {hoveredRegionConfig ? "Selected Zone" : "Hover to Inspect"}
            </div>
            <div className="mt-2 text-lg font-[800] leading-tight text-white">
              {hoveredMetrics?.name || "Delhi Zone Details"}
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-[800] uppercase tracking-[0.2em] text-slate-300">
            {hoveredRegionConfig ? "Live" : "Standby"}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-xl bg-rose-500/10 px-3 py-2">
            <div className="font-[800] text-rose-300">{hoveredMetrics?.pending ?? 0}</div>
            <div className="mt-1 text-slate-400">Active</div>
          </div>
          <div className="rounded-xl bg-emerald-500/10 px-3 py-2">
            <div className="font-[800] text-emerald-300">{hoveredMetrics?.resolved ?? 0}</div>
            <div className="mt-1 text-slate-400">Resolved</div>
          </div>
          <div className="rounded-xl bg-amber-500/10 px-3 py-2">
            <div className="font-[800] text-amber-300">{hoveredMetrics?.escalated ?? 0}</div>
            <div className="mt-1 text-slate-400">Escalated</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
            Localities
          </div>
          <div className="mt-2 text-[12px] leading-relaxed text-slate-200">
            {hoveredMetrics?.localities.join(", ") ||
              "Hover over a zone to reveal its localities and civic profile."}
          </div>
        </div>

        <div className="mt-3 text-[11px] leading-relaxed text-slate-300">
          {hoveredMetrics?.target ||
            "The hover panel will surface zone-specific complaint context here."}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-900/60 px-5 py-3 backdrop-blur-md">
        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
          Delhi Density Index (
          {activeCategory === "All" ? "all categories" : activeCategory})
        </span>
        <div className="flex flex-wrap items-center gap-4">
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

// These will be replaced with dynamic calculations in the component
const defaultSlaHistoryData = [
  { month: "Oct", compliance: 71 },
  { month: "Nov", compliance: 74 },
  { month: "Dec", compliance: 77 },
  { month: "Jan", compliance: 79 },
  { month: "Feb", compliance: 80 },
  { month: "Mar", compliance: 82 },
];

const defaultRadarData = [
  { metric: "SLA Compliance", score: 82 },
  { metric: "Verification Rate", score: 67 },
  { metric: "Citizen Satisfaction", score: 84 },
  { metric: "Resolution Speed", score: 71 },
  { metric: "Escalation Mgmt", score: 78 },
  { metric: "Participation", score: 63 },
];

const defaultKpiData = {
  mtta: 2.5,
  mttr: 48,
  slaCompliance: 82,
  satisfactionScore: 4.1,
};

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("7d");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = appwriteService.subscribeToComplaints((data) => {
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculate SLA history from actual data - last 6 months
  const slaHistoryData = useMemo(() => {
    const monthData: Record<string, { total: number; met: number }> = {};

    complaints.forEach((c) => {
      if (!c.createdAt) return;
      const date = new Date(c.createdAt);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!monthData[monthKey]) {
        monthData[monthKey] = { total: 0, met: 0 };
      }

      if (["Resolved", "Closed"].includes(c.status)) {
        monthData[monthKey].total++;
        if ((c.slaRemainingHours || 1) >= 0) {
          monthData[monthKey].met++;
        }
      }
    });

    // Get last 6 months
    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const data = monthData[key] || { total: 0, met: 0 };
      months.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        compliance:
          data.total > 0 ? Math.round((data.met / data.total) * 100) : 0,
      });
    }
    return months;
  }, [complaints]);

  const delhiComplaints = useMemo(
    () => complaints.filter((c) => isDelhiComplaint(c)),
    [complaints],
  );

  const heatmapZoneStats = useMemo<ZoneStats[]>(() => {
    const statsByZone: Record<DelhiZoneId, ZoneStats> =
      DELHI_ZONE_CONFIG.reduce(
        (acc, zone) => {
          acc[zone.id] = {
            id: zone.id,
            name: zone.name,
            localities: zone.localities,
            target: zone.target,
            total: 0,
            pending: 0,
            resolved: 0,
            escalated: 0,
          };
          return acc;
        },
        {} as Record<DelhiZoneId, ZoneStats>,
      );

    delhiComplaints
      .filter((c) => activeCategory === "All" || c.category === activeCategory)
      .forEach((complaint) => {
        const zoneId = inferDelhiZone(complaint);
        const zone = statsByZone[zoneId];
        zone.total += 1;

        if (["Resolved", "Closed"].includes(complaint.status)) {
          zone.resolved += 1;
        } else {
          zone.pending += 1;
        }

        if (complaint.escalated) {
          zone.escalated += 1;
        }
      });

    return DELHI_ZONE_CONFIG.map((zone) => statsByZone[zone.id]);
  }, [activeCategory, delhiComplaints]);

  // Calculate performance metrics from actual data
  const { kpiData, radarData, resolutionByArea, areaStats } = useMemo(() => {
    if (complaints.length === 0) {
      return {
        kpiData: defaultKpiData,
        radarData: defaultRadarData,
        resolutionByArea: resolutionTimeData,
        areaStats: mockAreaStats,
      };
    }

    // Calculate MTTA - mean time to assignment (hours from submission to assigned)
    const assignmentTimes = complaints
      .filter((c) => c.assignedAt || c.createdAt)
      .map((c) => {
        const created = new Date(c.createdAt).getTime();
        const assigned = c.assignedAt
          ? new Date(c.assignedAt).getTime()
          : created;
        return (assigned - created) / (1000 * 60 * 60);
      });
    const mtta =
      assignmentTimes.length > 0
        ? Math.round(
            (assignmentTimes.reduce((a, b) => a + b, 0) /
              assignmentTimes.length) *
              10,
          ) / 10
        : defaultKpiData.mtta;

    // Calculate MTTR - mean time to resolution
    const resolutionTimes = complaints
      .filter((c) => ["Resolved", "Closed"].includes(c.status))
      .map((c) => {
        const created = new Date(c.createdAt).getTime();
        const updated = new Date(c.updatedAt).getTime();
        return (updated - created) / (1000 * 60 * 60);
      });
    const mttr =
      resolutionTimes.length > 0
        ? Math.round(
            (resolutionTimes.reduce((a, b) => a + b, 0) /
              resolutionTimes.length) *
              10,
          ) / 10
        : defaultKpiData.mttr;

    // Calculate SLA Compliance
    const resolved = complaints.filter((c) =>
      ["Resolved", "Closed"].includes(c.status),
    );
    const slaMet = resolved.filter(
      (c) => (c.slaRemainingHours || 1) >= 0,
    ).length;
    const slaCompliance =
      resolved.length > 0 ? Math.round((slaMet / resolved.length) * 100) : 0;

    // Calculate Satisfaction Score from ratings
    const ratings = complaints.filter((c) => c.rating).map((c) => c.rating);
    const satisfactionScore =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
          ) / 10
        : defaultKpiData.satisfactionScore;

    // Calculate metrics for radar
    const escalated = complaints.filter((c) => c.escalated).length;
    const escalationMgmt =
      100 - Math.round((escalated / Math.max(complaints.length, 1)) * 100);

    const verified = complaints.filter(
      (c) => c.verifiedBy || c.status !== "Submitted",
    ).length;
    const verificationRate = Math.round(
      (verified / Math.max(complaints.length, 1)) * 100,
    );

    const resolutionSpeed = Math.min(100, Math.round(100 - (mttr / 72) * 50));

    const radarScores = [
      { metric: "SLA Compliance", score: slaCompliance },
      { metric: "Verification Rate", score: verificationRate },
      {
        metric: "Citizen Satisfaction",
        score: Math.round(satisfactionScore * 20),
      },
      { metric: "Resolution Speed", score: resolutionSpeed },
      { metric: "Escalation Mgmt", score: escalationMgmt },
      {
        metric: "Participation",
        score: Math.min(100, Math.round((complaints.length / 100) * 100)),
      },
    ];

    // Group by area with full stats
    const areaStatsMap: Record<string, any> = {};
    complaints.forEach((c) => {
      const area = c.area || c.ward || "Other";
      if (!areaStatsMap[area]) {
        areaStatsMap[area] = {
          area,
          totalComplaints: 0,
          resolved: 0,
          times: [],
        };
      }
      areaStatsMap[area].totalComplaints++;
      if (["Resolved", "Closed"].includes(c.status)) {
        areaStatsMap[area].resolved++;
        const created = new Date(c.createdAt).getTime();
        const updated = new Date(c.updatedAt).getTime();
        const hours = (updated - created) / (1000 * 60 * 60);
        areaStatsMap[area].times.push(hours);
      }
    });

    const areaStatsWithMetrics = Object.values(areaStatsMap)
      .map((stat: any) => ({
        ...stat,
        avgResolutionHours:
          stat.times.length > 0
            ? Math.round(
                stat.times.reduce((a: number, b: number) => a + b, 0) /
                  stat.times.length,
              )
            : 0,
        civicHealthScore: Math.max(
          40,
          Math.min(
            100,
            Math.round(
              (stat.resolved / Math.max(stat.totalComplaints, 1)) * 80 +
                (Math.max(
                  0,
                  72 -
                    (stat.times.length > 0
                      ? stat.times.reduce((a: number, b: number) => a + b, 0) /
                        stat.times.length
                      : 0),
                ) /
                  72) *
                  20,
            ),
          ),
        ),
      }))
      .sort((a, b) => b.totalComplaints - a.totalComplaints);

    const resolutionByAreaData = areaStatsWithMetrics
      .map((stat: any) => ({
        area: stat.area,
        avgTime: stat.avgResolutionHours,
        target: 72,
      }))
      .slice(0, 8);

    return {
      kpiData: { mtta, mttr, slaCompliance, satisfactionScore },
      radarData: radarScores,
      resolutionByArea: resolutionByAreaData,
      areaStats: areaStatsWithMetrics,
    };
  }, [complaints]);

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
    <div className="space-y-6 max-w-7xl mx-auto" id="analytics-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-[800] text-[#ffcbd1]">
            Analytics & Heatmap
          </h1>
          <p className="text-white/90 text-sm mt-1">
            Delhi NCT civic intelligence dashboard
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
          <button
            onClick={async () => {
              try {
                setIsExporting(true);
                await exportToPDF(
                  "analytics-dashboard",
                  "admin-analytics",
                  "Complaint Analytics Report",
                );
                toast.success("PDF exported successfully");
              } catch (error) {
                console.error("Export failed:", error);
                toast.error("Failed to export PDF");
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white/88 backdrop-blur-xl border border-white rounded-2xl hover:bg-white transition-colors shadow-sm disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Exporting..." : "Export PDF"}
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
              Delhi-only zone density with live complaint intensity
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
                "Sanitation",
                "Construction",
                "Other",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <CityHeatmap
          activeCategory={activeCategory}
          zoneStats={heatmapZoneStats}
        />

        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {heatmapZoneStats.map((zone) => (
            <div
              key={zone.id}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2"
            >
              <p className="text-[11px] font-[700] text-slate-700 truncate">
                {zone.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Active:{" "}
                <span className="font-[700] text-rose-600">{zone.pending}</span>{" "}
                · Resolved:{" "}
                <span className="font-[700] text-emerald-600">
                  {zone.resolved}
                </span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                Target: {zone.target}
              </p>
            </div>
          ))}
        </div>
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
            <BarChart data={resolutionByArea} layout="vertical">
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
                {resolutionByArea.map((entry, i) => (
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
                {(areaStats && areaStats.length > 0
                  ? areaStats
                  : mockAreaStats
                ).map((w) => (
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
          {(areaStats && areaStats.length > 0
            ? areaStats.slice(0, 4)
            : mockAreaStats.slice(0, 4)
          ).map((w) => (
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

