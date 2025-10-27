import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Star } from "lucide-react";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

const ProfileHeader = ({ profile, isOwner, onProfileUpdate }) => {
    const { user, stats } = profile;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Generate star rating display
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);

        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-5 w-5 ${
                            i < fullStars
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        }`}
                    />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                    {rating?.toFixed(1) || "0.0"} ({stats?.totalReviews || 0} Reviews)
                </span>
            </div>
        );
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

    const handleSaveProfile = async (updatedData) => {
        try {
            await onProfileUpdate(updatedData);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg border p-6 mb-6">
                <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <Avatar className="size-40 border-2 border-gray-200">
                        <AvatarImage
                            src={user?.avatar}
                            alt={user?.name}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to from-blue-500 to-purple-600 text-white font-semibold">
                            {getInitials(user?.name || "User")}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                        {/* Name */}
                        <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>

                        {/* Rating */}
                        <div className="flex items-center">
                            {renderStars(stats?.averageRating || 0)}
                        </div>

                        {/* Bio */}
                        <div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {user?.bio || "No bio provided yet."}
                            </p>
                        </div>

                        {/* Edit Button */}
                        {isOwner && (
                            <div className="pt-1">
                                <Button
                                    onClick={() => setIsEditModalOpen(true)}
                                    variant="outline"
                                    className="border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium"
                                    size="sm"
                                >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit Profile
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                profile={profile}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={onProfileUpdate} 
            />
        </>
    );
};

export default ProfileHeader;