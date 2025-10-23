import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import api from "@/services/api";

export default function StepProfileInfo() {
  const [formData, setFormData] = useState({
    bio: "",
    avatar: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // TODO: Implement Cloudinary upload here
    // For now, we'll just use a placeholder
    setFormData(prev => ({
      ...prev,
      avatar: URL.createObjectURL(file)
    }));
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Save profile info
      await api.patch("/users/profile", {
        bio: formData.bio,
        avatar: formData.avatar
      });

      // Redirect to home page
      navigate("/home");
    } catch (error) {
      console.error("Error saving profile:", error);
      // Still redirect to home even if save fails
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Complete Your Profile</CardTitle>
          <CardDescription>
            Add some personal information to help others get to know you (optional)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Avatar</span>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="max-w-xs"
            />
          </div>

          {/* Bio - Using Textarea for multi-line input */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip Profile Setup
          </Button>
          <Button onClick={handleComplete} disabled={loading}>
            {loading ? "Saving..." : "Complete Setup"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}