import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // FIX: Use the correct backend URL (port 5000)
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      
      setMessage(res.data.message || "If the email exists, a reset link has been sent");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/20 blur-[160px]" />
      <div className="relative z-10 w-full max-w-[520px]">
        <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_30px_110px_rgba(46,47,70,0.22)]">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-semibold text-foreground">Reset your password</CardTitle>
            <CardDescription className="text-sm text-foreground/70">
              Enter the email linked to your account and we&apos;ll send a secure reset link.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center text-sm text-foreground/60">
            <span>
              Remember your password?
              <Link to="/login" className="ml-2 font-semibold text-secondary transition hover:text-secondary/80">
                Back to login
              </Link>
            </span>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Need help? support@techswap.io
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}