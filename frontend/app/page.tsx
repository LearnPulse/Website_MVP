"use client";

import { useSession, signIn } from "next-auth/react";

export default function RootPage() {
  const { status } = useSession();

  if (status === "loading") return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-semibold text-primary">LearnPulse</h1>

      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 border rounded-lg"
      >
        Continue with Google
      </button>
    </div>
  );
}
