import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bot, HelpCircle, Send, Sparkles, X } from "lucide-react";

type PortalType = "citizen" | "manager" | "worker";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
};

interface PortalConfig {
  name: string;
  welcome: string;
}

const portalConfigs: Record<PortalType, PortalConfig> = {
  citizen: {
    name: "Civic AI Assistant",
    welcome: "Hi, I am Civic AI Assistant. Ask me anything about reporting, tracking, and sharing complaints.",
  },
  manager: {
    name: "Manager Support AI",
    welcome: "Welcome, Manager. I can help with worker assignment, SLA tracking, and operational oversight.",
  },
  worker: {
    name: "Worker Field AI",
    welcome: "Field Assistant active. Ask about resolution steps, GPS locking, or task priorities.",
  },
};

function buildBotReply(question: string, type: PortalType): string {
  const q = question.toLowerCase();
  const includesAny = (keywords: string[]) =>
    keywords.some((k) => q.includes(k));

  const replySections: Array<{ title: string; text: string }> = [];

  if (type === "manager") {
    if (includesAny(["assign", "worker", "handover", "route"])) {
      replySections.push({
        title: "Worker Assignment",
        text: "Select an unassigned complaint from your queue, click 'Assign Worker', and choose a field officer from the list. The task will immediately appear on their dashboard.",
      });
    }
    if (includesAny(["sla", "compliance", "timeline", "delay"])) {
      replySections.push({
        title: "SLA Monitoring",
        text: "The 'Area Overview' shows a breakdown of SLA status. Red indicators mean overdue, Amber means approaching SLA, and Green means on track.",
      });
    }
    if (includesAny(["jurisdiction", "area", "region", "filter"])) {
      replySections.push({
        title: "Jurisdiction Filters",
        text: "Use the filter bar at the top of the queue to narrow down issues by ward, zone, or specific infrastructure categories.",
      });
    }
    if (includesAny(["performance", "efficiency", "report", "workers"])) {
      replySections.push({
        title: "Worker Performance",
        text: "Go to 'My Workers' to see real-time metrics for each field officer, including total resolved tasks and average time to resolution.",
      });
    }
  } else if (type === "worker") {
    if (includesAny(["resolve", "update", "status", "complete"])) {
      replySections.push({
        title: "Task Resolution",
        text: "Open the assigned task, change status to 'En Route' when starting, and 'Resolved' after finishing. You MUST upload a photo during resolution.",
      });
    }
    if (includesAny(["gps", "lock", "150m", "distance", "location"])) {
      replySections.push({
        title: "GPS Verification",
        text: "To ensure transparency, resolution photos can only be uploaded if you are within 150m of the original GPS pin reported by the citizen.",
      });
    }
    if (includesAny(["history", "resolved", "completed", "past"])) {
      replySections.push({
        title: "Task History",
        text: "Visit the 'Resolved' tab in your navigation menu to see every task you've successfully closed and its verification status.",
      });
    }
    if (includesAny(["priority", "order", "urgent", "sla"])) {
      replySections.push({
        title: "Task Priority",
        text: "Tasks are automatically sorted by SLA urgency on your dashboard. Focus on 'Overdue' or 'Alert' status items first.",
      });
    }
  } else {
    // Citizen (default)
    const reportIntent = includesAny([
      "report",
      "issue",
      "raise",
      "submit",
      "file complaint",
      "new complaint",
    ]);
    const shareIntent = includesAny([
      "share",
      "download",
      "send",
      "forward",
      "post",
    ]);
    const statusIntent = includesAny([
      "status",
      "timeline",
      "update",
      "progress",
      "track",
      "pending",
      "resolved",
    ]);
    const galleryIntent = includesAny([
      "gallery",
      "save",
      "image",
      "photo",
      "auto save",
      "autosave",
    ]);
    const profileIntent = includesAny([
      "badge",
      "badges",
      "profile",
      "certificate",
      "history",
      "points",
    ]);

    if (reportIntent) {
      replySections.push({
        title: "Report issue",
        text: "Open Report Issue from the top menu, choose category, set location, add details/photos, then submit. CivicPulse auto-generates your official report card after submission.",
      });
    }
    if (shareIntent) {
      replySections.push({
        title: "Share complaint card",
        text: "Open My Complaints, open complaint detail, then use Download Image for the report card. Shared cards also appear in Profile > Gallery for quick sharing.",
      });
    }
    if (statusIntent) {
      replySections.push({
        title: "Track status",
        text: "Open My Complaints and select your complaint. You can see current stage, SLA progress, and timeline updates there.",
      });
    }
    if (galleryIntent) {
      replySections.push({
        title: "Gallery saving",
        text: "Report cards are auto-saved after complaint submission. Manual save is not needed. Open Profile > Gallery to view and share your latest cards.",
      });
    }
    if (profileIntent) {
      replySections.push({
        title: "Profile and badges",
        text: "Open Profile to view milestones, gallery cards, and activity history. Badge certificates can be downloaded from the Badges tab.",
      });
    }
  }

  if (replySections.length > 0) {
    return replySections
      .map(
        (section, index) => `${index + 1}. ${section.title}: ${section.text}`,
      )
      .join("\n\n");
  }

  if (type === "manager")
    return "I can help with worker assignment, SLA tracking, regional filters, and performance metrics. Try a quick question!";
  if (type === "worker")
    return "I can help with resolve tasks, GPS rules, task history, and priorities. Try a quick question!";
  return "I can help with reporting issues, tracking complaint status, sharing report cards, gallery autosave, and badges. Try one of the quick questions below.";
}

import ReactMarkdown from "react-markdown";

export default function CivicAIAssistant({
  type = "citizen",
}: {
  type?: PortalType;
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const config = portalConfigs[type];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: config.welcome,
    },
  ]);
  const messageIdRef = useRef(2);

  // Sync welcome message if type changes
  useEffect(() => {
    setMessages([
      {
        id: 1,
        from: "bot",
        text: config.welcome,
      },
    ]);
  }, [type, config.welcome]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isOpen, isLoading]);

  const lastBotReply = useMemo(() => {
    const reversed = [...messages].reverse();
    return reversed.find((m) => m.from === "bot")?.text || "";
  }, [messages]);

  const askQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: messageIdRef.current++,
      from: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Map history for the backend
      const history = messages
        .filter((m) => m.id !== 1) // skip welcome
        .map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const response = await fetch("http://localhost:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          portal_type: type,
          history: history,
        }),
      });

      if (!response.ok) throw new Error("AI Service Unavailable");

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: messageIdRef.current++,
        from: "bot",
        text: data.reply,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: messageIdRef.current++,
        from: "bot",
        text: "I'm having trouble connecting to the AI service. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-2xl shadow-sky-900/30 transition-transform hover:scale-105"
        title={`Open ${config.name}`}
      >
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-white" />
        {isOpen ? (
          <X className="mx-auto h-6 w-6" />
        ) : (
          <HelpCircle className="mx-auto h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-sky-700 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div className="font-bold tracking-tight">{config.name}</div>
            </div>
            <div className="mt-1 text-xs text-sky-100 italic opacity-90">
              {type === "citizen"
                ? "Powered by Llama 3"
                : type === "manager"
                  ? "Operational Intelligence"
                  : "Field Support AI"}
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="max-h-[280px] min-h-[100px] space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.from === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.from === "user"
                    ? "bg-sky-700 text-white"
                    : "bg-slate-100 text-slate-800"
                    }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p {...props} className="mb-0" />,
                      strong: ({ node, ...props }) => <strong {...props} className="font-black text-slate-950" />,
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left animate-pulse">
                <div className="inline-block bg-slate-100 rounded-2xl px-4 py-2 text-xs text-slate-500 italic">
                  Bot is thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askQuestion(input);
                }}
                placeholder="Type your question..."
                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 disabled:bg-slate-50"
              />
              <button
                disabled={isLoading}
                onClick={() => askQuestion(input)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white transition hover:bg-sky-800 disabled:opacity-50"
                title="Send"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            {lastBotReply && (
              <div className="mt-3 flex items-center justify-end font-medium text-slate-400">
                <div className="text-[10px]">
                  v3.0 Production
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
