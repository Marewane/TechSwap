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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
          <CardDescription>
            We sent a verification code to {userInfo.email}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600 text-center">{success}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-blue-600 hover:underline font-medium"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/register")}
          >
            Back to Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}