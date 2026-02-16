"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">
                auto_stories
              </span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              LearnPulse
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="size-8 rounded-full bg-slate-300" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-8 pb-32 max-w-md mx-auto w-full">

        {/* Greeting */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold leading-tight">
            Hello, Alex.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Ready to dive back in?
          </p>
        </section>

        {/* Current Focus Card */}
        <section className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Current Focus
          </h3>

          <div className="rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-5">
            <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">
              Data Structures
            </p>
            <h4 className="text-xl font-bold mb-2">
              Linked Lists
            </h4>
            <p className="text-sm text-slate-500 mb-6">
              Subtopic: Singly Linked Lists
            </p>

            <Link href="/session">
              <button className="bg-primary text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-base">
                  play_arrow
                </span>
                Resume Session
              </button>
            </Link>
          </div>
        </section>

        {/* Micro Session Config */}
        <section className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Micro-Session Config
          </h3>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-5">

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                I WANT TO STUDY...
              </label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg py-3 px-4 text-sm">
                <option>Data Structures</option>
                <option>Algorithms</option>
                <option>Operating Systems</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                MY GOAL IS...
              </label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg py-3 px-4 text-sm">
                <option>Review Concepts</option>
                <option>Solve Practice Problems</option>
                <option>Quick Knowledge Check</option>
              </select>
            </div>

            <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined">
                bolt
              </span>
              Start Learning
            </button>
          </div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pb-6 pt-3 px-10 flex justify-between items-center">
        
        <Link href="/" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined font-variation-fill-1">
            home
          </span>
          <span className="text-[10px] font-semibold">Home</span>
        </Link>

        <Link href="/library" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary">
          <span className="material-symbols-outlined">
            menu_book
          </span>
          <span className="text-[10px] font-semibold">Library</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary">
          <span className="material-symbols-outlined">
            person
          </span>
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>

      </nav>
    </div>
  );
}

