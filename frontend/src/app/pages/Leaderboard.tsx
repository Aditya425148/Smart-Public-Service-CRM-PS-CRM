import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  MapPin,
  Globe,
  Zap,
} from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<"National" | "District" | "Local">("National");
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalResolved: 0, activeCitizens: 0 });
  const [currentUser, setCurrentUser] = useState<any>({});

  useEffect(() => {
    account
      .get()
      .then((user) => {
        setCurrentUser({
          name: user.name || user.email?.split("@")[0] || "Citizen",
          email: user.email,
          uid: user.$id,
        });
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      appwriteService.getLeaderboard(activeTab),
      appwriteService.getLeaderboardSummary(),
    ])
      .then(([ranked, sum]) => {
        setLeaders(ranked);
        setSummary(sum);
      })
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Calculating rankings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[8%] -left-[8%] w-[35%] h-[35%] bg-indigo-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] -right-[5%] w-[30%] h-[30%] bg-amber-400/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-bold tracking-tight uppercase text-[10px] bg-amber-50 w-fit px-2 py-0.5 rounded-md border border-amber-100 mb-2">
              <Trophy className="w-3 h-3 fill-current" />
              Rankings
            </div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">
              Citizen Impact
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Recognizing the top contributors at every level.
            </p>
          </div>

          <div className="flex gap-1 p-1 bg-white/60 backdrop-blur-md rounded-2xl w-fit border border-white/50 shadow-sm">
            {(["Local", "District", "National"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {tab === "Local" && <MapPin className="w-3.5 h-3.5" />}
                {tab === "District" && <Users className="w-3.5 h-3.5" />}
                {tab === "National" && <Globe className="w-3.5 h-3.5" />}
                {tab === "Local" ? "Local (5km)" : tab}
              </button>
            ))}
          </div>
        </div>

        {leaders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Podium for Top 3 */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex justify-center items-end gap-2 md:gap-4 h-[280px] px-4">
                {/* 2nd Place */}
                {leaders[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 border-slate-200 shadow-lg">
                        <img
                          src={leaders[1].avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                        2
                      </div>
                    </div>
                    <div
                      className="w-full bg-white/60 backdrop-blur-md rounded-t-2xl p-4 text-center border border-white/50"
                      style={{ height: "120px" }}
                    >
                      <div className="font-black text-slate-800 text-sm truncate">
                        {leaders[1].name}
                      </div>
                      <div className="text-indigo-600 font-black text-xs">
                        {leaders[1].impact} pts
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {leaders[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <Trophy className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                    <div className="relative mb-4">
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl">
                        <img
                          src={leaders[0].avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-white shadow-lg">
                        1
                      </div>
                    </div>
                    <div
                      className="w-full bg-amber-50/60 backdrop-blur-md rounded-t-2xl p-6 text-center border border-amber-200/50 shadow-[0_-8px_30px_rgb(245,158,11,0.1)]"
                      style={{ height: "180px" }}
                    >
                      <div className="font-[900] text-slate-900 text-base truncate">
                        {leaders[0].name}
                      </div>
                      <div className="text-amber-600 font-[900] text-sm">
                        {leaders[0].impact} pts
                      </div>
                      <div className="text-[10px] text-amber-500 font-bold mt-2 uppercase">
                        National Hero
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {leaders[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-4 border-orange-200 shadow-md">
                        <img
                          src={leaders[2].avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm">
                        3
                      </div>
                    </div>
                    <div
                      className="w-full bg-orange-50/50 backdrop-blur-md rounded-t-2xl p-4 text-center border border-orange-200/50"
                      style={{ height: "100px" }}
                    >
                      <div className="font-black text-slate-800 text-xs truncate">
                        {leaders[2].name}
                      </div>
                      <div className="text-orange-600 font-black text-xs">
                        {leaders[2].impact} pts
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* List for the rest */}
              <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white/50 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">
                    Top Contributors
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Rank 4 — 10
                  </span>
                </div>
                <div className="divide-y divide-slate-100/50">
                  {leaders.slice(3).map((user, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 hover:bg-white/50 transition-colors"
                    >
                      <span className="w-6 text-sm font-black text-slate-300">
                        {idx + 4}
                      </span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          Resolved {user.resolved} issues
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">
                          {user.impact}
                        </div>
                        <div className="text-[10px] text-emerald-500 font-bold">
                          Points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-indigo-200/40 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 blur-[40px] rounded-full" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-white/20 rounded-2xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-black">Global Impact</h4>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Total Issues Resolved
                    </div>
                    <div className="text-4xl font-[900]">
                      {summary.totalResolved}
                    </div>
                  </div>
                  <div>
                    <div className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Active Citizens
                    </div>
                    <div className="text-4xl font-[900]">
                      {summary.activeCitizens}
                    </div>
                  </div>
                </div>
                <button className="w-full mt-8 py-3.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl text-xs font-black border border-white/10 transition-colors">
                  How is impact calculated?
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-6 border border-white/50 shadow-xl">
                <h4 className="font-black text-slate-900 mb-4">
                  Your Position
                </h4>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-[900] text-slate-400 italic">
                    --
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 italic">
                      Participate to rank
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Report an issue to start
                    </div>
                  </div>
                </div>
                <button className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-colors">
                  Find Issues Near You
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-200/50 p-20 text-center">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="font-[900] text-slate-900 text-xl">
              The movement has started
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              Be the first in your area to report an issue and top the
              leaderboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
