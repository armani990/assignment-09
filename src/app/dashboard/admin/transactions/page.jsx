
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  LoaderCircle,
  Store,
  CalendarDays,
  ReceiptText,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_FILTERS = [
  { label: "All Transactions", value: "all" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Pending", value: "pending" },
];

const STATUS_STYLES = {
  succeeded: "bg-green-500/10 text-green-500",
  pending: "bg-amber-500/10 text-amber-500",
};

function formatDate(value) {
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

function formatAmount(amount, currency) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "USD").toUpperCase(),
  }).format(numericAmount);
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("API base URL is not configured.");
      }

      const { data } = await authClient.token();
      const token = data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const query =
        selectedStatus === "all"
          ? ""
          : `?status=${selectedStatus}`;

      const response = await fetch(
        `${API_URL}/admin/transactions${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load transactions."
        );
      }

      setTransactions(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-nav-muted">
            View vendor Premium subscription payment records.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
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
                : "text-nav-muted hover:bg-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Transaction Count */}
      {!loading && !error && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <ReceiptText className="size-5 text-brand" />

          <p className="text-sm text-nav-muted">
            Total transactions:{" "}
            <span className="font-bold text-foreground">
              {transactions.length}
            </span>
          </p>
        </div>
      )}

      {/* Transactions */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <LoaderCircle className="size-9 animate-spin text-brand" />
        </div>
      ) : error ? null : transactions.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
          <CreditCard className="mb-3 size-10 text-nav-muted" />

          <h2 className="font-semibold text-foreground">
            No transactions found
          </h2>

          <p className="mt-1 text-sm text-nav-muted">
            No transactions are available for this filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-border bg-muted">
                <tr className="text-nav-muted">
                  <th className="px-5 py-4 font-semibold">
                    Vendor
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Plan
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Amount
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Created At
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Paid At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction._id || transaction.stripeSessionId || index}
                    className="transition hover:bg-accent"
                  >
                    {/* Vendor */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
                          <Store className="size-5 text-brand" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {transaction.vendor?.name || "Unknown Vendor"}
                          </p>

                          <p className="mt-1 text-xs text-nav-muted">
                            {transaction.vendor?.email || "Email unavailable"}
                          </p>

                          {transaction.vendor?.businessName && (
                            <p className="mt-1 text-xs text-nav-muted">
                              {transaction.vendor.businessName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      <span className="font-semibold capitalize text-foreground">
                        {transaction.plan || "N/A"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {formatAmount(
                        transaction.amount,
                        transaction.currency
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[transaction.status] ||
                          "bg-white/10 text-nav-muted"
                        }`}
                      >
                        {transaction.status || "Unknown"}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-5 py-4 text-nav-muted">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0" />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>

                    {/* Paid At */}
                    <td className="px-5 py-4 text-nav-muted">
                      {formatDate(transaction.paidAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
