import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import api from "@/services/api";

export default function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Get pending verification data from localStorage
    const stored = localStorage.getItem('pendingVerification');
    
    if (stored) {
      setPendingUser(JSON.parse(stored));
    } else {
      navigate("/register");
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!pendingUser) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/verify-email", {
        userId: pendingUser.userId,
        verificationCode: verificationCode
      });

      if (res.data.success) {
        // Clear pending verification
        localStorage.removeItem('pendingVerification');
        
        // Store auth data
        localStorage.setItem('auth', JSON.stringify({
          user: res.data.data.user,
          tokens: res.data.data.tokens
        }));

        // Check if user needs profile setup
        const user = res.data.data.user;
        if (!user.skillsToLearn || user.skillsToLearn.length === 0) {
          // Redirect to profile setup
          navigate("/onboarding/learn-skills");
        } else {
          // Redirect to home if profile is already set up
          navigate("/home");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUser) return;

    setResendLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/resend-verification", {
        email: pendingUser.email
      });

      if (res.data.success) {
        setMessage("New verification code sent to your email");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  if (!pendingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p>No pending verification found.</p>
            <Button onClick={() => navigate("/register")} className="w-full mt-4">
              Go to Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
          <CardDescription>
            We sent a verification code to {pendingUser.email}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength={6}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-green-500">{message}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}