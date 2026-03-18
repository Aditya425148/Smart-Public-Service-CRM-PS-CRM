import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Globe, MapPin, Trophy, Users } from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

type Scope = "National" | "District" | "Local";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Scope>("National");
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalResolved: 0,
    activeCitizens: 0,
  });
  const [currentUser, setCurrentUser] = useState<any>({});

  useEffect(() => {
    account
      .get()
      .then((user) => {
        setCurrentUser({
          name: user.name || user.email?.split("@")[0] || "Citizen",
          uid: user.$id,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      appwriteService.getLeaderboard(activeTab),
      appwriteService.getLeaderboardSummary(),
    ])
      .then(([ranked, totals]) => {
        setLeaders(ranked);
        setSummary(totals);
      })
      .catch(() => {
        setLeaders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab]);

  const currentUserRank = useMemo(
    () =>
      leaders.findIndex(
        (leader) =>
          leader.uid === currentUser.uid ||
          leader.userId === currentUser.uid ||
          leader.name === currentUser.name,
      ) + 1,
    [currentUser, leaders],
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white flex items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-6 py-7 shadow-sm">
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
          Leaderboard
        </span>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Citizen impact leaderboard
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A simple ranking view showing contributors across local, district,
              and national levels.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total resolved
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {summary.totalResolved}
              </div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Active citizens
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {summary.activeCitizens}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {([
            { label: "Local", icon: MapPin },
            { label: "District", icon: Users },
            { label: "National", icon: Globe },
          ] as const).map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.label
                  ? "bg-sky-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label === "Local" ? "Local (5 km)" : tab.label}
            </button>
          ))}
        </div>
      </section>

      {leaders.length === 0 ? (
        <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            <Trophy className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No ranking data yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Be the first contributor in this leaderboard range.
          </p>
          <button
            onClick={() => navigate("/dashboard/report")}
            className="mt-5 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Report an issue
          </button>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Top contributors
              </h2>
              <p className="text-sm text-slate-500">
                Ranked by impact score for the selected area.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {leaders.map((leader, index) => (
                <div
                  key={`${leader.uid || leader.name}-${index}`}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    index < 3 ? "bg-sky-50/50" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {index + 1}
                  </div>
                  <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-100">
                    {leader.avatar ? (
                      <img
                        src={leader.avatar}
                        alt={leader.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                        {leader.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {leader.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Resolved {leader.resolved || 0} issues
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">
                      {leader.impact || 0}
                    </div>
                    <div className="text-xs text-slate-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Your position
              </h2>
              <div className="mt-4 rounded-2xl bg-sky-50 p-4">
                <div className="text-sm font-medium text-slate-600">Rank</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {currentUserRank > 0 ? `#${currentUserRank}` : "--"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {currentUserRank > 0
                    ? "You are currently on the leaderboard."
                    : "Start reporting issues to appear here."}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                How ranking works
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Impact score increases with resolved issues and active contribution.</p>
                <p>Tabs switch the leaderboard scope between local, district, and national.</p>
                <p>Consistent reporting and resolution improve your position over time.</p>
              </div>
              <button
                onClick={() => navigate("/dashboard/report")}
                className="mt-5 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Improve my rank
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
