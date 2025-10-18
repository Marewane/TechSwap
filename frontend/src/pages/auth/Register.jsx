// src/pages/auth/Register.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, verifyEmail, resendVerification } from "@/features/user/userSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.user);

  // registration form
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  // flow state
  const [step, setStep] = useState("register"); // register | verify | done
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const result = await dispatch(registerUser({
        name: form.name,
        email: form.email,
        password: form.password
      })).unwrap();

      // backend returns: { userId, email }
      setUserId(result.userId);
      setStep("verify");
      setMessage("Verification code sent to your email. It expires in 10 minutes.");
    } catch (err) {
      setMessage(err || "Registration failed");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const result = await dispatch(verifyEmail({ userId, verificationCode: code })).unwrap();
      // result: { user, tokens } -> slice stores and persists them
      setMessage("Email verified — you are now logged in.");
      setStep("done");
      // redirect to dashboard after short delay
      setTimeout(() => navigate("/admin/dashboard"), 800);
    } catch (err) {
      setMessage(err || "Verification failed");
    }
  };

  const handleResend = async () => {
    setMessage("");
    try {
      await dispatch(resendVerification({ email: form.email })).unwrap();
      setMessage("New verification code sent to your email.");
    } catch (err) {
      setMessage(err || "Failed to resend code");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        {step === "register" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">Create account</h2>
            {message && <p className="text-sm text-blue-600 text-center mb-2">{message}</p>}
            {error && <p className="text-sm text-red-600 text-center mb-2">{error}</p>}

            <form onSubmit={handleRegister} className="space-y-3">
              <Input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
              <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <Input name="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} required />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>

            <p className="mt-3 text-center text-sm">
              Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
            </p>
          </>
        )}

        {step === "verify" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">Verify your email</h2>
            {message && <p className="text-sm text-blue-600 text-center mb-2">{message}</p>}
            {error && <p className="text-sm text-red-600 text-center mb-2">{error}</p>}

            <form onSubmit={handleVerify} className="space-y-3">
              <Input placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} required />
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Verifying..." : "Verify"}</Button>
            </form>

            <div className="mt-3 text-center">
              <button onClick={handleResend} className="text-sm text-blue-500 hover:underline">Resend code</button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">You're all set 🎉</h3>
            <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
