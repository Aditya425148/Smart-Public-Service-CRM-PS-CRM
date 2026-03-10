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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-[500] animate-pulse">
            Verifying access...
          </p>
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
    // FOR DEVELOPER ACCESS: Allow anonymous users to bypass role checks if they are in a demo session
    // Appwrite anonymous users usually have empty email and specific status.
    // We check for absence of email or specific flag to allow demo access.
    const isAnonymous =
      !user.email || user.email === "" || user.status === false;

    console.log("ProtectedRoute Check:", {
      user,
      allowedRoles,
      userRoles,
      isAnonymous,
    });

    const hasPermission =
      allowedRoles.some((role) => userRoles.includes(role)) || isAnonymous;

    // Special case for "citizen" which is the default for any logged in user if not specifically restricted
    const isCitizen = allowedRoles.includes("citizen") && user;

    if (!hasPermission && !isCitizen) {
      console.warn(
        "User does not have required roles:",
        allowedRoles,
        "User roles:",
        userRoles,
      );
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
