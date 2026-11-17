"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";

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
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const profileRef = useRef(null);

  // Close any open panel after navigating.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    if (!profileOpen) return;

    function handlePointerDown(event) {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setProfileOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  function handleLogout() {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-nav">
      <div className="relative mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" aria-label="PizzaHub home">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-brand">
            <PizzaMark />
          </span>
          <span className="font-heading flex items-baseline gap-1.5 text-[22px] leading-none font-bold tracking-tight">
            <span className="text-white">Pizza</span>
            <span className="text-brand">Hub</span>
          </span>
        </Link>

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

        <div className="hidden items-center gap-6 md:flex">
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-90"
              >
                <span className="font-heading flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {initialsOf(user.name)}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={`size-4 text-nav-muted transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 mt-2 w-52 overflow-hidden rounded-2xl bg-[#262322] p-1.5 shadow-xl ring-1 ring-white/10"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/50">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-white/10" />
                  <Link
                    role="menuitem"
                    href="/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-nav-muted transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Profile
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-nav-muted transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={linkClass(false)}>
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
            {mobileOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

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
            {user ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 pb-2">
                  <span className="font-heading flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {initialsOf(user.name)}
                  </span>
                  <span className="truncate text-sm font-semibold text-white">{user.name}</span>
                </div>
                <Link href="/profile" className="py-2 text-base text-nav-muted hover:text-white">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2 text-left text-base text-nav-muted hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
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
