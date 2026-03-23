import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  MessageSquare,
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
        const mockConfig = mockManagers.find(
          (m: Manager) => m.email === user.email,
        ) || mockManagers[0];
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
        // Fallback: If no session exists, use the ID from URL or default
        const fallback =
          mockManagers.find((m) => m.id === managerId) || mockManagers[0];
        setManager(fallback);
      });
  }, [managerId, navigate]);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = complaints.length;
    const submitted = complaints.filter((c) => c.status === "Submitted").length;
    const assigned = complaints.filter(
      (c) => c.status === "Assigned" || c.status === "In Progress",
    ).length;
    const resolved = complaints.filter(
      (c) => c.status === "Resolved" || c.status === "Closed",
    ).length;

    return [
      { name: "New (Submitted)", value: submitted, color: "#94a3b8" },
      { name: "Assigned/Active", value: assigned, color: "#0ea5e9" },
      { name: "Resolved/Closed", value: resolved, color: "#10b981" },
    ];
  }, [complaints]);

  // Workers assigned to this manager's state
  const stateWorkers = useMemo(
    () =>
      manager
        ? mockWorkers.filter((w: Worker) => w.state === manager.managedState)
        : [],
    [manager],
  );

  const handleAssign = (worker: Worker) => {
    if (!selectedComplaint) return;

    // Logic to update complaint status and notify via WhatsApp
    const whatsappMsg = `Hi ${worker.name}, a new issue has been assigned to you in ${selectedComplaint.address}. Category: ${selectedComplaint.category}. Check portal for details.`;
    const whatsappUrl = `https://wa.me/${worker.phone.replace("+", "")}?text=${encodeURIComponent(whatsappMsg)}`;

    window.open(whatsappUrl, "_blank");

    // Update local state (Mock)
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selectedComplaint.id
          ? { ...c, status: "Assigned", assignedTo: worker.name }
          : c,
      ),
    );

    setShowAssignModal(false);
    setSelectedComplaint(null);
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
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-sky-100">
              {manager.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "M"}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-[800] text-slate-900 tracking-tight">
                {manager.name || "Manager"}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                  <Mail size={14} className="text-sky-500" /> {manager.email}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                  <Smartphone size={14} className="text-emerald-500" />{" "}
                  {manager.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-96 bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin size={12} /> Official Jurisdiction
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold text-slate-500 mb-0.5">
                  Primary State
                </div>
                <div className="text-base font-bold text-slate-900">
                  {manager.managedState}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1.5">
                  Assigned Areas
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {manager.managedAreas.map((area: string) => (
                    <span
                      key={area}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
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

      {/* 2. Stats & Analytics Section */}
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
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Users className="text-emerald-500" /> Field Force
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stateWorkers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm">
                    {worker.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {worker.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Rating: {worker.rating} ⭐
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                    worker.status === "Available"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {worker.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Operational Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-[800] uppercase tracking-[0.2em] text-slate-400">
              Operational Queue
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket ID / address..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none sm:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredComplaints
              .filter((c) => c.status !== "Resolved")
              .map((complaint) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`cursor-pointer rounded-3xl border p-5 transition-all ${
                    selectedComplaint?.id === complaint.id
                      ? "border-sky-500 bg-sky-50/30 shadow-md ring-1 ring-sky-500/10"
                      : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded-md tracking-tighter uppercase">
                          {complaint.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                          #{complaint.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">
                        {complaint.address}
                      </h3>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        complaint.status === "Assigned"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {complaint.status}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                    {complaint.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                        <Clock size={12} />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {complaint.status === "Submitted" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(complaint);
                          setShowAssignModal(true);
                        }}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-sky-600/20"
                      >
                        Dispatch Help <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                        <Check size={14} />
                        <span>{complaint.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Issue Details View */}
        <div className="hidden lg:block">
          {selectedComplaint ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  Ticket Overview
                </h2>
                <div className="bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Active Issue
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                      Citizen
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedComplaint.reporterName}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                      Territory
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {manager.managedState}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest px-1">
                    Evidence Narrative
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100 font-medium italic">
                    "{selectedComplaint.description}"
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white transition hover:bg-black shadow-xl shadow-slate-900/20 group">
                    <Phone size={18} className="group-hover:shake" /> Contact
                    Citizen
                  </button>
                  <button className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50">
                    <MessageSquare size={18} className="text-emerald-500" />{" "}
                    WhatsApp Update
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
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
              onClick={() => setShowAssignModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Assign Worker
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Available workers for this area
              </p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {stateWorkers.map((worker: Worker) => (
                  <button
                    key={worker.id}
                    onClick={() => handleAssign(worker)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-sky-50 hover:border-sky-100 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-sky-700">
                        {worker.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Rating: {worker.rating} ⭐
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${worker.status === "Available" ? "bg-emerald-500" : "bg-amber-500"}`}
                      ></span>
                      <span className="text-xs font-semibold text-slate-500">
                        {worker.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="mt-6 w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
