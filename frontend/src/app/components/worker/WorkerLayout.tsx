import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";
import {
  LogOut,
  Menu,
  X,
  Home,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { account } from "../../appwrite";
import { motion, AnimatePresence } from "motion/react";

export default function WorkerLayout() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check if worker data is in session (from mock login)
    const workerDataStr = sessionStorage.getItem("workerData");
    if (workerDataStr) {
      setWorker(JSON.parse(workerDataStr));
      setLoading(false);
      return;
    }

    // Otherwise try to get from Appwrite (for real production users)
    account
      .get()
      .then((user) => {
        setWorker({
          id: "WKR-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
          name: user.name || "Field Worker",
          email: user.email,
          phone: user.phone,
        });
      })
      .catch((err) => {
        console.error("Auth error:", err);
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertCircle className="text-sky-500" size={32} />
          </div>
          <p className="text-slate-600 font-medium">Loading worker portal...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              {worker?.name?.charAt(0) || "W"}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900">
                Worker Portal
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {worker?.name}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { icon: Home, label: "Dashboard", href: "/worker" },
              { icon: CheckCircle2, label: "Resolved", href: "/worker/resolved" },
              { icon: User, label: "Profile", href: "/worker/profile" },
            ].map(({ icon: Icon, label, href }) => (
              <button
                key={href}
                onClick={() => navigate(href)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-all"
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {showMobileMenu ? (
              <X size={24} className="text-slate-600" />
            ) : (
              <Menu size={24} className="text-slate-600" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg transition-all font-medium text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-slate-50"
            >
              <div className="px-4 py-4 space-y-2">
                {[
                  { icon: Home, label: "Dashboard", href: "/worker" },
                  {
                    icon: CheckCircle2,
                    label: "Resolved",
                    href: "/worker/resolved",
                  },
                  { icon: User, label: "Profile", href: "/worker/profile" },
                ].map(({ icon: Icon, label, href }) => (
                  <button
                    key={href}
                    onClick={() => {
                      navigate(href);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white rounded-lg transition-all"
                  >
                    <Icon size={18} /> {label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-white rounded-lg transition-all"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Support</h3>
              <p className="text-xs text-slate-500">
                For technical issues, contact your manager or the support team.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Quick Links
              </h3>
              <ul className="text-xs text-slate-500 space-y-1">
                <li className="hover:text-sky-600 cursor-pointer">
                  Service Guidelines
                </li>
                <li className="hover:text-sky-600 cursor-pointer">
                  Safety Protocols
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Info</h3>
              <p className="text-xs text-slate-500">
                Smart Public Service CRM © 2024
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
