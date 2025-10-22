import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

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
    async (postId, { rejectWithValue }) => {
        try {
            const res = await api.post(`/posts/${postId}/request-swap`);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to request swap"
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
    },
});

export const { setPage, clearError, clearSuccess } = postsSlice.actions;
export default postsSlice.reducer;