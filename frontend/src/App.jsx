import {  Routes, Route } from "react-router-dom";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Reports from "./pages/Admin/Report/ReportsPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";



function App() {
  return (
    <Routes>
      {/* Admin Routes with */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
      
  
        

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

     
        </Route>
        
       
      </Routes>
    
  );
}

export default App;