import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/features/user/userSlice";
import postsReducer from "@/features/posts/postsSlice";
import profileReducer from "@/features/profile/profileSlice";

const store = configureStore({
  reducer: {
    user: userReducer, // ✅ this must point to your user slice
    posts: postsReducer,
    profile: profileReducer,
  },
});

export default store;
