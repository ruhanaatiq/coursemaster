"use client";

import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    checkingAuth: true, // 👈 important
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.checkingAuth = false;

      if (typeof window !== "undefined") {
        localStorage.setItem("cm_user", JSON.stringify(action.payload));
      }
    },
    finishCheck(state) {
      // called when we know there is NO logged-in user
      state.checkingAuth = false;
    },
    logout(state) {
      state.user = null;
      state.checkingAuth = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("cm_user");
      }
    },
  },
});

export const { setUser, finishCheck, logout } = authSlice.actions;
export default authSlice.reducer;
