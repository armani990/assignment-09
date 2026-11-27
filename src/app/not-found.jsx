
import Link from "next/link";
import { ArrowLeft, Home, Pizza } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-brand/20 bg-brand/10 text-brand">
          <Pizza className="size-10" />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-brand">
          Page Not Found
        </p>

        <h1 className="mt-3 font-heading text-7xl font-extrabold text-foreground sm:text-8xl">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Oops! This page is missing.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-nav-muted">
          Looks like this page is not on our menu. It may have been moved,
          deleted, or the link might be incorrect.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            <Home className="size-4" />
            Back to Home
          </Link>

          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Browse Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
