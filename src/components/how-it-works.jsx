
"use client";

import { motion } from "framer-motion";
import { Search, ShoppingBag, Bike } from "lucide-react";

const STEPS = [
  {
    number: "01",
    Icon: Search,
    title: "Explore the Menu",
    description:
      "Browse our delicious pizza collection and find your favorite flavor.",
  },
  {
    number: "02",
    Icon: ShoppingBag,
    title: "Place Your Order",
    description:
      "Choose your pizza, provide your delivery details, and place your order.",
  },
  {
    number: "03",
    Icon: Bike,
    title: "Enjoy Your Pizza",
    description:
      "Your vendor prepares your order. Get it delivered fresh to your door.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-background px-5 py-16 text-foreground sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-brand">
            Simple Process
          </span>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How PizzaHub Works
          </h2>

          <p className="mt-4 leading-relaxed text-muted-foreground">
            Getting your favorite pizza delivered is easy. Just follow these
            three simple steps.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.15 }}
              className="relative rounded-2xl border border-border bg-card p-7 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <step.Icon className="size-7" />
                </div>

                <span className="font-heading text-3xl font-bold text-brand/30">
                  {step.number}
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-card-foreground">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}