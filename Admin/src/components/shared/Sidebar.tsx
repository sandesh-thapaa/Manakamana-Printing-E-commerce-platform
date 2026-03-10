"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Package,
  CheckCircle,
  Library,
  Settings,
  Printer,
  LogOut,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Registration Requests", href: "/registration-requests", icon: UserPlus },
  { title: "Order Management", href: "/orders", icon: Package },
  { title: "Design Approval", href: "/design-approval", icon: CheckCircle },
  { title: "Template Library", href: "/template-library", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#0F172A]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0061FF] shadow-lg shadow-blue-600/30">
          <Printer className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">MANAKAMANA</h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Print Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#0061FF] text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span className="truncate">{item.title}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}

        <div className="mt-6 mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          System
        </div>
        <Link
          href="/settings"
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
            pathname === "/settings"
              ? "bg-[#0061FF] text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
          )}
        >
          <Settings
            className={cn(
              "h-4.5 w-4.5 shrink-0",
              pathname === "/settings" ? "text-white" : "text-slate-500 group-hover:text-slate-300"
            )}
          />
          <span>Settings</span>
          {pathname === "/settings" && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
          )}
        </Link>
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div
            className="h-8 w-8 shrink-0 rounded-full bg-slate-700 bg-cover bg-center ring-2 ring-white/10"
            style={{
              backgroundImage:
                "url('https://i.pravatar.cc/64?u=admin-manakamana')",
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">Admin User</p>
            <p className="truncate text-[10px] text-slate-500">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-slate-300"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
