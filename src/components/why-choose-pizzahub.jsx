"use client";

import Link from "next/link";
import { Clock, Leaf, Flame, Tag } from "lucide-react";

const FEATURES = [
  {
    Icon: Clock,
    iconBg: "bg-[#ea3d1b]",
    title: "Delivered in 30 minutes",
    desc: "Live tracking from the oven to your door, with a hot-pizza guarantee.",
  },
  {
    Icon: Leaf,
    iconBg: "bg-[#ea8a2d]",
    title: "Fresh ingredients",
    desc: "Dough made daily, vegetables from local farms, no shortcuts.",
  },
  {
    Icon: Flame,
    iconBg: "bg-[#10b981]",
    title: "Stone-baked",
    desc: "Every pie goes through a 450°C oven for a crisp, charred crust.",
  },
  {
    Icon: Tag,
    iconBg: "bg-[#171717]",
    title: "Fair prices, no fees",
    desc: "Clear menu prices, free delivery over $25 and weekly member deals.",
  },
];

export default function WhyChoosePizzaHub() {
  return (
    <section className="bg-nav text-nav-foreground min-h-screen py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="lg:pr-12">
            <h1 className="font-heading text-5xl font-bold tracking-tight lg:text-6xl leading-tight">
              Why choose
              <br />
              PizzaHub?
            </h1>

            <p className="mt-6 max-w-lg text-nav-muted leading-relaxed">
              We cook like a neighborhood pizzeria and deliver like it's our
              job, because it is.
            </p>

            <div className="mt-10">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-strong"
              >
                Order now
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className={`mb-4 inline-flex items-center justify-center size-12 rounded-xl p-2 text-white ${feature.iconBg}`}>
                  <feature.Icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-nav-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
