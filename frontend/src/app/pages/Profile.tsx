import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Award,
  Calendar,
  Zap,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

function ProgressRing({
  percent,
  size = 120,
}: {
  percent: number;
  size?: number;
}) {
  const r = (size - 16) / 2;
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
        strokeWidth={10}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#profile-ring)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.5s ease" }}
      />
      <defs>
        <linearGradient id="profile-ring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    reported: 0,
    verified: 0,
    resolved: 0,
    confirmations: 0,
    reputationScore: 0,
  });
  const [currentUser, setCurrentUser] = useState<any>({
    name: "Citizen",
    ward: "General",
    joinedDate: "2026",
    tier: 1,
    reputationLevel: "Bronze Citizen",
    nextMilestone: 1000,
    badges: [
      {
        id: 1,
        name: "First Report",
        icon: "🏁",
        earned: false, // Will calculate below
        criteria: "Submit your first complaint",
      },
      {
        id: 2,
        name: "Verified Citizen",
        icon: "✅",
        earned: false,
        criteria: "Get 5 complaints verified",
      },
      {
        id: 3,
        name: "Community Helper",
        icon: "🤝",
        earned: false,
        criteria: "Help verify 10 complaints",
      },
      {
        id: 4,
        name: "Ward Champion",
        icon: "🏆",
        earned: false,
        criteria: "Top contributor in your ward",
      },
    ],
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    account
      .get()
      .then((user) => {
        setCurrentUser((prev) => ({
          ...prev,
          name: user.name || user.email?.split("@")[0] || "Citizen",
          email: user.email || "",
          uid: user.$id,
          // Calculate badges based on real data
          badges: prev.badges.map((b: any) => {
            if (b.id === 1 && complaints.length > 0)
              return { ...b, earned: true };
            if (b.id === 2 && userStats.verified >= 5)
              return { ...b, earned: true };
            return b;
          }),
        }));

        if (!user.$id) {
          setLoading(false);
          return;
        }

        // Real-time subscription instead of async fetch
        unsubscribe = appwriteService.subscribeToUserComplaints(
          user.$id,
          (userComplaints) => {
            setComplaints(userComplaints);
            setUserStats({
              reported: userComplaints.length,
              verified: userComplaints.filter(
                (c) =>
                  c.status !== "Submitted" &&
                  c.status !== "Pending Verification",
              ).length,
              resolved: userComplaints.filter(
                (c) => c.status === "Resolved" || c.status === "Closed",
              ).length,
              confirmations: userComplaints.reduce(
                (acc, c) => acc + (c.confirmations || 0),
                0,
              ),
              reputationScore:
                userComplaints.length * 10 +
                userComplaints.filter((c) => c.status === "Resolved").length *
                  50 +
                userComplaints.reduce((sum, c) => {
                  const timeline = c.timeline || [];
                  const verifications = timeline.filter((event: any) =>
                    event.note?.includes(`Verified by user: ${user.$id}`),
                  ).length;
                  return sum + verifications * 20;
                }, 0),
            });
            setLoading(false);
          },
        );
      })
      .catch(() => {
        setLoading(false);
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const progressPercent = Math.round(
    (userStats.reputationScore / currentUser.nextMilestone) * 100,
  );
  const earnedBadges = currentUser.badges.filter((b) => b.earned);
  const lockedBadges = currentUser.badges.filter((b) => !b.earned);

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[30%] bg-violet-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] -left-[10%] w-[35%] h-[35%] bg-blue-400/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-6 p-4 md:p-8">
        <div>
          <div className="flex items-center gap-2 text-violet-600 font-bold tracking-tight uppercase text-[10px] bg-violet-50 w-fit px-2 py-0.5 rounded-md border border-violet-100 mb-2">
            <Zap className="w-3 h-3 fill-current" />
            Citizen Profile
          </div>
          <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">
            Profile & Reputation
          </h1>
        </div>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 text-white">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="relative">
              <ProgressRing percent={progressPercent} size={110} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-[900] shadow-inner border border-white/20">
                  {currentUser.name?.[0].toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-[940] tracking-tight">
                  {currentUser.name}
                </h2>
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">
                Authorized Citizen · {currentUser.uid?.slice(-6).toUpperCase()}
              </div>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl font-[900]">
                  <Shield className="w-3 h-3" />
                  Tier {currentUser.tier} Hub
                </span>
                <span className="text-[10px] uppercase tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-xl font-[900]">
                  <Award className="w-3 h-3 inline mr-1" />
                  {currentUser.reputationLevel}
                </span>
              </div>
              <div className="mt-5">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    Milestone Progress
                  </div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    {userStats.reputationScore} / {currentUser.nextMilestone}{" "}
                    PTS
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm self-center">
              <div className="text-3xl font-[1000] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-none">
                {userStats.reputationScore}
              </div>
              <div className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mt-2 text-center">
                Net Credits
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Reported", value: userStats.reported, icon: "📋" },
            { label: "Verified", value: userStats.verified, icon: "✅" },
            { label: "Resolved", value: userStats.resolved, icon: "🎯" },
            {
              label: "Confirmations",
              value: userStats.confirmations,
              icon: "🤝",
            },
          ].map(({ label, value, icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/60 backdrop-blur-md rounded-[2rem] p-5 border border-white/50 shadow-sm text-center"
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white/50 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-[700] text-slate-900">
              Badge Collection
            </h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-[600]">
              {earnedBadges.length}/{currentUser.badges.length} earned
            </span>
          </div>

          <div className="mb-4">
            <div className="text-xs font-[600] text-slate-500 uppercase tracking-wider mb-3">
              Earned
            </div>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-1.5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 cursor-pointer min-w-[80px]"
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <span className="text-xs font-[700] text-slate-700 text-center">
                    {badge.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {lockedBadges.length > 0 && (
            <div>
              <div className="text-xs font-[600] text-slate-400 uppercase tracking-wider mb-3">
                Locked
              </div>
              <div className="flex flex-wrap gap-3">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    title={badge.criteria}
                    className="flex flex-col items-center gap-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-50 cursor-not-allowed min-w-[80px] grayscale"
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <span className="text-xs font-[700] text-slate-500 text-center">
                      {badge.name}
                    </span>
                    <span className="text-[10px] text-slate-400 text-center leading-tight">
                      {badge.criteria}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Complaint History */}
        <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white/50 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100/50">
            <h3 className="text-base font-[700] text-slate-900">
              Complaint History
            </h3>
            <button
              onClick={() => navigate("/dashboard/complaints")}
              className="text-sm text-blue-600 hover:text-blue-700 font-[500] flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100/50">
            {complaints.length > 0 ? (
              complaints.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="text-2xl w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    {c.category === "Garbage"
                      ? "🗑️"
                      : c.category === "Pothole"
                        ? "🔧"
                        : c.category === "Streetlight"
                          ? "💡"
                          : c.category === "Water"
                            ? "💧"
                            : c.category === "Safety"
                              ? "🛡️"
                              : c.category === "Sanitation"
                                ? "⚠️"
                                : c.category === "Construction"
                                  ? "🏗️"
                                  : "📍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-[800] text-slate-900 truncate flex items-center gap-2">
                      {c.category}
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                        {c.subcategory || "General"}
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(c.$createdAt || c.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                      <span className="opacity-30">|</span>
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(c.$createdAt || c.createdAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[9px] px-2.5 py-1 rounded-full font-[900] uppercase tracking-wider ${
                        c.status === "Resolved" || c.status === "Closed"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : c.status === "Escalated"
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : c.status === "In Progress"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {c.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-2 opacity-10">📋</div>
                <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                  No complaints filed yet
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Annual Report Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-blue-200/30 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 blur-[40px] rounded-full" />
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-200" />
            <h3 className="text-base font-[700]">
              Your 2026 Civic Report Card
            </h3>
          </div>
          <p className="text-blue-200 text-sm mb-4">
            You helped <strong className="text-white">12 neighbors</strong> this
            year by reporting and resolving civic issues. Your ward ranks{" "}
            <strong className="text-white">#3</strong> in the city!
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-[600] rounded-xl transition-colors border border-white/20">
            Share on WhatsApp 📲
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white/50 shadow-xl p-5 space-y-1">
          {[
            { icon: Bell, label: "Notification Preferences" },
            { icon: Shield, label: "Privacy Settings" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-sm text-slate-700">{label}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100/50">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors text-left text-red-500">
              <LogOut className="w-4 h-4" />
              <span className="flex-1 text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
