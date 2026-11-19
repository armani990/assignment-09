"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSession, signOut } from "@/lib/auth-client";
import { UserRound, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Browse Menu" },
];

function PizzaMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
      <path
        d="M12 3.2 3.6 19.4a1 1 0 0 0 1.2 1.4c2.3-.7 4.7-1 7.2-1s4.9.3 7.2 1a1 1 0 0 0 1.2-1.4L12 3.2Z"
        fill="#fff"
      />
      <circle cx="12" cy="9.6" r="1.15" fill="#ea3d1b" />
      <circle cx="9.4" cy="14.4" r="1.05" fill="#ea3d1b" />
      <circle cx="14.7" cy="14.4" r="1.05" fill="#ea3d1b" />
    </svg>
  );
}

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "PH";

  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function linkClass(active) {
  return `text-[15px] transition-colors ${
    active ? "text-brand" : "text-nav-muted hover:text-white"
  }`;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await signOut();
      setMobileOpen(false);
      toast.success("Logged out successfully.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-nav">
      <div className="relative mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="PizzaHub home"
        >
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-brand">
            <PizzaMark />
          </span>

          <span className="font-heading flex items-baseline gap-1.5 text-[22px] leading-none font-bold tracking-tight">
            <span className="text-white">Pizza</span>
            <span className="text-brand">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-6 md:flex">
          {isPending ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-90"
                aria-label="Open profile menu"
              >
                <Avatar className="size-9 border border-white/10">
                  <AvatarImage
                    src={user.image || ""}
                    alt={user.name || "User"}
                  />

                  <AvatarFallback className="bg-brand font-heading text-sm font-bold text-white">
                    {initialsOf(user.name)}
                  </AvatarFallback>
                </Avatar>

                <ChevronDown className="size-4 text-nav-muted" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 border-white/10 bg-[#262322] text-white"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-semibold">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-white/50">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="cursor-pointer text-nav-muted focus:bg-white/5 focus:text-white"
                >
                  <UserRound className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-nav-muted focus:bg-white/5 focus:text-white"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/signin" className={linkClass(false)}>
                Sign In
              </Link>

              <Link
                href="/signup"
                className="rounded-full bg-brand px-6 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-lg text-white md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-nav px-5 pt-2 pb-6 md:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`py-3 text-base transition-colors ${
                    active ? "text-brand" : "text-nav-muted hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 border-t border-white/10 pt-4">
            {isPending ? null : user ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 pb-2">
                  <Avatar className="size-9 border border-white/10">
                    <AvatarImage
                      src={user.image || ""}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback className="bg-brand font-heading text-sm font-bold text-white">
                      {initialsOf(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-white/50">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-2 text-base text-nav-muted hover:text-white"
                >
                  <UserRound className="size-4" />
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 text-left text-base text-nav-muted hover:text-white"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/signin"
                  className="rounded-full border border-white/20 px-5 py-2.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-white/5"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="rounded-full bg-brand px-5 py-2.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
