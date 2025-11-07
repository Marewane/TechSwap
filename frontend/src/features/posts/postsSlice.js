import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

export const fetchPosts = createAsyncThunk(
    "posts/fetchPosts",
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/posts?page=${page}&limit=${limit}`);
            return res.data; // Expected: { posts, totalPages, page, total }
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch posts"
            );
        }
    }
);

export const createPost = createAsyncThunk(
    "posts/createPost",
    async (postData, { rejectWithValue }) => {
        try {
            const res = await api.post("/posts", postData);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to create post"
            );
        }
    }
);

export const requestSwap = createAsyncThunk(
    "posts/requestSwap",
    async ({ postId, scheduledTime, duration }, { rejectWithValue }) => {
        try {
            const res = await api.post("/swap-requests", {
                postId,
                scheduledTime,
                duration
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to request swap"
            );
        }
    }
);

export const updatePost = createAsyncThunk(
    "posts/updatePost",
    async ({ postId, updates }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/posts/${postId}`, updates);
            return res.data; // { success, data: updatedPost }
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to update post"
            );
        }
    }
);

const postsSlice = createSlice({
    name: "posts",
    initialState: {
        posts: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 8,
        successMessage: null,
        requestingSwap: null,
        swapError: null,
        swapSuccess: null,
    },
    reducers: {
        setPage: (state, action) => {
            state.currentPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
            state.swapError = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
            state.swapSuccess = null;
        },
        postAdded: (state, action) => {
            const newPost = action.payload;
            if (!newPost?._id) return;

            const existingIndex = state.posts.findIndex((post) => post._id === newPost._id);
            if (existingIndex !== -1) {
                state.posts[existingIndex] = { ...state.posts[existingIndex], ...newPost };
                return;
            }

            if (state.currentPage === 1) {
                state.posts.unshift(newPost);
                if (state.posts.length > state.limit) {
                    state.posts.pop();
                }
            }

            if (typeof state.total === "number") {
                state.total += 1;
            }
        },
        postUpdated: (state, action) => {
            const updatedPost = action.payload;
            if (!updatedPost?._id) return;

            const index = state.posts.findIndex((post) => post._id === updatedPost._id);
            if (index !== -1) {
                state.posts[index] = { ...state.posts[index], ...updatedPost };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch posts
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload.posts || [];
                state.totalPages = action.payload.totalPages || 1;
                state.currentPage = action.payload.page || 1;
                state.total = action.payload.total || 0;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create post
            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // Create post
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                const newPost = action.payload.data || action.payload;
                if (newPost) {
                    state.posts.unshift({
                        skillsOffered: [],
                        skillsWanted: [],
                        availability: { days: [] },
                        ...newPost
                    });
                }
                state.successMessage = "Post created successfully!";
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Request swap
            .addCase(requestSwap.pending, (state, action) => {
                state.requestingSwap = action.meta.arg;
                state.swapError = null;
            })
            .addCase(requestSwap.fulfilled, (state) => {
                state.requestingSwap = null;
                state.swapSuccess = "Swap request sent successfully!";
            })
            .addCase(requestSwap.rejected, (state, action) => {
                state.requestingSwap = null;
                state.swapError = action.payload;
            });

        // Update post
        builder
            .addCase(updatePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.data || action.payload;
                if (!updated?._id) return;
                const idx = state.posts.findIndex(p => p._id === updated._id);
                if (idx !== -1) {
                    state.posts[idx] = { ...state.posts[idx], ...updated };
                }
                state.successMessage = "Post updated successfully!";
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setPage, clearError, clearSuccess, postAdded, postUpdated } = postsSlice.actions;
export default postsSlice.reducer;