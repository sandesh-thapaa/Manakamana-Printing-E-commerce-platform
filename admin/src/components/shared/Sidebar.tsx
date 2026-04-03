"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  UserPlus,
  Package,
  CheckCircle,
  Wallet,
  Settings,
  LogOut,
  Users,
  Layers,
  ListTree,
  BadgeDollarSign,
  FileText,
  Boxes,
  IdCard,
} from "lucide-react";

const navSections = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        title: "Registration Requests",
        href: "/registration-requests",
        icon: UserPlus,
      },
      { title: "Clients", href: "/clients", icon: Users },
      { title: "Designs", href: "/design-approval", icon: CheckCircle },
      { title: "Wallet", href: "/payments", icon: Wallet },
      { title: "Orders", href: "/orders", icon: Package },
      { title: "ID Cards", href: "/idcards", icon: IdCard },
    ],
  },
  {
    label: "Setup",
    items: [
      { title: "Services", href: "/services", icon: FileText },
      { title: "Products", href: "/products", icon: Boxes },
      { title: "Product Fields", href: "/product-fields", icon: ListTree },
      { title: "Pricing", href: "/pricing", icon: BadgeDollarSign },
      { title: "Templates", href: "/templates", icon: Layers },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
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
    <aside className="relative flex h-screen w-64 flex-col border-r border-slate-800/80 bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#0b1220] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,97,255,0.22),transparent_38%)]" />
      <div className="relative flex items-center gap-3 p-6">
        
          <Image
            src="/main-logo.png"
            alt="Manakamana Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        <div>
          <h1 className="text-sm font-bold tracking-tight">MANAKAMANA</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">
            Admin Portal
          </p>
        </div>
      </div>
      <nav className="sidebar-scroll relative flex-1 min-h-0 overflow-y-auto space-y-6 px-4 pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="mb-2 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#0061FF] text-white shadow-lg shadow-[#0061FF]/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="relative mt-auto border-t border-slate-800 p-4">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full bg-slate-700 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKhX-5Q6tlIq6dac6RgcEwGlh0SEQdZ13Qf6Qxaie1sGpWuThZttPi5-nmISb9lVUxoXl4xLipPctss4tmfTdGPWWFmfaAYFk9cM2Uc6Z9HwzclFrcXMCwHDi2RRRTs0dUBRH4CwqcBIrUqTJ7sqAczD3sgUNvsAGagWxsBAGpwmG0Hsd2HvXGv-KTdmtlBQDRBNtjQguJj4Tamh36NzOb4fRVfJU-SBULYRggk9Un24825Gp-ksA9D6Lrp2TmLFiUSpehgtBINDI')",
              }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">Admin User</span>
              <span className="text-[10px] text-slate-500">Super Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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

