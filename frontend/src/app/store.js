import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/features/user/userSlice";

const store = configureStore({
  reducer: {
    user: userReducer, // ✅ this must point to your user slice
  },
});

export default store;
