import { useNavigate } from "react-router";
import { MapPin, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <div className="text-center">
        <div className="text-8xl mb-6">🗺️</div>
        <h1 className="text-4xl font-[800] text-white mb-3">404</h1>
        <p className="text-slate-400 mb-8">This page doesn't exist on our civic map.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-[600] rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-[500] rounded-xl border border-white/10 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
