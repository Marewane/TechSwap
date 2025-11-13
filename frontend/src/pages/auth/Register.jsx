import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import api from "@/services/api";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-secondary/25 blur-[180px]" />
      <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[200px]" />

      <div className="relative z-10 grid w-full max-w-[1160px] gap-10 rounded-[var(--radius)] border border-border/60 bg-white/70 p-6 shadow-[0_45px_140px_rgba(46,47,70,0.28)] backdrop-blur-2xl md:grid-cols-2 md:p-10">
        <div className="hidden flex-col justify-between rounded-[calc(var(--radius)/1.4)] border border-border/50 bg-gradient-to-br from-primary to-[#3b3c5c] p-8 text-primary-foreground shadow-[0_35px_120px_rgba(20,21,33,0.45)] md:flex">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Join TechSwap</p>
            <h1 className="mt-5 text-3xl font-semibold md:text-4xl">
              Build your trusted, gamified mentorship presence.
            </h1>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Create a premium profile, earn coins by teaching, spend coins to learn, and accelerate your career with high-caliber swap sessions.
            </p>
          </div>
          <div className="mt-12 grid gap-4 text-sm text-primary-foreground/80">
            <div className="rounded-[calc(var(--radius)/1.6)] border border-white/30 bg-white/10 px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Trusted members</p>
              <p className="mt-1 text-2xl font-semibold text-white">10,000+ IT professionals</p>
            </div>
            <div className="rounded-[calc(var(--radius)/1.6)] border border-white/30 bg-white/10 px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Swap sessions</p>
              <p className="mt-1 text-2xl font-semibold text-white">25,000+ completed</p>
            </div>
          </div>
        </div>

        <div className="w-full rounded-[calc(var(--radius)/1.1)] border border-border/50 bg-card/95 p-8 shadow-[0_30px_110px_rgba(46,47,70,0.22)]">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground">Create your account</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Verify your email, grab your bonus coins, and start swapping immediately.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
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

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
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
              <div className="rounded-[calc(var(--radius)/1.8)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
              <span className="bg-card/95 px-4">Or continue with</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="w-full justify-center gap-2" onClick={handleGoogleAuth} type="button">
              <FcGoogle className="size-4" />
              Google
            </Button>
            <Button variant="outline" className="w-full justify-center gap-2" onClick={handleGithubAuth} type="button">
              <FaGithub className="size-4" />
              GitHub
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-foreground/65">
            Already have an account?
            <a href="/login" className="ml-2 font-semibold text-secondary transition hover:text-secondary/80">
              Sign in
            </a>
          </p>

          <p className="mt-3 text-center text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            25 bonus coins awarded on email verification
          </p>
        </div>
      </div>
    </div>
  );
}