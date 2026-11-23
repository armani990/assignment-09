"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  UtensilsCrossed,
  MapPin,
  CalendarDays,
  LoaderCircle,
  Search,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const STATUS_FILTERS = [
  { label: "All Items", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Inactive", value: "inactive" },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-600",
};

export default function AdminMenuItemsPage() {
  const [items, setItems] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured.");
      }

      const { data } = await authClient.token();
      const token = data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const query = selectedStatus === "all" ? "" : `?status=${selectedStatus}`;

      const response = await fetch(`${API_BASE_URL}/admin/menu-items${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load menu items.");
      }

      setItems(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const filteredItems = items.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    return (
      item.itemName?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search)
    );
  });
  const handleStatusUpdate = async (id, status) => {
    try {
      setBusyId(id);
      setError("");
      setMessage("");

      const { data } = await authClient.token();
      const token = data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/menu-items/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update menu item.");
      }

      toast.success(result.message || `Menu item ${status} successfully.`);
      setMessage(result.message || `Menu item ${status} successfully.`);
      await loadMenuItems();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Menu Items</h1>
          <p className="mt-1 text-sm text-nav-muted">
            Review and manage menu items submitted by vendors.
          </p>
        </div>

        <button
          type="button"
          onClick={loadMenuItems}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setSelectedStatus(filter.value);
              setMessage("");
              setError("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedStatus === filter.value
                ? "bg-brand text-white"
                : "text-nav-muted hover:bg-white/5"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Menu Items */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-nav-muted" />

        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by item name, category or location..."
          className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-nav-muted focus:border-brand"
        />
      </div>

      {/* Feedback Messages */}
      {message && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Menu Items */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-brand" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
          <UtensilsCrossed className="mb-3 size-10 text-white/40" />
          <h2 className="font-semibold text-white">
            {searchTerm
              ? "No matching menu items found"
              : "No menu items found"}
          </h2>
          <p className="mt-1 text-sm text-nav-muted">
            {searchTerm
              ? "Try searching with a different keyword."
              : "There are no items in this category yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Item Image */}
                <div className="h-52 shrink-0 bg-white/10 sm:h-auto sm:w-44">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-40 items-center justify-center">
                      <UtensilsCrossed className="size-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Item Information */}
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">{item.itemName}</h2>
                      <p className="mt-1 text-sm text-nav-muted">
                        {item.category}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        STATUS_STYLES[item.status] ||
                        "bg-white/10 text-nav-muted"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-white/60">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-semibold text-brand">
                      ৳{Number(item.price).toLocaleString("en-BD")}
                    </p>

                    <p className="flex items-center gap-2 text-nav-muted">
                      <MapPin className="size-4 shrink-0" />
                      {item.location}
                    </p>

                    <p className="flex items-center gap-2 text-nav-muted">
                      <CalendarDays className="size-4 shrink-0" />
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </p>

                    <p className="break-all text-xs text-nav-muted">
                      Vendor ID: {String(item.vendorId || "N/A")}
                    </p>
                  </div>

                  {/* Approval Actions */}
                  {item.status === "pending" && (
                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(item._id, "approved")}
                        disabled={busyId === item._id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyId === item._id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(item._id, "rejected")}
                        disabled={busyId === item._id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="size-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
