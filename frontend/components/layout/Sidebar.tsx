"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  {
    href: "/dashboard", exact: true, label: "Overview",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1L13 6v8H9.5V9.5h-4V14H2V6L7.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/paths", label: "Paths",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: "/graph", label: "Graph",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
        <circle cx="2.5" cy="3"   r="1.5" fill="currentColor"/>
        <circle cx="12.5" cy="3"  r="1.5" fill="currentColor"/>
        <circle cx="2.5" cy="12"  r="1.5" fill="currentColor"/>
        <circle cx="12.5" cy="12" r="1.5" fill="currentColor"/>
        <path d="M3.8 4l2.8 2.5M11.2 4l-2.8 2.5M3.8 11l2.8-2.5M11.2 11l-2.8-2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/chat", label: "Chat",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1.5 3A1.5 1.5 0 013 1.5h9A1.5 1.5 0 0113.5 3v7A1.5 1.5 0 0112 11.5H5l-3.5 2.5V3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  function active(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex flex-col w-[200px] min-w-[200px] h-screen bg-canvas border-r border-line sticky top-0">

      {/* Wordmark */}
      <div className="px-5 py-5">
        <span className="text-ink font-bold text-[15px] tracking-[-0.03em]">LearnPulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-px">
        {NAV.map((item) => {
          const on = active(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-2.5 px-3 h-8 rounded text-sm transition-colors",
                on
                  ? "bg-surface text-ink font-medium"
                  : "text-dim hover:text-ink hover:bg-surface/60",
              ].join(" ")}
            >
              <span className={on ? "text-primary" : "text-ghost group-hover:text-dim"}>
                {item.icon}
              </span>
              {item.label}
              {on && <span className="ml-auto w-1 h-4 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-2 border-t border-line space-y-px">
        <Link
          href="/profile"
          className={[
            "group flex items-center gap-2.5 px-3 h-8 rounded text-sm transition-colors",
            pathname === "/profile"
              ? "bg-surface text-ink font-medium"
              : "text-dim hover:text-ink hover:bg-surface/60",
          ].join(" ")}
        >
          <span className={pathname === "/profile" ? "text-primary" : "text-ghost group-hover:text-dim"}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          Settings
        </Link>
        <button
          type="button"
          onClick={logout}
          className="group w-full flex items-center gap-2.5 px-3 h-8 rounded text-sm text-dim hover:text-ink hover:bg-surface/60 transition-colors"
        >
          <span className="text-ghost group-hover:text-dim">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M9 2h3.5a.5.5 0 01.5.5v10a.5.5 0 01-.5.5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M6 10l3-2.5L6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 7.5H1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
