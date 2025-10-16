// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/user/userSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.user);

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await dispatch(loginUser(form)).unwrap(); // slice stores auth
      setMessage("Login successful");
      navigate("/admin/dashboard");
    } catch (err) {
      setMessage(err || "Login failed");
    }
  };

  // OAuth — opens backend route which redirects to provider
  const GOOGLE = (import.meta.env.VITE_API_BASE || "http://localhost:5000/api") + "/auth/google";
  const GITHUB = (import.meta.env.VITE_API_BASE || "http://localhost:5000/api") + "/auth/github";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        {message && <p className="text-sm text-blue-600 text-center mb-2">{message}</p>}
        {error && <p className="text-sm text-red-600 text-center mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required/>
          <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required/>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">or continue with</div>
        <div className="mt-3 flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.href = GOOGLE}>Google</Button>
          <Button variant="outline" onClick={() => window.location.href = GITHUB}>GitHub</Button>
        </div>

        <p className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
        </p>
      </div>
    </div>
  );
}
