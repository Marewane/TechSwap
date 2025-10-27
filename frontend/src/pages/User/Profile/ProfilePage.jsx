import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
    fetchMyProfile, 
    fetchUserProfile, 
    updateProfile,
    clearError,
    clearSuccess 
} from '@/features/profile/profileSlice';

// Import components
import ProfileLayout from './components/ProfileLayout';
import ProfileHeader from './components/ProfileHeader';
import ProfileSkills from './components/ProfileSkils';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { userId } = useParams();
    const { myProfile, userProfile, loading, error, successMessage, isOwner } = useSelector((state) => state.profile);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserProfile(userId));
        } else {
            dispatch(fetchMyProfile());
        }
    }, [dispatch, userId]);

    // Handle profile updates
    const handleProfileUpdate = async (updatedData) => {
        try {
            await dispatch(updateProfile(updatedData)).unwrap();
            
            // Refresh profile data after successful update
            if (userId) {
                dispatch(fetchUserProfile(userId));
            } else {
                dispatch(fetchMyProfile());
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    };

    // Clear messages after 3 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 3000);
            return () => clearTimeout(timer);
        }
        if (successMessage) {
            const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage, dispatch]);

    const profileData = userId ? userProfile : myProfile;

    if (loading && !profileData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !profileData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900">Profile not found</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProfileLayout 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            profile={profileData}
            isOwner={isOwner}
        >
            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800">{successMessage}</p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <ProfileHeader 
                        profile={profileData}
                        isOwner={isOwner}
                        onProfileUpdate={handleProfileUpdate}
                    />
                    
                    <ProfileSkills 
                        skillsToTeach={profileData.user?.skillsToTeach}
                        skillsToLearn={profileData.user?.skillsToLearn}
                        isOwner={isOwner}
                    />

                    {/* Reviews Preview */}
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
                        {profileData.reviews && profileData.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {profileData.reviews.slice(0, 2).map((review) => (
                                    <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img 
                                                src={review.reviewerAvatar} 
                                                alt={review.reviewerName}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{review.reviewerName}</p>
                                                <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-lg ${
                                                        i < review.rating 
                                                            ? "text-yellow-400" 
                                                            : "text-gray-300"
                                                    }`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No reviews yet.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-2xl font-bold mb-4">Sessions</h2>
                    <p className="text-gray-500">Your session history will appear here.</p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-700">
                            Total Sessions Completed: {profileData.stats?.sessionsCompleted || 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                    {profileData.reviews && profileData.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {profileData.reviews.map((review) => (
                                <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                    <div className="flex items-start gap-4">
                                        <img 
                                            src={review.reviewerAvatar} 
                                            alt={review.reviewerName}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(review.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-xl ${
                                                                i < review.rating 
                                                                    ? "text-yellow-400" 
                                                                    : "text-gray-300"
                                                            }`}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg">No reviews yet.</p>
                            <p className="text-gray-400 mt-2">Reviews from your sessions will appear here.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-2xl font-bold mb-6">Settings</h2>
                    <div className="space-y-6">
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-3">Account Settings</h3>
                            <p className="text-gray-600">Manage your account preferences and privacy settings.</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-3">Notification Preferences</h3>
                            <p className="text-gray-600">Control how and when you receive notifications.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Privacy</h3>
                            <p className="text-gray-600">Manage your privacy and data sharing settings.</p>
                        </div>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
};

export default ProfilePage;