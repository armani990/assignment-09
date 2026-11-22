
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function SubscriptionCancelPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
      <div className="w-full rounded-3xl border border-border bg-nav p-6 text-center sm:p-10">
        <XCircle className="mx-auto size-16 text-amber-500" />

        <h1 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-sm leading-6 text-nav-muted">
          Your Premium subscription checkout was cancelled.
          No subscription has been activated.
          You can try again whenever you are ready.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/vendor/subscription"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            <RefreshCw className="size-4" />
            Try Again
          </Link>

          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-white transition hover:border-brand"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
