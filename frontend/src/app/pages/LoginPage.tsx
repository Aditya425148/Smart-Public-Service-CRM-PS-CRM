import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Mail,
  ArrowRight,
  Shield,
  ChevronLeft,
  Zap,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { authService } from "../appwriteService";
import { getNetworkErrorMessage } from "../utils/connectionStatus";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "email-login" | "email-signup">(
    "choose",
  );
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setIsLoading(true);
      // Step 1: Redirect to Google. Callback handled in OAuthCallback
      await authService.loginWithGoogle();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed.");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      await authService.loginWithEmail(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      // Handle specific Appwrite error codes if needed
      if (err.code === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(getNetworkErrorMessage(err.code?.toString()) || err.message || "Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      await authService.signupWithEmail(email, password, name);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.code === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "Signup failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: "citizen" | "admin") => {
    try {
      setError("");
      setIsLoading(true);
      await authService.loginAnonymous();
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Demo login error:", err);
      setError(err.message || "Guest login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderChooseMode = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-950 font-[600] py-4 rounded-xl transition-all duration-200 border border-slate-200 shadow-sm disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.53 12-4.53z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <button
          onClick={() => setMode("email-login")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-slate-700/50 hover:bg-slate-800 text-white font-[600] py-4 rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          <Mail className="w-5 h-5 text-slate-400" />
          <span>Login with Email</span>
        </button>
      </div>

      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-slate-800"></div>
        <span className="text-xs font-[600] text-slate-500 uppercase tracking-widest">
          Quick Access
        </span>
        <div className="h-px flex-1 bg-slate-800"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleDemoLogin("citizen")}
          disabled={isLoading}
          className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800/50 bg-slate-900/30 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all duration-200 disabled:opacity-50"
        >
          <Zap className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-[600] text-slate-300">Demo Citizen</span>
        </button>
        <button
          onClick={() => handleDemoLogin("admin")}
          disabled={isLoading}
          className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800/50 bg-slate-900/30 hover:bg-emerald-600/10 hover:border-emerald-500/30 transition-all duration-200 disabled:opacity-50"
        >
          <Shield className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-[600] text-slate-300">Demo Admin</span>
        </button>
      </div>

      <p className="text-center text-sm text-slate-400 mt-4">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => setMode("email-signup")}
          className="text-blue-400 font-[600] hover:underline"
        >
          Join CivicPulse
        </button>
      </p>
    </div>
  );

  const renderEmailForm = (type: "login" | "signup") => (
    <div className="space-y-4">
      <button
        onClick={() => setMode("choose")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Back to options
      </button>

      {type === "signup" && (
        <div className="space-y-2">
          <label className="text-sm font-[500] text-slate-300 ml-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
            placeholder="John Doe"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-[500] text-slate-300 ml-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
          placeholder="admin@civicpulse.com"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <label className="text-sm font-[500] text-slate-300">Password</label>
          {type === "login" && (
            <button className="text-xs text-blue-400 font-[500] hover:underline">
              Forgot?
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={type === "login" ? handleEmailLogin : handleEmailSignup}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[600] py-4 rounded-xl shadow-lg shadow-blue-900/10 transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {type === "login" ? "Sign In" : "Create Account"}
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] pointer-events-none">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-8 lg:p-10 rounded-[2.5rem] border border-slate-800 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/10">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-[800] text-white tracking-tight">CivicPulse</h1>
          <p className="text-slate-400 mt-2 font-[500]">Secure access to community pulse</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-4 rounded-2xl mb-8 flex gap-3 backdrop-blur-sm"
          >
            <span className="shrink-0 leading-tight">⚠️</span>
            <p className="leading-tight font-[500]">{error}</p>
          </motion.div>
        )}

        {mode === "choose" ? renderChooseMode() : renderEmailForm(mode === "email-login" ? "login" : "signup")}
      </motion.div>
    </div>
  );
}
