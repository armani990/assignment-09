
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, authClient } from "@/lib/auth-client";
import {
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Crown,
  ArrowRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getAuthToken() {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  return data.token;
}

export default function SubscriptionSuccessPage() {
  const { data: session, isPending } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);

  const checkSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("API base URL is not configured.");
      }

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to verify subscription.");
      }

      setSubscription({
        plan: result.subscriptionPlan || "free",
        expiresAt: result.subscriptionExpiresAt || null,
      });
    } catch (err) {
      setError(err.message || "Could not verify subscription.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session?.user) {
      checkSubscription();
    }
  }, [isPending, session?.user, checkSubscription]);

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoaderCircle className="size-10 animate-spin text-brand" />
        <p className="text-sm text-nav-muted">
          Verifying your subscription...
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
      <div className="w-full rounded-3xl border border-border bg-nav p-6 text-center sm:p-10">
        {error ? (
          <>
            <RefreshCw className="mx-auto size-14 text-nav-muted" />
            <h1 className="mt-5 text-2xl font-bold text-white">
              Verification Unavailable
            </h1>
            <p className="mt-3 text-sm text-nav-muted">{error}</p>
          </>
        ) : isPremium ? (
          <>
            <CheckCircle2 className="mx-auto size-16 text-green-500" />

            <h1 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
              Subscription Activated!
            </h1>

            <p className="mt-3 text-sm leading-6 text-nav-muted">
              Your PizzaHub Premium subscription is now active.
              Enjoy unlimited active menu items!
            </p>

            <div className="mt-7 rounded-2xl border border-brand/30 bg-brand/10 p-5">
              <Crown className="mx-auto size-8 text-brand" />
              <h2 className="mt-2 text-lg font-bold text-white">
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
            <LoaderCircle className="mx-auto size-14 animate-spin text-brand" />

            <h1 className="mt-5 text-2xl font-bold text-white">
              Payment Received
            </h1>

            <p className="mt-3 text-sm leading-6 text-nav-muted">
              Your payment was submitted successfully. We are waiting
              for Stripe to confirm your subscription. Please check
              again in a few moments.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {!isPremium && (
            <button
              type="button"
              onClick={checkSubscription}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-white transition hover:border-brand disabled:opacity-50"
            >
              <RefreshCw className="size-4" />
              Check Status
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
