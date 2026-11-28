
import Link from "next/link";
import {
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-reveal";

const CATEGORIES = [
  {
    name: "Classic Pizzas",
    filterCategory: "Classic Pizzas",
    description: "Timeless pizza favorites",
    emoji: "🍕",
  },
  {
    name: "Vegetarian Pizzas",
    filterCategory: "Vegetarian Pizzas",
    description: "Fresh and healthy flavors",
    emoji: "🥗",
  },
  {
    name: "Meat Lovers",
    filterCategory: "Chicken Pizzas",
    description: "Loaded with delicious meats",
    emoji: "🍖",
  },
  {
    name: "Gourmet Pizzas",
    filterCategory: "Gourmet Pizzas",
    description: "Premium handcrafted pizzas",
    emoji: "🍕",
  },
  {
    name: "Sides & Appetizers",
    filterCategory: "Sides & Appetizers",
    description: "Delicious bites and sides",
    emoji: "🍟",
  },
  {
    name: "Beverages & Desserts",
    filterCategory: "Beverages & Desserts",
    description: "Drinks and sweet treats",
    emoji: "🥤",
  },
];

export default function PizzaCategories() {
  return (
    <section className="bg-nav py-16 text-nav-foreground">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Explore Our Menu
          </p>

          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Pick Your Kind of Pizza
          </h2>

          <p className="mt-3 text-nav-muted">
            Discover your favorite flavors from our delicious pizza collection.
          </p>
        </Reveal>

        <StaggerContainer className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category, index) => (
            <StaggerItem key={category.name}>
              <Link
                href={`/menu?category=${encodeURIComponent(category.filterCategory)}`}
                className="group block h-full"
              >
                <div
                  className={`flex h-full flex-col items-center rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    index === 0
                      ? "border-brand bg-brand"
                      : "border-white/10 bg-white/5 hover:border-brand/50 hover:bg-white/10"
                  }`}
                >
                  <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-110">
                    <span className="text-4xl">{category.emoji}</span>
                  </div>

                  <h3
                    className={`text-base font-bold ${
                      index === 0
                        ? "text-white"
                        : "text-nav-foreground"
                    }`}
                  >
                    {category.name}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-nav-muted">
                    {category.description}
                  </p>

                  <span
                    className={`mt-5 text-xs font-semibold transition-transform group-hover:translate-x-1 ${
                      index === 0
                        ? "text-white"
                        : "text-nav-foreground"
                    }`}
                  >
                    Explore Menu →
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
