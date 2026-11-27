"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";

const VALID_ROLES = ["customer", "vendor", "admin"];

function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending } = useSession();

  const [open, setOpen] = useState(false);

  const user = session?.user;

  const role = VALID_ROLES.includes(user?.role) ? user.role : null;

  const base = role ? `/dashboard/${role}` : null;

  const links = role ? DASHBOARD_NAV[role] : [];

  const isAllowed =
    Boolean(role) &&
    (pathname === base ||
      pathname.startsWith(`${base}/`) ||
      pathname === "/dashboard/profile");

  // Authentication and Role Guard
  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (!role) {
      router.replace("/");
      return;
    }

    if (!isAllowed) {
      router.replace(base);
    }
  }, [isPending, user, role, isAllowed, base, router]);

  // Close mobile sidebar after navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isPending || !user || !role || !isAllowed) {
    return <Loader />;
  }

  const sidebar = (
    <nav className="flex flex-col gap-1 p-4">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-nav-muted">
        {role} dashboard
      </p>

      {links.map(({ label, href, icon: Icon }) => {
        const active =
          href === base
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-white"
                : "text-nav-muted hover:bg-accent hover:text-nav-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-border bg-nav text-nav-foreground lg:block">
        {sidebar}
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-dvh w-64 overflow-y-auto bg-nav text-nav-foreground">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="flex h-dvh min-w-0 min-h-0 flex-1 flex-col">
        {/* Mobile Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <span className="font-semibold capitalize">{role} Dashboard</span>
        </div>

        {/* Only Main Content Scrolls */}
        <main className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
