"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const LP_TOKEN_KEY = "lp_token";
const LP_USER_ID_KEY = "lp_user_id";

export function useAuth() {
  const { data: session, status } = useSession();
  const [isExchanging, setIsExchanging] = useState(false);

  const isLoading = status === "loading" || isExchanging;
  const isAuthenticated = !!session;

  // On first sign-in, exchange Google ID token for backend JWT
  useEffect(() => {
    const googleIdToken = (session as any)?.googleIdToken;
    if (!googleIdToken || getStoredToken()) return;

    setIsExchanging(true);
    apiClient
      .googleAuth(googleIdToken)
      .then((res) => {
        localStorage.setItem(LP_TOKEN_KEY, res.access_token);
        localStorage.setItem(LP_USER_ID_KEY, res.user_id);
      })
      .catch(console.error)
      .finally(() => setIsExchanging(false));
  }, [(session as any)?.googleIdToken]);

  function logout() {
    localStorage.removeItem(LP_TOKEN_KEY);
    localStorage.removeItem(LP_USER_ID_KEY);
    signOut({ callbackUrl: "/" });
  }

  return {
    session,
    isLoading,
    isAuthenticated,
    userId: getUserId(),
    login: () => signIn("google"),
    logout,
  };
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LP_TOKEN_KEY);
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LP_USER_ID_KEY);
}
