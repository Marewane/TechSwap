import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // ✅ added
import { setAuth } from "@/features/user/userSlice"; // ✅ added
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import api from "@/services/api"; // Use your API service

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
  const dispatch = useDispatch(); // ✅ needed for setAuth

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Fixed: function was outside the component block previously
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
      const response = await api.post("/auth/register", formData);

      if (response.data.success) {
        // Save tokens and user data
        const { user, tokens } = response.data.data;
        const authData = { user, tokens };

        // Save to Redux and localStorage
        dispatch(setAuth(authData));
        localStorage.setItem("auth", JSON.stringify(authData));
        api.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;

        // NEW USERS from registration go to profile setup
        console.log("🆕 New registered user - redirecting to profile setup");
        navigate("/onboarding/learn-skills");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.response?.data?.message || "Registration failed");
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
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

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

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
