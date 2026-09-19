import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/format";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/urls", label: "My Links", icon: LinkIcon },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            Lx
          </div>
          <span className="text-lg font-semibold text-ink-900">LinkX</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-700 hover:bg-slate-100"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <p className="truncate px-3 text-xs text-slate-400">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-slate-100"
          >
            <LogoutIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
            Lx
          </div>
          <span className="font-semibold text-ink-900">LinkX</span>
        </div>
        <button onClick={handleLogout} className="text-sm font-medium text-ink-700">
          Logout
        </button>
      </div>

      <main className="flex-1 px-4 py-6 pt-20 sm:px-8 sm:py-8 sm:pt-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 6h7v10h-7V10zM4 13h7v7H4v-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 10-7.07-7.07l-1.5 1.5M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 107.07 7.07l1.5-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 14l5-5-5-5m5 5H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
