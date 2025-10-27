import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Get own profile
export const fetchMyProfile = createAsyncThunk(
    "profile/fetchMyProfile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/profile/me");
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch profile"
            );
        }
    }
);

// Get other user's profile
export const fetchUserProfile = createAsyncThunk(
    "profile/fetchUserProfile",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/profile/user/${userId}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch user profile"
            );
        }
    }
);

// Update profile
export const updateProfile = createAsyncThunk(
    "profile/updateProfile",
    async (profileData, { rejectWithValue }) => {
        try {
            const res = await api.put("/profile/update", profileData);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to update profile"
            );
        }
    }
);

// Upload avatar
export const uploadAvatar = createAsyncThunk(
    "profile/uploadAvatar",
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const res = await api.post("/upload/avatar", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to upload avatar"
            );
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        myProfile: null,
        userProfile: null,
        loading: false,
        uploading: false,
        error: null,
        successMessage: null,
        isOwner: false,
        activeProfileType: null,
    },
    reducers: {
        clearProfile: (state) => {
            state.myProfile = null;
            state.userProfile = null;
            state.activeProfileType = null;
            state.isOwner = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
        },
        setOwner: (state, action) => {
            state.isOwner = action.payload;
        },
        clearMyProfile: (state) => {
            state.myProfile = null;
            if (state.activeProfileType === 'myProfile') {
                state.activeProfileType = null;
            }
        },
        clearUserProfile: (state) => {
            state.userProfile = null;
            if (state.activeProfileType === 'userProfile') {
                state.activeProfileType = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch my profile
            .addCase(fetchMyProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.myProfile = action.payload.data;
                state.isOwner = true;
                state.userProfile = null;
                state.activeProfileType = 'myProfile';
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.activeProfileType = null;
            })

            // Fetch user profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userProfile = action.payload.data;
                state.isOwner = action.payload.data.isOwner || false;
                state.myProfile = null;
                state.activeProfileType = 'userProfile';
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.activeProfileType = null;
            })

            // Update profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                
                // Update the correct profile
                if (state.activeProfileType === 'myProfile' && state.myProfile) {
                    state.myProfile = {
                        ...state.myProfile,
                        user: { ...state.myProfile.user, ...action.payload.data }
                    };
                } else if (state.activeProfileType === 'userProfile' && state.userProfile) {
                    state.userProfile = {
                        ...state.userProfile,
                        user: { ...state.userProfile.user, ...action.payload.data }
                    };
                }
                
                state.successMessage = action.payload.message || "Profile updated successfully!";
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Upload avatar
            .addCase(uploadAvatar.pending, (state) => {
                state.uploading = true;
                state.error = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.uploading = false;
                // Avatar URL is now available for use in profile update
                state.successMessage = "Avatar uploaded successfully!";
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload;
            });
    },
});

export const { 
    clearProfile, 
    clearError, 
    clearSuccess, 
    setOwner,
    clearMyProfile,
    clearUserProfile 
} = profileSlice.actions;

export default profileSlice.reducer;