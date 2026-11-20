
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
    ShoppingBag,
    CalendarDays,
    MapPin,
    Store,
    Clock,
    Eye,
    X,
    LoaderCircle,
    MessageSquare,
    Ban,
    PackageCheck,
    RefreshCw,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_STYLES = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    accepted: "bg-green-500/10 text-green-600 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function formatDate(date) {
    if (!date) return "Not available";

    // Delivery date is stored as YYYY-MM-DD.
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split("-");

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

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getVendorName(vendor) {
    return (
        vendor?.businessName ||
        vendor?.name ||
        "PizzaHub Vendor"
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${STATUS_STYLES[status] ||
                "border-gray-500/20 bg-gray-500/10 text-gray-500"
                }`}
        >
            {status || "unknown"}
        </span>
    );
}

export default function CustomerOrdersPage() {
    const { data: session, isPending: sessionLoading } = useSession();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmingOrderId, setConfirmingOrderId] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const tokenResult = await authClient.token();
            const token = tokenResult?.data?.token;

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please sign in again."
                );
            }

            const response = await fetch(`${API_URL}/customer/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch your orders"
                );
            }

            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (sessionLoading) return;

        if (session?.user?.role === "customer") {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [sessionLoading, session, fetchOrders]);

    const handleCancelOrder = async (orderId) => {
        try {
            setCancellingId(orderId);
            setError("");
            setSuccess("");

            const tokenResult = await authClient.token();
            const token = tokenResult?.data?.token;

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please sign in again."
                );
            }

            const response = await fetch(
                `${API_URL}/customer/orders/${orderId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to cancel order"
                );
            }

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order._id === orderId
                        ? { ...order, status: "cancelled" }
                        : order
                )
            );

            setSelectedOrder((previousOrder) =>
                previousOrder?._id === orderId
                    ? { ...previousOrder, status: "cancelled" }
                    : previousOrder
            );

            setSuccess("Your order has been cancelled successfully.");
            setConfirmingOrderId(null);
        } catch (err) {
            setError(err.message || "Failed to cancel order");
        } finally {
            setCancellingId(null);
        }
    };

    if (sessionLoading || loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="rounded-2xl border border-border bg-nav p-8 text-center">
                <h2 className="text-xl font-bold text-nav">
                    Please Sign In
                </h2>
                <p className="mt-2 text-sm text-nav-muted">
                    Sign in to view your orders.
                </p>
            </div>
        );
    }

    if (session.user.role !== "customer") {
        return (
            <div className="rounded-2xl border border-border bg-nav p-8 text-center">
                <h2 className="text-xl font-bold text-nav">
                    Access Denied
                </h2>
                <p className="mt-2 text-sm text-nav-muted">
                    This page is only available to customers.
                </p>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            {/* Page Heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                        <ShoppingBag size={24} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold text-nav sm:text-3xl">
                            My Orders
                        </h1>
                        <p className="mt-1 text-sm text-nav-muted">
                            Track and manage your pizza orders.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSuccess("");
                        fetchOrders();
                    }}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-nav transition hover:border-brand hover:text-brand disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Feedback */}
            {error && (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-start justify-between gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-600">
                    <p>{success}</p>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success message"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Order Summary */}
            <div className="rounded-2xl border border-border bg-nav p-5">
                <p className="text-sm font-medium text-nav-muted">
                    Total Orders
                </p>
                <p className="mt-1 text-3xl font-extrabold text-nav">
                    {orders.length}
                </p>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="rounded-2xl border border-border bg-nav px-6 py-16 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-nav-muted" />

                    <h2 className="mt-4 text-xl font-bold text-nav">
                        No Orders Yet
                    </h2>

                    <p className="mt-2 text-sm text-nav-muted">
                        Your pizza orders will appear here after you place an order.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((order) => {
                        const image = order.item?.images?.[0];

                        return (
                            <article
                                key={order._id}
                                className="overflow-hidden rounded-2xl border border-border bg-nav transition hover:border-brand/40"
                            >
                                <div className="flex flex-col gap-5 p-5 sm:flex-row">
                                    {/* Pizza Image */}
                                    <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl bg-background sm:h-36 sm:w-40">
                                        {image ? (
                                            <Image
                                                src={image}
                                                alt={order.item?.itemName || "Ordered pizza"}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 640px) 100vw, 160px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-nav-muted">
                                                <ShoppingBag size={32} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Information */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                                                    {order.item?.category || "Pizza Order"}
                                                </p>

                                                <h2 className="mt-1 text-xl font-bold text-nav">
                                                    {order.item?.itemName || "Item unavailable"}
                                                </h2>

                                                <p className="mt-1 font-bold text-brand">
                                                    {order.item?.price != null
                                                        ? `৳${Number(order.item.price).toLocaleString("en-BD")}`
                                                        : "Price unavailable"}
                                                </p>
                                            </div>

                                            <StatusBadge status={order.status} />
                                        </div>

                                        <div className="mt-4 grid gap-3 text-sm text-nav-muted sm:grid-cols-2">
                                            <p className="flex min-w-0 items-center gap-2">
                                                <Store
                                                    size={16}
                                                    className="shrink-0 text-brand"
                                                />
                                                <span className="truncate">
                                                    {getVendorName(order.vendor)}
                                                </span>
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <CalendarDays
                                                    size={16}
                                                    className="shrink-0 text-brand"
                                                />
                                                <span>
                                                    Delivery: {formatDate(order.deliveryDate)}
                                                </span>
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <Clock
                                                    size={16}
                                                    className="shrink-0 text-brand"
                                                />
                                                <span>
                                                    Requested: {formatDate(order.createdAt)}
                                                </span>
                                            </p>

                                            <p className="flex min-w-0 items-center gap-2">
                                                <MapPin
                                                    size={16}
                                                    className="shrink-0 text-brand"
                                                />
                                                <span className="truncate">
                                                    {order.deliveryAddress}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Order Actions */}
                                        <div className="mt-5 flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setConfirmingOrderId(null);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand hover:text-brand"
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </button>

                                            {order.status === "pending" &&
                                                (confirmingOrderId === order._id ? (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm text-nav-muted">
                                                            Cancel this order?
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleCancelOrder(order._id)
                                                            }
                                                            disabled={cancellingId === order._id}
                                                            className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {cancellingId === order._id
                                                                ? "Cancelling..."
                                                                : "Confirm"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setConfirmingOrderId(null)
                                                            }
                                                            disabled={cancellingId === order._id}
                                                            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-nav"
                                                        >
                                                            Keep Order
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirmingOrderId(order._id)
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                                                    >
                                                        <Ban size={16} />
                                                        Cancel Order
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="order-details-title"
                        className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-nav p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                                    Your Order
                                </p>
                                <h2
                                    id="order-details-title"
                                    className="mt-1 text-xl font-bold text-nav"
                                >
                                    Order Details
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                aria-label="Close order details"
                                className="rounded-lg p-2 text-nav-muted transition hover:bg-background hover:text-nav"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-6 space-y-5">
                            {/* Item Information */}
                            <div className="flex items-center gap-4">
                                {selectedOrder.item?.images?.[0] && (
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                                        <Image
                                            src={selectedOrder.item.images[0]}
                                            alt={
                                                selectedOrder.item.itemName || "Ordered pizza"
                                            }
                                            fill
                                            unoptimized
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h3 className="font-bold text-nav">
                                        {selectedOrder.item?.itemName || "Item unavailable"}
                                    </h3>

                                    <p className="mt-1 text-sm text-nav-muted">
                                        {selectedOrder.item?.category || "Pizza"}
                                    </p>

                                    <p className="mt-1 font-bold text-brand">
                                        {selectedOrder.item?.price != null
                                            ? `৳${Number(selectedOrder.item.price).toLocaleString("en-BD")}`
                                            : "Price unavailable"}
                                    </p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4 rounded-xl bg-background p-4 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-nav-muted">
                                        Order Status
                                    </span>
                                    <StatusBadge status={selectedOrder.status} />
                                </div>

                                <div>
                                    <p className="flex items-center gap-2 text-nav-muted">
                                        <Store size={15} />
                                        Vendor
                                    </p>
                                    <p className="mt-1 font-semibold text-nav">
                                        {getVendorName(selectedOrder.vendor)}
                                    </p>

                                    {selectedOrder.vendor?.email && (
                                        <p className="mt-1 text-nav-muted">
                                            {selectedOrder.vendor.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="flex items-center gap-2 text-nav-muted">
                                        <CalendarDays size={15} />
                                        Delivery Date
                                    </p>
                                    <p className="mt-1 font-semibold text-nav">
                                        {formatDate(selectedOrder.deliveryDate)}
                                    </p>
                                </div>

                                <div>
                                    <p className="flex items-center gap-2 text-nav-muted">
                                        <MapPin size={15} />
                                        Delivery Address
                                    </p>
                                    <p className="mt-1 font-semibold text-nav">
                                        {selectedOrder.deliveryAddress}
                                    </p>
                                </div>

                                <div>
                                    <p className="flex items-center gap-2 text-nav-muted">
                                        <Clock size={15} />
                                        Request Date
                                    </p>
                                    <p className="mt-1 font-semibold text-nav">
                                        {formatDate(selectedOrder.createdAt)}
                                    </p>
                                </div>

                                <div>
                                    <p className="flex items-center gap-2 text-nav-muted">
                                        <MessageSquare size={15} />
                                        Additional Message
                                    </p>
                                    <p className="mt-1 font-semibold text-nav">
                                        {selectedOrder.message || "No additional message"}
                                    </p>
                                </div>
                            </div>

                            {/* Pending Notice */}
                            {selectedOrder.status === "pending" && (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600">
                                    <PackageCheck
                                        className="mr-2 inline-block"
                                        size={17}
                                    />
                                    Your order is waiting for vendor approval. You can cancel it while it is pending.
                                </div>
                            )}

                            {selectedOrder.status === "accepted" && (
                                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
                                    Your order has been accepted by the vendor.
                                </div>
                            )}

                            {selectedOrder.status === "rejected" && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                                    The vendor has rejected this order.
                                </div>
                            )}

                            {selectedOrder.status === "cancelled" && (
                                <div className="rounded-xl border border-gray-500/30 bg-gray-500/10 p-3 text-sm text-gray-500">
                                    This order has been cancelled.
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="mt-6 w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-strong"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
