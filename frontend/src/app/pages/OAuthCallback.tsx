import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { authService } from "../appwriteService";

/**
 * OAuthCallback handles the redirect back from Appwrite's OAuth providers (Google, etc).
 * It extracts the userId and secret tokens from the URL and creates the final session.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId || !secret) {
      // If we don't have tokens, check if the session exists already
      authService.getCurrentUser()
        .then((user) => {
          if (user) {
            navigate("/dashboard", { replace: true });
          } else {
            setError("Authentication failed. No session data found.");
            setTimeout(() => navigate("/login", { replace: true }), 2500);
          }
        })
        .catch(() => {
          setError("Auth session error. Please log in again.");
          setTimeout(() => navigate("/login", { replace: true }), 2500);
        });
      return;
    }

    // Step 2 of OAuth Flow: Exchange token for a session
    const completeLogin = async () => {
      try {
        await authService.createSessionFromToken(userId, secret);
        navigate("/dashboard", { replace: true });
      } catch (err: any) {
        console.error("OAuth exchange failed:", err);
        setError("Failed to secure your session. Please try again.");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    completeLogin();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-sm p-8 text-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              ⚠️
            </div>
            <p className="text-red-200 font-[600]">{error}</p>
            <p className="text-slate-500 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
             <div className="space-y-2">
               <h2 className="text-white text-xl font-[700]">Finalizing Login</h2>
               <p className="text-slate-400 text-sm">Securing your session with CivicPulse...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
