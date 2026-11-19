
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function AddMenuItemPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    price: "",
    location: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form inputs
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle image selection
  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      setError("Image size must be less than 32MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
  }

  // Remove selected image
  function removeImage() {
    setImageFile(null);
  }

  // Upload image to ImgBB
  async function uploadImage() {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error("ImgBB API key is missing.");
    }

    const imageFormData = new FormData();
    imageFormData.append("image", imageFile);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: imageFormData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error("Image upload failed. Please try again.");
    }

    return result.data.url;
  }

  // Submit menu item
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!imageFile) {
      setError("Please select a food image.");
      return;
    }

    try {
      setLoading(true);

      // Get JWT token from Better Auth
      const { data, error: tokenError } = await authClient.token();

      if (tokenError || !data?.token) {
        throw new Error("Authentication failed. Please sign in again.");
      }

      // Upload image to ImgBB
      const imageUrl = await uploadImage();

      // Prepare menu item data
      const menuItemData = {
        ...formData,
        price: Number(formData.price),
        images: [imageUrl],
      };

      // Send data to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/menu-items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify(menuItemData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add menu item.");
      }

      alert("Menu item submitted successfully!");

      router.push("/dashboard/vendor");
      router.refresh();
    } catch (error) {
      console.error("Add Menu Item Error:", error);
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/vendor"
          className="mb-4 inline-flex items-center gap-2 text-sm text-black/60 transition hover:text-brand dark:text-white/60"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
          Add New Menu Item
        </h1>

        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Add a new delicious item to your restaurant menu.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8"
      >
        {/* Item Name */}
        <div>
          <label
            htmlFor="itemName"
            className="mb-2 block text-sm font-semibold"
          >
            Item Name *
          </label>

          <input
            id="itemName"
            name="itemName"
            type="text"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="e.g. Chicken BBQ Pizza"
            required
            className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-brand dark:border-white/10"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-semibold"
          >
            Category *
          </label>

          <input
            id="category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Pizza"
            required
            className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-brand dark:border-white/10"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold"
          >
            Description *
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your menu item..."
            rows={4}
            required
            className="w-full resize-y rounded-lg border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-brand dark:border-white/10"
          />
        </div>

        {/* Price and Location */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-semibold"
            >
              Price (৳) *
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="450"
              required
              className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-brand dark:border-white/10"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold"
            >
              Location *
            </label>

            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Feni"
              required
              className="w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-brand dark:border-white/10"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Item Image *
          </label>

          {!imageFile ? (
            <label
              htmlFor="image"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/20 px-5 py-10 text-center transition hover:border-brand dark:border-white/20"
            >
              <ImagePlus className="mb-3 size-10 text-brand" />

              <span className="font-semibold">
                Click to upload food image
              </span>

              <span className="mt-1 text-xs text-black/50 dark:text-white/50">
                PNG, JPG or WEBP (Maximum 32MB)
              </span>

              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
              <div className="flex min-w-0 items-center gap-3">
                <ImagePlus className="size-8 shrink-0 text-brand" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {imageFile.name}
                  </p>

                  <p className="text-xs text-black/50 dark:text-white/50">
                    {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeImage}
                className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                aria-label="Remove image"
              >
                <X className="size-5" />
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Uploading & Submitting...
            </>
          ) : (
            <>
              <Upload className="size-5" />
              Submit Menu Item
            </>
          )}
        </button>

        <p className="text-center text-xs text-black/50 dark:text-white/50">
          Your menu item will remain pending until approved by an admin.
        </p>
      </form>
    </div>
  );
}
