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
import AdminManagers from "./pages/admin/AdminManagers";
import ManagerLayout from "./components/manager/ManagerLayout";
import ManagerOverview from "./pages/manager/ManagerOverview";
import ManagerWorkers from "./pages/manager/ManagerWorkers";
import WorkerLayout from "./components/worker/WorkerLayout";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerResolved from "./pages/worker/WorkerResolved";
import WorkerProfile from "./pages/worker/WorkerProfile";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/auth/callback", Component: OAuthCallback },
  {
    element: <ProtectedRoute allowedRoles={["citizen", "admin", "manager"]} />,
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
    element: <ProtectedRoute allowedRoles={["manager"]} />,
    children: [
      {
        path: "/manager/:managerId?",
        Component: ManagerLayout,
        children: [
          { index: true, Component: ManagerOverview },
          { path: "workers", Component: ManagerWorkers },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["worker"]} />,
    children: [
      {
        path: "/worker",
        Component: WorkerLayout,
        children: [
          { index: true, Component: WorkerDashboard },
          { path: "resolved", Component: WorkerResolved },
          { path: "profile", Component: WorkerProfile },
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
          { path: "managers", Component: AdminManagers },
        ],
      },
    ],
  },
  { path: "*", Component: NotFound },
]);
