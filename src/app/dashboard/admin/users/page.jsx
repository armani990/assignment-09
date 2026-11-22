
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  LoaderCircle,
  UserRound,
  Mail,
  CalendarDays,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ROLE_FILTERS = [
  { label: "All Users", value: "all" },
  { label: "Customers", value: "customer" },
  { label: "Vendors", value: "vendor" },
  { label: "Admins", value: "admin" },
];

const ROLE_STYLES = {
  customer: "bg-blue-500/10 text-blue-500",
  vendor: "bg-purple-500/10 text-purple-500",
  admin: "bg-green-500/10 text-green-500",
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
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
        selectedRole === "all"
          ? ""
          : `?role=${selectedRole}`;

      const response = await fetch(
        `${API_URL}/admin/users${query}`,
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
          result.message || "Failed to load users."
        );
      }

      setUsers(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Manage Users
          </h1>

          <p className="mt-2 text-sm text-nav-muted">
            View and manage registered customers, vendors, and admins.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-white transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Role Filters */}
      <div className="flex flex-wrap gap-2">
        {ROLE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setSelectedRole(filter.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedRole === filter.value
                ? "bg-brand text-white"
                : "text-nav-muted hover:bg-white/5"
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

      {/* User Count */}
      {!loading && !error && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-nav p-4">
          <Users className="size-5 text-brand" />

          <p className="text-sm text-nav-muted">
            Total users:{" "}
            <span className="font-bold text-white">
              {users.length}
            </span>
          </p>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <LoaderCircle className="size-9 animate-spin text-brand" />
        </div>
      ) : error ? null : users.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
          <Users className="mb-3 size-10 text-nav-muted" />

          <h2 className="font-semibold text-white">
            No users found
          </h2>

          <p className="mt-1 text-sm text-nav-muted">
            No users are available for this filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {users.map((user) => (
            <article
              key={user._id || user.id || user.email}
              className="flex flex-col gap-4 rounded-xl border border-border bg-nav p-5 sm:flex-row sm:items-center"
            >
              {/* Avatar */}
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/10">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-7 text-brand" />
                )}
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-white">
                    {user.name || "Unnamed User"}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      ROLE_STYLES[user.role] ||
                      "bg-white/10 text-nav-muted"
                    }`}
                  >
                    {user.role || "Unknown"}
                  </span>
                </div>

                <p className="mt-2 flex items-center gap-2 break-all text-sm text-nav-muted">
                  <Mail className="size-4 shrink-0" />
                  {user.email}
                </p>

                <p className="mt-2 flex items-center gap-2 text-xs text-nav-muted">
                  <CalendarDays className="size-4 shrink-0" />
                  Joined: {formatDate(user.createdAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
