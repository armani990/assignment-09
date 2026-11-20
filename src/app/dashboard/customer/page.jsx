
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    LoaderCircle,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CustomerOverviewPage() {
    const { data: session, isPending: sessionLoading } = useSession();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);

            const tokenResult = await authClient.token();
            const token = tokenResult?.data?.token;

            if (!token) {
                throw new Error("Authentication token not found. Please sign in again.");
            }

            const response = await fetch(`${API_URL}/customer/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch orders");
            }

            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.message || "Something went wrong");
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
    }, [sessionLoading, session?.user?.role, fetchOrders]);

    if (sessionLoading || loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    const stats = [
        {
            label: "Total Orders",
            count: orders.length,
            icon: ShoppingBag,
            color: "text-brand",
            background: "bg-brand/10",
        },
        {
            label: "Pending Orders",
            count: orders.filter((order) => order.status === "pending").length,
            icon: Clock,
            color: "text-amber-500",
            background: "bg-amber-500/10",
        },
        {
            label: "Accepted Orders",
            count: orders.filter((order) => order.status === "accepted").length,
            icon: CheckCircle,
            color: "text-green-500",
            background: "bg-green-500/10",
        },
        {
            label: "Rejected Orders",
            count: orders.filter((order) => order.status === "rejected").length,
            icon: XCircle,
            color: "text-red-500",
            background: "bg-red-500/10",
        },
    ];

    return (
        <section className="space-y-8">
            {/* Page Heading */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                        Customer Overview
                    </h1>
                    <p className="mt-2 text-sm text-nav-muted">
                        Track your orders and check their current status.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchOrders}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-white transition hover:border-brand hover:text-brand disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Order Statistics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-border bg-nav p-5 transition hover:border-brand/40"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-nav-muted">
                                        {stat.label}
                                    </p>

                                    <p className="mt-3 text-3xl font-extrabold text-white">
                                        {stat.count}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
                                >
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Welcome Section */}
            <div className="rounded-2xl border border-border bg-nav p-6">
                <h2 className="text-xl font-bold text-white">
                    Welcome to Your Dashboard!
                </h2>

                <p className="mt-2 text-sm leading-6 text-nav-muted">
                    You can track all your pizza orders from here.
                    Visit My Orders to view order details and manage your pending orders.
                </p>
            </div>
        </section>
    );
}
