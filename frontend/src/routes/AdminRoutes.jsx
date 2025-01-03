import AdminReportsPage from "../Pages/Admin/AdminReports";
import PaymentDetailsPage from "../Pages/Admin/PaymentDetails";
import SettlementsPage from "../Pages/Admin/Settlements";
import SearchPage from "../Pages/Admin/Search";
import UserProfile from "../Pages/Admin/UserProfilePage";
import AdminCreatePage from "../Pages/Admin/CreateAdmin";
import MovieUploadPage from "../Pages/Admin/MovieUpload";
import AdminMovieStatus from "../Pages/Admin/MovieStatus";
import AdminAnalytics from "../Pages/Admin/AdminAnalysis";
import PaymentManagement from "../Pages/Admin/ActiveUsers";
import RefundChatBotPage from "@/Pages/Admin/RefundChatbot";
import PlanAdd from "@/Pages/Admin/PlanAdd";
import EmailChangeLogsPage from "@/Pages/Admin/EmailLogs";

const AdminRoutes = [
  { path: "/admin/reports", element: <AdminReportsPage />, isProtected: true },
  {
    path: "/admin/payments",
    element: <PaymentDetailsPage />,
    isProtected: true,
  },
  {
    path: "/admin/add/plans",
    element: <PlanAdd />,
    isProtected: true,
  },
  {
    path: "/admin/payment/:id",
    element: <RefundChatBotPage />,
    isProtected: true,
  },
  {
    path: "/admin/email/logs",
    element: <EmailChangeLogsPage />,
    isProtected: true,
  },
  {
    path: "/admin/settlements",
    element: <SettlementsPage />,
    isProtected: true,
  },
  { path: "/admin/payment/search", element: <SearchPage />, isProtected: true },
  {
    path: "/admin/reports/detailed",
    element: <UserProfile />,
    isProtected: true,
  },
  {
    path: "/admin/create-admin",
    element: <AdminCreatePage />,
    isProtected: true,
  },
  { path: "/admin/upload", element: <MovieUploadPage />, isProtected: true },
  { path: "/movie/status", element: <AdminMovieStatus />, isProtected: true },
  { path: "/users/statics", element: <AdminAnalytics />, isProtected: true },
  { path: "/admin/view", element: <PaymentManagement />, isProtected: true },
];

export default AdminRoutes;
