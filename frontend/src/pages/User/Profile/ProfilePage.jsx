import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    fetchMyProfile,
    fetchUserProfile,
    updateProfile,
    clearError,
    clearSuccess,
    requestWalletTopupSession,
} from '@/features/profile/profileSlice';

// Import components
import ProfileLayout from './components/ProfileLayout';
import ProfileHeader from './components/ProfileHeader';
import ProfileSkills from './components/ProfileSkils';
import ProfilePosts from './components/ProfilePosts';
import ProfileReviews from './components/ProfileReviews';
import ProfileReviewsPreview from './components/ProfileReviewsPreview';
import ProfileTransactions from './components/ProfileTransactions';
import EditPostModal from './components/EditPostModal';
import CreatePostModal from '../Post/components/CreatePostModal';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { userId } = useParams();
    const { myProfile, userProfile, loading, error, successMessage, isOwner } = useSelector((state) => state.profile);
    const [activeTab, setActiveTab] = useState('overview');
    const [editingPost, setEditingPost] = useState(null);
    const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
    const [topupAmount, setTopupAmount] = useState('100');
    const [topupError, setTopupError] = useState('');
    const [processingTopup, setProcessingTopup] = useState(false);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserProfile(userId));
        } else {
            dispatch(fetchMyProfile());
        }
    }, [dispatch, userId]);

    const handleAddFundsClick = () => {
        setTopupAmount('100');
        setTopupError('');
        setShowAddFundsDialog(true);
    };

    const handleTopupDialogChange = (open) => {
        setShowAddFundsDialog(open);
        if (!open) {
            setTopupError('');
            setProcessingTopup(false);
        }
    };

    const handleStartStripeCheckout = async (event) => {
        event.preventDefault();
        const parsedAmount = Number(topupAmount);

        if (!parsedAmount || parsedAmount <= 0) {
            setTopupError('Please enter a valid number of coins.');
            return;
        }

        if (parsedAmount < 10) {
            setTopupError('Minimum purchase is 10 coins.');
            return;
        }

        setProcessingTopup(true);
        setTopupError('');

        try {
            const data = await dispatch(requestWalletTopupSession({ coinsNumber: parsedAmount })).unwrap();

            if (data?.url) {
                window.open(data.url, '_blank');
            } else if (data?.id) {
                const checkoutUrl = `https://checkout.stripe.com/c/pay/${data.id}`;
                window.open(checkoutUrl, '_blank');
            } else {
                throw new Error('Stripe session was not created.');
            }

            setShowAddFundsDialog(false);
        } catch (err) {
            const message = typeof err === 'string' ? err : err?.message;
            setTopupError(message || 'Failed to start Stripe checkout.');
        } finally {
            setProcessingTopup(false);
        }
    };

    useEffect(() => {
        const handler = (e) => {
            const p = e?.detail?.post || null;
            setEditingPost(p);
            if (p) setActiveTab('posts');
        };

        window.addEventListener('profile:edit-post', handler);
        return () => window.removeEventListener('profile:edit-post', handler);
    }, []);

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
        <>
        <ProfileLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profile={profileData}
            isOwner={isOwner}
            onAddFundsClick={isOwner ? handleAddFundsClick : undefined}
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
                <div className="space-y-4">
                    {isOwner && (
                        <div className="flex justify-end">
                            <CreatePostModal
                                renderTrigger={({ openModal }) => (
                                    <Button
                                        onClick={openModal}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Create Post
                                    </Button>
                                )}
                            />
                        </div>
                    )}
                    <ProfilePosts
                        posts={profileData.posts}
                        isOwner={isOwner}
                        currentUser={profileData.user} // Pass the current user data
                    />
                </div>
            )}
            <EditPostModal
                open={!!editingPost}
                post={editingPost}
                onClose={() => setEditingPost(null)}
            />
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
        <Dialog open={showAddFundsDialog} onOpenChange={handleTopupDialogChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Coins with Stripe</DialogTitle>
                    <DialogDescription>
                        Choose how many coins you want to purchase. You will be redirected to Stripe Checkout.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleStartStripeCheckout} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="topupAmount">Coins to purchase</Label>
                        <Input
                            id="topupAmount"
                            type="number"
                            min={10}
                            step={10}
                            value={topupAmount}
                            onChange={(event) => setTopupAmount(event.target.value)}
                            placeholder="Enter number of coins"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            $0.10 per coin. Minimum purchase is 10 coins.
                        </p>
                        {topupError && (
                            <p className="text-sm text-red-600">{topupError}</p>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleTopupDialogChange(false)}
                            disabled={processingTopup}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processingTopup} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {processingTopup ? 'Redirecting…' : 'Continue to Stripe'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default ProfilePage;