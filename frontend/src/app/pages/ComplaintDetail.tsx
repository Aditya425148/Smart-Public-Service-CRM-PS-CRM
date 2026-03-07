import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { appwriteService } from "../appwriteService";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Share2,
  Copy,
  AlertCircle,
  CheckCircle,
  Star,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Camera,
} from "lucide-react";

const statusColors: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-600",
  "Pending Verification": "bg-yellow-100 text-yellow-700",
  Verified: "bg-blue-100 text-blue-700",
  Assigned: "bg-indigo-100 text-indigo-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-500",
  Escalated: "bg-red-100 text-red-700",
};

const statusSteps = [
  "Submitted",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const complaints = await appwriteService.getAllComplaints();
        const found = complaints.find((c) => c.id === id);
        setComplaint(found || complaints[0]); // Fallback to first one if ID not found for demo stability
      } catch (error) {
        console.error("Error fetching complaint:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-vh-100 p-8 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Loading complaint details...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
        Complaint not found
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(complaint.status);
  const isOverdue =
    (complaint.slaRemainingHours || 0) < 0 &&
    !["Resolved", "Closed"].includes(complaint.status);
  const canEscalate = isOverdue || complaint.status === "Escalated";
  const canReopen = ["Resolved", "Closed"].includes(complaint.status);

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/complaints")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-sm text-slate-400">Complaint Detail</span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Top Banner */}
        <div
          className={`p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 ${
            complaint.escalated ? "bg-red-50" : "bg-white"
          }`}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-[800] text-slate-900">
                {complaint.id}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-[600] ${statusColors[complaint.status]}`}
              >
                {complaint.status}
              </span>
              {complaint.escalated && (
                <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-[700]">
                  🔴 Escalated — Under Review
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500">
              {complaint.category} → {complaint.subcategory}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 text-xs font-[500] text-slate-500 hover:text-slate-900 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy ID"}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-[500] text-slate-500 hover:text-slate-900 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 grid md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-[600] text-slate-400 mb-1 uppercase tracking-wider">
                Description
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {complaint.description}
              </p>
            </div>
            <div>
              <div className="text-xs font-[600] text-slate-400 mb-1 uppercase tracking-wider">
                Location
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />
                {complaint.address}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">
                  AI Priority Score
                </div>
                <div className="text-lg font-[800] text-slate-900">
                  {complaint.priorityScore.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-[600] mt-0.5 ${
                    complaint.priorityScore >= 0.75
                      ? "text-red-500"
                      : complaint.priorityScore >= 0.4
                        ? "text-amber-500"
                        : "text-slate-500"
                  }`}
                >
                  {complaint.priorityScore >= 0.75
                    ? "High"
                    : complaint.priorityScore >= 0.4
                      ? "Medium"
                      : "Low"}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">
                  Community Confirmations
                </div>
                <div className="text-lg font-[800] text-slate-900">
                  {complaint.confirmations}
                </div>
                <div className="text-xs text-blue-500 font-[600] mt-0.5">
                  neighbors confirmed
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* SLA */}
            <div
              className={`rounded-xl p-4 border ${
                isOverdue
                  ? "bg-red-50 border-red-100"
                  : complaint.slaRemainingHours < complaint.slaHours * 0.25
                    ? "bg-amber-50 border-amber-100"
                    : "bg-blue-50 border-blue-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock
                  className={`w-4 h-4 ${isOverdue ? "text-red-500" : "text-blue-500"}`}
                />
                <span className="text-xs font-[700] text-slate-700">
                  SLA Status
                </span>
              </div>
              {isOverdue ? (
                <div className="text-base font-[800] text-red-600">
                  OVERDUE — {Math.abs(complaint.slaRemainingHours)}h exceeded
                </div>
              ) : ["Resolved", "Closed"].includes(complaint.status) ? (
                <div className="text-base font-[700] text-emerald-600">
                  ✓ Resolved within SLA
                </div>
              ) : (
                <div className="text-base font-[800] text-blue-700">
                  {complaint.slaRemainingHours}h remaining
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500">
                Category SLA: {complaint.slaHours} hours
              </div>
            </div>

            {/* Assignment */}
            {complaint.assignedTo && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-[600] text-slate-400 mb-2 uppercase tracking-wider">
                  Assigned To
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-[700]">
                    {complaint.assignedTo
                      .split(" ")
                      .slice(-2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-[600] text-slate-800">
                      {complaint.assignedTo}
                    </div>
                    <div className="text-xs text-slate-400">
                      Field Officer · {complaint.ward}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 bg-white rounded-lg p-2.5 border border-slate-100">
                  🔒 GPS-verified proof will be uploaded on resolution
                </div>
              </div>
            )}

            {/* Escalate / Reopen Buttons */}
            <div className="space-y-2">
              {canEscalate && !complaint.escalated && (
                <button
                  onClick={() => setShowEscalate(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-[600] rounded-xl border border-red-100 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  Escalate Complaint
                </button>
              )}
              {canReopen && (
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-[600] rounded-xl border border-amber-100 transition-colors">
                  Re-open Complaint (7 days)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Photo */}
        {complaint.imageUrl && (
          <div className="px-5 pb-5">
            <div className="text-xs font-[600] text-slate-400 mb-2 uppercase tracking-wider">
              Evidence Photos
            </div>
            <div className="flex gap-3">
              <img
                src={complaint.imageUrl}
                alt="Complaint evidence"
                className="w-32 h-24 object-cover rounded-xl border border-slate-100"
              />
              {complaint.status === "Resolved" && (
                <div className="w-32 h-24 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-1">
                  <Camera className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-[600]">
                    Resolution Proof
                  </span>
                  <span className="text-xs text-emerald-500">GPS Verified</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-base font-[700] text-slate-900 mb-6">
          Status Timeline
        </h3>

        {/* Step bar */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {statusSteps.map((s, i) => {
            const done =
              i <
              (complaint.status === "Closed"
                ? statusSteps.length
                : currentStepIndex);
            const active =
              statusSteps[i] === complaint.status ||
              (complaint.status === "Escalated" && s === "Assigned");
            return (
              <div key={s} className="flex items-center min-w-0">
                <div className="flex flex-col items-center min-w-[64px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-[700] border-2 ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : active
                          ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 text-center font-[500] whitespace-nowrap ${
                      active
                        ? "text-blue-600"
                        : done
                          ? "text-emerald-600"
                          : "text-slate-400"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 min-w-[20px] ${done ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Event log */}
        <div className="space-y-4">
          {complaint.timeline.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                {i < complaint.timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-slate-100 mt-1" />
                )}
              </div>
              <div className="pb-4">
                <div className="text-sm font-[600] text-slate-900">
                  {event.status}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {event.note}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400">
                    {new Date(event.timestamp).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-blue-500 font-[500]">
                    by {event.actor}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rating (only for resolved/closed) */}
      {["Resolved", "Closed"].includes(complaint.status) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-base font-[700] text-slate-900 mb-4">
            Rate the Resolution
          </h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none bg-slate-50"
          />
          <div className="flex gap-3 mt-3">
            <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-[600] rounded-xl transition-colors">
              Submit Rating
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-[500] rounded-xl transition-colors">
              <Share2 className="w-4 h-4" />
              Share Before/After Card
            </button>
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-[700] text-slate-900 mb-4">
              Escalate Complaint
            </h3>
            <div className="space-y-2 mb-4">
              {[
                "Still not fixed",
                "Wrong resolution",
                "Safety risk",
                "Other reason",
              ].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <input type="radio" name="reason" className="w-4 h-4" />
                  <span className="text-sm text-slate-700">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEscalate(false)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-[600] rounded-xl transition-colors"
              >
                Submit Escalation
              </button>
              <button
                onClick={() => setShowEscalate(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-[500] rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
