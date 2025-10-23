import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "@/features/user/userSlice";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processOAuthSuccess = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      console.log("OAuth Success - Tokens received");

      if (accessToken && refreshToken) {
        try {
          // Decode the token to get user info
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          
          // Create user object from token
          const user = {
            id: payload.userId,
            role: payload.role || 'user'
          };

          const authData = {
            user,
            tokens: { 
              accessToken, 
              refreshToken 
            }
          };

          // Save to Redux and localStorage
          dispatch(setAuth(authData));

          // Redirect based on role
          if (user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            // For now, redirect to home - we'll add profile setup check later
            navigate("/home");
          }
        } catch (error) {
          console.error("Error processing OAuth success:", error);
          navigate("/login?error=oauth_processing_error");
        }
      } else {
        console.error("Missing tokens in OAuth callback");
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