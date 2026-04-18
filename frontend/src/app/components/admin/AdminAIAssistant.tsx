import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bot, BriefcaseBusiness, Send, Sparkles, X } from "lucide-react";
import { appwriteService } from "../../appwriteService";
import {
  DELHI_ZONE_CONFIG,
  inferDelhiZone,
  isDelhiComplaint,
  MOCK_ADMIN_MANAGERS,
  normalizeComplaintCategory,
} from "../../utils/adminInsights";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
};

type AssistantContext = {
  complaints: any[];
};

const quickQuestions = [
  "How many managers are currently mapped in the admin portal?",
  "Give me a Delhi zone-wise complaint summary.",
  "Which Delhi zone currently has the highest active complaints?",
  "What can I review in the analytics and heatmap section?",
];

function buildAdminReply(question: string, context: AssistantContext) {
  const q = question.toLowerCase();
  const complaints = context.complaints;
  const delhiComplaints = complaints.filter((complaint) =>
    isDelhiComplaint(complaint),
  );

  const zoneStats = DELHI_ZONE_CONFIG.map((zone) => {
    const zoneComplaints = delhiComplaints.filter(
      (complaint) => inferDelhiZone(complaint) === zone.id,
    );
    const active = zoneComplaints.filter(
      (complaint) => !["Resolved", "Closed"].includes(complaint.status),
    );
    const resolved = zoneComplaints.filter((complaint) =>
      ["Resolved", "Closed"].includes(complaint.status),
    );

    const categoryMap = active.reduce(
      (acc, complaint) => {
        const category = normalizeComplaintCategory(complaint.category);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      ...zone,
      total: zoneComplaints.length,
      active: active.length,
      resolved: resolved.length,
      escalated: zoneComplaints.filter((complaint) => complaint.escalated)
        .length,
      topCategories,
    };
  });

  const busiestZone = [...zoneStats].sort((a, b) => b.active - a.active)[0];
  const totalActive = complaints.filter(
    (complaint) => !["Resolved", "Closed"].includes(complaint.status),
  ).length;
  const totalResolved = complaints.filter((complaint) =>
    ["Resolved", "Closed"].includes(complaint.status),
  ).length;
  const escalatedCount = complaints.filter((complaint) => complaint.escalated)
    .length;

  const zoneWithKeyword = zoneStats.find((zone) =>
    q.includes(zone.name.toLowerCase().replace(/&/g, "and")),
  );

  if (
    q.includes("manager") ||
    q.includes("managers") ||
    q.includes("manager list")
  ) {
    const managerLines = MOCK_ADMIN_MANAGERS.map(
      (manager, index) =>
        `${index + 1}. ${manager.name} handles ${manager.zone} and can be reached at ${manager.email}.`,
    ).join("\n");

    return [
      `There are currently ${MOCK_ADMIN_MANAGERS.length} configured managers visible in the admin portal.`,
      managerLines,
    ].join("\n\n");
  }

  if (
    q.includes("zone-wise") ||
    q.includes("zone wise") ||
    q.includes("delhi zone") ||
    q.includes("summary")
  ) {
    const summaryLines = zoneStats.map((zone, index) => {
      const categorySummary =
        zone.topCategories.length > 0
          ? zone.topCategories
              .map(([category, count]) => `${category}: ${count}`)
              .join(", ")
          : "No active category concentration right now";

      return `${index + 1}. ${zone.name}: ${zone.active} active, ${zone.resolved} resolved, ${zone.escalated} escalated. Top active categories: ${categorySummary}.`;
    });

    return summaryLines.join("\n\n");
  }

  if (
    q.includes("highest active") ||
    q.includes("most complaints") ||
    q.includes("busiest zone")
  ) {
    if (!busiestZone) {
      return "No Delhi complaint data is available yet, so I cannot identify the busiest zone.";
    }

    const categorySummary =
      busiestZone.topCategories.length > 0
        ? busiestZone.topCategories
            .map(([category, count]) => `${category} (${count})`)
            .join(", ")
        : "No active category split is available yet";

    return `${busiestZone.name} currently reports the highest active complaint volume with ${busiestZone.active} active complaints. Resolved cases in this zone stand at ${busiestZone.resolved}, with ${busiestZone.escalated} escalations. The most visible active categories are ${categorySummary}.`;
  }

  if (zoneWithKeyword) {
    const categorySummary =
      zoneWithKeyword.topCategories.length > 0
        ? zoneWithKeyword.topCategories
            .map(([category, count]) => `${category}: ${count}`)
            .join(", ")
        : "No active category split is currently available";

    return `${zoneWithKeyword.name} currently has ${zoneWithKeyword.active} active complaints, ${zoneWithKeyword.resolved} resolved complaints, and ${zoneWithKeyword.escalated} escalated complaints. The most visible active categories are ${categorySummary}.`;
  }

  if (
    q.includes("analytics") ||
    q.includes("heatmap") ||
    q.includes("review")
  ) {
    return [
      "The Analytics & Heatmap section helps the admin team review live Delhi complaint density, active versus resolved volume by zone, SLA movement, resolution speed, and escalation pressure.",
      `At the moment, the portal shows ${delhiComplaints.length} Delhi-linked complaints in the heatmap pipeline, with ${totalActive} active complaints, ${totalResolved} resolved complaints, and ${escalatedCount} escalated cases across the broader admin dataset.`,
      busiestZone
        ? `${busiestZone.name} is currently the most active Delhi zone.`
        : "A busiest Delhi zone cannot be identified yet because there is no qualifying complaint data.",
    ].join("\n\n");
  }

  return [
    "I can help with admin-focused insights from the Managers and Analytics & Heatmap sections.",
    `Current snapshot: ${MOCK_ADMIN_MANAGERS.length} managers configured, ${totalActive} active complaints, ${totalResolved} resolved complaints, and ${escalatedCount} escalated cases.`,
    busiestZone
      ? `${busiestZone.name} currently has the highest active complaint load in Delhi.`
      : "Delhi zone distribution will appear as soon as complaint records are available.",
  ].join("\n\n");
}

export default function AdminAIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Hello, I am the CivicPulse Admin AI Assistant. I can provide professional, section-aware insights for managers, analytics, and the Delhi heatmap.",
    },
  ]);
  const messageIdRef = useRef(2);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = appwriteService.subscribeToComplaints((data) => {
      setComplaints(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [isOpen, messages]);

  const lastBotReply = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((message) => message.from === "bot")?.text || "";
  }, [messages]);

  const askQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: messageIdRef.current++,
      from: "user",
      text: trimmed,
    };

    const botMessage: ChatMessage = {
      id: messageIdRef.current++,
      from: "bot",
      text: buildAdminReply(trimmed, { complaints }),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-[1.35rem] bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-2xl shadow-sky-900/35 transition-transform hover:scale-105"
        title="Open Admin AI Assistant"
      >
        <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-white" />
        {isOpen ? (
          <X className="mx-auto h-6 w-6" />
        ) : (
          <BriefcaseBusiness className="mx-auto h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(43rem,calc(100vh-7rem))] w-[380px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.28)]">
          <div className="bg-gradient-to-r from-sky-700 to-indigo-700 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div className="text-lg font-[800] tracking-tight">
                Civic AI Assistant
              </div>
            </div>
            <div className="mt-1 text-sm leading-snug text-sky-100">
              Ask for manager coverage, admin analytics, or Delhi heatmap
              insights in professional English.
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/50 px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.from === "user" ? "text-right" : "text-left"
                }
              >
                <div
                  className={`inline-block max-w-[92%] rounded-[1.4rem] px-4 py-3 text-sm leading-relaxed ${
                    message.from === "user"
                      ? "bg-sky-700 text-white"
                      : "whitespace-pre-line bg-[#e9eef7] text-slate-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4">
            <div className="mb-3 max-h-[112px] overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => askQuestion(question)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-sky-100 hover:text-sky-700"
                >
                  {question}
                </button>
              ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") askQuestion(input);
                }}
                placeholder="Ask the admin assistant..."
                className="h-11 flex-1 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700 outline-none focus:border-sky-400"
              />
              <button
                onClick={() => askQuestion(input)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-700 text-white transition hover:bg-sky-800"
                title="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/admin/analytics")}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Analytics
              </button>
              <button
                onClick={() => navigate("/admin/managers")}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Managers
              </button>
            </div>

            {lastBotReply && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
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
