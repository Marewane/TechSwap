import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, setPage, clearError, clearSuccess, requestSwap } from "../../../features/posts/postsSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, ChevronLeft, ChevronRight, Loader2, Clock, Calendar } from "lucide-react";
import CreatePostModal from "./components/CreatePostModal";

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
            ?.split(" ")
            ?.map((n) => n[0])
            ?.join("")
            ?.toUpperCase() || "U";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f9fafb] via-white to-[#eef1ff] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Header */}
                <div className="mb-12 text-center">
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-secondary">Marketplace</p>
                    <h1 className="mt-4 text-4xl font-semibold text-foreground">Skill Swap Community</h1>
                    <p className="mt-3 text-base text-foreground/70">
                        Discover premium peers, exchange knowledge, and spend coins where it matters most.
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6 border border-destructive/40 bg-destructive/10 backdrop-blur">
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
                    <Alert variant="destructive" className="mb-6 border border-destructive/40 bg-destructive/10 backdrop-blur">
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
                    <Alert className="mb-6 border border-secondary/40 bg-secondary/15">
                        <AlertDescription className="text-secondary-foreground/80">
                            {swapSuccess}
                        </AlertDescription>
                    </Alert>
                )}

                {loading ? (
                    <div className="py-16 text-center">
                        <Loader2 className="mx-auto mb-4 size-10 animate-spin text-secondary" />
                        <p className="text-sm text-foreground/60">Loading premium swap posts…</p>
                    </div>
                ) : posts?.length === 0 ? (
                    <div className="py-16 text-center">
                        <Card className="mx-auto max-w-md border border-border/50 bg-white/80 p-0 shadow-[0_22px_70px_rgba(46,47,70,0.16)]">
                            <CardContent className="p-10">
                                <Calendar className="mx-auto mb-6 size-12 text-secondary" />
                                <h3 className="text-2xl font-semibold text-foreground">No posts yet</h3>
                                <p className="mt-2 text-sm text-foreground/65">
                                    Be the first to create a premium swap post and unlock 50-coin sessions.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {posts?.map((post) => (
                            <Card
                                key={post?._id}
                                className="flex h-full flex-col overflow-hidden border border-border/50 bg-card/95 p-0 shadow-[0_20px_70px_rgba(46,47,70,0.18)] transition-all duration-300 hover:-translate-y-2"
                            >
                                <CardContent className="flex flex-1 flex-col p-6">
                                    {/* User Info Header */}
                                    <div className="mb-5 flex items-start gap-4">
                                        <Avatar className="size-12 border-2 border-secondary/30">
                                            <AvatarImage src={post?.userId?.avatar || "/default-avatar.png"} alt={post?.userId?.name || "Unknown User"} />
                                            <AvatarFallback className="bg-gradient-to-br from-secondary/40 to-primary/40 text-sm font-semibold text-primary-foreground">
                                                {getInitials(post?.userId?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-lg font-semibold text-foreground">
                                                {post?.userId?.name || "Unknown User"}
                                            </h3>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-foreground/60">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="size-4 fill-secondary text-secondary" />
                                                    <span className="font-semibold">{post?.userId?.rating || "0"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
                                        {post?.title || "Untitled Post"}
                                    </h4>

                                    {/* Description */}
                                    <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/70 line-clamp-3">
                                        {post?.content || "No description provided"}
                                    </p>

                                    {/* Skills Offered */}
                                    <div className="mt-5">
                                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-secondary">Offering</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {post?.skillsOffered?.slice(0, 3).map((skill, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="rounded-full px-3 py-1 text-xs"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {post?.skillsOffered?.length > 3 && (
                                                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                                    +{post.skillsOffered.length - 3}
                                                </Badge>
                                            )}
                                            {(!post?.skillsOffered || post.skillsOffered.length === 0) && (
                                                <span className="text-xs italic text-foreground/50">No skills offered</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills Wanted */}
                                    <div className="mt-4">
                                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-secondary">Wanting</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {post?.skillsWanted?.slice(0, 3).map((skill, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    className="rounded-full border-secondary/40 bg-secondary/10 px-3 py-1 text-xs text-secondary"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {post?.skillsWanted?.length > 3 && (
                                                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                                    +{post.skillsWanted.length - 3}
                                                </Badge>
                                            )}
                                            {(!post?.skillsWanted || post.skillsWanted.length === 0) && (
                                                <span className="text-xs italic text-foreground/50">No skills wanted</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    {post?.availability?.days && post.availability.days.length > 0 && (
                                        <div className="mt-5 rounded-[calc(var(--radius)/1.6)] border border-border/40 bg-white/70 p-4">
                                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                                <Clock className="size-4 text-secondary" />
                                                Availability
                                            </div>
                                            <p className="text-xs text-foreground/70">
                                                <span className="font-medium">{post.availability.days.slice(0, 2).join(", ")}</span>
                                                {post.availability.days.length > 2 && ` +${post.availability.days.length - 2} more`}
                                            </p>
                                            {post.availability.startTime && post.availability.endTime && (
                                                <p className="mt-1 text-xs text-foreground/60">
                                                    {post.availability.startTime} - {post.availability.endTime}
                                                </p>
                                            )}
                                            {post?.timeSlotsAvailable && post.timeSlotsAvailable.length > 0 && (
                                                <p className="mt-1 text-xs font-semibold text-secondary">
                                                    {post.timeSlotsAvailable.length} slots available
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Request Button */}
                                    <div className="mt-auto pt-4">
                                        <Button
                                            className="w-full"
                                            onClick={() => handleRequestSwap(post?._id)}
                                            disabled={requestingSwap === post?._id}
                                        >
                                            {requestingSwap === post?._id ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                    Requesting...
                                                </>
                                            ) : (
                                                "Request Swap"
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
                    <div className="mx-auto mt-14 flex w-full max-w-xl items-center justify-between rounded-[var(--radius)] border border-border/50 bg-white/80 px-6 py-4 shadow-[0_18px_55px_rgba(46,47,70,0.16)]">
                        <Button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="size-4" />
                            Previous
                        </Button>
                        <div className="flex flex-col items-center gap-1 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <span className="text-[10px] text-foreground/50">
                                {posts.length} posts
                            </span>
                        </div>
                        <Button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                )}
            </div>
            <CreatePostModal />
        </div>
    );
};

export default PostsPage;