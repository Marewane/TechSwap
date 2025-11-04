import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "@/features/user/userSlice";
import { fetchMyProfile } from "@/features/profile/profileSlice";
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

          // Immediately hydrate profile so Navbar has avatar/wallet
          dispatch(fetchMyProfile());

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2">Completing login...</h2>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}