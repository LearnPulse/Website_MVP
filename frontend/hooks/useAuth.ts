"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const LP_TOKEN_KEY = "lp_token";
const LP_USER_ID_KEY = "lp_user_id";
const LP_IS_NEW_KEY = "lp_is_new";

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
        if (res.is_new_user) localStorage.setItem(LP_IS_NEW_KEY, "1");
      })
      .catch(console.error)
      .finally(() => setIsExchanging(false));
  }, [(session as any)?.googleIdToken]);

  function logout() {
    localStorage.removeItem(LP_TOKEN_KEY);
    localStorage.removeItem(LP_USER_ID_KEY);
    localStorage.removeItem(LP_IS_NEW_KEY);
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

export function isNewUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LP_IS_NEW_KEY) === "1";
}

export function clearNewUserFlag(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LP_IS_NEW_KEY);
}
