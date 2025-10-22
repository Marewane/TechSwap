import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, setPage, clearError, clearSuccess, requestSwap } from "../features/posts/postsSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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

    const handleRequestSwap = (postId) => {
        dispatch(requestSwap(postId));
    };

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto px-4">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
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
                    <Alert variant="destructive" className="mb-4">
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
                    <Alert className="mb-4 border-green-500 bg-green-50">
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
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No posts available</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {posts.map((post) => (
                            <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    {/* User Info Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <Avatar className="w-14 h-14">
                                            <AvatarImage src={post.userId?.avatar || "/default-avatar.png"} alt={post.userId?.name || "Unknown User"} />
                                            <AvatarFallback className="bg-gray-400 text-white">
                                                {getInitials(post.userId?.name || "U")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {post.userId?.name || "Unknown User"}
                                            </h2>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                                                    <span className="font-medium">{post.userId?.rating || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills Offered */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Offering:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {post.skillsOffered.map((skill, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="bg-gray-600 text-white hover:bg-gray-700"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skills Wanted */}
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Wanting:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {post.skillsWanted.map((skill, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    className="border-gray-400 text-gray-700"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                                    {/* Availability */}
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {post.availability.map((slot) => slot.day).join(" & ")}
                                        </p>
                                    </div>

                                    {/* Request Button */}
                                    <Button
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium"
                                        onClick={() => handleRequestSwap(post._id)}
                                        disabled={requestingSwap === post._id}
                                    >
                                        {requestingSwap === post._id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Requesting...
                                            </>
                                        ) : (
                                            'Request Swap'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && posts.length > 0 && (
                    <div className="flex items-center justify-between mt-8 px-2">
                        <Button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostsPage;