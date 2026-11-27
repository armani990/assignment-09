"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UtensilsCrossed,
  RefreshCw,
  LoaderCircle,
  Pencil,
  Trash2,
  MapPin,
  CalendarDays,
  X,
  Upload,
  Save,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-600",
};

const INITIAL_FORM = {
  itemName: "",
  category: "",
  description: "",
  price: "",
  location: "",
};

export default function VendorMenuItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [availabilityUpdatingId, setAvailabilityUpdatingId] =
    useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getToken = async () => {
    const { data } = await authClient.token();

    if (!data?.token) {
      throw new Error("Authentication token not found.");
    }

    return data.token;
  };

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured.");
      }

      const token = await getToken();

      const response = await fetch(
        `${API_BASE_URL}/vendor/menu-items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load menu items."
        );
      }

      setItems(result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const openEditForm = (item) => {
    setEditingItem(item);

    setForm({
      itemName: item.itemName || "",
      category: item.category || "",
      description: item.description || "",
      price: String(item.price || ""),
      location: item.location || "",
    });

    setImageFile(null);
    setError("");
    setMessage("");
  };

  const closeEditForm = () => {
    setEditingItem(null);
    setForm(INITIAL_FORM);
    setImageFile(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    if (!IMGBB_API_KEY) {
      throw new Error("ImgBB API key is not configured.");
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error("Image upload failed. Please try again.");
    }

    return result.data.url;
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingItem) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = await getToken();

      let images = editingItem.images || [];

      if (imageFile) {
        const uploadedImage = await uploadImage();
        images = [uploadedImage];
      }

      const response = await fetch(
        `${API_BASE_URL}/vendor/menu-items/${editingItem._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            images,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update menu item."
        );
      }

      toast.success(
        "Menu item updated successfully. It is now waiting for admin approval."
      );
      closeEditForm();
      setMessage(
        "Menu item updated successfully. It is now waiting for admin approval."
      );

      await loadMenuItems();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      const token = await getToken();

      const response = await fetch(
        `${API_BASE_URL}/vendor/menu-items/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete menu item."
        );
      }

      setConfirmDeleteId(null);
      toast.success("Menu item deleted successfully.");
      setMessage("Menu item deleted successfully.");

      await loadMenuItems();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAvailabilityToggle = async (item) => {
    const nextStatus =
      item.status === "approved" ? "inactive" : "approved";

    try {
      setAvailabilityUpdatingId(item._id);
      setError("");
      setMessage("");

      const token = await getToken();

      const response = await fetch(
        `${API_BASE_URL}/vendor/menu-items/${item._id}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update item availability."
        );
      }

      toast.success(result.message);
      await loadMenuItems();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message || "Something went wrong.");
    } finally {
      setAvailabilityUpdatingId(null);
    }
  };

  const pendingCount = items.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = items.filter(
    (item) => item.status === "approved"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Menu Items</h1>
          <p className="mt-1 text-sm text-nav-muted">
            View and manage the menu items you have submitted.
          </p>
        </div>

        <button
          type="button"
          onClick={loadMenuItems}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-card disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-nav-muted">Total Items</p>
          <p className="mt-1 text-2xl font-bold text-white">{items.length}</p>
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-nav-muted">Pending Approval</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-nav-muted">Approved Items</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {approvedCount}
          </p>
        </div>
      </div>

      {/* Feedback */}
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

      {/* Items */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-brand" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
          <UtensilsCrossed className="mb-3 size-10 text-muted-foreground" />
          <h2 className="font-semibold text-white">No menu items yet</h2>
          <p className="mt-1 text-sm text-nav-muted">
            Your submitted menu items will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {items.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="h-52 shrink-0 bg-muted sm:h-auto sm:w-44">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-40 items-center justify-center">
                      <UtensilsCrossed className="size-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">
                        {item.itemName}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.category}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        STATUS_STYLES[item.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-semibold text-brand">
                      ৳{Number(item.price).toLocaleString("en-BD")}
                    </p>

                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      {item.location}
                    </p>

                    <p className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="size-4 shrink-0" />
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg border border-brand px-3 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item._id)}
                      disabled={deletingId === item._id}
                      className="flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                    >
                      {deletingId === item._id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Delete
                    </button>

                    {(item.status === "approved" ||
                      item.status === "inactive") && (
                      <button
                        type="button"
                        onClick={() => handleAvailabilityToggle(item)}
                        disabled={
                          availabilityUpdatingId === item._id ||
                          deletingId === item._id
                        }
                        className={`flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          item.status === "approved"
                            ? "border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white"
                            : "border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white"
                        }`}
                      >
                        {availabilityUpdatingId === item._id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : null}

                        {availabilityUpdatingId === item._id
                          ? "Updating..."
                          : item.status === "approved"
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    )}
                  </div>

                  {/* Delete Confirmation */}
                  {confirmDeleteId === item._id && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/5">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Are you sure you want to delete this item?
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === item._id
                            ? "Deleting..."
                            : "Yes, Delete"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingId === item._id}
                          className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold border-border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Edit Menu Item</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Changes will require admin approval again.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={saving}
                aria-label="Close edit form"
                className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Item Name
                </label>
                <input
                  name="itemName"
                  value={form.itemName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 outline-none focus:border-brand dark:border-white/15"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Category
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 outline-none focus:border-brand dark:border-white/15"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Price (৳)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 outline-none focus:border-brand dark:border-white/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 outline-none focus:border-brand dark:border-white/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 outline-none focus:border-brand dark:border-white/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Item Image
                </label>

                {editingItem.images?.[0] && (
                  <img
                    src={editingItem.images[0]}
                    alt="Current item"
                    className="mb-3 h-32 w-40 rounded-lg object-cover"
                  />
                )}

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 p-4 transition hover:border-brand border-border">
                  <Upload className="size-5 text-brand" />

                  <span className="text-sm text-muted-foreground">
                    {imageFile
                      ? imageFile.name
                      : "Choose a new image (optional)"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) return;

                      if (!file.type.startsWith("image/")) {
                        setError("Please select a valid image file.");
                        event.target.value = "";
                        return;
                      }

                      if (file.size > 5 * 1024 * 1024) {
                        setError("Image size must be less than 5 MB.");
                        event.target.value = "";
                        return;
                      }

                      setError("");
                      setImageFile(file);
                    }}
                  />
                </label>

                <p className="mt-1 text-xs text-muted-foreground">
                  Leave empty to keep the current image. Maximum size: 5 MB.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold border-border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}