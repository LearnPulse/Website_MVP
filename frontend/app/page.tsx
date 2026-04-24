"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useAuth, getStoredToken, isNewUser } from "@/hooks/useAuth";

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-surface border border-line rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-base font-semibold text-ink mb-1">{title}</p>
        <p className="text-sm text-dim leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-ghost border border-line flex items-center justify-center text-sm font-bold text-dim">
        {n}
      </div>
      <div className="pt-1">
        <p className="text-base font-semibold text-ink mb-1">{title}</p>
        <p className="text-sm text-dim leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { status } = useSession();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    const token = getStoredToken();
    if (!token) return;
    // New users go through onboarding; returning users go straight to dashboard
    router.replace(isNewUser() ? "/onboarding" : "/dashboard");
  }, [isAuthenticated, isLoading, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-line">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-base font-semibold tracking-[-0.02em]">LearnPulse</span>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="h-9 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-150 shadow-subtle"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          AI-powered learning
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Turn any material into
          <br />
          <span className="text-primary">a learning path.</span>
        </h1>
        <p className="text-lg text-dim max-w-xl mx-auto leading-relaxed mb-10">
          Upload your PDFs, notes, or slides. LearnPulse extracts the concepts,
          builds a personalized curriculum, and generates interactive study tools — automatically.
        </p>
        <button
          type="button"
          onClick={() => signIn("google")}
          className="inline-flex items-center gap-3 h-12 px-6 rounded-xl bg-surface border border-line text-sm font-semibold text-ink hover:bg-surface2 hover:border-dim/40 transition-all duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-line">
        <p className="text-xs font-semibold uppercase tracking-widest text-dim text-center mb-12">
          Everything you need to learn faster
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Feature
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L17 6.5v7L10 18l-7-4.5v-7L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M10 2v16M3 6.5l7 4.5 7-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            }
            title="Smart knowledge graph"
            desc="Automatically extracts concepts from your documents and maps how they connect, so you always know what to learn next."
          />
          <Feature
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6 7.5h8M6 10.5h8M6 13.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            }
            title="Interactive study tools"
            desc="Generate cheatsheets, flashcards, quizzes, and diagrams on demand — tailored to your current mastery level."
          />
          <Feature
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 4.5A1.5 1.5 0 014.5 3h11A1.5 1.5 0 0117 4.5v9a1.5 1.5 0 01-1.5 1.5H6.5L3 17.5V4.5Z"
                  stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            }
            title="AI learning assistant"
            desc="Ask questions, get explanations, and explore your materials through a conversational AI grounded in your own documents."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-line">
        <p className="text-xs font-semibold uppercase tracking-widest text-dim text-center mb-12">
          How it works
        </p>
        <div className="max-w-lg mx-auto flex flex-col gap-8">
          <Step n={1} title="Upload your materials" desc="Drop in PDFs, notes, slides — anything you want to learn. LearnPulse handles the rest." />
          <Step n={2} title="Set your learning goal" desc="Tell LearnPulse what you're preparing for. It builds a concept map and orders your path." />
          <Step n={3} title="Study interactively" desc="Work through concepts at your own pace. The AI tracks your mastery and adapts as you go." />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-line">
        <div className="bg-surface border border-line rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink mb-3">Ready to learn smarter?</h2>
          <p className="text-base text-dim mb-8 max-w-md mx-auto leading-relaxed">
            Join LearnPulse and turn your study materials into an intelligent learning experience.
          </p>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-3 h-12 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-150 shadow-subtle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="white" opacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="white" opacity=".9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="white" opacity=".9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="white" opacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Get started free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-dim">
          <span>LearnPulse</span>
          <span>Built for learners who mean it.</span>
        </div>
      </footer>
    </div>
  );
}
