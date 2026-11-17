export const metadata = {
  title: "Browse Menu · PizzaHub",
  description: "Browse the PizzaHub menu.",
};

export default function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 sm:px-8 lg:px-12">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Browse Menu</h1>
      <p className="mt-3 text-black/60 dark:text-white/60">
        Our pizzas will be listed here soon.
      </p>
    </main>
  );
}
