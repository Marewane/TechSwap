import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import api from "@/services/api";
import { fetchMyProfile } from "@/features/profile/profileSlice";

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
  const dispatch = useDispatch();

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
        // Refresh profile so Navbar immediately reflects the new avatar
        await dispatch(fetchMyProfile());
        navigate("/home");
      } else {
        throw new Error(response.data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Profile completed! You can update your avatar later.");
      // Best-effort refresh to reflect whatever is saved
      dispatch(fetchMyProfile());
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
            <div 
              className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
              onClick={triggerFileInput}
            >
              {tempAvatar ? (
                <img 
                  src={tempAvatar} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show placeholder
                    e.target.style.display = 'none';
                  }}
                />
              ) : formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm text-center">Click to upload</span>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <Button 
              variant="outline" 
              onClick={triggerFileInput}
              disabled={uploading}
              className="mb-2"
            >
              {uploading ? "Uploading..." : "Choose Image"}
            </Button>
            
            {uploading && <p className="text-sm text-blue-600">Uploading image...</p>}
            <p className="text-sm text-gray-500 text-center">
              {formData.avatar && formData.avatar.includes('cloudinary') 
                ? "✅ Image saved to Cloudinary" 
                : tempAvatar 
                ? "🔼 Image ready to upload" 
                : "No image selected"}
            </p>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself, your interests, and what you hope to achieve..."
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
          <Button onClick={handleComplete} disabled={loading || uploading}>
            {loading ? "Saving..." : uploading ? "Uploading..." : "Complete Setup"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}