import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Reports from "./pages/Admin/Report/ReportsPage";


function App() {
  return (
    <Routes>
      {/* Admin Routes with */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;