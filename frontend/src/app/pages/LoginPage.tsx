import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { Mail, Shield, Loader2, Eye, EyeOff, ChevronLeft, Users, ArrowRight } from "lucide-react";
import { authService } from "../appwriteService";
import { getNetworkErrorMessage } from "../utils/connectionStatus";
import { mockManagers, workerCredentials } from "../data/mockData";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<
    "choose" | "email-login" | "email-signup" | "manager-login"
  >("choose");

  useEffect(() => {
    if (location.state?.role === "manager") {
      setMode("manager-login");
    }
  }, [location.state]);

  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");

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

      // Check if this is a manager demo account FIRST (before official email check)
      const manager = mockManagers.find(
        (m) => m.email.toLowerCase() === email.toLowerCase(),
      );

      if (manager) {
        // Mock manager login (using anonymous auth for backend connection)
        // For demo purposes, we accept any password for these specific emails
        await authService.loginAnonymous();
        navigate(`/manager/${manager.id}`, { replace: true });
        return;
      }

      // Check if this is a worker demo account BEFORE official email enforcement
      console.log("Checking worker credentials. Total workers:", workerCredentials.length);
      console.log("Looking for email:", email.toLowerCase());
      console.log("Available worker emails:", workerCredentials.map(w => w.email.toLowerCase()));
      
      const worker = workerCredentials.find(
        (w) => w.email.toLowerCase() === email.toLowerCase(),
      );

      console.log("Worker found:", !!worker);
      
      if (worker) {
        console.log("Worker found:", worker.name);
        // Verify worker password
        if (password !== worker.password) {
          console.log("Password mismatch. Entered:", password, "Expected:", worker.password);
          setError("Invalid credentials for worker account.");
          setIsLoading(false);
          return;
        }
        // Mock worker login (using anonymous auth for backend connection)
        console.log("Attempting anonymous login...");
        try {
          await authService.loginAnonymous();
          console.log("Anonymous login successful");
        } catch (anonErr: any) {
          console.error("Anonymous login failed:", anonErr);
          setError("Authentication failed: " + (anonErr.message || "Unknown error"));
          setIsLoading(false);
          return;
        }
        // Store worker info in session for later use
        sessionStorage.setItem("workerData", JSON.stringify(worker));
        console.log("Worker data stored in sessionStorage");
        navigate("/worker", { replace: true });
        return;
      }

      // --- Official Credentials Enforcement (after checking demo accounts) ---
      const isOfficialAdmin =
        email.toLowerCase().endsWith("@civicpulse.com") ||
        email.toLowerCase() === "admin@civicpulse.com";

      if (isOfficialAdmin && password !== "admin123456") {
        setError("Invalid credentials for official account.");
        setIsLoading(false);
        return;
      }

      // Automatically handle official admin login for demo/dev purposes
      if (isOfficialAdmin) {
        try {
          // Force set a local storage flag to bypass role check if Appwrite labels fail
          localStorage.setItem("is_admin_bypass", "true");
          // Try to login if account exists
          await authService.loginWithEmail(email, password);
        } catch (authErr: any) {
          // If account doesn't exist (401/404), create it and then login
          console.log("Admin account missing or login failed, falling back...");
          try {
            await authService.loginAnonymous();
          } catch (anonErr) {
            console.error("Auth fallback failed:", anonErr);
          }
        }
        navigate("/admin", { replace: true });
        return;
      }

      // Check if this is a regular user in Appwrite
      await authService.loginWithEmail(email, password);
      // Redirect based on email
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      // Handle specific Appwrite error codes if needed
      if (err.code === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(
          getNetworkErrorMessage(err.code?.toString()) ||
            err.message ||
            "Login failed.",
        );
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

  const handleManagerLogin = async () => {
    if (!managerEmail || !managerPassword) {
      setError("Please enter manager credentials.");
      return;
    }
    await handleEmailLogin();
  };

  const handleDemoLogin = async (role: "citizen" | "admin" | "manager") => {
    try {
      setError("");
      setIsLoading(true);
      await authService.loginAnonymous();
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "manager") navigate("/manager", { replace: true });
      else navigate("/dashboard", { replace: true });
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
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-[600] py-4 rounded-2xl transition-all duration-200 border border-slate-200 shadow-sm disabled:opacity-50"
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
          className="w-full flex items-center justify-center gap-3 bg-sky-700 hover:bg-sky-800 text-white font-[600] py-4 rounded-2xl transition-all duration-200 shadow-[0_8px_20px_rgba(3,105,161,0.2)] disabled:opacity-50"
        >
          <Mail className="w-5 h-5" />
          <span>Login with Email</span>
        </button>
      </div>

      <p className="text-center text-sm text-slate-500 mt-4">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => setMode("email-signup")}
          className="text-sky-700 font-[600] hover:underline"
        >
          Join CivicPulse
        </button>
      </p>
    </div>
  );

  const renderManagerForm = () => (
    <div className="space-y-4">
      <button
        onClick={() => setMode("choose")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm mb-4 font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to options
      </button>

      <div className="space-y-2 text-center mb-6">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <Users size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Field Manager Login
        </h2>
        <p className="text-sm text-slate-500">Authorized personnel only</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-[600] text-slate-700 ml-1">
          Official Email
        </label>
        <input
          type="email"
          value={managerEmail}
          onChange={(e) => {
            setManagerEmail(e.target.value);
            setEmail(e.target.value);
          }}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-slate-400"
          placeholder="name@civicpulse.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-[600] text-slate-700 ml-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={managerPassword}
            onChange={(e) => {
              setManagerPassword(e.target.value);
              setPassword(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-slate-400"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleManagerLogin}
        disabled={isLoading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-[600] py-4 rounded-2xl shadow-lg shadow-amber-900/10 transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Access Portal
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-semibold">
        System Access Logged
      </p>
    </div>
  );

  const renderEmailForm = (type: "login" | "signup") => (
    <div className="space-y-4">
      <button
        onClick={() => setMode("choose")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm mb-4 font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to options
      </button>

      {type === "signup" && (
        <div className="space-y-2">
          <label className="text-sm font-[600] text-slate-700 ml-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all placeholder:text-slate-400"
            placeholder="John Doe"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-[600] text-slate-700 ml-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all placeholder:text-slate-400"
          placeholder="admin@civicpulse.com"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <label className="text-sm font-[600] text-slate-700">Password</label>
          {type === "login" && (
            <button className="text-xs text-sky-700 font-[600] hover:underline">
              Forgot?
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all placeholder:text-slate-400"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={type === "login" ? handleEmailLogin : handleEmailSignup}
        disabled={isLoading}
        className="w-full bg-sky-700 hover:bg-sky-800 text-white font-[600] py-4 rounded-2xl shadow-lg shadow-sky-900/10 transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] pointer-events-none">
        <div className="absolute inset-0 bg-sky-200/20 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 lg:p-10 rounded-[3rem] border border-slate-100 relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]"
      >
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 bg-sky-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-900/20 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-[800] text-slate-900 tracking-tight">
            {mode === "email-signup" ? "Create Account" : "Sign In"}
          </h1>
          <p className="text-slate-500 mt-2 font-[500]">
            {mode === "email-signup"
              ? "Join CivicPulse to start engaging with your community"
              : "Secure access to community pulse"}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-4 rounded-2xl mb-8 flex gap-3"
          >
            <span className="shrink-0 leading-tight">⚠️</span>
            <p className="leading-tight font-medium">{error}</p>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-[600] py-4 rounded-2xl transition-all duration-200 border border-slate-200 shadow-sm disabled:opacity-50"
          >
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
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-[600] uppercase tracking-widest">
              OR
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-4">
            {mode === "email-signup" && (
              <div className="space-y-2">
                <label className="text-sm font-[600] text-slate-700 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-[600] text-slate-700 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={mode === "manager-login" ? managerEmail : email}
                  onChange={(e) => {
                    if (mode === "manager-login") {
                      setManagerEmail(e.target.value);
                      setEmail(e.target.value);
                    } else {
                      setEmail(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-[600] text-slate-700">
                  Password
                </label>
                {mode !== "email-signup" && (
                  <button className="text-xs text-sky-700 font-[600] hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Shield size={18} className="opacity-50" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={mode === "manager-login" ? managerPassword : password}
                  onChange={(e) => {
                    if (mode === "manager-login") {
                      setManagerPassword(e.target.value);
                      setPassword(e.target.value);
                    } else {
                      setPassword(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={
                mode === "manager-login"
                  ? handleManagerLogin
                  : mode === "email-signup"
                    ? handleEmailSignup
                    : handleEmailLogin
              }
              disabled={isLoading}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-[600] py-4 rounded-2xl shadow-lg shadow-sky-900/10 transition-all duration-200 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : mode === "email-signup" ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            {mode === "email-signup"
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() =>
                setMode(mode === "email-signup" ? "choose" : "email-signup")
              }
              className="text-sky-700 font-[600] hover:underline"
            >
              {mode === "email-signup" ? "Sign In" : "Join CivicPulse"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
