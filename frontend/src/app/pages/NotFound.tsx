import { useNavigate, useLocation } from "react-router";
import { MapPin, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the best redirect path based on where the user might be coming from
  const getRedirectPath = () => {
    if (location.pathname.startsWith("/admin")) return "/admin";
    if (location.pathname.startsWith("/manager")) return "/manager";
    if (location.pathname.startsWith("/worker")) return "/worker";
    if (location.pathname.startsWith("/dashboard")) return "/dashboard";
    return "/";
  };

  const redirectPath = getRedirectPath();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950 p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      <div className="text-center">
        <div className="mb-6 text-8xl">🗺️</div>
        <h1 className="mb-3 text-4xl font-[800] text-white">404</h1>
        <p className="mb-8 text-slate-400">
          This page doesn't exist on our civic map.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-[600] text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate(redirectPath)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-[600] text-white transition-colors hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            {redirectPath === "/" ? "Go Home" : "Back to Panel"}
          </button>
        </div>
      </div>
    </div>
  );
}
