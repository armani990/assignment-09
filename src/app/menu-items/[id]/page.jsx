"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Store,
  CalendarDays,
  ShoppingBag,
  LoaderCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MenuItemDetailsPage() {
  const { id } = useParams();
  const { data: session, isPending: sessionLoading } = useSession();

  const [item, setItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  const userRole = session?.user?.role;
  const isCustomer = userRole === "customer";
  const isLoggedIn = Boolean(session?.user);

  useEffect(() => {
    if (!id || !API_URL) return;

    const fetchMenuItem = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/menu-items/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load pizza details");
        }

        setItem(data);
        setSelectedImage(data.images?.[0] || "");
      } catch (error) {
        setFeedback({
          type: "error",
          text: error.message || "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id]);

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!isCustomer) return;

    if (!deliveryDate || !deliveryAddress.trim()) {
      setFeedback({
        type: "error",
        text: "Please provide delivery date and address.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ type: "", text: "" });

      const tokenResult = await authClient.token();
      const token = tokenResult?.data?.token;

      if (!token) {
        throw new Error("Authentication token not found. Please sign in again.");
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: id,
          deliveryDate,
          deliveryAddress: deliveryAddress.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setFeedback({
        type: "success",
        text: "Your order has been placed successfully!",
      });

      setDeliveryDate("");
      setDeliveryAddress("");
      setMessage("");
      setShowOrderForm(false);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Failed to place order",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!item) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <ImageIcon className="mb-4 h-12 w-12 text-black/40 dark:text-white/40" />
        <h2 className="font-heading text-2xl font-bold text-black dark:text-white">
          Pizza Not Found
        </h2>
        <p className="mt-2 text-black/60 dark:text-white/60">
          This pizza may have been removed or is no longer available.
        </p>
        <Link
          href="/menu"
          className="mt-6 rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Back to Menu
        </Link>
      </section>
    );
  }

  const images = item.images?.length ? item.images : [];
  const vendorName = item.vendor?.name || "PizzaHub Vendor";

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-black/60 transition-colors hover:text-brand dark:text-white/60 dark:hover:text-brand"
        >
          <ArrowLeft size={18} />
          Back to Menu
        </Link>

        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Image Gallery */}
            <div>
              <div className="overflow-hidden rounded-xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={item.itemName}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-black/30 dark:text-white/30" />
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedImage === image
                          ? "border-brand"
                          : "border-black/10 dark:border-white/10"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.itemName} ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Information */}
            <div className="flex flex-col">
              <span className="inline-flex self-start rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {item.category}
              </span>

              <h1 className="mt-3 font-heading text-3xl font-bold text-black dark:text-white sm:text-4xl">
                {item.itemName}
              </h1>

              <p className="mt-3 text-3xl font-bold text-brand">
                ৳{Number(item.price).toLocaleString("en-BD")}
              </p>

              <div className="mt-5 space-y-3 border-y border-black/10 py-5 dark:border-white/10">
                <div className="flex items-center gap-3 text-sm text-black/70 dark:text-white/70">
                  <MapPin className="h-5 w-5 shrink-0 text-brand" />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-black/70 dark:text-white/70">
                  <Store className="h-5 w-5 shrink-0 text-brand" />
                  <span>{vendorName}</span>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="font-heading text-lg font-bold text-black dark:text-white">
                  About This Pizza
                </h2>
                <p className="mt-2 text-sm leading-7 text-black/70 dark:text-white/70">
                  {item.description}
                </p>
              </div>

              {/* Feedback */}
              {feedback.text && (
                <div
                  className={`mt-5 rounded-lg border p-4 text-sm ${
                    feedback.type === "success"
                      ? "border-green-500/30 bg-green-500/10 text-green-600"
                      : "border-red-500/30 bg-red-500/10 text-red-500"
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              {/* Order Access */}
              <div className="mt-6 lg:mt-auto lg:pt-6">
                {!isLoggedIn ? (
                  <div className="rounded-xl border border-black/10 p-5 dark:border-white/10">
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Please sign in as a customer to order this pizza.
                    </p>
                    <Link
                      href="/login"
                      className="mt-4 inline-flex rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
                    >
                      Sign In to Order
                    </Link>
                  </div>
                ) : isCustomer ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrderForm(!showOrderForm);
                      setFeedback({ type: "", text: "" });
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
                  >
                    {showOrderForm ? (
                      <>
                        <X size={20} />
                        Close Order Form
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        Order Now
                      </>
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl border border-black/10 p-5 dark:border-white/10">
                    <p className="text-sm leading-6 text-black/60 dark:text-white/60">
                      Only customers can place orders. Vendors and admins
                      cannot order pizzas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Form (full width, below the details) */}
          {showOrderForm && isCustomer && (
            <form
              onSubmit={handlePlaceOrder}
              className="mt-8 border-t border-black/10 pt-6 dark:border-white/10"
            >
              <div className="mb-5">
                <h2 className="font-heading text-xl font-bold text-black dark:text-white">
                  Delivery Information
                </h2>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                  Provide your delivery details to place the order.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="deliveryDate"
                    className="mb-1.5 block text-xs font-semibold text-black/70 dark:text-white/70"
                  >
                    Delivery Date
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black/40 dark:text-white/40" />
                    <input
                      id="deliveryDate"
                      type="date"
                      min={getTodayDate()}
                      value={deliveryDate}
                      onChange={(event) => setDeliveryDate(event.target.value)}
                      required
                      className="w-full rounded-lg border border-black/15 bg-transparent py-3 pl-11 pr-4 text-sm text-black outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand dark:border-white/20 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="deliveryAddress"
                    className="mb-1.5 block text-xs font-semibold text-black/70 dark:text-white/70"
                  >
                    Delivery Address
                  </label>
                  <textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    maxLength={500}
                    required
                    className="w-full resize-none rounded-lg border border-black/15 bg-transparent px-4 py-3 text-sm text-black outline-none transition-all placeholder:text-black/40 focus:border-brand focus:ring-2 focus:ring-brand dark:border-white/20 dark:text-white dark:placeholder:text-white/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-xs font-semibold text-black/70 dark:text-white/70"
                  >
                    Additional Message
                    <span className="ml-2 font-normal text-black/40 dark:text-white/40">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Any special instructions?"
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-black/15 bg-transparent px-4 py-3 text-sm text-black outline-none transition-all placeholder:text-black/40 focus:border-brand focus:ring-2 focus:ring-brand dark:border-white/20 dark:text-white dark:placeholder:text-white/40"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  disabled={submitting}
                  className="rounded-full border border-black/15 px-6 py-3 text-[15px] font-semibold text-black/70 transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:text-white dark:hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}