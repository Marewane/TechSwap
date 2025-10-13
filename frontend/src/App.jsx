import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";


function App() {
  return (
      <Routes>
        {/* Admin Routes with Sidebar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        
        {/* Other routes */}
      </Routes>
  );
}

export default App;