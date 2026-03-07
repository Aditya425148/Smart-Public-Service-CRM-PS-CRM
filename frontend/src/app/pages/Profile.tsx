import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Zap,
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
    ward: "Ward 1",
    joinedDate: "2026",
    tier: 1,
    reputationLevel: "Bronze Citizen",
    nextMilestone: 1000,
    badges: [
      {
        id: 1,
        name: "First Report",
        icon: "🏁",
        earned: true,
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
                  50,
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

  const reputationEvents = [
    {
      event: "Real-time data synced from Firestore",
      delta: `+${userStats.reputationScore}`,
      date: "Today",
    },
    {
      event: "Issue resolved (Pothole #CMP-2026-04828)",
      delta: "+30",
      date: "Feb 28",
    },
    { event: "Complaint verified as genuine", delta: "+20", date: "Feb 25" },
    { event: "Witness confirmation given", delta: "+5", date: "Feb 24" },
    {
      event: "Referral: friend filed first report",
      delta: "+50",
      date: "Feb 20",
    },
  ];

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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-[800]">
                  RS
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-[800]">{currentUser.name}</h2>
              <div className="text-slate-400 text-sm mt-1">
                {currentUser.ward} · Member since {currentUser.joinedDate}
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm bg-blue-600/30 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-[600]">
                  <Shield className="w-3.5 h-3.5" />
                  Tier {currentUser.tier} Citizen
                </span>
                <span className="text-sm bg-violet-600/30 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full font-[600]">
                  {currentUser.reputationLevel}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-xs text-slate-400 mb-1.5">
                  {userStats.reputationScore} / {currentUser.nextMilestone} pts
                  to next milestone ({progressPercent}%)
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-[800]">
                {userStats.reputationScore}
              </div>
              <div className="text-slate-400 text-sm">Civic Points</div>
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

        {/* Reputation Log */}
        <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white/50 shadow-xl p-6">
          <h3 className="text-base font-[700] text-slate-900 mb-5">
            Recent Reputation Events
          </h3>
          <div className="space-y-3">
            {reputationEvents.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-2.5 border-b border-slate-50 last:border-0"
              >
                <div className="text-sm text-slate-600 flex-1">{e.event}</div>
                <span className="text-sm font-[800] text-emerald-500">
                  {e.delta}
                </span>
                <span className="text-xs text-slate-400 w-12 text-right">
                  {e.date}
                </span>
              </div>
            ))}
          </div>
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
            {complaints.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="text-xl">
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
                  <div className="text-sm font-[600] text-slate-800 truncate">
                    {c.category} — {c.subcategory || "General"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {c.createdAt?.seconds
                      ? new Date(
                          c.createdAt.seconds * 1000,
                        ).toLocaleDateString()
                      : "Just now"}
                  </div>
                </div>
                <div
                  className={`text-xs px-2.5 py-1 rounded-full font-[600] ${
                    c.status === "Resolved" || c.status === "Closed"
                      ? "bg-emerald-100 text-emerald-700"
                      : c.status === "Escalated"
                        ? "bg-red-100 text-red-700"
                        : c.status === "In Progress"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {c.status}
                </div>
              </div>
            ))}
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
