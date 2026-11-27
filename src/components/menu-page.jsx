"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, MapPin, Utensils } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const MENU_CATEGORIES = [
    "Classic Pizzas",
    "Vegetarian Pizzas",
    "Chicken Pizzas",
    "Gourmet Pizzas",
    "Sides & Appetizers",
    "Beverages & Desserts",
  ];
  const [locations, setLocations] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get selected category from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get("category");

    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  }, []);

  // Fetch menu items
  useEffect(() => {
    if (!API_URL) {
      setError("API URL is not configured.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchMenuItems() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);
        if (location) params.set("location", location);
        if (sort) params.set("sort", sort);

        const query = params.toString();

        const response = await fetch(
          `${API_URL}/menu-items${query ? `?${query}` : ""}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to load menu items.");
        }

        const data = await response.json();

        setMenuItems(data);

        // Build location options from the initial approved menu list.
        if (!search && !category && !location && !sort) {
          setLocations([
            ...new Set(data.map((item) => item.location).filter(Boolean)),
          ]);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMenuItems();

    return () => controller.abort();
  }, [search, category, location, sort]);

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-nav px-4 py-16 text-center text-white sm:py-20">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Fresh & Delicious
        </p>

        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          Explore Our Menu
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-nav-muted sm:text-base">
          Discover delicious pizzas from restaurants around you. Find your
          favorite taste and enjoy every bite.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-brand" />
            <h2 className="font-heading text-lg font-semibold">
              Find Your Pizza
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="search"
                placeholder="Search pizza..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-brand"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand"
            >
              <option value="">All Categories</option>
              {MENU_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Location */}
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand"
            >
              <option value="">All Locations</option>
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brand"
            >
              <option value="">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold">Our Pizzas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore our available menu items.
            </p>
          </div>

          {!loading && (
            <p className="text-sm font-medium text-muted-foreground">
              {menuItems.length} {menuItems.length === 1 ? "item" : "items"}{" "}
              found
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading delicious pizzas...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && menuItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-4 py-20 text-center">
            <Utensils size={40} className="mx-auto text-muted-foreground" />

            <h3 className="mt-4 font-heading text-xl font-semibold">
              No Pizzas Found
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your search or filters.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("");
                setLocation("");
                setSort("");
              }}
              className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pizza Grid */}
        {!loading && !error && menuItems.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item._id}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-56 overflow-hidden bg-muted">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.itemName}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Utensils size={42} />
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-nav px-3 py-1 text-xs font-semibold text-nav-foreground">
                    {item.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading text-xl font-bold">
                      {item.itemName}
                    </h3>

                    <p className="shrink-0 font-heading text-lg font-bold text-brand">
                      ৳{Number(item.price).toLocaleString("en-BD")}
                    </p>
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>

                  {/* Location and Vendor */}
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {item.location}
                    </span>

                    <span className="truncate">
                      By {item.vendor?.name || "PizzaHub Vendor"}
                    </span>
                  </div>

                  <Link
                    href={`/menu-items/${item._id}`}
                    className="mt-5 flex w-full items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
