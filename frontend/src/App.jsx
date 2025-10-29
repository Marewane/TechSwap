import { Routes, Route } from "react-router-dom";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Reports from "./pages/Admin/Report/ReportsPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Events from './pages/Events/Events'; // Add this import
import LiveSession from './pages/LiveSession/LiveSession'; // Add this import
import SimpleVideoCall from "./components/Session/SimpleVideoCall";
import VideoCallErrorBoundary from './components/Session/VideoCallErrorBoundary';


function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} /> 
      <Route path="/events" element={<Events />} /> {/* Add this route */}
      <Route path="/live-session/:id" element={<LiveSession />} />
      {/* <Route 
              path="/live-session/:id" 
              element={
                <VideoCallErrorBoundary>
                  <LiveSession />
                </VideoCallErrorBoundary>
              } 
            /> */}

      <Route path="/simple-call/:sessionId" element={<SimpleVideoCall />} />
            {/* You can also have a version without a specific ID if needed */}
            {/* <Route path="/simple-call" element={<SimpleVideoCall sessionId="default-id" />} /> */}

    
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;