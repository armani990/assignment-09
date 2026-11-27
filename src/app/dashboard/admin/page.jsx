"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserRound,
  Store,
  UtensilsCrossed,
  ClipboardList,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  LoaderCircle,
  ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-500",
  accepted: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  cancelled: "bg-gray-500/10 text-gray-400",
};

const USER_CHART_COLORS = ["#3B82F6", "#A855F7"];

const ORDER_CHART_COLORS = {
  Pending: "#F59E0B",
  Accepted: "#22C55E",
  Rejected: "#EF4444",
  Cancelled: "#9CA3AF",
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
    <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-brand/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-nav-muted">{label}</p>

          <p className="mt-3 text-3xl font-extrabold text-card-foreground">{count}</p>
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

export default function AdminOverviewPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("API base URL is not configured.");
      }

      const { data } = await authClient.token();
      const token = data?.token;

      if (!token) {
        throw new Error(
          "Authentication token not found. Please sign in again.",
        );
      }

      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load dashboard statistics.",
        );
      }

      setDashboardData(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = dashboardData?.stats;

  // Chart data must stay inside the component because it uses stats.
  const userChartData = stats
    ? [
        { name: "Customers", count: stats.totalCustomers },
        { name: "Vendors", count: stats.totalVendors },
      ]
    : [];

  const orderChartData = stats
    ? [
        { name: "Pending", count: stats.pendingOrders },
        { name: "Accepted", count: stats.acceptedOrders },
        { name: "Rejected", count: stats.rejectedOrders },
        { name: "Cancelled", count: stats.cancelledOrders ?? 0 },
      ]
    : [];

  const statCards = stats
    ? [
        {
          label: "Total Users",
          count: stats.totalUsers,
          icon: Users,
          color: "text-brand",
          background: "bg-brand/10",
        },
        {
          label: "Customers",
          count: stats.totalCustomers,
          icon: UserRound,
          color: "text-blue-500",
          background: "bg-blue-500/10",
        },
        {
          label: "Vendors",
          count: stats.totalVendors,
          icon: Store,
          color: "text-purple-500",
          background: "bg-purple-500/10",
        },
        {
          label: "Total Menu Items",
          count: stats.totalMenuItems,
          icon: UtensilsCrossed,
          color: "text-brand",
          background: "bg-brand/10",
        },
        {
          label: "Pending Approvals",
          count: stats.pendingMenuItems,
          icon: Clock,
          color: "text-amber-500",
          background: "bg-amber-500/10",
        },
        {
          label: "Approved Menu Items",
          count: stats.approvedMenuItems,
          icon: CheckCircle,
          color: "text-green-500",
          background: "bg-green-500/10",
        },
        {
          label: "Total Orders",
          count: stats.totalOrders,
          icon: ClipboardList,
          color: "text-brand",
          background: "bg-brand/10",
        },
        {
          label: "Total Transactions",
          count: stats.totalTransactions,
          icon: CreditCard,
          color: "text-purple-500",
          background: "bg-purple-500/10",
        },
        {
          label: "Pending Orders",
          count: stats.pendingOrders,
          icon: Clock,
          color: "text-amber-500",
          background: "bg-amber-500/10",
        },
        {
          label: "Accepted Orders",
          count: stats.acceptedOrders,
          icon: CheckCircle,
          color: "text-green-500",
          background: "bg-green-500/10",
        },
        {
          label: "Rejected Orders",
          count: stats.rejectedOrders,
          icon: XCircle,
          color: "text-red-500",
          background: "bg-red-500/10",
        },
      ]
    : [];

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
          <h1 className="text-2xl font-extrabold text-card-foreground sm:text-3xl">
            Admin Overview
          </h1>

          <p className="mt-2 text-sm text-nav-muted">
            Monitor users, menu items, and customer orders across PizzaHub.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-card-foreground transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
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

      {!error && stats && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Dashboard Charts */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* User Distribution Chart */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">
                  User Distribution
                </h2>

                <p className="mt-1 text-sm text-nav-muted">
                  Customer and vendor account distribution.
                </p>
              </div>

              {stats.totalCustomers + stats.totalVendors === 0 ? (
                <p className="flex h-[280px] items-center justify-center text-sm text-nav-muted">
                  No user data available yet.
                </p>
              ) : (
                <div className="mt-5 h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userChartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        paddingAngle={3}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {userChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={USER_CHART_COLORS[index]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#171717",
                          border: "1px solid #404040",
                          borderRadius: "10px",
                          color: "#ffffff",
                        }}
                      />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Order Status Chart */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">
                  Order Status Overview
                </h2>

                <p className="mt-1 text-sm text-nav-muted">
                  Overview of customer order statuses.
                </p>
              </div>

              {stats.totalOrders === 0 ? (
                <p className="flex h-[280px] items-center justify-center text-sm text-nav-muted">
                  No order data available yet.
                </p>
              ) : (
                <div className="mt-5 h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orderChartData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -15,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#404040"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{
                          backgroundColor: "#171717",
                          border: "1px solid #404040",
                          borderRadius: "10px",
                          color: "#ffffff",
                        }}
                      />

                      <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                        {orderChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={ORDER_CHART_COLORS[entry.name]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-card-foreground">Quick Actions</h2>

            <p className="mt-1 text-sm text-nav-muted">
              Quickly access important administration pages.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link
                href="/dashboard/admin/users"
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 transition hover:border-brand hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-brand" />

                  <div>
                    <h3 className="font-semibold text-card-foreground">Manage Users</h3>
                    <p className="mt-1 text-xs text-nav-muted">
                      View customers and vendors.
                    </p>
                  </div>
                </div>

                <ArrowRight className="size-4 text-nav-muted" />
              </Link>

              <Link
                href="/dashboard/admin/menu-items"
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 transition hover:border-brand hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="size-5 text-brand" />

                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      Manage Menu Items
                    </h3>
                    <p className="mt-1 text-xs text-nav-muted">
                      Review vendor menu submissions.
                    </p>
                  </div>
                </div>

                <ArrowRight className="size-4 text-nav-muted" />
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-card-foreground">Recent Orders</h2>

              <p className="mt-1 text-sm text-nav-muted">
                Latest orders placed by customers.
              </p>
            </div>

            {dashboardData.recentOrders?.length === 0 ? (
              <p className="py-10 text-center text-sm text-nav-muted">
                No orders have been placed yet.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {dashboardData.recentOrders?.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-card-foreground">
                        {order.itemName}
                      </h3>

                      <p className="mt-1 text-xs text-nav-muted">
                        Customer: {order.customerName}
                      </p>

                      <p className="mt-1 text-xs text-nav-muted">
                        Vendor: {order.vendorName}
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
        </>
      )}
    </section>
  );
}
