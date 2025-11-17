import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "@/features/user/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import api from "@/services/api";
import { ArrowLeft } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Sending registration request...");
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log("📥 Registration response:", response.data);

      if (response.data.success) {
        // ✅ FIXED: Handle the actual response structure
        // After registration, user needs to verify email first
        // So we don't get tokens immediately
        
        const { userId, email } = response.data.data;
        
        console.log("✅ Registration successful - redirecting to email verification");
        
        // Redirect to email verification page with user info
        navigate("/verify-email", { 
          state: { 
            userId: userId,
            email: email 
          } 
        });
        
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      console.error("Error details:", err.response?.data);
      
      // More specific error messages
      if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid registration data");
      } else if (err.response?.status === 409) {
        setError("User already exists with this email");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleGithubAuth = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50">
      <Link
        to="/landing-page"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to landing page</span>
      </Link>

      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-center">Create an account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            type="button"
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGithubAuth}
            type="button"
          >
            <FaGithub className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}