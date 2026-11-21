'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

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

export default function Footer() {
  const pathname = usePathname();

  const hiddenRoutes = [
    "/signin",
    "/signup",
  ];

  if (
    pathname.startsWith("/dashboard") ||
    hiddenRoutes.includes(pathname)
  ) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#171514] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              aria-label="PizzaHub home"
              className="inline-flex items-center gap-2.5"
            >
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand">
                <PizzaMark />
              </span>

              <span className="font-heading flex items-baseline gap-1 text-2xl font-bold tracking-tight">
                <span>Pizza</span>
                <span className="text-brand">Hub</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-nav-muted">
              Your favorite pizza, made fresh and delivered to your door.
              Explore our menu and find your next favorite slice.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Explore Menu
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-heading text-base font-bold">
              Explore
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-nav-muted">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-brand"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/menu"
                  className="transition-colors hover:text-brand"
                >
                  Browse Menu
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-heading text-base font-bold">
              Your Account
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-nav-muted">
              <li>
                <Link
                  href="/signin"
                  className="transition-colors hover:text-brand"
                >
                  Sign In
                </Link>
              </li>

              <li>
                <Link
                  href="/signup"
                  className="transition-colors hover:text-brand"
                >
                  Create Account
                </Link>
              </li>

              <li>
                <Link
                  href="/menu"
                  className="transition-colors hover:text-brand"
                >
                  Order Pizza
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-center text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} PizzaHub. All rights reserved.
          </p>

          <p>
            Made for pizza lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
