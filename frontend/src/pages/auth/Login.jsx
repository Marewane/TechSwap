import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/user/userSlice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      
      // Redirect based on role - FIXED LOGIC
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // For regular users, always go to home page
        // Remove the profile setup check for now
        navigate("/home");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleOAuthLogin = (provider) => {
    // Redirect to backend OAuth route
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-secondary/20 blur-[140px]" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-[180px]" />
      <div className="relative z-10 grid w-full max-w-[1160px] gap-10 rounded-[var(--radius)] border border-border/60 bg-white/70 p-6 shadow-[0_45px_140px_rgba(46,47,70,0.28)] backdrop-blur-2xl md:grid-cols-2 md:p-10">
        <div className="hidden flex-col justify-between rounded-[calc(var(--radius)/1.4)] border border-border/50 bg-gradient-to-br from-primary to-[#393a57] p-8 text-primary-foreground shadow-[0_35px_120px_rgba(20,21,33,0.45)] md:flex">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Elite SaaS Platform</p>
            <h2 className="mt-5 text-3xl font-semibold md:text-4xl">
              Swap your expertise for the tech breakthroughs you crave.
            </h2>
            <p className="mt-4 text-sm text-primary-foreground/80">
              TechSwap unlocks high-signal mentorship by pairing you with vetted peers. Enter the ecosystem, purchase coins, and launch premium 50-coin swap sessions in seconds.
            </p>
          </div>
          <div className="mt-12 space-y-4 text-sm text-primary-foreground/80">
            <div className="rounded-[calc(var(--radius)/1.6)] border border-white/30 bg-white/10 px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Live swaps happening</p>
              <p className="mt-1 text-2xl font-semibold text-white">47 sessions in progress</p>
            </div>
            <div className="rounded-[calc(var(--radius)/1.6)] border border-white/30 bg-white/10 px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Coins traded</p>
              <p className="mt-1 text-2xl font-semibold text-white">1.2M+ this quarter</p>
            </div>
          </div>
        </div>
        <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_30px_110px_rgba(46,47,70,0.22)]">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-semibold text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-sm text-foreground/70">
              Enter your credentials to access your premium swap dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 text-left">
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

              <div className="space-y-1.5 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
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
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link to="/forgot-password" className="font-semibold text-secondary transition hover:text-secondary/80">
                Forgot password?
              </Link>
            </div>

            <div>
              <p className="text-center text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Or continue with
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2"
                  onClick={() => handleOAuthLogin("google")}
                  type="button"
                >
                  <FcGoogle className="size-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2"
                  onClick={() => handleOAuthLogin("github")}
                  type="button"
                >
                  <Github className="size-4" />
                  GitHub
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 text-center text-sm text-foreground/65">
            <span>
              Don&apos;t have an account?
              <Link to="/register" className="ml-2 font-semibold text-secondary transition hover:text-secondary/80">
                Sign up
              </Link>
            </span>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Secured via Stripe · Trust badges on every swap
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}