import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { authService } from "../appwriteService";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

/**
 * ProtectedRoute checks if the user has a valid session.
 * If not, it redirects to /login.
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    authService
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-sky-600 rounded-full animate-spin" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-slate-900 text-sm font-bold tracking-tight">
              Authenticating
            </p>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">
              Please wait a moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Session is invalid or expired
    return <Navigate to="/login" replace />;
  }

  // Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.labels || [];
    const sessionRole = sessionStorage.getItem("session_role");

    const hasPermission =
      allowedRoles.some((role) => userRoles.includes(role)) ||
      (!!sessionRole && allowedRoles.includes(sessionRole));

    // Special case for "citizen" which is the default for any logged in user if not specifically restricted
    const isCitizen = allowedRoles.includes("citizen") && user;

    if (!hasPermission && !isCitizen) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
