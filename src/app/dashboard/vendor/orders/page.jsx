
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ClipboardList,
  RefreshCw,
  LoaderCircle,
  UtensilsCrossed,
  User,
  CalendarDays,
  MapPin,
  Clock,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_FILTERS = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function formatDate(value) {
  if (!value) return "Not available";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

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

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${
        STATUS_STYLES[status] ||
        "border-gray-500/20 bg-gray-500/10 text-gray-500"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

async function getAuthToken() {
  const { data } = await authClient.token();

  if (!data?.token) {
    throw new Error("Authentication token not found. Please sign in again.");
  }

  return data.token;
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrder, setUpdatingOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured.");
      }

      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/vendor/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrder({
        id: orderId,
        status,
      });
      setError("");

      const token = await getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/vendor/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, status }
            : order
        )
      );

      toast.success(data.message || `Order ${status} successfully.`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Something went wrong.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const getCount = (status) => {
    if (status === "all") return orders.length;

    return orders.filter((order) => order.status === status).length;
  };

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ClipboardList size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Customer Orders
            </h1>
            <p className="mt-1 text-sm text-nav-muted">
              View and manage orders placed for your menu items.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Order Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Pending",
            status: "pending",
            color: "text-amber-500",
          },
          {
            label: "Accepted",
            status: "accepted",
            color: "text-green-500",
          },
          {
            label: "Rejected",
            status: "rejected",
            color: "text-red-500",
          },
          {
            label: "Cancelled",
            status: "cancelled",
            color: "text-gray-400",
          },
        ].map((item) => (
          <div
            key={item.status}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm text-nav-muted">{item.label} Orders</p>
            <p className={`mt-1 text-2xl font-bold ${item.color}`}>
              {getCount(item.status)}
            </p>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setSelectedStatus(filter.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedStatus === filter.value
                ? "bg-brand text-white"
                : "border border-white/10 text-nav-muted hover:bg-white/5"
            }`}
          >
            {filter.label}
            <span className="ml-2 opacity-70">
              {getCount(filter.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <LoaderCircle className="size-9 animate-spin text-brand" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 text-center">
          <ClipboardList className="mb-3 size-10 text-white/40" />

          <h2 className="text-lg font-semibold text-white">
            No orders found
          </h2>

          <p className="mt-1 text-sm text-nav-muted">
            {selectedStatus === "all"
              ? "Customer orders will appear here."
              : `There are no ${selectedStatus} orders.`}
          </p>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {selectedStatus === "all"
                ? "All Orders"
                : `${selectedStatus} Orders`}
            </h2>

            <p className="text-sm text-nav-muted">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"}
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {filteredOrders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Pizza Image */}
                  <div className="relative h-52 shrink-0 overflow-hidden bg-white/10 sm:w-44">
                    {order.item?.images?.[0] ? (
                      <Image
                        src={order.item.images[0]}
                        alt={order.item.itemName || "Pizza"}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 176px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UtensilsCrossed className="size-10 text-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Order Information */}
                  <div className="flex min-w-0 flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {order.item?.itemName || "Menu item unavailable"}
                        </h3>

                        <p className="mt-1 text-sm text-nav-muted">
                          {order.item?.category || "Pizza"}
                        </p>

                        {order.item?.price != null && (
                          <p className="mt-2 font-bold text-brand">
                            ৳{Number(order.item.price).toLocaleString("en-BD")}
                          </p>
                        )}
                      </div>

                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                      {/* Customer */}
                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 size-4 shrink-0 text-brand" />

                        <div className="min-w-0">
                          <p className="font-semibold text-white">
                            {order.customer?.name || "Unknown Customer"}
                          </p>
                          <p className="break-all text-xs text-nav-muted">
                            {order.customer?.email || "Email unavailable"}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Date */}
                      <div className="flex items-center gap-3 text-nav-muted">
                        <CalendarDays className="size-4 shrink-0 text-brand" />
                        <span>
                          Delivery: {formatDate(order.deliveryDate)}
                        </span>
                      </div>

                      {/* Delivery Address */}
                      <div className="flex items-start gap-3 text-nav-muted">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                        <span className="break-words">
                          {order.deliveryAddress || "Address unavailable"}
                        </span>
                      </div>

                      {/* Request Date */}
                      <div className="flex items-center gap-3 text-nav-muted">
                        <Clock className="size-4 shrink-0 text-brand" />
                        <span>
                          Requested: {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Message */}
                    {order.message && (
                      <div className="mt-5 rounded-xl bg-white/5 p-3">
                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-brand">
                          <MessageSquare size={14} />
                          Customer Message
                        </div>

                        <p className="text-sm leading-6 text-nav-muted">
                          {order.message}
                        </p>
                      </div>
                    )}

                    {/* Order Actions */}
                    {order.status === "pending" && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(order._id, "accepted")
                          }
                          disabled={updatingOrder?.id === order._id}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingOrder?.id === order._id &&
                          updatingOrder.status === "accepted" ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          Accept Order
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(order._id, "rejected")
                          }
                          disabled={updatingOrder?.id === order._id}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingOrder?.id === order._id &&
                          updatingOrder.status === "rejected" ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                          Reject Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
