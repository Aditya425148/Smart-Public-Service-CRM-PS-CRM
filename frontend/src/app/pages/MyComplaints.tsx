import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Clock3, MapPin, Search } from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";

const statusColors: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-700",
  Assigned: "bg-sky-100 text-sky-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  Escalated: "bg-red-100 text-red-700",
};

const priorityLabel = (score: number) => {
  if (score >= 0.75)
    return { label: "High", className: "bg-red-50 text-red-700" };
  if (score >= 0.4)
    return { label: "Medium", className: "bg-amber-50 text-amber-700" };
  return { label: "Low", className: "bg-slate-100 text-slate-700" };
};

function formatDate(value: any) {
  if (!value) return "Just now";
  const date =
    typeof value === "string"
      ? new Date(value)
      : new Date((value.seconds || 0) * 1000);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyComplaints() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "sla" | "priority">("date");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    account
      .get()
      .then((user) => {
        if (!user.$id) {
          setLoading(false);
          return;
        }

        unsubscribe = appwriteService.subscribeToUserComplaints(
          user.$id,
          (data) => {
            setComplaints(data);
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

  const allStatuses = [
    "All",
    "Submitted",
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
    .filter((complaint) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        complaint.id?.toLowerCase().includes(query) ||
        complaint.category?.toLowerCase().includes(query) ||
        complaint.address?.toLowerCase().includes(query);

      const matchesStatus =
        filterStatus === "All" || complaint.status === filterStatus;
      const matchesCategory =
        filterCategory === "All" || complaint.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((left, right) => {
      if (sortBy === "sla") {
        return (left.slaRemainingHours || 0) - (right.slaRemainingHours || 0);
      }
      if (sortBy === "priority") {
        return (right.priorityScore || 0) - (left.priorityScore || 0);
      }

      const leftDate = left.createdAt?.seconds
        ? left.createdAt.seconds * 1000
        : new Date(left.createdAt || 0).getTime();
      const rightDate = right.createdAt?.seconds
        ? right.createdAt.seconds * 1000
        : new Date(right.createdAt || 0).getTime();
      return rightDate - leftDate;
    });

  const summary = {
    total: complaints.length,
    active: complaints.filter(
      (complaint) =>
        !["Resolved", "Closed", "Rejected"].includes(complaint.status),
    ).length,
    resolved: complaints.filter((complaint) =>
      ["Resolved", "Closed"].includes(complaint.status),
    ).length,
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-slate-200 bg-white flex items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading your complaints...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-6 py-7 shadow-sm">
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
          My complaints
        </span>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Track your complaints
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Search, filter, and open any complaint without dealing with a busy
              dashboard layout.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total", value: summary.total },
              { label: "Active", value: summary.active },
              { label: "Resolved", value: summary.resolved },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-slate-200"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID, category, or address"
              className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-sky-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
          >
            {allStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
          >
            {allCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as "date" | "sla" | "priority")
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
          >
            <option value="date">Latest first</option>
            <option value="sla">SLA urgency</option>
            <option value="priority">Priority score</option>
          </select>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-sm font-medium text-slate-700">
              No complaints found
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Try a different search or filter.
            </div>
          </div>
        ) : (
          filtered.map((complaint) => {
            const isOverdue =
              complaint.slaRemainingHours < 0 &&
              !["Resolved", "Closed"].includes(complaint.status);
            const priority =
              complaint.priorityScore != null
                ? priorityLabel(complaint.priorityScore)
                : null;

            return (
              <button
                key={complaint.id}
                onClick={() =>
                  navigate(`/dashboard/complaints/${complaint.id}`)
                }
                className="w-full rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-sky-200 hover:bg-sky-50/30"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">
                        {complaint.category || "Complaint"}
                        {complaint.subcategory
                          ? ` - ${complaint.subcategory}`
                          : ""}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[complaint.status] || "bg-slate-100 text-slate-700"}`}
                      >
                        {complaint.status}
                      </span>
                      {priority && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}
                        >
                          {priority.label} priority
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {complaint.address || "Address unavailable"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-4 w-4" />
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>ID: {complaint.id}</span>
                      <span>Confirmations: {complaint.confirmations || 0}</span>
                      {complaint.slaRemainingHours != null && (
                        <span>
                          {isOverdue
                            ? `${Math.abs(complaint.slaRemainingHours)}h overdue`
                            : `${complaint.slaRemainingHours}h left`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-48">
                    {!["Resolved", "Closed"].includes(complaint.status) &&
                      complaint.slaHours != null && (
                        <>
                          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                            <span>SLA progress</span>
                            <span>{complaint.slaHours}h total</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${
                                isOverdue
                                  ? "bg-red-500"
                                  : complaint.slaRemainingHours <
                                      complaint.slaHours * 0.2
                                    ? "bg-amber-500"
                                    : "bg-sky-700"
                              }`}
                              style={{
                                width: isOverdue
                                  ? "100%"
                                  : `${Math.min(
                                      ((complaint.slaHours -
                                        complaint.slaRemainingHours) /
                                        complaint.slaHours) *
                                        100,
                                      100,
                                    )}%`,
                              }}
                            />
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </section>
    </div>
  );
}
