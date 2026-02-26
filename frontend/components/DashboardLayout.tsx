"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/learning-session", label: "Learn", icon: "school" },
    { href: "/artifacts", label: "Artifacts", icon: "auto_awesome" },
    { href: "/profile", label: "Profile", icon: "person" }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[24px]">auto_stories</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LearnPulse</h1>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-primary/20" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqGNRSWZFYxNdCgCom-bo_IUsfiyD3Xuo7PjOLZtijJ4A5rRfwHaMK-WqUbjevE2_HLCAQe_PJZ0OY2Mflx_j-fNYPlBXlSshN2JvZUm3ijChWwL9eM9Vj0dNQSY8Ch6Dia8-yhe8gRNKg15dg3AI6ECv-dqxgJCB-Bas_Pic0ChBs_-iLbXUPCc467E_ESSDRdBe7M2B5ajetlO1fXeewMZ3lvtRLQUST09BvkKnmEIDwpb2sYDW6MzHyCB7Z9vGEtEcMPQ6V3Ho')"}}></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">Alex Chen</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Career Switcher</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header with User & Notifications */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div></div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
