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
import ProfilePosts from './components/ProfilePosts';
import ProfileReviews from './components/ProfileReviews';
import ProfileReviewsPreview from './components/ProfileReviewsPreview';
import ProfileTransactions from './components/ProfileTransactions';

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
                        onUpdateSkills={(data) => handleProfileUpdate(data)}
                    />

                    {/* Reviews Preview */}
                    <ProfileReviewsPreview
                        reviews={profileData.reviews || []}
                        onViewAll={() => setActiveTab('reviews')}
                    />
                </div>
            )}

            {activeTab === 'posts' && (
                <ProfilePosts
                    posts={profileData.posts}
                    isOwner={isOwner}
                    currentUser={profileData.user} // Pass the current user data
                />
            )}
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
                <ProfileReviews reviews={profileData.reviews || []} />
            )}
            {/* Wallet / Transactions Tab */}
            {activeTab === 'wallet' && (
                <ProfileTransactions
                    balance={profileData.wallet?.balance}
                    transactions={profileData.transactions || []}
                />
            )}
        </ProfileLayout>
    );
};

export default ProfilePage;