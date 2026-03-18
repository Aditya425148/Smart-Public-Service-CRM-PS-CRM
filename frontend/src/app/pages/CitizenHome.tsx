import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  LocateFixed,
  MapPin,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

const statusColor: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-700",
  "Pending Verification": "bg-amber-100 text-amber-800",
  Verified: "bg-sky-100 text-sky-700",
  Assigned: "bg-sky-100 text-sky-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  Escalated: "bg-red-100 text-red-700",
};

function formatComplaintDate(value: any) {
  if (!value) return "Today";
  const date =
    typeof value === "string"
      ? new Date(value)
      : new Date((value.seconds || 0) * 1000);

  if (Number.isNaN(date.getTime())) return "Today";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFirstName(name?: string) {
  return name?.trim()?.split(" ")?.[0] || "Citizen";
}

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
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
          );
          const data = await response.json();
          if (data.address?.state) {
            setUserState(data.address.state);
          }
        } catch (error) {
          console.error("Failed to fetch state name:", error);
        }
      },
      () => {
        console.warn("Location access denied or unavailable.");
      },
    );
  }, []);

  useEffect(() => {
    account
      .get()
      .then((currentUser) => {
        setUser({
          name: currentUser.name || currentUser.email?.split("@")[0] || "Citizen",
          email: currentUser.email,
          uid: currentUser.$id,
        });
      })
      .catch(() => {
        navigate("/login");
      });

    const unsubscribe = appwriteService.subscribeToComplaints(
      (data) => {
        setComplaints(data);
        setLoading(false);
      },
      coords?.lat,
      coords?.lng,
      5,
    );

    return () => unsubscribe();
  }, [coords, navigate]);

  const userComplaints = complaints.filter(
    (complaint) =>
      complaint.reporterId === user.uid || complaint.userId === user.uid,
  );
  const resolvedCount = userComplaints.filter((complaint) =>
    ["Resolved", "Closed"].includes(complaint.status),
  ).length;
  const activeCount = userComplaints.length - resolvedCount;
  const nearbyOpenCount = complaints.filter(
    (complaint) =>
      !["Resolved", "Closed"].includes(complaint.status) &&
      (complaint.distance_km || 1) <= 5,
  ).length;
  const verificationCount = complaints.filter(
    (complaint) =>
      ["Submitted", "Pending Verification"].includes(complaint.status) &&
      complaint.reporterId !== user.uid &&
      complaint.userId !== user.uid &&
      !(complaint.verifiedBy || []).includes(user.uid) &&
      (userState ? complaint.state === userState : true),
  ).length;

  const recentComplaints = [...userComplaints].slice(0, 5);
  const nearbyComplaints = complaints
    .filter(
      (complaint) =>
        !["Resolved", "Closed"].includes(complaint.status) &&
        (complaint.distance_km || 1) <= 5,
    )
    .slice(0, 4);

  const quickLinks = [
    {
      label: "Report a new issue",
      description: "Start a complaint with location and category details.",
      action: () => navigate("/dashboard/report"),
    },
    {
      label: "Check my complaints",
      description: "Track status updates and response timelines in one place.",
      action: () => navigate("/dashboard/complaints"),
    },
    {
      label: "Open my profile",
      description: "Review your details and account information.",
      action: () => navigate("/dashboard/profile"),
    },
  ];

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white flex flex-col items-center justify-center">
        <div className="mb-4 h-10 w-10 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
              Citizen dashboard
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Hello, {formatFirstName(user.name)}
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                Everything important is on one screen: create a complaint,
                follow your updates, and see nearby issues without extra visual
                clutter.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                <LocateFixed className="h-4 w-4 text-sky-600" />
                {coords
                  ? "Nearby updates enabled"
                  : "Location not shared yet"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                {userState || "Local area feed"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard/report")}
              className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
            >
              <Plus className="h-4 w-4" />
              Report issue
            </button>
            <button
              onClick={() => navigate("/dashboard/complaints")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              View complaints
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Reported by you",
            value: userComplaints.length,
            note: "Total complaints created",
          },
          {
            label: "Active now",
            value: activeCount,
            note: "Still being worked on",
          },
          {
            label: "Resolved",
            value: resolvedCount,
            note: "Completed or closed",
          },
          {
            label: "Nearby open issues",
            value: nearbyOpenCount,
            note: "Within about 5 km",
          },
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
            <div className="mt-1 text-sm text-slate-500">{item.note}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent complaints
              </h2>
              <p className="text-sm text-slate-500">
                Your latest updates in a clean list.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/complaints")}
              className="text-sm font-medium text-sky-700 hover:text-sky-800"
            >
              See all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentComplaints.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  You have not reported any issues yet.
                </p>
                <button
                  onClick={() => navigate("/dashboard/report")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                >
                  <Plus className="h-4 w-4" />
                  Create first report
                </button>
              </div>
            ) : (
              recentComplaints.map((complaint) => (
                <button
                  key={complaint.id}
                  onClick={() =>
                    navigate(`/dashboard/complaints/${complaint.id}`)
                  }
                  className="flex w-full items-start gap-4 px-6 py-4 text-left transition hover:bg-sky-50/60"
                >
                  <div className="mt-1 rounded-xl bg-sky-50 p-2 text-sky-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {complaint.category || "Complaint"}
                        {complaint.subcategory
                          ? ` - ${complaint.subcategory}`
                          : ""}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[complaint.status] || "bg-slate-100 text-slate-700"}`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {complaint.address || "Address unavailable"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-4 w-4" />
                        {formatComplaintDate(complaint.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              What needs attention
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-sky-50 p-4">
                <div className="text-sm font-medium text-slate-600">
                  Complaints waiting for your verification
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {verificationCount}
                </div>
                <button
                  onClick={() => navigate("/dashboard/complaints")}
                  className="mt-3 text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                  Review complaints
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-medium text-slate-600">
                  Your completion rate
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-2xl font-semibold text-slate-900">
                    {userComplaints.length
                      ? Math.round((resolvedCount / userComplaints.length) * 100)
                      : 0}
                    %
                  </div>
                  <div className="mb-1 text-sm text-slate-500">
                    resolved or closed
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-sky-700"
                    style={{
                      width: `${userComplaints.length ? Math.round((resolvedCount / userComplaints.length) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick actions
            </h2>
            <div className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50/60"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {link.label}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {link.description}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Nearby public issues
            </h2>
            <p className="text-sm text-slate-500">
              A short local feed so users can understand what is happening
              around them.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <CheckCircle2 className="h-4 w-4" />
            {nearbyComplaints.length} visible now
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          {nearbyComplaints.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 md:col-span-2">
              No open nearby issues are visible right now.
            </div>
          ) : (
            nearbyComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {complaint.category || "Issue"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {complaint.address || "Address unavailable"}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[complaint.status] || "bg-slate-100 text-slate-700"}`}
                  >
                    {complaint.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>{(complaint.distance_km || 0).toFixed(1)} km away</span>
                  <button
                    onClick={() =>
                      navigate(`/dashboard/complaints/${complaint.id}`)
                    }
                    className="font-medium text-sky-700 hover:text-sky-800"
                  >
                    Open details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
