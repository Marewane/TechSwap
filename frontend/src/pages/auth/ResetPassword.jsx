import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

export default function ResetPassword() {
  const { token } = useParams(); // This gets the token from URL parameter
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/reset-password", {
        token, // This is the token from URL parameter
        newPassword: formData.newPassword,
      });
      
      setMessage(res.data.message || "Password reset successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
      setValidToken(false);
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-destructive/20 blur-[160px]" />
        <div className="relative z-10 w-full max-w-[520px]">
          <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_30px_110px_rgba(46,47,70,0.22)]">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-semibold text-destructive">Invalid reset link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Request a new one to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-foreground/70">
              We build security-first experiences. Links expire quickly to protect your account.
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate("/forgot-password")}>Request new reset link</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-secondary/20 blur-[150px]" />
      <div className="relative z-10 w-full max-w-[520px]">
        <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_30px_110px_rgba(46,47,70,0.22)]">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-semibold text-foreground">Set a new password</CardTitle>
            <CardDescription className="text-sm text-foreground/70">
              Create a strong password to secure your premium swap account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.newPassword}
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
                  minLength={6}
                />
              </div>

              {error && (
                <div className="rounded-[calc(var(--radius)/1.8)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-[calc(var(--radius)/1.8)] border border-secondary/40 bg-secondary/15 px-4 py-3 text-sm text-secondary-foreground/80">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center text-sm text-foreground/60">
            <Button variant="link" onClick={() => navigate("/login")} className="mx-auto">
              Back to login
            </Button>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Need help? support@techswap.io
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}