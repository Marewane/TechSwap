import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Upload } from "lucide-react";
import { updateProfile } from "@/features/profile/profileSlice";
import api from "@/services/api";

const EditProfileModal = ({ profile, isOpen, onClose, onSave }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.profile);
    
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        avatar: "",
    });
    const [avatarPreview, setAvatarPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize form data when profile changes
    useEffect(() => {
        if (profile?.user) {
            setFormData({
                name: profile.user.name || "",
                bio: profile.user.bio || "",
                avatar: profile.user.avatar || "",
            });
            setAvatarPreview(profile.user.avatar || "");
        }
    }, [profile]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle avatar file upload to Cloudinary
    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
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
        setAvatarPreview(previewUrl);
        
        setUploading(true);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);

            console.log("🔼 Uploading avatar to Cloudinary...");
            const response = await api.post('/upload/avatar', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("📥 Upload response:", response.data);

            if (response.data.success) {
                // Use the Cloudinary URL from the response
                const cloudinaryUrl = response.data.imageUrl || response.data.data?.avatar;
                setFormData(prev => ({
                    ...prev,
                    avatar: cloudinaryUrl
                }));
                console.log("✅ Avatar uploaded to Cloudinary:", cloudinaryUrl);
                
                // Update preview to show the actual Cloudinary image
                setAvatarPreview(cloudinaryUrl);
            } else {
                throw new Error(response.data.message || "Upload failed");
            }
        } catch (error) {
            console.error("❌ Error uploading avatar:", error);
            console.error("Error details:", error.response?.data);
            alert("Failed to upload image. Please try again.");
            
            // Reset preview on error
            setAvatarPreview(formData.avatar);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Handle save using Redux
    const handleSave = async () => {
        try {
            // Prepare data for backend
            const updateData = {
                name: formData.name,
                bio: formData.bio,
                avatar: formData.avatar,
            };

            console.log("💾 Saving profile data:", updateData);

            // Dispatch the updateProfile action
            const result = await dispatch(updateProfile(updateData)).unwrap();
            
            console.log("✅ Profile updated successfully:", result);
            
            // Call the parent onSave callback if provided
            if (onSave) {
                onSave(result.data);
            }
            
            onClose();
        } catch (error) {
            console.error("❌ Error saving profile:", error);
            // Error is already handled by the slice and will be in Redux state
        }
    };

    // Get initials for avatar fallback
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                <AvatarImage
                                    src={avatarPreview || formData.avatar}
                                    alt="Profile preview"
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-gradient-to from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                                    {getInitials(formData.name || "User")}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={triggerFileInput}
                            size="sm"
                            disabled={uploading}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Uploading..." : "Change Photo"}
                        </Button>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Bio Field */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                            rows={4}
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 ">
                    <Button variant="outline" onClick={onClose} disabled={uploading || loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={uploading || loading}>
                        {loading ? "Saving..." : uploading ? "Uploading..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;