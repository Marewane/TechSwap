import { Routes, Route } from "react-router-dom";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Sessions from "./pages/Admin/Sessions/Sessions";
import Reports from "./pages/Admin/Report/ReportsPage";
import TransactionPage from "./pages/Admin/Transactions/TransactionPage";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import PostsPage from "./pages/User/Post/PostsPage";
import Landing from "./components/Landing";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<PostsPage />} />


      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="transactions" element={<TransactionPage />} />
      </Route>
    </Routes>
  );
}

export default App;
