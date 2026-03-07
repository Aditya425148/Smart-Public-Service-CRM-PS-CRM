import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Filter,
  Search,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  MapPin,
  SortAsc,
  Zap,
} from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

const statusColors: Record<string, string> = {
  Submitted: "bg-slate-200/60 text-slate-600 border-slate-300/50",
  "Pending Verification":
    "bg-yellow-100/60 text-yellow-700 border-yellow-300/50",
  Verified: "bg-blue-100/60 text-blue-700 border-blue-300/50",
  Assigned: "bg-indigo-100/60 text-indigo-700 border-indigo-300/50",
  "In Progress": "bg-amber-100/60 text-amber-700 border-amber-300/50",
  Resolved: "bg-emerald-100/60 text-emerald-700 border-emerald-300/50",
  Closed: "bg-slate-100/60 text-slate-500 border-slate-300/50",
  Escalated: "bg-red-100/60 text-red-700 border-red-300/50",
};

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

const priorityLabel = (score: number) => {
  if (score >= 0.75) return { label: "High", class: "text-red-600 bg-red-50" };
  if (score >= 0.4)
    return { label: "Medium", class: "text-amber-600 bg-amber-50" };
  return { label: "Low", class: "text-slate-600 bg-slate-100" };
};

export default function MyComplaints() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date" | "sla" | "priority">("date");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account
      .get()
      .then((user) => {
        if (!user.$id) {
          setLoading(false);
          return;
        }

        // Real-time subscription instead of async fetch
        const unsubscribe = appwriteService.subscribeToUserComplaints(
          user.$id,
          (data) => {
            setComplaints(data);
            setLoading(false);
          },
        );

        return () => unsubscribe();
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const allStatuses = [
    "All",
    "Submitted",
    "Pending Verification",
    "Verified",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
    "Escalated",
  ];
  const allCategories = [
    "All",
    "Garbage",
    "Streetlight",
    "Pothole",
    "Water",
    "Sanitation",
    "Construction",
    "Safety",
    "Other",
  ];

  const filtered = complaints
    .filter((c) => {
      const matchSearch =
        c.id?.toLowerCase().includes(search.toLowerCase()) ||
        false ||
        c.category?.toLowerCase().includes(search.toLowerCase()) ||
        false ||
        c.address?.toLowerCase().includes(search.toLowerCase()) ||
        false;
      const matchStatus = filterStatus === "All" || c.status === filterStatus;
      const matchCat =
        filterCategory === "All" || c.category === filterCategory;
      return matchSearch && matchStatus && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "sla")
        return (a.slaRemainingHours || 0) - (b.slaRemainingHours || 0);
      if (sortBy === "priority")
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      const dateA = a.createdAt?.seconds
        ? a.createdAt.seconds * 1000
        : new Date(a.createdAt || 0).getTime();
      const dateB = b.createdAt?.seconds
        ? b.createdAt.seconds * 1000
        : new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  const statusCounts = {
    active: complaints.filter(
      (c) => !["Resolved", "Closed", "Rejected"].includes(c.status),
    ).length,
    resolved: complaints.filter((c) =>
      ["Resolved", "Closed"].includes(c.status),
    ).length,
    escalated: complaints.filter((c) => c.escalated).length,
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Loading your complaints...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[35%] h-[35%] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] -left-[5%] w-[25%] h-[25%] bg-indigo-400/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight uppercase text-[10px] bg-blue-50 w-fit px-2 py-0.5 rounded-md border border-blue-100 mb-2">
              <Zap className="w-3 h-3 fill-current" />
              My Reports
            </div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">
              My Complaints
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Track and manage all your reported issues
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Active",
              value: statusCounts.active,
              icon: Clock,
              color: "text-blue-500",
              bg: "bg-blue-500/5",
              border: "border-blue-200/50",
            },
            {
              label: "Resolved",
              value: statusCounts.resolved,
              icon: CheckCircle,
              color: "text-emerald-500",
              bg: "bg-emerald-500/5",
              border: "border-emerald-200/50",
            },
            {
              label: "Escalated",
              value: statusCounts.escalated,
              icon: AlertCircle,
              color: "text-red-500",
              bg: "bg-red-500/5",
              border: "border-red-200/50",
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white/60 backdrop-blur-md rounded-[2rem] p-5 border ${border} shadow-sm flex items-center gap-4`}
            >
              <div
                className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center border border-white`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {value}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, category, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/50 border border-slate-200/50 rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all backdrop-blur-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm bg-white/50 border border-slate-200/50 rounded-2xl px-3 py-3 focus:outline-none focus:border-blue-400 text-slate-700 cursor-pointer backdrop-blur-sm"
              >
                {allStatuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-sm bg-white/50 border border-slate-200/50 rounded-2xl px-3 py-3 focus:outline-none focus:border-blue-400 text-slate-700 cursor-pointer backdrop-blur-sm"
              >
                {allCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "sla" | "priority")
                }
                className="text-sm bg-white/50 border border-slate-200/50 rounded-2xl px-3 py-3 focus:outline-none focus:border-blue-400 text-slate-700 cursor-pointer backdrop-blur-sm"
              >
                <option value="date">Latest First</option>
                <option value="sla">SLA Urgency</option>
                <option value="priority">Priority Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaint List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 p-14 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-sm font-bold text-slate-700">
                No complaints found
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Try adjusting your filters
              </div>
            </div>
          ) : (
            filtered.map((c, i) => {
              const { label: pLabel, class: pClass } = priorityLabel(
                c.priorityScore,
              );
              const isOverdue =
                c.slaRemainingHours < 0 &&
                c.status !== "Resolved" &&
                c.status !== "Closed";

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/dashboard/complaints/${c.id}`)}
                  className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm hover:border-blue-300/50 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl mt-0.5">
                        {categoryIcons[c.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-black text-slate-900">
                            {c.category} — {c.subcategory}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border font-bold backdrop-blur-sm ${statusColors[c.status]}`}
                          >
                            {c.status}
                          </span>
                          {c.escalated && (
                            <span className="text-xs bg-red-100/60 text-red-700 border border-red-200/50 px-2.5 py-0.5 rounded-full font-bold">
                              🔴 Escalated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                          <MapPin className="w-3 h-3" />
                          {c.address}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold text-slate-500">
                            {c.id}
                          </span>
                          {c.priorityScore != null && (
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${pClass}`}
                            >
                              {pLabel} Priority ({c.priorityScore?.toFixed(2)})
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {c.confirmations || 0} confirmations
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isOverdue ? (
                          <div className="text-xs font-black text-red-600 bg-red-50/60 border border-red-100/50 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                            ⚠️ OVERDUE
                          </div>
                        ) : c.status === "Resolved" || c.status === "Closed" ? (
                          <div className="text-xs font-black text-emerald-600 bg-emerald-50/60 border border-emerald-100/50 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                            ✓ Done
                          </div>
                        ) : c.slaRemainingHours != null ? (
                          <div className="text-xs font-bold text-slate-500 bg-slate-50/60 border border-slate-100/50 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {c.slaRemainingHours}h left
                          </div>
                        ) : null}
                        <div className="text-xs text-slate-400 mt-2">
                          {c.createdAt?.seconds
                            ? new Date(
                                c.createdAt.seconds * 1000,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })
                            : "Just now"}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors self-center shrink-0" />
                    </div>

                    {/* SLA Bar */}
                    {!["Resolved", "Closed"].includes(c.status) &&
                      c.slaHours != null && (
                        <div className="mt-3 pt-3 border-t border-slate-100/50">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>SLA Progress</span>
                            <span
                              className={
                                isOverdue ? "text-red-500 font-bold" : ""
                              }
                            >
                              {isOverdue
                                ? `${Math.abs(c.slaRemainingHours)}h overdue`
                                : `${c.slaRemainingHours}h / ${c.slaHours}h`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOverdue
                                  ? "bg-red-500 w-full"
                                  : c.slaRemainingHours < c.slaHours * 0.2
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                              style={{
                                width: isOverdue
                                  ? "100%"
                                  : `${Math.min(((c.slaHours - c.slaRemainingHours) / c.slaHours) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
