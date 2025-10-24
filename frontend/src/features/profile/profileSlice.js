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

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        // Current user's profile data
        myProfile: null,
        // Other user's profile data (when viewing someone else's profile)
        userProfile: null,
        loading: false,
        error: null,
        successMessage: null,
        isOwner: false,
        // Track which profile is currently active
        activeProfileType: null, // 'myProfile' or 'userProfile'
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
        // Clear only the specific profile type
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
                state.userProfile = null; // Clear other user's profile
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
                state.myProfile = null; // Clear my profile
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
                
                // Update the correct profile based on what's currently active
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

// Selectors for easier state access
export const selectProfile = (state) => {
    const { myProfile, userProfile, activeProfileType } = state.profile;
    return activeProfileType === 'myProfile' ? myProfile : userProfile;
};

export const selectIsOwner = (state) => state.profile.isOwner;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectProfileSuccess = (state) => state.profile.successMessage;

export default profileSlice.reducer;