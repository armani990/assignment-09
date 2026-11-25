"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  ClipboardList,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  LoaderCircle,
  Crown,
  CalendarDays,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-green-500/10 text-green-500",
  accepted: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  inactive: "bg-gray-500/10 text-gray-400",
  cancelled: "bg-gray-500/10 text-gray-400",
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ label, count, icon: Icon, color, background }) {
  return (
    <div className="rounded-2xl border border-border bg-nav p-5 transition hover:border-brand/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-nav-muted">{label}</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{count}</p>
        </div>

        <div
          className={`flex size-12 items-center justify-center rounded-xl ${background} ${color}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

async function getAuthToken() {
  const { data } = await authClient.token();

  if (!data?.token) {
    throw new Error("Authentication token not found. Please sign in again.");
  }

  return data.token;
}

export default function VendorOverviewPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscription, setSubscription] = useState({
    plan: "free",
    expiresAt: null,
    cancelAtPeriodEnd: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("API base URL is not configured.");
      }

      const token = await getAuthToken();

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [menuResponse, orderResponse, profileResponse] =
        await Promise.all([
          fetch(`${API_URL}/vendor/menu-items`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/vendor/orders`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_URL}/profile`, {
            headers,
            cache: "no-store",
          }),
        ]);

      const [menuData, orderData, profileData] = await Promise.all([
        menuResponse.json(),
        orderResponse.json(),
        profileResponse.json(),
      ]);

      if (!menuResponse.ok) {
        throw new Error(
          menuData.message || "Failed to load menu items."
        );
      }

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message || "Failed to load customer orders."
        );
      }

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Failed to load subscription details."
        );
      }

      setMenuItems(Array.isArray(menuData) ? menuData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);

      setSubscription({
        plan: profileData.subscriptionPlan || "free",
        expiresAt: profileData.subscriptionExpiresAt || null,
        cancelAtPeriodEnd:
          profileData.subscriptionCancelAtPeriodEnd || false,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = [
    {
      label: "Total Menu Items",
      count: menuItems.length,
      icon: UtensilsCrossed,
      color: "text-brand",
      background: "bg-brand/10",
    },
    {
      label: "Approved Menu Items",
      count: menuItems.filter((item) => item.status === "approved").length,
      icon: CheckCircle,
      color: "text-green-500",
      background: "bg-green-500/10",
    },
    {
      label: "Pending Menu Items",
      count: menuItems.filter((item) => item.status === "pending").length,
      icon: Clock,
      color: "text-amber-500",
      background: "bg-amber-500/10",
    },
    {
      label: "Accepted Orders",
      count: orders.filter((order) => order.status === "accepted").length,
      icon: ClipboardList,
      color: "text-green-500",
      background: "bg-green-500/10",
    },
    {
      label: "Pending Orders",
      count: orders.filter((order) => order.status === "pending").length,
      icon: Clock,
      color: "text-amber-500",
      background: "bg-amber-500/10",
    },
  ];

  const isPremiumActive =
    subscription.plan === "premium" &&
    subscription.expiresAt &&
    new Date(subscription.expiresAt) > new Date();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="size-9 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Vendor Overview
          </h1>

          <p className="mt-2 text-sm text-nav-muted">
            Manage your menu and keep track of customer orders.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-white transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          <p>{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="font-semibold underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Subscription Overview */}
      <div className="rounded-2xl border border-border bg-nav p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 items-center justify-center rounded-xl ${
                isPremiumActive
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-white/5 text-nav-muted"
              }`}
            >
              <Crown size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Subscription Overview
              </h2>

              <p className="mt-1 text-sm text-nav-muted">
                Your current vendor subscription details.
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              isPremiumActive
                ? "bg-amber-500/10 text-amber-400"
                : "bg-white/10 text-nav-muted"
            }`}
          >
            {isPremiumActive ? "PREMIUM" : "FREE PLAN"}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-sm text-nav-muted">Current Plan</p>

            <p className="mt-1 text-xl font-bold capitalize text-white">
              {isPremiumActive ? "Premium" : "Free"}
            </p>
          </div>

          {isPremiumActive && (
            <div>
              <p className="flex items-center gap-2 text-sm text-nav-muted">
                <CalendarDays size={15} />
                Subscription Expires
              </p>

              <p className="mt-1 font-semibold text-white">
                {formatDate(subscription.expiresAt)}
              </p>
            </div>
          )}

          {isPremiumActive && subscription.cancelAtPeriodEnd && (
            <p className="text-sm font-semibold text-amber-400">
              Cancellation Scheduled
            </p>
          )}

          <Link
            href="/dashboard/vendor/subscription"
            className="text-sm font-semibold text-brand transition hover:underline"
          >
            Manage Subscription →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border bg-nav p-6">
        <h2 className="text-lg font-bold text-white">Quick Actions</h2>

        <p className="mt-1 text-sm text-nav-muted">
          Quickly access your most important dashboard features.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/vendor/add-item"
            className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 transition hover:border-brand hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <PlusCircle size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-white">Add Menu Item</h3>
                <p className="mt-1 text-xs text-nav-muted">
                  Add a new pizza to your menu.
                </p>
              </div>
            </div>

            <ArrowRight className="size-4 text-nav-muted" />
          </Link>

          <Link
            href="/dashboard/vendor/orders"
            className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 transition hover:border-brand hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <ClipboardList size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-white">Manage Orders</h3>
                <p className="mt-1 text-xs text-nav-muted">
                  Review and manage customer orders.
                </p>
              </div>
            </div>

            <ArrowRight className="size-4 text-nav-muted" />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-border bg-nav p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Recent Customer Orders
            </h2>
            <p className="mt-1 text-sm text-nav-muted">
              Latest orders placed for your menu items.
            </p>
          </div>

          <Link
            href="/dashboard/vendor/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="py-10 text-center text-sm text-nav-muted">
            No customer orders yet.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">
                    {order.item?.itemName || "Menu item unavailable"}
                  </h3>

                  <p className="mt-1 text-xs text-nav-muted">
                    {order.customer?.name || "Unknown Customer"}
                    {" · "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                    STATUS_STYLES[order.status] ||
                    "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {order.status || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Menu Items */}
      <div className="rounded-2xl border border-border bg-nav p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Menu Items</h2>
            <p className="mt-1 text-sm text-nav-muted">
              Recently added items from your menu.
            </p>
          </div>

          <Link
            href="/dashboard/vendor/menu-items"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </div>

        {menuItems.length === 0 ? (
          <div className="py-10 text-center">
            <UtensilsCrossed className="mx-auto mb-3 size-9 text-nav-muted" />

            <p className="text-sm text-nav-muted">
              You haven't added any menu items yet.
            </p>

            <Link
              href="/dashboard/vendor/add-item"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
            >
              <PlusCircle size={16} />
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {menuItems.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">
                    {item.itemName}
                  </h3>

                  <p className="mt-1 text-xs text-nav-muted">
                    {item.category || "Uncategorized"}
                    {" · "}৳{Number(item.price || 0).toLocaleString("en-BD")}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                    STATUS_STYLES[item.status] || "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {item.status || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}