import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Zap,
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Play,
  Star,
  ChevronDown,
  Trash2,
  Lightbulb,
  Droplets,
  HardHat,
  AlertTriangle,
  Wrench,
  Menu,
  X,
  Phone,
  Mail,
  Github,
  Twitter,
  ChevronRight,
  TrendingUp,
  Award,
  MessageSquare,
  Activity,
  Calendar,
  Lock,
  FileText,
  LifeBuoy,
  Scale,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

const Logo = ({
  className = "w-8 h-8",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle
        cx="16"
        cy="16"
        r="14"
        className={light ? "stroke-blue-400/20" : "stroke-blue-600/20"}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path
        d="M6 16H10L13 8L17 24L21 10L23 16H26"
        className={light ? "stroke-blue-400" : "stroke-blue-600"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="100"
          to="0"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </div>
);

const HERO_BG =
  "https://images.unsplash.com/photo-1760553120209-8e9d5d2493e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGNpdHklMjBhZXJpYWwlMjB2aWV3JTIwbGlnaHRzfGVufDF8fHx8MTc3MjYxNTc4NHww&ixlib=rb-4.1.0&q=80&w=1080";
const COMMUNITY_IMG =
  "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc3RyZWV0JTIwcmVwYWlyJTIwbXVuaWNpcGFsJTIwd29ya2VyfGVufDF8fHx8MTc3MjYxNTc4NXww&ixlib=rb-4.1.0&q=80&w=1080";
const ANALYTICS_IMG =
  "https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzI2MDYyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080";

function AnimatedCounter({
  target,
  duration = 2000,
  suffix = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const categories = [
  {
    icon: Trash2,
    label: "Garbage",
    color: "bg-amber-100 text-amber-600",
    desc: "Overflow, littering",
  },
  {
    icon: Lightbulb,
    label: "Streetlight",
    color: "bg-yellow-100 text-yellow-600",
    desc: "Failures, dim lights",
  },
  {
    icon: Wrench,
    label: "Pothole",
    color: "bg-red-100 text-red-600",
    desc: "Roads, footpaths",
  },
  {
    icon: Droplets,
    label: "Water",
    color: "bg-blue-100 text-blue-600",
    desc: "Supply failures",
  },
  {
    icon: AlertTriangle,
    label: "Sanitation",
    color: "bg-purple-100 text-purple-600",
    desc: "Drains, sewage",
  },
  {
    icon: HardHat,
    label: "Construction",
    color: "bg-green-100 text-green-600",
    desc: "Illegal building",
  },
  {
    icon: Shield,
    label: "Safety",
    color: "bg-rose-100 text-rose-600",
    desc: "Hazards, risks",
  },
  {
    icon: MapPin,
    label: "Other",
    color: "bg-slate-100 text-slate-600",
    desc: "Any civic issue",
  },
];

const features = [
  {
    icon: Zap,
    title: "AI Priority Scoring",
    desc: "Every complaint is instantly scored using location sensitivity, image confidence, and category weight — ensuring critical issues are fast-tracked automatically.",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: MapPin,
    title: "Dual-Path Verification",
    desc: "Our system combines human verification from nearby citizens with mandatory GPS-fenced officer uploads, creating an immutable audit trail for every fix.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Clock,
    title: "Real-Time SLA Tracking",
    desc: "Strict resolution deadlines per category (12h to 120h). Automated escalation when deadlines approach. Citizens see live status — full transparency throughout.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "GPS-Verified Resolution",
    desc: "Field officers can only upload resolution proof within 150m of the complaint location — no false closures. System holds proof of work for every action.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: BarChart3,
    title: "Analytics & Heatmaps",
    desc: "Area-level complaint density heatmaps, KPI dashboards (MTTA, MTTR, SLA compliance), and department-wise performance tracking for officials.",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    icon: Award,
    title: "Citizen Leaderboards",
    desc: "Earn reputation and climb the city-wide leaderboard by reporting genuine issues and verifying solutions. Civic credits represent your contribution to making Delhi better.",
  },
];

const steps = [
  {
    step: "01",
    title: "Report in 60 Seconds",
    desc: "Open the app, snap a photo. AI suggests the category. GPS auto-fills your location. Hit submit — your Complaint ID arrives instantly.",
  },
  {
    step: "02",
    title: "AI Routes & Prioritizes",
    desc: "Our engine scores your complaint, checks for duplicates, notifies nearby citizens, and routes it to the right department — all within seconds.",
  },
  {
    step: "03",
    title: "Track to Resolution",
    desc: "Watch your complaint move through a live status timeline. Get push updates. Escalate if SLA is breached. Rate the resolution on closure.",
  },
];

const testimonials = [
  {
    name: "Anjali Desai",
    area: "Delhi, NCT",
    text: "I submitted a garbage complaint with photos and immediately got a complaint ID. In My Complaints, I could follow each status update without guessing what happened.",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    area: "Dwarka, Delhi",
    text: "The Delhi-only location rule made the form clear for our area. After submission, I could see assignment progress and SLA-related status in the dashboard.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    area: "Rohini, Delhi",
    text: "Reporting was straightforward: category, location, details, and photos. The timeline and report card made it easy to share updates with my family.",
    rating: 5,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modalContent: Record<
    string,
    { title: string; desc: string; icon: any; content: React.ReactNode }
  > = {
    "Privacy Policy": {
      title: "Privacy Policy",
      icon: Lock,
      desc: "How we handle your data with care and transparency.",
      content: (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            At CivicPulse, your privacy is our priority. We only collect data
            necessary to resolve civic issues.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">
              1. Data Collection
            </h4>
            <p className="text-xs text-slate-500">
              We collect your location, photos of issues, and contact info for
              status updates.
            </p>
            <h4 className="font-semibold text-slate-900 text-sm">
              2. Data Usage
            </h4>
            <p className="text-xs text-slate-500">
              Your data is shared only with relevant municipal departments to
              facilitate resolution.
            </p>
            <h4 className="font-semibold text-slate-900 text-sm">
              3. Your Rights
            </h4>
            <p className="text-xs text-slate-500">
              You can request data deletion or export your reporting history at
              any time.
            </p>
          </div>
        </div>
      ),
    },
    "Terms of Service": {
      title: "Terms of Service",
      icon: FileText,
      desc: "The rules of engagement for our platform.",
      content: (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            By using CivicPulse, you agree to report genuine issues and maintain
            community decorum.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">
              User Obligations
            </h4>
            <p className="text-xs text-slate-500">
              Provide accurate information and do not misuse the reporting
              system for personal grievances.
            </p>
            <h4 className="font-semibold text-slate-900 text-sm">
              Platform Rights
            </h4>
            <p className="text-xs text-slate-500">
              We reserve the right to ban users who consistently submit false or
              spam reports.
            </p>
          </div>
        </div>
      ),
    },
    "Help Center": {
      title: "Help Center",
      icon: LifeBuoy,
      desc: "Need assistance? We're here to help.",
      content: (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <p className="font-medium text-sm">How to report an issue?</p>
              <p className="text-xs text-slate-500">
                Click 'Report' and snap a photo. AI handles the rest.
              </p>
            </div>
            <div className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <p className="font-medium text-sm">Tracking my complaint</p>
              <p className="text-xs text-slate-500">
                Use the 'My Complaints' section in your profile.
              </p>
            </div>
            <div className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <p className="font-medium text-sm">What are Civic Credits?</p>
              <p className="text-xs text-slate-500">
                Points earned for every report resolved by the city.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    "SLA Guidelines": {
      title: "SLA Guidelines",
      icon: Scale,
      desc: "Service Level Agreements for municipal response.",
      content: (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            We enforce strict resolution timelines based on issue severity.
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-slate-400">
                <th className="text-left pb-2 font-medium">Category</th>
                <th className="text-right pb-2 font-medium">Resolution Goal</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b">
                <td className="py-2">Emergency Safety</td>
                <td className="text-right">12 Hours</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Water & Sanitation</td>
                <td className="text-right">24-48 Hours</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Streetlight Failure</td>
                <td className="text-right">72 Hours</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Pothole Repair</td>
                <td className="text-right">96 Hours</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Construction & Other</td>
                <td className="text-right">120 Hours</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    "API Access": {
      title: "API Access",
      icon: Activity,
      desc: "Build on top of our civic intelligence data.",
      content: (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            We provide public endpoints for researchers and developers to
            analyze civic data.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">
              Real-time Feed
            </h4>
            <p className="text-xs text-slate-500">
              Access anonymized complaint data filtered by area or category.
            </p>
            <h4 className="font-semibold text-slate-900 text-sm">
              SLA Reports
            </h4>
            <p className="text-xs text-slate-500">
              Retrieve monthly performance metrics for different departments.
            </p>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg">
            <code className="text-[10px] text-blue-300">
              GET /api/v1/issues/public?area=delhi_central
            </code>
          </div>
        </div>
      ),
    },
    "Impact Strip": {
      title: "Delhi Governance Report",
      icon: BarChart3,
      desc: "Precision governance across Delhi NCT.",
      content: (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">NCT of Delhi</p>
              <p className="text-[10px] text-blue-500 uppercase font-semibold">
                Primary Jurisdiction
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            CivicPulse Delhi is specifically optimized for the National Capital
            Territory, ensuring 100% GPS-verified resolution trails for all
            civic complaints.
          </p>
        </div>
      ),
    },
    "Contact Us": {
      title: "Contact Us",
      icon: Mail,
      desc: "Get in touch with the CivicPulse team.",
      content: (
        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-semibold">Email Support</p>
                <p className="text-xs text-slate-500">support@civicpulse.org</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Twitter className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-semibold">Twitter / X</p>
                <p className="text-xs text-slate-500">@CivicPulse_HQ</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  };

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setNavOpen(false);
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className="min-h-screen bg-white font-[Inter,sans-serif]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <Logo className="w-9 h-9" light={!scrolled} />
              <span
                className={`text-xl font-[800] tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}
              >
                Civic
                <span className={scrolled ? "text-blue-600" : "text-blue-400"}>
                  Pulse
                </span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "For Officials", "Leaderboard"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      scrollToSection(item.toLowerCase().replace(/ /g, "-"));
                    }}
                    className={`text-sm font-[500] transition-colors hover:text-blue-400 ${
                      scrolled ? "text-slate-600" : "text-white/80"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className={`text-sm font-[600] px-4 py-2 rounded-lg border transition-colors ${
                  scrolled
                    ? "text-blue-600 border-blue-600 hover:bg-blue-50"
                    : "text-white border-white/30 hover:bg-white/10"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-[600] px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Get Started Free
              </button>
            </div>

            <button
              className={`md:hidden ${scrolled ? "text-slate-700" : "text-white"}`}
              onClick={() => setNavOpen(!navOpen)}
            >
              {navOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {navOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            {["Features", "How It Works", "For Officials", "Leaderboard"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollToSection(item.toLowerCase().replace(/ /g, "-"))
                  }
                  className="w-full text-left text-sm text-slate-700 py-2 font-[500]"
                >
                  {item}
                </button>
              ),
            )}
            <button
              onClick={() => navigate("/login")}
              className="w-full text-sm font-[600] px-4 py-2.5 bg-blue-600 text-white rounded-lg"
            >
              Get Started Free
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>

        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-[600] px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm"
            >
              <Zap className="w-3 h-3" />
              AI-Powered Civic Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-[800] text-white leading-[1.1] mb-6"
            >
              Your City.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your Voice.
              </span>
              <br />
              Fixed Fast.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-slate-300 mb-10 max-w-xl leading-relaxed"
            >
              Report civic issues in under 60 seconds. AI routes complaints to
              the right department, enforces SLA deadlines, and guarantees
              GPS-stamped resolution — with full transparency throughout.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-[600] rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Report an Issue Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const section = document.getElementById("features");
                  section?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-base font-[600] rounded-xl border border-white/20 backdrop-blur-sm transition-all"
              >
                Our Features
              </button>
            </motion.div>

            {/* Mini Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-8"
            >
              {[
                { value: "8", label: "Categories" },
                { value: "SLA", label: "Enforced" },
                { value: "Precision", label: "Mapping" },
                { value: "GPS", label: "Verification" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-[800] text-white">
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-400 font-[500]">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <a
          href="#features"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/50 hover:text-white/80 transition-colors animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* Impact Strip */}
      <div className="bg-blue-600 py-4 overflow-hidden">
        <div className="flex gap-12 animate-[slide_30s_linear_infinite] whitespace-nowrap">
          {Array(4)
            .fill([
              "🚀 Delhi NCR resolved 1,240 complaints this month",
              "⚡ AI prioritized 42 critical issues in Central Delhi",
              "🛠️ Pothole on Ring Road fixed in 14 hours",
              "🔍 94% SLA compliance across all Delhi wards",
              "🏆 Top Ward: Delhi-West Division",
            ])
            .flat()
            .map((text, i) => (
              <span
                key={i}
                className="text-sm text-white/90 font-[700] tracking-wide"
              >
                {text} <span className="text-white/40 mx-4">|</span>
              </span>
            ))}
        </div>
      </div>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-[700] px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <MapPin className="w-3 h-3" />8 Issue Categories
            </div>
            <h2 className="text-3xl md:text-4xl font-[800] text-slate-900 mb-4">
              NCT of Delhi Jurisdiction
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Solving civic issues across the National Capital Territory. Our
              system handles jurisdiction-aware routing for faster fixes.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(({ icon: Icon, label, color, desc }) => (
              <motion.div
                key={label}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-4 text-center cursor-pointer border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-[700] text-slate-800">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 text-xs font-[700] px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider border border-blue-500/20">
              <Zap className="w-3 h-3" />
              Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-[800] text-white mb-4">
              Built for Real Impact
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Sophisticated AI and civic technology designed to make government
              services measurably more responsive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-[700] text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-[700] px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <CheckCircle className="w-3 h-3" />
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-[800] text-slate-900 mb-4">
              From Report to Resolution
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Our AI-powered pipeline ensures every complaint is handled with
              speed, transparency, and accountability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-lg font-[800] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
                  {s.step}
                </div>
                <h3 className="text-xl font-[700] text-slate-900 mb-3">
                  {s.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Officials Section */}
      <section id="for-officials" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 text-xs font-[700] px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <BarChart3 className="w-3 h-3" />
                For Delhi Government Authorities
              </div>
              <h2 className="text-3xl md:text-4xl font-[800] text-slate-900 mb-6">
                Operational Visibility.
                <br />
                <span className="text-blue-600">
                  Manager-Controlled Execution.
                </span>
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Government officials get live complaint queues, manager workload
                visibility, status timelines, and SLA health indicators to run
                day-to-day operations with clarity.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: BarChart3,
                    title: "Live Queue & KPI Overview",
                    desc: "Track total, active, resolved, escalated complaints and SLA compliance in one place",
                  },
                  {
                    icon: Users,
                    title: "Manager Assignment Controls",
                    desc: "Auto-assign or manually assign complaints to field workers from manager workspace",
                  },
                  {
                    icon: AlertTriangle,
                    title: "Escalation & Overdue Monitoring",
                    desc: "Prioritize escalated and overdue complaints from dedicated admin and manager views",
                  },
                  {
                    icon: TrendingUp,
                    title: "Transparent Status Timeline",
                    desc: "Every status change is recorded with notes so officials can audit progress end-to-end",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-[700] text-slate-900">
                        {title}
                      </div>
                      <div className="text-sm text-slate-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() =>
                    navigate("/login", { state: { role: "manager" } })
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-[600] transition-all"
                >
                  Official Login <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 uppercase font-[700] tracking-wider mb-0.5">
                    Official Support
                  </span>
                  <span className="text-sm font-[500] text-slate-600">
                    manager_name@civicpluse.com
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={ANALYTICS_IMG}
                  alt="Analytics Dashboard"
                  className="w-full h-72 object-cover"
                />
                <div className="bg-slate-900 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "SLA Compliance",
                        value: "82.4%",
                        color: "text-emerald-400",
                      },
                      {
                        label: "Avg Resolution",
                        value: "54.7h",
                        color: "text-blue-400",
                      },
                      {
                        label: "Active Today",
                        value: "42",
                        color: "text-amber-400",
                      },
                      { label: "Escalated", value: "3", color: "text-red-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-slate-800 rounded-xl p-4">
                        <div className={`text-xl font-[800] ${color}`}>
                          {value}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-[700] px-3 py-1.5 rounded-full shadow-lg">
                ✓ Live Demo Ready
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                value: 8,
                suffix: "",
                label: "Issue Categories",
                icon: CheckCircle,
              },
              { value: 60, suffix: "s", label: "Reporting Time", icon: Clock },
              {
                value: 12,
                suffix: "h",
                label: "Min. SLA Response",
                icon: TrendingUp,
              },
              {
                value: 1,
                suffix: " City",
                label: "Delhi NCT Coverage",
                icon: MapPin,
              },
            ].map(({ value, suffix, label, icon: Icon }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-white"
              >
                <Icon className="w-8 h-8 mx-auto mb-3 text-white/60" />
                <div className="text-4xl md:text-5xl font-[800]">
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <div className="text-sm text-blue-200 font-[500] mt-2">
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="leaderboard" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative"
            >
              <img
                src={COMMUNITY_IMG}
                alt="Municipal field work and issue resolution"
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-[700] text-slate-900">
                      Live Complaint Tracking
                    </div>
                    <div className="text-xs text-slate-500">
                      Citizens can follow status updates till resolution
                    </div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {["RS", "AK", "PD"].map((init) => (
                    <div
                      key={init}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white flex items-center justify-center text-white text-xs font-[700]"
                    >
                      {init}
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 text-xs font-[700]">
                    +5
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-[700] px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <Users className="w-3 h-3" />
                Delhi Civic Network
              </div>
              <h2 className="text-3xl md:text-4xl font-[800] text-slate-900 mb-6">
                What Actually Happens In CivicPulse
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                You report an issue in Delhi, it is routed to a manager, and
                progress is tracked through clear status updates. Citizens can
                see resolution progress, share report cards, and build impact on
                the leaderboard.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: "🌱",
                    title: "Report In Under 60 Seconds",
                    desc: "Choose category, add location, photos, and submit with complaint ID",
                  },
                  {
                    icon: "🧭",
                    title: "Manager Assignment",
                    desc: "Complaints are assigned to Delhi managers and moved through workflow",
                  },
                  {
                    icon: "📌",
                    title: "Status Timeline Visibility",
                    desc: "Track Submitted, Assigned, In Progress, and Resolved updates",
                  },
                  {
                    icon: "🏆",
                    title: "Impact & Leaderboard",
                    desc: "Earn civic impact points and appear in community rankings",
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="text-sm font-[700] text-slate-900">
                        {title}
                      </div>
                      <div className="text-xs text-slate-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-[800] text-slate-900 mb-4">
              Citizens Love CivicPulse
            </h2>
            <p className="text-slate-500">
              Real voices from across the community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array(t.rating)
                    .fill(0)
                    .map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-[700]">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-[700] text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500">{t.area}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-6">🏙️</div>
            <h2 className="text-4xl md:text-5xl font-[800] text-white mb-6">
              Ready to Make Delhi Better?
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              Experience CivicPulse — a platform designed to report issues, earn
              credits, and hold authorities accountable across the NCT of Delhi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-[600] rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/30"
              >
                Start Reporting — It's Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/login", { state: { role: "admin" } })}
                className="flex items-center justify-center gap-2 px-10 py-4 bg-white/10 hover:bg-white/20 text-white text-base font-[600] rounded-xl border border-white/20 backdrop-blur-sm transition-all"
              >
                I'm a Municipal Official
              </button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> No app
                download required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />{" "}
                GPS-verified reports only
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Your data
                stays private
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Logo className="w-9 h-9" light={true} />
                <span className="text-xl font-[800] tracking-tight text-white">
                  Civic<span className="text-blue-400">Pulse</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                AI-Powered Civic Intelligence & SLA Enforcement Platform.
                Building more responsive governments, one fix at a time.
              </p>
              <div className="flex gap-3">
                {[Twitter, Github, Mail].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            {[
              {
                title: "Platform",
                links: [
                  { label: "Features & AI", id: "features" },
                  { label: "Community", id: "leaderboard" },
                  { label: "For Officials", id: "for-officials" },
                  { label: "Leaderboard", id: "leaderboard" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Help Center", id: "hero", modal: "Help Center" },
                  {
                    label: "SLA Guidelines",
                    id: "features",
                    modal: "SLA Guidelines",
                  },
                  { label: "API Access", id: "features", modal: "API Access" },
                ],
              },
              {
                title: "Company",
                links: [
                  {
                    label: "Privacy Policy",
                    id: "hero",
                    modal: "Privacy Policy",
                  },
                  {
                    label: "Terms of Service",
                    id: "hero",
                    modal: "Terms of Service",
                  },
                  {
                    label: "Civic Impact Report",
                    id: "hero",
                    modal: "Civic Impact",
                  },
                  { label: "Contact Us", id: "hero", modal: "Contact Us" },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-sm font-[700] text-white mb-4">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => {
                          const modalLink = link as {
                            modal?: string;
                            id: string;
                          };
                          if (modalLink.modal) {
                            setActiveModal(modalLink.modal);
                          } else {
                            scrollToSection(modalLink.id);
                          }
                        }}
                        className="text-sm text-slate-500 hover:text-blue-400 transition-colors text-left focus:outline-none"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">
              © 2026 CivicPulse Delhi. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-slate-600">
              <button
                onClick={() => setActiveModal("Privacy Policy")}
                className="hover:text-slate-400 transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveModal("Terms of Service")}
                className="hover:text-slate-400 transition-colors"
              >
                Terms
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-3 h-3" />
              Available via Web Browser
            </div>
          </div>
        </div>

        {/* Global Footer Modals */}
        <AnimatePresence>
          {activeModal && modalContent[activeModal] && (
            <Dialog
              open={!!activeModal}
              onOpenChange={(open) => !open && setActiveModal(null)}
            >
              <DialogContent className="sm:max-w-md border-slate-800 bg-white p-0 overflow-hidden">
                <div className="p-6">
                  <DialogHeader className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        {(() => {
                          const Icon = modalContent[activeModal].icon;
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <div className="text-left">
                        <DialogTitle className="text-xl font-bold text-slate-900">
                          {modalContent[activeModal].title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                          {modalContent[activeModal].desc}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="mt-4">
                    {modalContent[activeModal].content}
                  </div>

                  <div className="mt-10 flex justify-end">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      Got it, thanks
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </footer>

      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
