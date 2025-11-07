// components/ProfilePosts.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Loader2, Star } from "lucide-react";

const ProfilePosts = ({ posts, requestingSwap, onOpenScheduler, isOwner = false, currentUser }) => {
    const getInitials = (name) => {
        return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";
    };

    // If no posts or empty array
    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                    <p className="text-gray-600">
                        {isOwner 
                            ? "You haven't created any posts yet." 
                            : "This user hasn't created any posts yet."
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
                // Use current user data for owner's posts
                const displayUser = isOwner ? currentUser : (post.userId || currentUser);
                const userName = displayUser?.name || "User";
                const userAvatar = displayUser?.avatar;
                const userRating = displayUser?.rating || 0;

                // Get skills ONLY from the post itself
                const skillsOffered = post.skillsOffered || [];
                const skillsWanted = post.skillsWanted || [];

                return (
                    <Card key={post?._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full">
                        <CardContent className="p-5 flex flex-col flex-1">
                            {/* User Info Section - Always show */}
                            <div className="flex items-start gap-3 mb-4">
                                <Avatar className="w-12 h-12 border-2 border-gray-100">
                                    <AvatarImage src={userAvatar || "/default-avatar.png"} alt={userName} />
                                    <AvatarFallback className="text-sm font-medium">
                                        {getInitials(userName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">{userName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                                            <span className="font-medium">{userRating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Post Title */}
                            <h4 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                                {post?.title || "Untitled Post"}
                            </h4>

                            {/* Post Content */}
                            <p className="text-gray-700 mb-4 leading-relaxed text-sm line-clamp-3 flex-1">
                                {post?.content || "No description provided"}
                            </p>

                            {/* Skills Offered Section - O */}
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Offering</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {skillsOffered.slice(0, 3).map((skill, idx) => (
                                        <Badge key={idx} className="bg-gray-700 text-white text-xs px-2 py-1">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {skillsOffered.length > 3 && (
                                        <Badge className="text-xs px-2 py-1">
                                            +{skillsOffered.length - 3}
                                        </Badge>
                                    )}
                                    {skillsOffered.length === 0 && (
                                        <span className="text-xs text-gray-500 italic">No skills offered in this post</span>
                                    )}
                                </div>
                            </div>

                            {/* Skills Wanted Section - ONLY from post */}
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Wanting</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {skillsWanted.slice(0, 3).map((skill, idx) => (
                                        <Badge key={idx} className="border-blue-200 bg-blue-50 text-blue-700 text-xs px-2 py-1">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {skillsWanted.length > 3 && (
                                        <Badge className="text-xs px-2 py-1">
                                            +{skillsWanted.length - 3}
                                        </Badge>
                                    )}
                                    {skillsWanted.length === 0 && (
                                        <span className="text-xs text-gray-500 italic">No skills wanted in this post</span>
                                    )}
                                </div>
                            </div>

                            {/* Availability Section */}
                            {post?.availability?.days?.length > 0 && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm font-semibold text-gray-900">Availability</p>
                                    </div>
                                    <p className="text-xs text-gray-700 mb-1">
                                        <span className="font-medium">{post.availability.days.slice(0, 2).join(", ")}</span>
                                        {post.availability.days.length > 2 && ` +${post.availability.days.length - 2} more`}
                                    </p>
                                    {post.availability.startTime && post.availability.endTime && (
                                        <p className="text-xs text-gray-600">
                                            {post.availability.startTime} - {post.availability.endTime}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="mt-auto pt-3">
                                {isOwner ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            // Dispatch a global event for edit (hook up a listener where you handle editing)
                                            try { window.dispatchEvent(new CustomEvent('profile:edit-post', { detail: { postId: post?._id, post } })); } catch {}
                                        }}
                                    >
                                        Edit Post
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full bg-gray-700 text-white font-medium py-2.5"
                                        onClick={() => onOpenScheduler && onOpenScheduler(post)}
                                        disabled={requestingSwap === post?._id}
                                    >
                                        {requestingSwap === post?._id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Requesting...
                                            </>
                                        ) : (
                                            'Request Swap'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default ProfilePosts;