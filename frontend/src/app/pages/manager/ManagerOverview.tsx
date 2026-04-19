import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Search,
  Check,
  Building2,
  Users,
  LayoutDashboard,
  BarChart3,
  Mail,
  Smartphone,
  Zap,
  Map,
  ShieldCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  mockWorkers,
  mockManagers,
  Complaint,
  Worker,
  Manager,
} from "../../data/mockData";
import { appwriteService } from "../../appwriteService";
import { account } from "../../appwrite";
import { api } from "../../api";
import { toast } from "sonner";
import { SLATimer } from "../../components/SLATimer";

export default function ManagerOverview() {
  const { managerId } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState<any>(null);

  useEffect(() => {
    // Attempt to get the logged-in user from Appwrite
    account
      .get()
      .then((user) => {
        // Find the mock config for this logged in user or use defaults
        const mockConfig =
          mockManagers.find((m: Manager) => m.email === user.email) ||
          (managerId ? mockManagers.find((m) => m.id === managerId) : null) ||
          mockManagers[0];
        setManager({
          ...user,
          // Use the mock manager ID (e.g. MGR-DEL-01) for complaint filtering
          id: mockConfig.id,
          name: user.name || mockConfig.name,
          email: user.email || mockConfig.email,
          phone: user.phone || mockConfig.phone,
          managedState: mockConfig.managedState,
          managedAreas: mockConfig.managedAreas,
        });
      })
      .catch(() => {
        // Fallback: If no session exists, use the ID from URL or first manager
        if (!managerId) {
          navigate("/login", { replace: true });
          return;
        }
        const fallback = mockManagers.find((m) => m.id === managerId);
        if (!fallback) {
          navigate("/login", { replace: true });
          return;
        }
        setManager(fallback);
      });
  }, [managerId, navigate]);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [selectedReview, setSelectedReview] = useState<Complaint | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null,
  );
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMapView, setShowMapView] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    if (!manager) return;
    // Fetch live complaints assigned to this manager from the backend
    api
      .get<Complaint[]>(`/api/complaints?managerId=${manager.id}`)
      .then((data) => setComplaints(data))
      .catch(() => {
        // Fallback: filter from all complaints by assignedManagerId
        api
          .get<Complaint[]>("/api/complaints")
          .then((data) =>
            setComplaints(
              (data as any[]).filter(
                (c: any) => c.assignedManagerId === manager.id,
              ) as Complaint[],
            ),
          )
          .catch(console.error);
      });
  }, [manager]);

  useEffect(() => {
    if (!manager) return;
    appwriteService.getWorkers(manager.managedState)
      .then(setWorkers)
      .catch(console.error);
  }, [manager]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = complaints.length;
    const submitted = complaints.filter((c) => c.status === "Submitted").length;
    const assigned = complaints.filter(
      (c) =>
        c.status === "Assigned" ||
        c.status === "In Progress" ||
        c.status === "Pending Review",
    ).length;
    const resolved = complaints.filter(
      (c) => c.status === "Resolved" || c.status === "Closed",
    ).length;

    return [
      { name: "New (Submitted)", value: submitted, color: "#94a3b8" },
      { name: "Assigned/Active/Review", value: assigned, color: "#0ea5e9" },
      { name: "Resolved/Closed", value: resolved, color: "#10b981" },
    ];
  }, [complaints]);

  // Workers assigned to this manager's state, filtered by their managed areas
  const stateWorkers = useMemo(() => {
    if (!manager || !manager.managedAreas) return workers;
    return workers.filter((worker) =>
      manager.managedAreas.includes(worker.area)
    );
  }, [workers, manager]);

  // Auto-assignment logic - smart worker selection
  const autoAssignWorker = (complaint: Complaint): Worker | null => {
    const availableWorkers = stateWorkers.filter(
      (w: Worker) => w.status === "Available",
    );

    if (availableWorkers.length === 0) return null;

    // Sort by rating (higher is better)
    const sorted = [...availableWorkers].sort((a, b) => b.rating - a.rating);
    return sorted[0];
  };

  // Auto-assign all submitted complaints using AI
  const handleAutoAssignAll = async () => {
    const submittedComplaints = complaints.filter(
      (c) => c.status === "Submitted",
    );

    if (submittedComplaints.length === 0) {
      toast.info("No submitted complaints to assign");
      return;
    }

    if (stateWorkers.length === 0) {
      toast.error("No workers available in your state");
      return;
    }

    setAutoAssigning(true);
    let assignedCount = 0;

    // We'll process them one by one for better feedback, though batching would be faster
    for (const complaint of submittedComplaints) {
      try {
        const result = await appwriteService.smartAssignWorker({
          complaintId: complaint.id,
          category: complaint.category,
          description: complaint.description || "",
          address: complaint.address,
          workers: stateWorkers.map(w => ({
            id: w.id,
            name: w.name,
            rating: w.rating,
            activeTasks: w.activeTasks || 0,
            area: w.area
          }))
        });

        const selectedWorker = stateWorkers.find(w => w.id === result.recommendedWorkerId);
        if (!selectedWorker) continue;

        await api.patch(`/api/complaints/${complaint.id}/status`, {
          status: "Assigned",
          note: `Smart Auto-assigned: ${result.reasoning}`,
          actor: manager?.name || "Manager",
          assignedTo: selectedWorker.name,
        });

        assignedCount++;

        // Update local state immediately for feedback
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaint.id
              ? { ...c, status: "Assigned", assignedTo: selectedWorker.name }
              : c,
          ),
        );
      } catch (error) {
        console.error("Smart assignment error:", error);
      }
    }

    setAutoAssigning(false);
    toast.success(`Successfully assigned ${assignedCount} complaints`);
  };

  const handleAssign = (worker: Worker) => {
    if (!selectedComplaint) return;

    // Update API
    api
      .patch(`/api/complaints/${selectedComplaint.id}/status`, {
        status: "Assigned",
        note: `Assigned to ${worker.name}`,
        actor: manager?.name || "Manager",
        assignedTo: worker.name,
      })
      .then(() => {
        // Update local state
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? { ...c, status: "Assigned", assignedTo: worker.name }
              : c,
          ),
        );
        setShowAssignModal(false);
        setSelectedComplaint(null);
        toast.success(`Assigned to ${worker.name}`);
      })
      .catch(() => {
        // Optimistic update
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? { ...c, status: "Assigned", assignedTo: worker.name }
              : c,
          ),
        );
        setShowAssignModal(false);
        setSelectedComplaint(null);
        toast.success(`Assigned to ${worker.name}`);
      });
  };

  // Review approval/rejection handler
  const handleReviewDecision = (action: "approve" | "reject") => {
    if (!selectedReview) return;

    const newStatus = action === "approve" ? "Resolved" : "Rejected";
    const message =
      action === "approve"
        ? "Work approved! Citizen can now provide feedback."
        : "Work rejected. Worker will be notified. Now assign another worker.";

    api
      .patch(`/api/complaints/${selectedReview.id}/status`, {
        status: newStatus,
        note: `${action === "approve" ? "Approved" : "Rejected"} by manager`,
        actor: manager?.name || "Manager",
      })
      .then(() => {
        // Update local state
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedReview.id ? { ...c, status: newStatus } : c,
          ),
        );

        if (action === "approve") {
          setShowReviewModal(false);
          setSelectedReview(null);
          setReviewAction(null);
        } else {
          // For rejection, show reassignment modal
          setReviewAction(null);
          setShowReviewModal(false);
          setShowReassignModal(true);
        }

        toast.success(message);
      })
      .catch(() => {
        // Optimistic update
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedReview.id ? { ...c, status: newStatus } : c,
          ),
        );

        if (action === "approve") {
          setShowReviewModal(false);
          setSelectedReview(null);
          setReviewAction(null);
        } else {
          // For rejection, show reassignment modal
          setReviewAction(null);
          setShowReviewModal(false);
          setShowReassignModal(true);
        }

        toast.success(message);
      });
  };

  // Reassign worker after rejection
  const handleReassignWorker = (worker: Worker) => {
    if (!selectedReview) return;

    api
      .patch(`/api/complaints/${selectedReview.id}/status`, {
        status: "Assigned",
        note: `Reassigned to ${worker.name} after rejection`,
        actor: manager?.name || "Manager",
        assignedTo: worker.name,
      })
      .then(() => {
        // Update local state
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedReview.id
              ? { ...c, status: "Assigned", assignedTo: worker.name }
              : c,
          ),
        );
        setShowReassignModal(false);
        setSelectedReview(null);
        toast.success(`Reassigned to ${worker.name}`);
      })
      .catch(() => {
        // Optimistic update
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedReview.id
              ? { ...c, status: "Assigned", assignedTo: worker.name }
              : c,
          ),
        );
        setShowReassignModal(false);
        setSelectedReview(null);
        toast.success(`Reassigned to ${worker.name}`);
      });
  };

  const filteredComplaints = complaints.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!manager)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 font-medium">
        Loading manager details...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Header & Manager Profile Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50/50 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between gap-10 relative z-10">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white via-sky-50 to-blue-100 flex items-center justify-center text-sky-700 text-3xl font-bold shadow-xl shadow-sky-100/50 border border-white">
                {manager.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "M"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                <Check size={14} className="text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">
                  {manager.name || "Manager"}
                </h1>
                <span className="px-3 py-1 bg-sky-100 text-sky-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Senior Overseer
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-2">
                  <Mail size={16} className="text-slate-300" /> {manager.email}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-200 mt-2" />
                <span className="flex items-center gap-2">
                  <Smartphone size={16} className="text-slate-300" />{" "}
                  {manager.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-[400px] bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={12} className="text-sky-600" /> Official Jurisdiction
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Primary State</span>
                <span className="text-sm font-bold text-slate-900">{manager.managedState}</span>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">Assigned Operational Areas</span>
                <div className="flex flex-wrap gap-2">
                  {manager.managedAreas.map((area: string) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-white border border-slate-200/60 rounded-full text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Auto-Assignment Banner */}
      {complaints.filter((c) => c.status === "Submitted").length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 rounded-[2.5rem] border border-amber-100 p-7 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/10 rounded-full -mr-16 -mt-16 blur-2xl" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-amber-100 flex items-center justify-center shadow-sm">
                <Zap size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">
                  {complaints.filter((c) => c.status === "Submitted").length}{" "}
                  Operations pending dispatch
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Intelligent auto-assignment will optimize field staff distribution based on proximity.
                </p>
              </div>
            </div>
            <button
              onClick={handleAutoAssignAll}
              disabled={autoAssigning}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {autoAssigning ? "Processing..." : "Commence auto-dispatch"}
              {!autoAssigning && <ChevronRight size={16} />}
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. Stats & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="text-indigo-500" /> Performance Overview
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="text-sky-600" size={20} /> Field force status
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stateWorkers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 rounded-[20px] bg-slate-50/50 border border-slate-100 hover:border-sky-100 hover:bg-sky-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-sky-700 shadow-sm group-hover:scale-105 transition-transform">
                    {worker.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {worker.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-medium text-slate-500">
                        {worker.area}
                      </div>
                      <div className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                      <div className="text-[10px] font-bold text-amber-600">
                        {worker.rating} ⭐
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-900">{worker.activeTasks || 0} active</div>
                  <div className={`text-[10px] font-semibold uppercase tracking-wider ${worker.status === "Available"
                    ? "text-emerald-600"
                    : "text-amber-600"
                    }`}>
                    {worker.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Pending Review Section */}
      {complaints.filter((c) => c.status === "Pending Review").length > 0 && (
        <div className="bg-gradient-to-br from-white via-indigo-50/30 to-sky-50/30 border border-slate-100 rounded-[2.5rem] p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            Verification Pipeline ({complaints.filter((c) => c.status === "Pending Review").length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {complaints
              .filter((c) => c.status === "Pending Review")
              .map((complaint) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border border-slate-100 p-5 cursor-pointer hover:border-sky-200 hover:shadow-md transition-all group"
                  onClick={() => {
                    setSelectedReview(complaint);
                    setShowReviewModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                        {complaint.category}
                      </span>
                      <p className="font-semibold text-slate-900 mt-2 text-sm leading-tight">
                        {complaint.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Technician</span>
                      <span className="text-[10px] font-bold text-slate-600">
                        {complaint.assignedTo?.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-full transition-all uppercase tracking-wider group-hover:bg-sky-600 group-hover:text-white"
                  >
                    Assess Resolution
                  </button>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* 4. Main Operational Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-[800] uppercase tracking-[0.2em] text-slate-400">
              Operational Queue
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMapView(!showMapView)}
                className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
                title="Toggle Map View"
              >
                <Map size={18} />
              </button>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ticket ID / address..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredComplaints
              .filter(
                (c) =>
                  c.status !== "Resolved" &&
                  c.status !== "Pending Review" &&
                  c.status !== "Closed",
              )
              .map((complaint) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`relative cursor-pointer rounded-3xl border p-5 transition-all overflow-hidden ${selectedComplaint?.id === complaint.id
                    ? "border-sky-200 bg-sky-50 shadow-md ring-1 ring-sky-200/50"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {complaint.category}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono tracking-wider">
                          #{complaint.id.slice(0, 8)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                        {complaint.address}
                      </h3>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${complaint.status === "Assigned"
                        ? "bg-amber-50 text-amber-600"
                        : complaint.status === "In Progress"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-50 text-slate-600"
                        }`}
                    >
                      {complaint.status}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                    {complaint.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                        <Clock size={12} />
                        {new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[10px] font-bold text-sky-600 uppercase">
                        P{complaint.priorityScore ? (complaint.priorityScore * 10).toFixed(0) : '0'}
                      </div>
                    </div>
                    {complaint.status === "Submitted" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(complaint);
                          setShowAssignModal(true);
                        }}
                        className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-semibold rounded-full transition-all shadow-lg shadow-sky-100 uppercase tracking-wider"
                      >
                        Dispatch
                      </button>
                    ) : (
                      <SLATimer
                        deadline={complaint.slaDeadline}
                        status={complaint.status}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* 5. Issue Details View - REFINED SOFT THEME */}
        <div className="hidden lg:block">
          {selectedComplaint ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedComplaint.id}
              className="sticky top-24 rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/30 overflow-hidden"
            >
              {/* Header: Soft Gradient */}
              <div className="bg-gradient-to-br from-white via-sky-50 to-blue-50 px-8 py-7 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-bold text-sky-700 ring-1 ring-sky-100 uppercase tracking-wider">
                    {selectedComplaint.category}
                  </span>
                  <span
                    className="text-[10px] font-medium text-slate-400 font-mono tracking-widest cursor-help hover:text-sky-600 transition-colors"
                    title={selectedComplaint.id}
                  >
                    #{selectedComplaint.id.slice(0, 12)}...
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
                  {selectedComplaint.subcategory || selectedComplaint.category}
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedComplaint.status === 'Submitted' ? 'bg-slate-100 text-slate-700' :
                    selectedComplaint.status === 'Assigned' ? 'bg-sky-100 text-sky-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                    {selectedComplaint.status}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">
                    Priority Score: <span className="text-slate-900 font-bold">{(selectedComplaint.priorityScore || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Visual Evidence (if any) */}
                {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                  <div className="relative group rounded-3xl overflow-hidden border border-slate-100 aspect-video bg-slate-50">
                    <img
                      src={selectedComplaint.photos[0]}
                      alt="Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm font-medium">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Citizen Reporter</div>
                    <div className="text-slate-900 text-sm flex items-center gap-2">
                      {selectedComplaint.reporterName}
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[9px] rounded-full font-bold">Tier {selectedComplaint.reporterTier || 1}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm font-medium">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operational Area</div>
                    <div className="text-slate-900 text-sm">{selectedComplaint.area || manager.managedAreas[0]}</div>
                  </div>
                  {selectedComplaint.assignedTo && (
                    <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm font-medium col-span-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Worker</div>
                      <div className="text-slate-900 text-sm flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-700">
                          {selectedComplaint.assignedTo.split(' ').map(n => n[0]).join('')}
                        </div>
                        {selectedComplaint.assignedTo}
                      </div>
                    </div>
                  )}
                </div>


                {/* Evidence Narrative */}
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-slate-900 px-1">Evidence Narrative</h3>
                  <div className="p-5 rounded-2xl bg-sky-50/50 text-slate-700 text-sm leading-relaxed font-medium italic border border-sky-100/50">
                    "{selectedComplaint.description}"
                  </div>
                </div>

                {/* Real-time SLA Tracking */}
                <div className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA Deadline</div>
                    <div className="text-xs font-semibold text-slate-900">
                      {new Date(selectedComplaint.slaDeadline).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                  <SLATimer deadline={selectedComplaint.slaDeadline} status={selectedComplaint.status} />
                </div>

                {/* Operational History */}
                {selectedComplaint.timeline && selectedComplaint.timeline.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-bold text-slate-900 px-1">Operational History</h3>
                    <div className="space-y-6 pl-4 border-l border-slate-100 ml-1">
                      {selectedComplaint.timeline.slice(0, 3).map((event: any, i: number) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-sky-200 ring-4 ring-white" />
                          <div className="text-[11px] font-semibold text-slate-900">{event.status}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {event.actor} • {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Command Actions */}
                <div className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all">
                      <Phone size={14} /> Contact
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-sm">
                      <Mail size={14} /> Email
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedComplaint.status === 'Submitted') {
                        setShowAssignModal(true);
                      } else {
                        setShowReassignModal(true);
                      }
                    }}
                    className={`w-full py-4 rounded-full text-sm font-semibold text-white shadow-lg shadow-sky-100 transition-all active:scale-[0.98] ${selectedComplaint.status === 'Submitted'
                      ? 'bg-sky-700 hover:bg-sky-800'
                      : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                  >
                    {selectedComplaint.status === 'Submitted' ? 'Dispatch field force' : 'Reassign command'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="sticky top-24 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 h-[500px] bg-slate-50/30">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-50">
                <LayoutDashboard className="text-slate-200" size={32} />
              </div>
              <p className="text-slate-400 font-bold text-sm text-center">
                Select an operational ticket
                <br />
                to activate view
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
              onClick={() => setShowAssignModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border border-slate-100"
            >
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                Dispatch field force
              </h3>
              <p className="text-sm font-medium text-slate-500 mb-8">
                Available personnel for <span className="text-sky-700 font-bold">{selectedComplaint?.area || manager.managedAreas[0]}</span>
              </p>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {stateWorkers.map((worker: Worker) => (
                  <button
                    key={worker.id}
                    onClick={() => handleAssign(worker)}
                    className="w-full flex items-center justify-between p-4 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-sky-50 hover:border-sky-100 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-sky-700 shadow-sm group-hover:scale-105 transition-transform">
                        {worker.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-sky-800 transition-colors">
                          {worker.name}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                          {worker.rating} ⭐ <span className="h-1 w-1 rounded-full bg-slate-300" /> {worker.area}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${worker.status === "Available" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="mt-8 w-full py-4 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel dispatch
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedReview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
              onClick={() => {
                setShowReviewModal(false);
                setReviewAction(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative max-w-lg w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Review resolution
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Technician: <span className="text-slate-900 font-bold">{selectedReview.assignedTo}</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                  <ShieldCheck className="text-sky-600" size={24} />
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location & Issue</div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">{selectedReview.address}</p>
                  <p className="text-xs text-slate-500 leading-relaxed italic">"{selectedReview.description}"</p>
                </div>

                <div className="p-5 rounded-3xl bg-indigo-50/30 border border-indigo-100/50">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Work Submission Note</div>
                  <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
                    "{selectedReview.timeline?.[selectedReview.timeline.length - 1]?.note || "Work completed and submitted for review"}"
                  </p>
                </div>
              </div>

              {!reviewAction ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReviewAction("approve")}
                    className="py-4 px-4 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-full shadow-lg shadow-sky-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button
                    onClick={() => setReviewAction("reject")}
                    className="py-4 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full transition-all"
                  >
                    Flag issues
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewAction(null);
                    }}
                    className="col-span-2 mt-2 py-3 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl">
                    <p className="text-sm text-sky-800 font-medium">
                      {reviewAction === "approve"
                        ? "Confirming this will mark the operation as resolved and notify the citizen."
                        : "Rejecting this will return the ticket to operational status and alert the field force."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReviewDecision(reviewAction)}
                    className={`w-full py-4 text-white font-semibold rounded-full shadow-lg transition-all ${reviewAction === "approve"
                      ? "bg-sky-700 hover:bg-sky-800 shadow-sky-100"
                      : "bg-amber-600 hover:bg-amber-700 shadow-amber-100"
                      }`}
                  >
                    {reviewAction === "approve" ? "Confirm approval" : "Confirm rejection"}
                  </button>
                  <button
                    onClick={() => setReviewAction(null)}
                    className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Go back
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reassign Worker Modal (after rejection) */}
      <AnimatePresence>
        {showReassignModal && selectedReview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
              onClick={() => setShowReassignModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border border-slate-100"
            >
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                Reassign command
              </h3>
              <p className="text-sm font-medium text-slate-500 mb-6">
                Ticket rejected from <span className="text-slate-900 font-bold">{selectedReview.assignedTo}</span>. Select an alternative technician.
              </p>

              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-center gap-3">
                <AlertCircle className="text-amber-600" size={16} />
                <p className="text-xs text-amber-900 font-semibold truncate flex-1">
                  {selectedReview.address}
                </p>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {stateWorkers
                  .filter((w) => w.name !== selectedReview.assignedTo)
                  .map((worker: Worker) => (
                    <button
                      key={worker.id}
                      onClick={() => handleReassignWorker(worker)}
                      className="w-full flex items-center justify-between p-4 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-100 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-emerald-700 shadow-sm group-hover:scale-105 transition-transform">
                          {worker.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {worker.name}
                          </div>
                          <div className="text-[11px] font-medium text-slate-500">
                            {worker.rating} ⭐ • {worker.status}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
              </div>

              <button
                onClick={() => setShowReassignModal(false)}
                className="mt-8 w-full py-4 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel reassignment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
