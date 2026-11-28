"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Crown,
  Check,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getAuthToken() {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  return data.token;
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function VendorSubscriptionPage() {
  const [subscription, setSubscription] = useState({
    plan: "free",
    expiresAt: null,
    cancelAtPeriodEnd: false,
  });

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);

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
        throw new Error(
          result.message || "Failed to load subscription details."
        );
      }

      setSubscription({
        plan: result.subscriptionPlan || "free",
        expiresAt: result.subscriptionExpiresAt || null,
        cancelAtPeriodEnd:
          result.subscriptionCancelAtPeriodEnd || false,
      });
    } catch (error) {
      toast.error(error.message || "Failed to load subscription.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const isPremiumActive =
    subscription.plan === "premium" &&
    subscription.expiresAt &&
    new Date(subscription.expiresAt) > new Date();

  async function handleCancelSubscription() {
    try {
      setCancelLoading(true);

      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/vendor/subscription/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to cancel subscription."
        );
      }

      toast.success(
        result.message || "Subscription cancellation scheduled."
      );

      setShowCancelConfirm(false);
      await loadSubscription();
    } catch (error) {
      toast.error(error.message || "Unable to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleUpgrade() {
    try {
      setCheckoutLoading(true);

      if (!API_URL) {
        throw new Error("API base URL is not configured.");
      }

      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/vendor/subscription/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to create checkout session."
        );
      }

      if (!result.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(result.url);
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <LoaderCircle className="size-9 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Subscription Plans
          </h1>

          <p className="mt-2 text-sm text-nav-muted">
            Choose the right plan to grow your pizza business.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSubscription}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Current Subscription */}
      <div className="rounded-2xl border border-border bg-nav p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${
                isPremiumActive
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-muted text-nav-muted"
              }`}
            >
              {isPremiumActive ? (
                <Crown className="size-7" />
              ) : (
                <ShieldCheck className="size-7" />
              )}
            </div>

            <div>
              <p className="text-sm text-nav-muted">
                Your Current Plan
              </p>

              <h2 className="mt-1 text-2xl font-extrabold capitalize text-foreground">
                {isPremiumActive ? "Premium" : "Free"}
              </h2>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  isPremiumActive
                    ? "bg-green-500/10 text-green-400"
                    : "bg-border text-nav-muted"
                }`}
              >
                {isPremiumActive ? "Active Subscription" : "Free Plan"}
              </span>
            </div>
          </div>

          {isPremiumActive && (
            <div className="space-y-3 sm:text-right">
              <div>
                <p className="text-sm text-nav-muted">
                  Subscription Expires
                </p>

                <p className="mt-1 font-semibold text-foregrounds">
                  {formatDate(subscription.expiresAt)}
                </p>
              </div>

              {subscription.cancelAtPeriodEnd ? (
                <p className="text-sm font-semibold text-amber-400">
                  Cancellation Scheduled
                </p>
              ) : showCancelConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm text-amber-400">
                    Are you sure you want to cancel your subscription?
                    Premium access will remain active until the expiry
                    date.
                  </p>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelLoading}
                      className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      Keep Subscription
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                    >
                      {cancelLoading
                        ? "Cancelling..."
                        : "Confirm Cancel"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Free Plan */}
        <div className="flex flex-col rounded-2xl border border-border bg-nav p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-nav-muted">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">
                Free Plan
              </h2>
              <p className="text-sm text-nav-muted">
                Get started with PizzaHub
              </p>
            </div>
          </div>

          <div className="mt-7">
            <span className="text-4xl font-extrabold text-foreground">
              $0
            </span>
            <span className="ml-2 text-sm text-nav-muted">
              / forever
            </span>
          </div>

          <div className="my-7 h-px bg-border" />

          <ul className="flex-1 space-y-4 text-sm text-nav-muted">
            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-green-500" />
              Create up to 3 active menu items
            </li>

            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-green-500" />
              Manage customer orders
            </li>

            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-green-500" />
              Access vendor dashboard
            </li>

            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-green-500" />
              Basic business management
            </li>
          </ul>

          <div className="mt-8">
            {!isPremiumActive ? (
              <div className="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-nav-muted">
                Your Current Plan
              </div>
            ) : (
              <div className="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-nav-muted">
                Free Plan
              </div>
            )}
          </div>
        </div>

        {/* Premium Plan */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 sm:p-8">
          <div className="absolute right-5 top-5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">
            PREMIUM
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Crown className="size-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">
                Premium Plan
              </h2>
              <p className="text-sm text-nav-muted">
                Grow without limits
              </p>
            </div>
          </div>

          <div className="mt-7">
            <span className="text-4xl font-extrabold text-foreground">
              $9.99
            </span>
            <span className="ml-2 text-sm text-nav-muted">
              / month
            </span>
          </div>

          <div className="my-7 h-px bg-border" />

          <ul className="flex-1 space-y-4 text-sm text-nav-muted">
            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-amber-400" />
              Unlimited active menu items
            </li>

            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-amber-400" />
              Manage customer orders
            </li>

            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-amber-400" />
              Full vendor dashboard access
            </li>

            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-amber-400" />
              Expand your restaurant menu
            </li>

            <li className="flex items-center gap-3">
              <Check className="size-4 shrink-0 text-amber-400" />
              Monthly recurring subscription
            </li>
          </ul>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={checkoutLoading || Boolean(isPremiumActive)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutLoading ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : isPremiumActive ? (
                <Check className="size-5" />
              ) : (
                <Zap className="size-5" />
              )}

              {checkoutLoading
                ? "Redirecting to Checkout..."
                : isPremiumActive
                  ? "Premium Active"
                  : "Upgrade to Premium"}

              {!checkoutLoading && !isPremiumActive && (
                <ArrowRight className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-nav p-5">
        <CreditCard className="mt-0.5 size-5 shrink-0 text-brand" />

        <div>
          <h3 className="font-semibold text-foreground">
            Secure Payments
          </h3>

          <p className="mt-1 text-sm leading-6 text-nav-muted">
            Payments are securely processed through Stripe Checkout.
            Your Premium subscription is activated only after the
            payment is verified by our payment server.
          </p>
        </div>
      </div>
    </section>
  );
}