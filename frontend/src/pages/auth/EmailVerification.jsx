import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "@/features/user/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import api from "@/services/api";

export default function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userInfo, setUserInfo] = useState({ userId: "", email: "" });
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Get user info from navigation state
    if (location.state?.userId && location.state?.email) {
      setUserInfo({
        userId: location.state.userId,
        email: location.state.email
      });
    } else {
      // If no user info, redirect to register
      navigate("/register");
    }
  }, [location, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Verifying email...");
      const response = await api.post("/auth/verify-email", {
        userId: userInfo.userId,
        verificationCode: verificationCode
      });

      console.log("📥 Verification response:", response.data);

      if (response.data.success) {
        // ✅ Email verified successfully - now we get tokens
        const { user, tokens } = response.data.data;
        
        const authData = {
          user,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          }
        };

        // Save to Redux and localStorage
        dispatch(setAuth(authData));
        localStorage.setItem("auth", JSON.stringify(authData));
        api.defaults.headers.common["Authorization"] = `Bearer ${tokens.accessToken}`;

        setSuccess("Email verified successfully! Redirecting...");
        
        // Redirect to profile setup for new users
        setTimeout(() => {
          navigate("/onboarding/learn-skills");
        }, 2000);
        
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (err) {
      console.error("❌ Verification error:", err);
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setResendLoading(true);

    try {
      const response = await api.post("/auth/resend-verification", {
        email: userInfo.email
      });

      if (response.data.success) {
        setSuccess("New verification code sent to your email!");
      } else {
        throw new Error(response.data.message || "Failed to resend code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-secondary/25 blur-[180px]" />
      <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[200px]" />
      <div className="relative z-10 w-full max-w-[560px]">
        <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_30px_110px_rgba(46,47,70,0.22)]">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-semibold text-foreground">Verify your email</CardTitle>
            <CardDescription className="text-sm text-foreground/70">
              We sent a six-digit code to <span className="font-semibold text-secondary">{userInfo.email}</span>. Enter it below to unlock your TechSwap profile.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="verificationCode">Verification code</Label>
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="rounded-[calc(var(--radius)/1.8)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-[calc(var(--radius)/1.8)] border border-secondary/40 bg-secondary/15 px-4 py-3 text-sm text-secondary-foreground/80">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying…" : "Verify email"}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-foreground/65">
              Didn&apos;t receive the code?
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="ml-2 font-semibold text-secondary transition hover:text-secondary/80 disabled:opacity-50"
              >
                {resendLoading ? "Sending…" : "Resend code"}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center text-sm text-foreground/60">
            <Button variant="outline" onClick={() => navigate("/register")} className="mx-auto w-full sm:w-auto">
              Back to register
            </Button>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Verification grants 25 bonus coins instantly
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}