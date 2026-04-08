"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 18v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PathsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="6" height="6" rx="1" strokeLinecap="round" />
      <rect x="3" y="11" width="6" height="6" rx="1" strokeLinecap="round" />
      <rect x="11" y="3" width="6" height="6" rx="1" strokeLinecap="round" />
      <rect x="11" y="11" width="6" height="6" rx="1" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="7" r="3" strokeLinecap="round" />
      <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
    </svg>
  );
}

function GraphIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="4"  cy="5"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="5"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4"  cy="15" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="1.5" fill="currentColor" stroke="none" />
      <path d="M5.2 6.2l3.4 2.8M14.8 6.2l-3.4 2.8M5.2 13.8l3.4-2.8M14.8 13.8l-3.4-2.8" strokeWidth="1" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 14l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 10H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home",          icon: <HomeIcon />, exact: true },
  { href: "/paths",     label: "My paths",      icon: <PathsIcon /> },
  { href: "/graph",     label: "Knowledge graph", icon: <GraphIcon /> },
  { href: "/chat",      label: "Chat",           icon: <ChatIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="flex flex-col w-[220px] min-w-[220px] h-screen bg-[#0d1117] border-r border-slate-800 sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-slate-800/60">
        <span className="text-primary font-bold text-base tracking-tight">LearnPulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              isActive(item)
                ? "bg-primary/10 text-primary"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
            ].join(" ")}
          >
            <span className={isActive(item) ? "text-primary" : "text-slate-500"}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom: profile + sign out */}
      <div className="px-3 py-4 border-t border-slate-800/60 space-y-0.5">
        <Link
          href="/profile"
          className={[
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            pathname === "/profile"
              ? "bg-primary/10 text-primary"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
          ].join(" ")}
        >
          <span className={pathname === "/profile" ? "text-primary" : "text-slate-500"}>
            <ProfileIcon />
          </span>
          Profile
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
        >
          <span className="text-slate-500">
            <SignOutIcon />
          </span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
