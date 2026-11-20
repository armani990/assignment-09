
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FeaturedMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session, isPending } = useSession();
  const role = session?.user?.role;

  useEffect(() => {
    const controller = new AbortController();

    const fetchFeaturedItems = async () => {
      try {
        const response = await fetch(
          `${API_URL}/menu-items/featured`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load menu items");
        }

        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError("Unable to load featured pizzas. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedItems();

    return () => controller.abort();
  }, []);

  return (
    <section className="bg-nav px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Fresh From Our Kitchen
          </p>

          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Our Featured Pizzas
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-nav-muted">
            Explore our delicious collection of freshly prepared pizzas.
            Find your favorite and enjoy every bite.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
              >
                <div className="h-52 bg-white/10 dark:bg-white/5" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded bg-white/10 dark:bg-white/5" />
                  <div className="h-4 w-full rounded bg-white/10 dark:bg-white/5" />
                  <div className="h-4 w-1/3 rounded bg-white/10 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <p className="py-10 text-center text-red-600">{error}</p>
        )}

        {/* Empty State */}
        {!loading && !error && menuItems.length === 0 && (
          <p className="py-10 text-center text-nav-muted">
            No featured pizzas are available right now.
          </p>
        )}

        {/* Pizza Cards */}
        {!loading && !error && menuItems.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item._id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
              >
                <div className="relative h-56 overflow-hidden bg-white/10 dark:bg-white/5">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white">
                    {item.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-white">
                      {item.itemName}
                    </h3>

                    <span className="whitespace-nowrap text-lg font-bold text-orange-600">
                      ৳{Number(item.price).toLocaleString("en-BD")}
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-2 min-h-12 text-sm leading-6 text-nav-muted">
                    {item.description}
                  </p>

                  <p className="mb-5 flex items-center gap-2 text-sm text-nav-muted">
                    <span>📍</span>
                    {item.location}
                  </p>

                  {/* Guest: Login required */}
                  {!isPending && !session && (
                    <Link
                      href="/login"
                      className="block w-full rounded-lg bg-orange-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-700"
                    >
                      Login to Order
                    </Link>
                  )}

                  {/* Customer: Can order */}
                  {!isPending && role === "customer" && (
                    <Link
                      href={`/menu-items/${item._id}`}
                      className="block w-full rounded-lg bg-orange-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-700"
                    >
                     View Details
                    </Link>
                  )}

                  {/* Vendor and Admin: Cannot order */}
                  {!isPending &&
                    (role === "vendor" || role === "admin") && (
                      <button
                        type="button"
                        disabled
                        className="w-full cursor-not-allowed rounded-lg bg-white/10 px-4 py-3 font-semibold text-nav-muted"
                      >
                        Ordering for Customers Only
                      </button>
                    )}

                  {/* Session is loading */}
                  {isPending && (
                    <div className="h-12 animate-pulse rounded-lg bg-white/10" />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
