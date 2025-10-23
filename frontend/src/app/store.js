import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/features/user/userSlice";
import postsReducer from "@/features/posts/postsSlice";

const store = configureStore({
  reducer: {
    user: userReducer, // ✅ this must point to your user slice
    posts: postsReducer,
  },
});

export default store;
