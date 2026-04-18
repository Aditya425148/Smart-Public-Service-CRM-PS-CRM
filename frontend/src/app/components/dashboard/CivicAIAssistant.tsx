import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bot, HelpCircle, Send, Sparkles, X } from "lucide-react";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
};

const quickQuestions = [
  "How do I report an issue?",
  "How can I share my reported complaint?",
  "Where do I check complaint status updates?",
  "How does gallery image saving work?",
];

function buildBotReply(question: string): string {
  const q = question.toLowerCase();
  const includesAny = (keywords: string[]) =>
    keywords.some((k) => q.includes(k));

  const replySections: Array<{ title: string; text: string }> = [];

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

  if (replySections.length > 0) {
    return replySections
      .map(
        (section, index) => `${index + 1}. ${section.title}: ${section.text}`,
      )
      .join("\n\n");
  }

  return "I can help with reporting issues, tracking complaint status, sharing report cards, gallery autosave, and badges. Try one of the quick questions below.";
}

export default function CivicAIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Hi, I am Civic AI Assistant. Ask me anything about reporting, tracking, and sharing complaints.",
    },
  ]);
  const messageIdRef = useRef(2);

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
      text: buildBotReply(trimmed),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-2xl shadow-sky-900/30 transition-transform hover:scale-105"
        title="Open Civic AI Assistant"
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
              <div className="font-bold tracking-tight">Civic AI Assistant</div>
            </div>
            <div className="mt-1 text-xs text-sky-100">
              Ask anything about report, status, gallery, and complaint sharing.
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="max-h-[280px] space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.from === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-sky-700 text-white"
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
              {quickQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => askQuestion(q)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-sky-100 hover:text-sky-700"
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
                placeholder="Ask Civic AI..."
                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400"
              />
              <button
                onClick={() => askQuestion(input)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white transition hover:bg-sky-800"
                title="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/dashboard/report")}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go to Report
              </button>
              <button
                onClick={() => navigate("/dashboard/complaints")}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Complaints
              </button>
            </div>

            {lastBotReply && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <Sparkles className="h-3 w-3" />
                AI help active
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
