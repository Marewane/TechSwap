import { useState, useRef } from "react";
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
  const [tempAvatar, setTempAvatar] = useState(""); // For preview
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
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

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Show immediate preview
    const previewUrl = URL.createObjectURL(file);
    setTempAvatar(previewUrl);
    
    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      console.log("🔼 Starting image upload...");
      const response = await api.post('/upload/avatar', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("📥 Upload response:", response.data);

      if (response.data.success) {
        // Use the ACTUAL Cloudinary URL from the response
        const cloudinaryUrl = response.data.imageUrl;
        setFormData(prev => ({
          ...prev,
          avatar: cloudinaryUrl
        }));
        console.log("✅ Image uploaded to Cloudinary:", cloudinaryUrl);
        
        // Update temp avatar to show the actual Cloudinary image
        setTempAvatar(cloudinaryUrl);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      console.error("Error details:", error.response?.data);
      
      // On error, keep the preview but use default for saving
      setFormData(prev => ({
        ...prev,
        avatar: "https://i.pravatar.cc/150?img=4"
      }));
      
      alert("Image upload failed. Using default avatar.");
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Use the uploaded Cloudinary URL if available, otherwise default
      const avatarToSave = formData.avatar || "https://i.pravatar.cc/150?img=4";
      
      console.log("💾 Saving profile with avatar:", avatarToSave);
      
      const response = await api.put("/profile/update", {
        bio: formData.bio,
        avatar: avatarToSave
      });

      if (response.data.success) {
        console.log("✅ Profile saved successfully");
        navigate("/home");
      } else {
        throw new Error(response.data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Profile completed! You can update your avatar later.");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_26px_90px_rgba(46,47,70,0.18)]">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold text-foreground">Complete your profile</CardTitle>
        <CardDescription className="text-sm text-foreground/70">
          Add a bio and avatar so peers can instantly trust your expertise.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <div
            className="relative mb-4 flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-secondary/40 bg-secondary/10 transition hover:border-secondary"
            onClick={triggerFileInput}
          >
            {tempAvatar ? (
              <img
                src={tempAvatar}
                alt="Avatar Preview"
                className="h-full w-full object-cover"
              />
            ) : formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="px-4 text-center text-xs text-foreground/60">Tap to upload your avatar</span>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <Button variant="outline" onClick={triggerFileInput} disabled={uploading} className="mb-2">
            {uploading ? "Uploading…" : "Choose image"}
          </Button>

          {uploading && <p className="text-xs text-secondary">Uploading image…</p>}
          <p className="text-xs text-foreground/60">
            {formData.avatar && formData.avatar.includes("cloudinary")
              ? "✅ Image saved to Cloudinary"
              : tempAvatar
              ? "🔄 Preview ready"
              : "No image selected"}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell the community about your experience, focus areas, and what you love teaching."
            value={formData.bio}
            onChange={handleChange}
            rows={5}
            maxLength={500}
          />
          <p className="text-xs text-foreground/60">{formData.bio.length}/500 characters</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleSkip}>
          Skip profile setup
        </Button>
        <Button onClick={handleComplete} disabled={loading || uploading}>
          {loading ? "Saving…" : uploading ? "Uploading…" : "Complete setup"}
        </Button>
      </CardFooter>
    </Card>
  );
}