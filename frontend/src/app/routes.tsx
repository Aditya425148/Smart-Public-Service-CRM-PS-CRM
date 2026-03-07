import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import CitizenHome from "./pages/CitizenHome";
import ReportIssue from "./pages/ReportIssue";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetail from "./pages/ComplaintDetail";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminQueue from "./pages/admin/AdminQueue";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSLA from "./pages/admin/AdminSLA";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/auth/callback", Component: OAuthCallback },
  {
    element: <ProtectedRoute allowedRoles={["citizen", "admin"]} />,
    children: [
      {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: CitizenHome },
          { path: "report", Component: ReportIssue },
          { path: "complaints", Component: MyComplaints },
          { path: "complaints/:id", Component: ComplaintDetail },
          { path: "leaderboard", Component: Leaderboard },
          { path: "profile", Component: Profile },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: "queue", Component: AdminQueue },
          { path: "analytics", Component: AdminAnalytics },
          { path: "sla", Component: AdminSLA },
          { path: "users", Component: AdminUsers },
        ],
      },
    ],
  },
  { path: "*", Component: NotFound },
]);
