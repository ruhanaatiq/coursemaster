"use client";

import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser, finishCheck } from "./store/authSlice";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1) Try localStorage snapshot (optional)
        let localUser = null;
        try {
          const saved = localStorage.getItem("cm_user");
          if (saved) localUser = JSON.parse(saved);
        } catch (e) {}

        if (localUser) {
          dispatch(setUser(localUser));
          return;
        }

        // 2) Fallback to backend cookie check
        const res = await axios.get(`${API_BASE}/api/auth/me`);
        if (res.data?.user) {
          dispatch(setUser(res.data.user));
        } else {
          dispatch(finishCheck());
        }
      } catch (err) {
        dispatch(finishCheck());
      }
    };

    checkAuth();
  }, [dispatch]);

  return children;
}
