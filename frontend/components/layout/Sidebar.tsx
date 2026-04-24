"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  {
    href: "/dashboard", exact: true, label: "Overview",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M8.5 1.5L14.5 7v8.5H11V11H6v4.5H2.5V7L8.5 1.5Z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/paths", label: "Paths",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1.5" y="9.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="9.5" y="9.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    href: "/graph", label: "Explore",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <circle cx="8.5" cy="8.5" r="2" fill="currentColor"/>
        <circle cx="3" cy="3.5"   r="1.75" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="14" cy="3.5"  r="1.75" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="3" cy="13.5"  r="1.75" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="14" cy="13.5" r="1.75" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M4.5 4.5 7 7M12.5 4.5 10 7M4.5 12.5 7 10M12.5 12.5 10 10"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/chat", label: "Chat",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M2 3.5A1.5 1.5 0 013.5 2h10A1.5 1.5 0 0115 3.5v8a1.5 1.5 0 01-1.5 1.5H5.5L2 15.5V3.5Z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
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
    <aside className="flex flex-col w-[248px] min-w-[248px] h-screen bg-canvas border-r border-line sticky top-0">

      {/* Wordmark */}
      <div className="px-5 pt-6 pb-5">
        <span className="text-ink font-semibold text-base tracking-[-0.02em]">LearnPulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const on = active(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-150",
                on
                  ? "bg-ghost text-ink"
                  : "text-dim hover:text-ink hover:bg-ghost/60",
              ].join(" ")}
            >
              <span className={[
                "transition-colors duration-150",
                on ? "text-primary" : "text-dim group-hover:text-ink",
              ].join(" ")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-line space-y-0.5">
        <Link
          href="/profile"
          className={[
            "group flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-150",
            pathname === "/profile"
              ? "bg-ghost text-ink"
              : "text-dim hover:text-ink hover:bg-ghost/60",
          ].join(" ")}
        >
          <span className={[
            "transition-colors duration-150",
            pathname === "/profile" ? "text-primary" : "text-dim group-hover:text-ink",
          ].join(" ")}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <circle cx="8.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 15c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </span>
          Settings
        </Link>

        <button
          type="button"
          onClick={logout}
          className="group w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium text-dim hover:text-ink hover:bg-ghost/60 transition-all duration-150"
        >
          <span className="text-dim group-hover:text-ink transition-colors duration-150">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M10.5 2.5h3a1 1 0 011 1v10a1 1 0 01-1 1h-3"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M7 11.5l3.5-3L7 5"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 8.5H1.5"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
