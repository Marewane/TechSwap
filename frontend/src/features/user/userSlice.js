// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

// register: returns { userId, email }
export const registerUser = createAsyncThunk(
  "user/register",
  async (payload, thunkAPI) => {
    try {
      const res = await api.post("/auth/register", payload);
      return res.data.data; // { userId, email }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// verify email: returns { user, tokens }
export const verifyEmail = createAsyncThunk(
  "user/verifyEmail",
  async (payload, thunkAPI) => {
    try {
      const res = await api.post("/auth/verify-email", payload);
      return res.data.data; // { user, tokens }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// resend code
export const resendVerification = createAsyncThunk(
  "user/resendVerification",
  async (payload, thunkAPI) => {
    try {
      const res = await api.post("/auth/resend-verification", payload);
      return res.data.data; // { userId, email }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// login: returns { user, tokens }
export const loginUser = createAsyncThunk(
  "user/login",
  async (payload, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", payload);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  user: null,
  tokens: null,
  loading: false,
  error: null,
};

const loadFromStorage = () => {
  const raw = localStorage.getItem("auth");
  if (!raw) return initialState;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      user: parsed.user || null,
      tokens: parsed.tokens || null,
    };
  } catch {
    return initialState;
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: loadFromStorage(),
  reducers: {
    logout(state) {
      state.user = null;
      state.tokens = null;
      localStorage.removeItem("auth");
    },
    setAuth(state, action) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      localStorage.setItem("auth", JSON.stringify(action.payload));
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s) => { s.loading = false; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(verifyEmail.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(verifyEmail.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.tokens = a.payload.tokens;
        localStorage.setItem("auth", JSON.stringify({ user: a.payload.user, tokens: a.payload.tokens }));
      })
      .addCase(verifyEmail.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(resendVerification.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(resendVerification.fulfilled, (s) => { s.loading = false; })
      .addCase(resendVerification.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.tokens = a.payload.tokens;
        localStorage.setItem("auth", JSON.stringify({ user: a.payload.user, tokens: a.payload.tokens }));
      })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { logout, setAuth } = userSlice.actions;
export default userSlice.reducer;
