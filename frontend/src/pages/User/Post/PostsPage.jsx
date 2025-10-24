import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, setPage, clearError, clearSuccess, requestSwap } from "../../../features/posts/postsSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, ChevronLeft, ChevronRight, Loader2, Clock, Calendar } from "lucide-react";
import CreatePostModal from "./components/CreatePostModal";
import SessionScheduler from "@/components/SessionScheduler"; // ✅ Import scheduler

const PostsPage = () => {
    const dispatch = useDispatch();
    const {
        posts,
        loading,
        error,
        currentPage,
        totalPages,
        limit,
        requestingSwap,
        swapError,
        swapSuccess
    } = useSelector((state) => state.posts);

    // 🔥 NEW: State to manage scheduler popup
    const [schedulerPost, setSchedulerPost] = useState(null);

    useEffect(() => {
        dispatch(fetchPosts({ page: currentPage, limit }));
    }, [dispatch, currentPage, limit]);

    // Auto-clear success message after 3 seconds
    useEffect(() => {
        if (swapSuccess) {
            const timer = setTimeout(() => {
                dispatch(clearSuccess());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [swapSuccess, dispatch]);

    const handlePrev = () => {
        if (currentPage > 1) {
            dispatch(setPage(currentPage - 1));
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            dispatch(setPage(currentPage + 1));
        }
    };

    // 🔥 NEW: Open scheduler for a post
    const openScheduler = (post) => {
        setSchedulerPost(post);
    };

    // 🔥 NEW: Handle actual swap request with user-selected time
    const handleSchedule = (data) => {
        dispatch(requestSwap({
            postId: schedulerPost._id,
            ...data
        }));
        setSchedulerPost(null); // Close popup
    };

    const getInitials = (name) => {
        return name
            ?.split(" ")
            ?.map((n) => n[0])
            ?.join("")
            ?.toUpperCase() || "U";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Swap Community</h1>
                    <p className="text-gray-600">Connect with others to exchange skills and knowledge</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription className="flex items-center justify-between">
                            {error}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch(clearError())}
                            >
                                ✕
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Swap Error Alert */}
                {swapError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription className="flex items-center justify-between">
                            {swapError}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch(clearError())}
                            >
                                ✕
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Success Alert */}
                {swapSuccess && (
                    <Alert className="mb-6 border-green-500 bg-green-50">
                        <AlertDescription className="text-green-700">
                            {swapSuccess}
                        </AlertDescription>
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">Loading posts...</p>
                    </div>
                ) : posts?.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                            <p className="text-gray-600 mb-4">Be the first to create a post and start swapping skills!</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {posts?.map((post) => (
                            <Card
                                key={post?._id}
                                className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col h-full"
                            >
                                <CardContent className="p-5 flex flex-col flex-1">
                                    {/* User Info Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <Avatar className="w-12 h-12 border-2 border-gray-100">
                                            <AvatarImage src={post?.userId?.avatar || "/default-avatar.png"} alt={post?.userId?.name || "Unknown User"} />
                                            <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm font-medium">
                                                {getInitials(post?.userId?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {post?.userId?.name || "Unknown User"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                                                    <span className="font-medium">{post?.userId?.rating || "0"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                                        {post?.title || "Untitled Post"}
                                    </h4>

                                    {/* Description */}
                                    <p className="text-gray-700 mb-4 leading-relaxed text-sm line-clamp-3 flex-1">
                                        {post?.content || "No description provided"}
                                    </p>

                                    {/* Skills Offered */}
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Offering</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post?.skillsOffered?.slice(0, 3).map((skill, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 text-xs px-2 py-1"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {post?.skillsOffered?.length > 3 && (
                                                <Badge variant="outline" className="text-xs px-2 py-1">
                                                    +{post.skillsOffered.length - 3}
                                                </Badge>
                                            )}
                                            {(!post?.skillsOffered || post.skillsOffered.length === 0) && (
                                                <span className="text-xs text-gray-500 italic">No skills offered</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills Wanted */}
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Wanting</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post?.skillsWanted?.slice(0, 3).map((skill, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs px-2 py-1"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {post?.skillsWanted?.length > 3 && (
                                                <Badge variant="outline" className="text-xs px-2 py-1">
                                                    +{post.skillsWanted.length - 3}
                                                </Badge>
                                            )}
                                            {(!post?.skillsWanted || post.skillsWanted.length === 0) && (
                                                <span className="text-xs text-gray-500 italic">No skills wanted</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    {post?.availability?.days && post.availability.days.length > 0 && (
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
                                            {post?.timeSlotsAvailable && post.timeSlotsAvailable.length > 0 && (
                                                <p className="text-xs text-blue-600 font-medium mt-1">
                                                    {post.timeSlotsAvailable.length} slots available
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Request Button */}
                                    <div className="mt-auto pt-3">
                                        <Button
                                            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-2.5 transition-all duration-200"
                                            onClick={() => openScheduler(post)} // ✅ Open scheduler
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
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && posts?.length > 0 && (
                    <div className="flex items-center justify-between mt-12 px-4 w-1/2 mx-auto">
                        <Button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                                {posts.length} posts
                            </span>
                        </div>
                        <Button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* 🔥 CALENDAR POPUP */}
            {schedulerPost && (
                <SessionScheduler
                    postOwnerName={schedulerPost.userId.name}
                    skillsOffered={schedulerPost.skillsOffered}
                    skillsWanted={schedulerPost.skillsWanted}
                    onSchedule={handleSchedule}
                    onClose={() => setSchedulerPost(null)}
                />
            )}

            <CreatePostModal />
        </div>
    );
};

export default PostsPage;