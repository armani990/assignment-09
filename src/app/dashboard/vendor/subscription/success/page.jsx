
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession, authClient } from "@/lib/auth-client";
import {
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Crown,
  ArrowRight,
  XCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { data: session, isPending } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);

  const verifySubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!sessionId) {
        throw new Error("Stripe checkout session ID is missing.");
      }

      if (!API_URL) {
        throw new Error("API base URL is not configured.");
      }

      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Authentication failed. Please sign in again.");
      }

      const response = await fetch(
        `${API_URL}/vendor/subscription/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({
            sessionId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Subscription verification failed."
        );
      }

      setSubscription({
        plan: result.subscriptionPlan,
        expiresAt: result.subscriptionExpiresAt,
      });
    } catch (err) {
      setError(err.message || "Could not verify subscription.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isPending && session?.user) {
      verifySubscription();
    }
  }, [isPending, session?.user, verifySubscription]);

  if (isPending || (loading && !error)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoaderCircle className="size-10 animate-spin text-brand" />
        <p className="text-sm text-nav-muted">
          Verifying your Premium subscription...
        </p>
      </div>
    );
  }

  if (!session?.user) return null;

  const isPremium =
    subscription?.plan === "premium" &&
    subscription?.expiresAt &&
    new Date(subscription.expiresAt).getTime() > Date.now();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
      <div className="w-full rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
        {error ? (
          <>
            <XCircle className="mx-auto size-16 text-red-500" />

            <h1 className="mt-5 text-2xl font-bold text-foreground">
              Verification Failed
            </h1>

            <p className="mt-3 text-sm leading-6 text-nav-muted">
              {error}
            </p>
          </>
        ) : isPremium ? (
          <>
            <CheckCircle2 className="mx-auto size-16 text-green-500" />

            <h1 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
              Subscription Activated!
            </h1>

            <p className="mt-3 text-sm leading-6 text-nav-muted">
              Your PizzaHub Premium subscription is now active.
              Enjoy unlimited active menu items!
            </p>

            <div className="mt-7 rounded-2xl border border-brand/30 bg-brand/10 p-5">
              <Crown className="mx-auto size-8 text-brand" />

              <h2 className="mt-2 text-lg font-bold text-foreground">
                Premium Plan
              </h2>

              <p className="mt-2 text-sm text-nav-muted">
                Valid until:{" "}
                {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="mx-auto size-14 text-red-500" />

            <h1 className="mt-5 text-2xl font-bold text-foreground">
              Subscription Not Active
            </h1>

            <p className="mt-3 text-sm leading-6 text-nav-muted">
              Your payment was verified, but the Premium subscription
              is not currently active.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {!isPremium && (
            <button
              type="button"
              onClick={verifySubscription}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Try Verification Again
            </button>
          )}

          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
          >
            Go to Dashboard
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
