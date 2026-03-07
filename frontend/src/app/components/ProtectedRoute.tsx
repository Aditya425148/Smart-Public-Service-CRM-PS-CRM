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
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    authService.getCurrentUser()
      .then((user) => {
        if (user) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-[500] animate-pulse">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // Session is invalid or expired
    return <Navigate to="/login" replace />;
  }

  // NOTE: In a real Appwrite setup, you would check user.labels or team membership
  // for "admin" vs "citizen" roles here.
  return <Outlet />;
}
