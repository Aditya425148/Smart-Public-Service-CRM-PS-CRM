import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bot, HelpCircle, Send, Sparkles, X } from "lucide-react";
import { appwriteService } from "../../appwriteService";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
};

type AdminOpsStats = {
  total: number;
  pending: number;
  resolved: number;
  breached: number;
  atRisk: number;
  escalated: number;
  topCategory: string;
  hotspotArea: string;
};

const quickQuestions = [
  "What is current queue snapshot?",
  "How do I assign complaints quickly?",
  "How can I reduce SLA breaches?",
  "Where can I view manager performance?",
  "How do I use analytics for zone decisions?",
];

const defaultStats: AdminOpsStats = {
  total: 0,
  pending: 0,
  resolved: 0,
  breached: 0,
  atRisk: 0,
  escalated: 0,
  topCategory: "No data",
  hotspotArea: "No data",
};

function buildOpsSnapshot(stats: AdminOpsStats): string {
  return [
    `Total: ${stats.total}`,
    `Pending: ${stats.pending}`,
    `Resolved: ${stats.resolved}`,
    `Breached: ${stats.breached}`,
    `At Risk: ${stats.atRisk}`,
    `Escalated: ${stats.escalated}`,
    `Top Category: ${stats.topCategory}`,
    `Hotspot Area: ${stats.hotspotArea}`,
  ].join(" | ");
}

function buildAdminReply(question: string, stats: AdminOpsStats): string {
  const q = question.toLowerCase();
  const includesAny = (keywords: string[]) =>
    keywords.some((k) => q.includes(k));

  const replySections: Array<{ title: string; text: string }> = [];

  const assignmentIntent = includesAny([
    "assign",
    "allocation",
    "route",
    "manager",
    "worker",
    "queue",
  ]);
  const slaIntent = includesAny([
    "sla",
    "breach",
    "escalation",
    "deadline",
    "risk",
  ]);
  const analyticsIntent = includesAny([
    "analytics",
    "heatmap",
    "zone",
    "trend",
    "insight",
    "report",
  ]);
  const usersIntent = includesAny([
    "user",
    "manager",
    "roles",
    "access",
    "permissions",
  ]);
  const queueIntent = includesAny([
    "queue",
    "pending",
    "backlog",
    "priority",
    "complaints",
  ]);
  const snapshotIntent = includesAny([
    "snapshot",
    "current",
    "today",
    "right now",
    "overview",
    "summary",
  ]);

  const urgentFocus =
    stats.breached > 0
      ? `Immediate focus: ${stats.breached} breached complaints need urgent reassignment.`
      : "Immediate focus: no breached complaints right now.";

  if (snapshotIntent) {
    return `Current admin operations snapshot:\n${buildOpsSnapshot(stats)}\n\n${urgentFocus}`;
  }

  if (assignmentIntent) {
    replySections.push({
      title: "Fast assignment flow",
      text: `Open Complaint Queue, sort by SLA risk and priority, then assign high-risk complaints first. Right now: ${stats.atRisk} at-risk and ${stats.breached} breached complaints. Start from hotspot area ${stats.hotspotArea}.`,
    });
  }

  if (slaIntent) {
    replySections.push({
      title: "Reduce SLA breaches",
      text: `Prioritize ${stats.breached} breached and ${stats.atRisk} at-risk complaints from Queue, monitor Analytics hotspot ${stats.hotspotArea}, and tune SLA policy thresholds in SLA Configuration to match operational capacity.`,
    });
  }

  if (analyticsIntent) {
    replySections.push({
      title: "Use analytics effectively",
      text: `Use Analytics & Heatmap to identify high-volume Delhi zones and unresolved clusters. Current hotspot is ${stats.hotspotArea} and top category is ${stats.topCategory}. Use these to set daily staffing and routing priorities.`,
    });
  }

  if (usersIntent) {
    replySections.push({
      title: "Manage users and managers",
      text: "Use User Management for access and role-level checks, and Managers for operational ownership. Keep active managers balanced by zone and complaint type.",
    });
  }

  if (queueIntent) {
    replySections.push({
      title: "Queue best practice",
      text: `Review queue by SLA and priority each shift. Current queue: ${stats.pending} pending, ${stats.breached} breached, ${stats.escalated} escalated. Clear oldest pending cases first while keeping emergency categories on top.`,
    });
  }

  if (replySections.length > 0) {
    return replySections
      .map(
        (section, index) => `${index + 1}. ${section.title}: ${section.text}`,
      )
      .join("\n\n");
  }

  return `I can help with complaint assignment, SLA optimization, queue prioritization, manager performance, and analytics-driven zone planning.\n\nCurrent snapshot: ${buildOpsSnapshot(stats)}`;
}

export default function AdminAIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [complaints, setComplaints] = useState<any[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Hi, I am Civic AI Admin Assistant. Ask me about queue actions, SLA, managers, or analytics. I use live dashboard data.",
    },
  ]);
  const messageIdRef = useRef(2);

  useEffect(() => {
    const unsubscribe = appwriteService.subscribeToComplaints((data) => {
      setComplaints(Array.isArray(data) ? data : []);
    });
    return () => unsubscribe();
  }, []);

  const opsStats = useMemo<AdminOpsStats>(() => {
    const areaMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};

    let pending = 0;
    let resolved = 0;
    let breached = 0;
    let atRisk = 0;
    let escalated = 0;

    complaints.forEach((c) => {
      const isResolved = ["Resolved", "Closed"].includes(c?.status);
      const area = c?.area || c?.ward || "Unspecified";
      const category = c?.category || "Other";

      areaMap[area] = (areaMap[area] || 0) + 1;
      categoryMap[category] = (categoryMap[category] || 0) + 1;

      if (isResolved) {
        resolved += 1;
      } else {
        pending += 1;
      }

      const slaHours = Number(c?.slaRemainingHours);
      if (!Number.isNaN(slaHours)) {
        if (slaHours < 0) breached += 1;
        else if (slaHours < 12) atRisk += 1;
      }

      if (Boolean(c?.escalated)) escalated += 1;
    });

    const topCategory =
      Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "No data";
    const hotspotArea =
      Object.entries(areaMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "No data";

    return {
      total: complaints.length,
      pending,
      resolved,
      breached,
      atRisk,
      escalated,
      topCategory,
      hotspotArea,
    };
  }, [complaints]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isOpen]);

  const lastBotReply = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((m) => m.from === "bot")?.text || "";
  }, [messages]);

  const askQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: messageIdRef.current++,
      from: "user",
      text: trimmed,
    };

    const botMsg: ChatMessage = {
      id: messageIdRef.current++,
      from: "bot",
      text: buildAdminReply(
        trimmed,
        complaints.length ? opsStats : defaultStats,
      ),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-2xl shadow-violet-900/30 transition-transform hover:scale-105"
        title="Open Civic AI Admin Assistant"
      >
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-white" />
        {isOpen ? (
          <X className="mx-auto h-6 w-6" />
        ) : (
          <HelpCircle className="mx-auto h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div className="font-bold tracking-tight">
                Civic AI Admin Assistant
              </div>
            </div>
            <div className="mt-1 text-xs text-violet-100">
              Ask about queue, SLA, manager performance, and operational
              analytics.
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="max-h-[300px] space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.from === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={`inline-block max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-violet-700 text-white"
                      : "whitespace-pre-line bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-3 py-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => askQuestion(q)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-violet-100 hover:text-violet-700"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askQuestion(input);
                }}
                placeholder="Ask admin assistant..."
                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400"
              />
              <button
                onClick={() => askQuestion(input)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-white transition hover:bg-violet-800"
                title="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/admin/queue")}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Queue
              </button>
              <button
                onClick={() => navigate("/admin/analytics")}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Analytics
              </button>
            </div>

            {lastBotReply && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <Sparkles className="h-3 w-3" />
                Admin AI active
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
