"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getStoredToken } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !getStoredToken()) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
