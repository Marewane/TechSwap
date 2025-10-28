import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./pages/Admin/AdminLayout";
import UserLayout from "./pages/User/UserLayout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Sessions from "./pages/Admin/Sessions/Sessions";
import Reports from "./pages/Admin/Report/ReportsPage";
import TransactionPage from "./pages/Admin/Transactions/TransactionPage";
import PostsPage from "./pages/User/Post/PostsPage";
import ProfilePage from "./pages/User/Profile/ProfilePage";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OAuthSuccess from "./pages/auth/OAuthSuccess";
import EmailVerification from "./pages/auth/EmailVerification";

// Profile Setup
import StepLearnSkills from "./pages/profile-setup/StepLearnSkills";
import StepTeachSkills from "./pages/profile-setup/StepTeachSkills";
import StepProfileInfo from "./pages/profile-setup/StepProfileInfo";

// Other Pages
import Home from "./pages/Home";
import NotificationsPage from "./pages/User/Notifications/NotificationsPage";

function App() {
  return (
    <Routes>
      {/* Root redirect to landing page */}
      <Route path="/" element={<Navigate to="/landing-page" replace />} />

      {/* Public Routes */}
      <Route path="/landing-page" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* App Routes (Protected) */}
      <Route path="/" element={<UserLayout />}>
        <Route path="/home" element={<PostsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      {/* Profile Setup Routes */}
      <Route path="/onboarding/learn-skills" element={<StepLearnSkills />} />
      <Route path="/onboarding/teach-skills" element={<StepTeachSkills />} />
      <Route path="/onboarding/profile-info" element={<StepProfileInfo />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="transactions" element={<TransactionPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/landing-page" replace />} />
    </Routes>
  );
}

export default App;