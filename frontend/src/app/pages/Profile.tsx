import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  ChevronRight,
  LogOut,
  Mail,
  MapPin,
  Shield,
} from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

function formatDate(value: any) {
  if (!value) return "Recently";
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const badgeTemplates = [
  {
    id: 1,
    name: "First Report",
    description: "Submit your first complaint",
  },
  {
    id: 2,
    name: "Verified Citizen",
    description: "Get 5 complaints verified",
  },
  {
    id: 3,
    name: "Community Helper",
    description: "Help verify 10 complaints",
  },
  {
    id: 4,
    name: "Ward Champion",
    description: "Become a strong local contributor",
  },
];

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
    joinedDate: "Recently",
    tier: 1,
    reputationLevel: "Bronze Citizen",
    nextMilestone: 1000,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    account
      .get()
      .then((user) => {
        setCurrentUser((prev: any) => ({
          ...prev,
          name: user.name || user.email?.split("@")[0] || "Citizen",
          email: user.email || "",
          uid: user.$id,
          joinedDate: formatDate(user.registration || user.$createdAt),
        }));

        if (!user.$id) {
          setLoading(false);
          return;
        }

        unsubscribe = appwriteService.subscribeToUserComplaints(
          user.$id,
          (userComplaints) => {
            setComplaints(userComplaints);
            setUserStats({
              reported: userComplaints.length,
              verified: userComplaints.filter(
                (complaint) =>
                  !["Submitted", "Pending Verification"].includes(
                    complaint.status,
                  ),
              ).length,
              resolved: userComplaints.filter((complaint) =>
                ["Resolved", "Closed"].includes(complaint.status),
              ).length,
              confirmations: userComplaints.reduce(
                (sum, complaint) => sum + (complaint.confirmations || 0),
                0,
              ),
              reputationScore:
                userComplaints.length * 10 +
                userComplaints.filter(
                  (complaint) => complaint.status === "Resolved",
                ).length *
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

  const progressPercent = Math.min(
    100,
    Math.round((userStats.reputationScore / currentUser.nextMilestone) * 100),
  );

  const badges = useMemo(
    () =>
      badgeTemplates.map((badge) => ({
        ...badge,
        earned:
          (badge.id === 1 && userStats.reported > 0) ||
          (badge.id === 2 && userStats.verified >= 5) ||
          (badge.id === 3 && userStats.confirmations >= 10) ||
          (badge.id === 4 && userStats.resolved >= 10),
      })),
    [userStats],
  );

  const handleLogout = async () => {
    try {
      await account.deleteSessions();
    } catch (_) {
      try {
        await account.deleteSession("current");
      } catch (_) {}
    }
    navigate("/login");
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white flex items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-6 py-7 shadow-sm">
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
          Profile
        </span>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-700 text-xl font-semibold text-white">
              {currentUser.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {currentUser.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-sky-700" />
                  {currentUser.email || "Citizen account"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sky-700" />
                  {currentUser.ward || "General"}
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-[240px] rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="text-sm font-medium text-slate-600">
              Reputation score
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {userStats.reputationScore}
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-sky-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {progressPercent}% of next milestone
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Reported", value: userStats.reported },
          { label: "Verified", value: userStats.verified },
          { label: "Resolved", value: userStats.resolved },
          { label: "Confirmations", value: userStats.confirmations },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm font-medium text-slate-500">
              {item.label}
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {item.value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent complaint history
            </h2>
            <p className="text-sm text-slate-500">
              Your latest reported issues and status updates.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {complaints.length > 0 ? (
              complaints.slice(0, 5).map((complaint) => (
                <button
                  key={complaint.id}
                  onClick={() => navigate(`/dashboard/complaints/${complaint.id}`)}
                  className="flex w-full items-start justify-between gap-4 px-6 py-4 text-left hover:bg-sky-50/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {complaint.category}
                      {complaint.subcategory ? ` - ${complaint.subcategory}` : ""}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {complaint.address || "Address unavailable"}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {formatDate(complaint.$createdAt || complaint.createdAt)}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {complaint.status}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No complaints filed yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Badges</h2>
            <div className="mt-4 space-y-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-2xl border px-4 py-3 ${
                    badge.earned
                      ? "border-sky-200 bg-sky-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900">
                    {badge.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {badge.description}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {badge.earned ? "Earned" : "Locked"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Account actions
            </h2>
            <div className="mt-4 space-y-2">
              {[
                { icon: Bell, label: "Notification preferences" },
                { icon: Shield, label: "Privacy settings" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left hover:bg-sky-50/50"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <item.icon className="h-4 w-4 text-sky-700" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-2xl border border-red-200 px-4 py-3 text-left text-red-600 hover:bg-red-50"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </span>
                <ChevronRight className="h-4 w-4 text-red-300" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
