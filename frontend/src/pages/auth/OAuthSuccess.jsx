import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "@/features/user/userSlice";
import api from "@/services/api";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processOAuthSuccess = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const isNewUser = searchParams.get("isNewUser") === "true";

      console.log("🔐 OAuth Success - Processing tokens", { isNewUser });

      if (accessToken && refreshToken) {
        try {
          // Decode the token to get user info
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          console.log("📄 Decoded token payload:", payload);

          // Create user object from token
          const user = {
            id: payload.userId,
            role: payload.role || "user",
          };

          const authData = {
            user,
            tokens: {
              accessToken,
              refreshToken,
            },
          };

          // Save to Redux and localStorage
          dispatch(setAuth(authData));
          console.log("💾 Auth data saved to storage");

          // Set authorization header
          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

          // SIMPLIFIED LOGIC: Trust the backend's isNewUser flag
          if (isNewUser) {
            console.log("🆕 First-time OAuth user - redirecting to profile setup");
            navigate("/onboarding/learn-skills");
          } else {
            console.log("👤 Returning OAuth user - redirecting to home");
            if (user.role === "admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/home");
            }
          }

        } catch (error) {
          console.error("❌ Error processing OAuth success:", error);
          navigate("/login?error=oauth_processing_error");
        }
      } else {
        console.error("❌ Missing tokens in OAuth callback");
        navigate("/login?error=oauth_missing_tokens");
      }
    };

    processOAuthSuccess();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f9fafb] via-white to-[#eef1ff] px-4 py-12">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-secondary/20 blur-[160px]" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-accent/20 blur-[160px]" />
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        <h2 className="text-2xl font-semibold text-foreground">Completing login…</h2>
        <p className="mt-2 text-sm text-foreground/65">Please wait while we finalize your TechSwap authentication.</p>
      </div>
    </div>
  );
}