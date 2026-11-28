
"use client";

import Image from "next/image";
import { Reveal } from "@/components/scroll-reveal";

export default function Banner() {
  return (
    <section className="bg-nav text-nav-foreground">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Reveal className="space-y-6 lg:space-y-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-nav-muted">
              <span className="relative size-1.5 rounded-full bg-[#22c55e]">
                <span className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
              </span>
              Now delivering in 30 minutes or less
            </span>

            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Hot &amp; Fresh <br />
              Pizza Delivered <br />
              to <span className="text-brand">Your Door</span>.
            </h1>

            <p className="max-w-lg text-nav-muted leading-relaxed">
              Stone-baked crusts, slow-simmered tomato sauce and fresh
              mozzarella, made to order and at your table while it&rsquo;s still
              bubbling.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/menu"
                className="rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-brand-strong"
              >
                Explore Menu
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-nav-foreground/20 px-6 py-3 text-[15px] font-semibold text-nav-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-accent"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex items-center gap-8 border-t border-border pt-8 text-sm text-nav-muted">
              <div className="flex flex-col">
                <p className="font-heading text-2xl font-bold text-nav-foreground">
                  4.9<span className="font-sans text-xs">★</span>
                </p>
                <p className="text-xs">from 12,400 reviews</p>
              </div>
              <div className="flex flex-col">
                <p className="font-heading text-2xl font-bold text-nav-foreground">
                  28 min
                </p>
                <p className="text-xs">average delivery</p>
              </div>
              <div className="flex flex-col">
                <p className="font-heading text-2xl font-bold text-nav-foreground">
                  40+
                </p>
                <p className="text-xs">handcrafted pizzas</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="relative flex justify-center" delay={0.15}>
            <Image
              src="/images/pizza-banner.png"
              alt="Hot fresh pizza"
              width={600}
              height={600}
              priority
              className="h-auto max-w-full transition-transform duration-500 hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 600px"
            />

            <div className="absolute right-4 top-6 w-52 rounded-xl border border-border bg-card px-3 py-2 text-[12px] text-card-foreground shadow-lg">
              <p className="font-bold text-card-foreground">On its way</p>
              <p className="text-nav-muted">Arriving in 18 min</p>
            </div>

            <div className="absolute bottom-6 left-4 w-52 rounded-xl border border-border bg-card px-3 py-2 text-[12px] text-card-foreground shadow-lg">
              <p className="font-bold text-card-foreground">
                Fresh from the oven
              </p>
              <p className="text-nav-muted">Baked at 450°C</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
