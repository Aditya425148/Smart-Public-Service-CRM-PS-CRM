import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  MapPin,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Zap,
  Users,
  ChevronRight,
  Bell,
  ThumbsUp,
} from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

// ... existing Counter and ProgressRing components ...
function Counter({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);

  return <>{value.toLocaleString()}</>;
}

// Progress Ring SVG
function ProgressRing({
  percent,
  size = 100,
}: {
  percent: number;
  size?: number;
}) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth={8}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.5s ease" }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// City Map Component with pins
function FixMap({
  complaints,
  userId,
}: {
  complaints: any[];
  userId?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter and map real complaints to radar coordinates
  const pins = complaints
    .filter((c) => {
      const distKm = c.distance_km || 1.0;
      const statusMatch = c.status !== "Resolved" && c.status !== "Closed";

      // LOGIC: Show if it's within 5km OR if it's reported by the CURRENT USER
      const isMyReport = userId && c.reporterId === userId;
      return distKm <= 15 && (distKm <= 5 || isMyReport) && statusMatch;
    })
    .map((c, i) => {
      const distKm = c.distance_km || 1.0;
      const idStr = c.id || i.toString();
      let seed = 0;
      for (let j = 0; j < idStr.length; j++) {
        seed += idStr.charCodeAt(j);
      }

      const angle = (seed * 137.5) % 360;

      // Scale: 5km takes 0-45% radius.
      // If > 5km, we scale it to stay between 46% and 49% (just outside the regular rings)
      let radiusPercent;
      if (distKm <= 5) {
        radiusPercent = (distKm / 5) * 45;
      } else {
        // Map 5.1km - 50km to 46% - 49%
        const overflowDist = Math.min(distKm, 20); // Cap visual distance at 20km for layout
        radiusPercent = 46 + ((overflowDist - 5) / 15) * 3;
      }

      const x = 50 + Math.cos((angle * Math.PI) / 180) * radiusPercent;
      const y = 50 + Math.sin((angle * Math.PI) / 180) * radiusPercent;

      return {
        id: c.id,
        x: x,
        y: y,
        status: c.status,
        category: c.category,
        address: c.address,
        dist: distKm,
        isFar: distKm > 5,
        isMyReport: userId && c.reporterId === userId,
      };
    });

  const colorMap: Record<string, string> = {
    Resolved: "#10B981",
    Closed: "#10B981",
    "In Progress": "#F59E0B",
    Assigned: "#F59E0B",
    Escalated: "#EF4444",
    Submitted: "#EF4444",
    "Pending Verification": "#EF4444",
  };

  return (
    <div className="relative w-full h-[550px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl flex items-center justify-center">
      {/* Map grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.08) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(59,130,246,0.08) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "55px 55px",
        }}
      />

      {/* Radar rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
        {[1, 2, 3, 4, 5].map((km) => (
          <div
            key={km}
            className="absolute border border-blue-500/15 rounded-full flex items-center justify-center"
            style={{
              width: `${km * 100}px`,
              height: `${km * 100}px`,
            }}
          >
            <span className="mb-auto mt-1.5 text-[9px] text-blue-400 font-bold bg-slate-900/90 px-1.5 py-0.5 rounded-full border border-blue-500/10 backdrop-blur-sm">
              {km}km
            </span>
          </div>
        ))}

        {/* Radar Sweep Animation - Enhanced Visibility & Pulse Effect */}
        <div
          className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/30 via-blue-500/5 to-transparent rounded-full origin-center animate-[spin_6s_linear_infinite]"
          style={{
            clipPath: "polygon(50% 50%, 100% 0, 100% 50%)",
            filter: "blur(2px)",
            boxShadow: "0 0 15px rgba(59,130,246,0.2)",
          }}
        />

        {/* Radar Pulse Effect */}
        <div className="absolute w-[500px] h-[500px] rounded-full border border-blue-500/10 animate-pulse scale-90" />
      </div>

      {/* Roads & Navigation Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="#334155"
          strokeWidth="0.3"
        />
        <line
          x1="50"
          y1="0"
          x2="50"
          y2="100"
          stroke="#334155"
          strokeWidth="0.3"
        />
      </svg>

      {/* User location pulse */}
      <div
        className="absolute z-30"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="group relative flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.6)] relative z-10 cursor-help">
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-60" />
          </div>

          <div className="absolute top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-800 border border-blue-500/30 text-white p-3 rounded-xl shadow-2xl w-56 text-center backdrop-blur-md">
              <div className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                <MapPin className="w-3 h-3" /> Radar Origin
              </div>
              <div className="text-sm font-[600] leading-tight">
                Current Location Hub
              </div>
              <div className="text-[10px] text-slate-400 mt-2 border-t border-white/5 pt-2">
                Scanning 5km radius around your detected GPS coordinates.
              </div>
            </div>
          </div>

          {/* <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-[10px] text-white px-2.5 py-1 rounded-full font-bold shadow-lg border border-blue-400/30 group-hover:hidden transition-all">
            Central Hub (5km Radius)
          </div> */}
        </div>
      </div>

      {/* Complaint Pins */}
      {pins.map((pin) => {
        const color = colorMap[pin.status] || "#6B7280";
        const isHovered = hovered === pin.id;
        return (
          <div
            key={pin.id}
            className="absolute cursor-pointer z-20 group/pin"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={() => setHovered(pin.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(`/dashboard/complaints/${pin.id}`)}
          >
            {pin.isFar && (
              <div className="absolute -inset-2 rounded-full border border-dashed border-white/30 animate-[spin_10s_linear_infinite] opacity-50" />
            )}
            <div
              className={`w-5 h-5 rounded-full border-2 border-white shadow-md transition-all group-hover/pin:scale-125 ${pin.isFar ? "h-3 w-3 shadow-[0_0_10px_rgba(255,255,255,0.4)]" : ""}`}
              style={{ backgroundColor: color }}
            />
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap z-30 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-[600]">{pin.category}</div>
                  {pin.isFar && (
                    <span className="bg-amber-500/20 text-amber-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-black border border-amber-500/30">
                      Far Location ({pin.dist.toFixed(1)}km)
                    </span>
                  )}
                  {pin.isMyReport && (
                    <span className="bg-blue-500/20 text-blue-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-black border border-blue-500/30">
                      My Report
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-300 mb-1">
                  {pin.address}
                </div>
                <div
                  style={{ color }}
                  className="font-bold flex items-center gap-2"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {pin.status}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-700">
        {[
          { color: "#10B981", label: "Resolved" },
          { color: "#F59E0B", label: "In Progress" },
          { color: "#EF4444", label: "Open" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:bg-slate-700 transition-colors flex items-center justify-center">
          +
        </button>
        <button className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:bg-slate-700 transition-colors flex items-center justify-center">
          −
        </button>
      </div>
    </div>
  );
}

const statusColor: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-600",
  "Pending Verification": "bg-yellow-100 text-yellow-700",
  Verified: "bg-blue-100 text-blue-700",
  Assigned: "bg-indigo-100 text-indigo-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-500",
  Escalated: "bg-red-100 text-red-700",
};

export default function CitizenHome() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const [userState, setUserState] = useState<string | null>(null);

  useEffect(() => {
    // Get user coordinates and State name
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });

          // Fetch State Name for point verification filtering
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            );
            const data = await res.json();
            const state = data.address?.state;
            if (state) setUserState(state);
          } catch (e) {
            console.error("Failed to fetch state name:", e);
          }
        },
        () => {
          console.warn("Location access denied or unavailable.");
        },
      );
    }
  }, []);

  // Real stats calculation from DB
  const userComplaints = complaints.filter(
    (c) => c.reporterId === user.uid || c.userId === user.uid,
  );
  const resolvedCount = userComplaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed",
  ).length;
  const impactScore = resolvedCount * 50 + userComplaints.length * 10;
  const resolutionRate =
    userComplaints.length > 0
      ? Math.round((resolvedCount / userComplaints.length) * 100)
      : 0;
  const inProgressCount = complaints.filter(
    (c) => c.status === "In Progress" || c.status === "Assigned",
  ).length;
  const escalatedCount = complaints.filter(
    (c) => c.escalated || c.status === "Escalated",
  ).length;

  // Category breakdown from all complaints
  const categoryBreakdown = complaints.reduce(
    (acc: Record<string, number>, c: any) => {
      const cat = c.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 4);

  const stats = {
    impactScore: impactScore,
    userComplaints: userComplaints.length,
    reputationScore:
      userComplaints.length > 0 ? 150 + userComplaints.length * 5 : 0,
    activeNearby: complaints.filter(
      (c: any) => c.status !== "Resolved" && c.status !== "Closed",
    ).length,
    resolutionRate,
    inProgress: inProgressCount,
    escalated: escalatedCount,
    totalIssues: complaints.length,
  };

  useEffect(() => {
    // Fetch current user from Appwrite session
    account
      .get()
      .then((u) => {
        setUser({
          name: u.name || u.email?.split("@")[0] || "Citizen",
          email: u.email,
          uid: u.$id,
        });
      })
      .catch(() => {
        navigate("/login");
        return;
      });

    // Subscribe to real-time updates with backend filtering if coords available
    const unsubscribe = appwriteService.subscribeToComplaints(
      (data) => {
        setComplaints(data);
        setLoading(false);
      },
      coords?.lat,
      coords?.lng,
      5.0, // 5km radius
    );

    return () => unsubscribe();
  }, [navigate, coords]);

  const userRecentComplaints = userComplaints.slice(0, 4);
  const progressPercent = Math.min(
    Math.round((stats.reputationScore / 500) * 100),
    100,
  );

  // Complaints visible on the radar (within 5km, not resolved)
  const nearbyComplaints = complaints.filter((c) => {
    const distKm = c.distance_km || 1.0;
    return distKm <= 5 && c.status !== "Resolved" && c.status !== "Closed";
  });

  // Complaints that need verification (not the user's own AND not already verified by user)
  // FILTER: Only show complaints from the same State as the user
  const verifiableComplaints = complaints.filter(
    (c) =>
      (c.status === "Submitted" || c.status === "Pending Verification") &&
      c.reporterId !== user.uid &&
      c.userId !== user.uid &&
      !(c.verifiedBy || []).includes(user.uid) &&
      (userState ? c.state === userState : true),
  );

  const categoryIcons: Record<string, string> = {
    Garbage: "🗑️",
    Streetlight: "💡",
    Pothole: "🔧",
    Water: "💧",
    Sanitation: "⚠️",
    Construction: "🏗️",
    Safety: "🛡️",
    Other: "📍",
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Synchronizing Civic Data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-400/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight uppercase text-[10px] bg-blue-50 w-fit px-2 py-0.5 rounded-md border border-blue-100">
              <Zap className="w-3 h-3 fill-current" />
              Citizen Portal
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tight">
                Welcome back,{" "}
                <span className="text-blue-600">
                  {user.name?.split(" ")[0] || "Citizen"}
                </span>
              </h1>
              {coords && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full h-fit mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-black text-blue-600 tracking-tighter">
                    Live Feed: {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">
              You have{" "}
              <span className="text-slate-900 font-bold">
                {stats.activeNearby} active issues
              </span>{" "}
              identified within your 5km radar.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard/report")}
            className="group relative flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Report New Issue
          </button>
        </div>

        {/* Stats Row with Glass Effect */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Impact Score",
              value: stats.impactScore,
              icon: Zap,
              color: "text-amber-500",
              bg: "bg-amber-500/5",
              border: "border-amber-200/50",
            },
            {
              label: "Complaints",
              value: stats.userComplaints,
              icon: Clock,
              color: "text-blue-500",
              bg: "bg-blue-500/5",
              border: "border-blue-200/50",
            },
            {
              label: "Reputation",
              value: stats.reputationScore,
              icon: TrendingUp,
              color: "text-indigo-500",
              bg: "bg-indigo-500/5",
              border: "border-indigo-200/50",
              suffix: " pts",
            },
            {
              label: "Neighborhood",
              value: stats.activeNearby,
              icon: MapPin,
              color: "text-emerald-500",
              bg: "bg-emerald-500/5",
              border: "border-emerald-200/50",
            },
          ].map(({ label, value, icon: Icon, color, bg, border, suffix }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative overflow-hidden bg-white/60 backdrop-blur-md border ${border} rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03]">
                <Icon size={100} />
              </div>
              <div
                className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 border border-white`}
              >
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  <Counter end={value} />
                  {suffix}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-[2.5rem] p-6 lg:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    The Fix Map™
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500 mt-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      Real-time Radar Monitoring
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* <button className="px-4 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                    Satellite
                  </button> */}
                  <button className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                    Radar
                  </button>
                </div>
              </div>

              <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner">
                <FixMap complaints={complaints} userId={user.uid} />
              </div>

              {/* Quick Navigation Tags */}
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  "General",
                  "Emergency",
                  "Roads",
                  "Electricity",
                  "Water",
                  "Waste",
                ].map((tag) => (
                  <button
                    key={tag}
                    className="px-5 py-2.5 bg-white/50 backdrop-blur rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-500 border border-slate-100 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Nearby Complaints List (below map) */}
              {nearbyComplaints.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      📍 Complaints on Radar ({nearbyComplaints.length})
                    </h3>
                    <button
                      onClick={() => navigate("/dashboard/complaints")}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                    {nearbyComplaints.slice(0, 8).map((c, i) => {
                      const statusClr: Record<string, string> = {
                        Submitted: "bg-red-500",
                        "Pending Verification": "bg-red-500",
                        "In Progress": "bg-amber-500",
                        Assigned: "bg-amber-500",
                        Escalated: "bg-red-600",
                        Verified: "bg-blue-500",
                      };
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() =>
                            navigate(`/dashboard/complaints/${c.id}`)
                          }
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/80 cursor-pointer transition-all group border border-transparent hover:border-slate-100 hover:shadow-sm"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusClr[c.status] || "bg-slate-400"}`}
                          />
                          <div className="text-lg shrink-0">
                            {categoryIcons[c.category] || "📍"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                              {c.category}
                              {c.subcategory ? ` — ${c.subcategory}` : ""}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin size={10} className="shrink-0" />{" "}
                                {c.address || c.location?.address || "Unknown"}
                              </div>
                              <div className="flex items-center gap-1 shrink-0 font-bold text-slate-400">
                                <Clock size={9} />
                                {c.createdAt
                                  ? typeof c.createdAt === "string"
                                    ? new Date(c.createdAt).toLocaleDateString(
                                        "en-IN",
                                        { day: "numeric", month: "short" },
                                      )
                                    : new Date(
                                        c.createdAt.seconds * 1000,
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                      })
                                  : "Today"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[c.status] || "bg-slate-100 text-slate-500"}`}
                            >
                              {c.status}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Community Pulse - New Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-md border border-emerald-200/50 rounded-[2rem] p-5 text-center"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {stats.resolutionRate}%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Resolution Rate
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white/60 backdrop-blur-md border border-amber-200/50 rounded-[2rem] p-5 text-center"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-amber-100">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">
                  <Counter end={stats.inProgress} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  In Progress
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/60 backdrop-blur-md border border-red-200/50 rounded-[2rem] p-5 text-center"
              >
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-2xl font-black text-red-600">
                  <Counter end={stats.escalated} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Escalated
                </div>
              </motion.div>
            </div>

            {/* Category Breakdown */}
            {topCategories.length > 0 && (
              <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-[2.5rem] p-6 shadow-lg">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
                  Top Issue Categories
                </h3>
                <div className="space-y-4">
                  {topCategories.map(([cat, count], i) => {
                    const maxCount = (topCategories[0]?.[1] as number) || 1;
                    const pct = Math.round(
                      ((count as number) / (maxCount as number)) * 100,
                    );
                    const colors = [
                      "bg-blue-500",
                      "bg-indigo-500",
                      "bg-violet-500",
                      "bg-purple-500",
                    ];
                    const catIcons: Record<string, string> = {
                      Garbage: "🗑️",
                      Streetlight: "💡",
                      Pothole: "🔧",
                      Water: "💧",
                      Sanitation: "⚠️",
                      Construction: "🏗️",
                      Safety: "🛡️",
                    };
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-slate-700">
                            {catIcons[cat] || "📍"} {cat}
                          </span>
                          <span className="text-xs font-black text-slate-500">
                            {count as number}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${colors[i] || "bg-slate-400"} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Reputation Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-all" />

              <div className="flex items-center gap-6 mb-8">
                <div className="relative shrink-0">
                  <ProgressRing percent={progressPercent} size={90} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-black">
                        {progressPercent}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black italic">
                    {stats.reputationScore}
                  </div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">
                    Rank: Lead Guardian
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Next Reward</span>
                  <span className="text-white">
                    {500 - stats.reputationScore} pts
                  </span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full p-0.5 border border-white/10 shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                  Redeem Rewards Area
                </button>
              </div>
            </div>

            {/* Verify & Earn 50 Points */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-md rounded-[2.5rem] p-6 border border-amber-200/50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl -z-10" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  <ThumbsUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-950">
                    Verify & Earn
                  </h3>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">
                    +50 pts per verification
                  </p>
                </div>
              </div>
              <p className="text-[12px] font-bold text-amber-900/70 leading-snug mb-4">
                Help your neighborhood in{" "}
                <span className="text-amber-600 font-black">
                  {userState || "your state"}
                </span>{" "}
                by verifying unresolved issues. Earn{" "}
                <span className="text-amber-600 font-black">50 points</span> per
                verified report.
              </p>

              {verifiableComplaints.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {verifiableComplaints.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/dashboard/complaints/${c.id}`)}
                      className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl cursor-pointer hover:bg-white transition-all group border border-amber-100 hover:border-amber-300"
                    >
                      <div className="text-lg">
                        {categoryIcons[c.category] || "📍"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-700">
                          {c.category}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {c.address || c.location?.address}
                        </div>
                      </div>
                      <div className="shrink-0 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-full">
                        +50 pts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 mb-4">
                  <p className="text-[11px] text-amber-600 font-bold">
                    No complaints pending in {userState || "your area"}
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/dashboard/complaints")}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <ThumbsUp size={14} />{" "}
                {verifiableComplaints.length > 0
                  ? `Verify All (${verifiableComplaints.length})`
                  : "Browse Complaints"}
              </button>
            </div>

            {/* Your Complaints Cards */}
            {userComplaints.length > 0 && (
              <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-[2.5rem] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Your Reports
                  </h3>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {userComplaints.length} total
                  </span>
                </div>

                {/* Status breakdown chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {[
                    {
                      label: "Active",
                      count: userComplaints.filter(
                        (c) => !["Resolved", "Closed"].includes(c.status),
                      ).length,
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      label: "Resolved",
                      count: resolvedCount,
                      color: "bg-emerald-100 text-emerald-700",
                    },
                    {
                      label: "In Progress",
                      count: userComplaints.filter(
                        (c) =>
                          c.status === "In Progress" || c.status === "Assigned",
                      ).length,
                      color: "bg-amber-100 text-amber-700",
                    },
                  ]
                    .filter((s) => s.count > 0)
                    .map((s) => (
                      <span
                        key={s.label}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.color}`}
                      >
                        {s.count} {s.label}
                      </span>
                    ))}
                </div>

                {/* Recent complaint cards */}
                <div className="space-y-3">
                  {userRecentComplaints.map((c) => (
                    <div
                      key={c.id}
                      className="flex gap-3 p-3 rounded-[1.5rem] hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-100 group shadow-sm hover:shadow-md"
                      onClick={() => navigate(`/dashboard/complaints/${c.id}`)}
                    >
                      <div
                        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${statusColor[c.status]?.split(" ")[0] || "bg-slate-100"} border border-white shadow-sm`}
                      >
                        <span className="text-base">
                          {categoryIcons[c.category] || "📍"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {c.category}
                          {c.subcategory ? ` — ${c.subcategory}` : ""}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                          <MapPin size={9} />{" "}
                          {c.address || c.location?.address || "Unknown"}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor[c.status] || "bg-slate-100 text-slate-500"}`}
                          >
                            {c.status}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1">
                            <Clock size={8} className="text-blue-500" />
                            {c.slaRemainingHours ?? c.slaHours ?? "24"}h left
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock size={8} />
                            {c.createdAt
                              ? typeof c.createdAt === "string"
                                ? new Date(c.createdAt).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short" },
                                  )
                                : new Date(
                                    c.createdAt.seconds * 1000,
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })
                              : "Today"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 self-center shrink-0" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/dashboard/complaints")}
                  className="w-full mt-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 border border-slate-100"
                >
                  View All My Complaints <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Activity Hub - Glassified */}
            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-[2.5rem] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Latest Activity
                </h3>
                <button
                  onClick={() => navigate("/dashboard/complaints")}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-wider"
                >
                  Browse All
                </button>
              </div>
              <div className="space-y-4">
                {userRecentComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="flex gap-4 p-4 rounded-[1.5rem] hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-100 group shadow-sm hover:shadow-md"
                    onClick={() => navigate(`/dashboard/complaints/${c.id}`)}
                  >
                    <div
                      className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${statusColor[c.status]?.split(" ")[0] || "bg-slate-100"} border border-white shadow-sm transition-transform group-hover:scale-110`}
                    >
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {c.category}
                      </div>
                      <div className="text-[11px] font-bold text-slate-400 mt-1 truncate flex items-center gap-1">
                        <MapPin size={10} /> {c.address}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                        <Clock size={10} />
                        {c.createdAt
                          ? typeof c.createdAt === "string"
                            ? new Date(c.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : new Date(
                                c.createdAt.seconds * 1000,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                          : "Recently"}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 self-center" />
                  </div>
                ))}
                {userRecentComplaints.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="text-slate-300" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      No recent reports
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Civic Level Progression — 5 Levels */}
        {(() => {
          const levels = [
            {
              level: 1,
              name: "Newcomer",
              icon: "🌱",
              minReports: 0,
              color: "from-slate-400 to-slate-500",
              ring: "border-slate-300",
              bg: "bg-slate-100",
              text: "text-slate-600",
            },
            {
              level: 2,
              name: "Observer",
              icon: "👁️",
              minReports: 3,
              color: "from-blue-400 to-blue-600",
              ring: "border-blue-400",
              bg: "bg-blue-50",
              text: "text-blue-600",
            },
            {
              level: 3,
              name: "Advocate",
              icon: "📢",
              minReports: 10,
              color: "from-indigo-500 to-violet-600",
              ring: "border-indigo-400",
              bg: "bg-indigo-50",
              text: "text-indigo-600",
            },
            {
              level: 4,
              name: "Guardian",
              icon: "🛡️",
              minReports: 25,
              color: "from-amber-500 to-orange-600",
              ring: "border-amber-400",
              bg: "bg-amber-50",
              text: "text-amber-600",
            },
            {
              level: 5,
              name: "Legend",
              icon: "🏆",
              minReports: 50,
              color: "from-yellow-400 to-amber-500",
              ring: "border-yellow-400",
              bg: "bg-yellow-50",
              text: "text-yellow-600",
            },
          ];
          const totalReports = userComplaints.length;
          const currentLevel =
            [...levels].reverse().find((l) => totalReports >= l.minReports) ||
            levels[0];
          const nextLevel = levels.find(
            (l) => l.level === currentLevel.level + 1,
          );
          const progressToNext = nextLevel
            ? Math.min(
                Math.round(
                  ((totalReports - currentLevel.minReports) /
                    (nextLevel.minReports - currentLevel.minReports)) *
                    100,
                ),
                100,
              )
            : 100;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-[2.5rem] p-6 lg:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Civic Level Progression
                  </h2>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                    Report more issues to level up and unlock titles
                  </p>
                </div>
                <div
                  className={`${currentLevel.bg} ${currentLevel.text} text-xs font-black px-3 py-1.5 rounded-full border ${currentLevel.ring}`}
                >
                  Level {currentLevel.level} — {currentLevel.name}
                </div>
              </div>

              {/* Level nodes */}
              <div className="relative flex items-center justify-between px-2 md:px-6">
                {/* Connecting line */}
                <div className="absolute top-6 left-10 right-10 h-1 bg-slate-100 rounded-full z-0" />
                <motion.div
                  className="absolute top-6 left-10 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full z-[1]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.max(0, ((currentLevel.level - 1) / 4) * 100 + (progressToNext / 4) * (nextLevel ? 1 : 0))}%`,
                  }}
                  style={{ maxWidth: "calc(100% - 5rem)" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {levels.map((l) => {
                  const isReached = totalReports >= l.minReports;
                  const isCurrent = l.level === currentLevel.level;
                  return (
                    <div
                      key={l.level}
                      className="relative z-10 flex flex-col items-center gap-2"
                    >
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: isCurrent ? 1.15 : 1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-[3px] shadow-lg transition-all ${
                          isReached
                            ? `bg-gradient-to-br ${l.color} border-white text-white shadow-${l.text.split("-")[1]}-200/40`
                            : "bg-slate-50 border-slate-200 grayscale opacity-50"
                        } ${isCurrent ? "ring-4 ring-blue-500/20" : ""}`}
                      >
                        {l.icon}
                      </motion.div>
                      <div className="text-center">
                        <div
                          className={`text-[10px] font-black uppercase tracking-wider ${isReached ? l.text : "text-slate-300"}`}
                        >
                          {l.name}
                        </div>
                        <div
                          className={`text-[9px] font-bold ${isReached ? "text-slate-500" : "text-slate-300"}`}
                        >
                          {l.minReports === 0
                            ? "Start"
                            : `${l.minReports} reports`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress to next level */}
              {nextLevel && (
                <div className="mt-8 bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {currentLevel.icon} Level {currentLevel.level} →{" "}
                      {nextLevel.icon} Level {nextLevel.level}
                    </span>
                    <span className="text-[11px] font-black text-slate-700">
                      {totalReports} / {nextLevel.minReports} reports
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-2">
                    Report {nextLevel.minReports - totalReports} more issue
                    {nextLevel.minReports - totalReports !== 1 ? "s" : ""} to
                    reach{" "}
                    <span className={`${nextLevel.text} font-black`}>
                      {nextLevel.name}
                    </span>
                  </p>
                </div>
              )}
              {!nextLevel && (
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-200/50 text-center">
                  <p className="text-sm font-black text-amber-700">
                    🏆 You've reached the highest level — Legend!
                  </p>
                  <p className="text-[11px] text-amber-600 mt-1">
                    You are a true civic champion. Keep making a difference.
                  </p>
                </div>
              )}
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}

// Inline icon component
function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
