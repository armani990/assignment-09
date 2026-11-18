"use client";

import Link from "next/link";
import { useState } from "react";

function Input({ id, label, type, value, onChange, iconRight, onIconClick }) {
  return (
    <div className="space-y-1.5 text-left">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-black/70 dark:text-white/70"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-black/15 px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand dark:border-white/20 dark:bg-black/5 dark:text-white"
        />

        {iconRight && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-black/40 transition-colors hover:text-brand dark:text-white/40 dark:hover:text-brand"
            aria-label={iconRight}
          >
            {iconRight}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-brand">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-[18px]"
            fill="#fff"
          >
            <path d="M12 3.2 3.6 19.4a1 1 0 0 0 1.2 1.4c2.3-.7 4.7-1 7.2-1s4.9.3 7.2 1a1 1 0 0 0 1.2-1.4L12 3.2Z" />
            <circle cx="12" cy="9.6" r="1.15" fill="#ea3d1b" />
            <circle cx="9.4" cy="14.4" r="1.05" fill="#ea3d1b" />
            <circle cx="14.7" cy="14.4" r="1.05" fill="#ea3d1b" />
          </svg>
        </div>

        <h1 className="mb-2 font-heading text-2xl font-bold">
          Welcome back
        </h1>

        <p className="mb-8 mt-2 text-sm text-black/60 dark:text-white/60">
          Sign in to order your favorite pizza.
        </p>

        <form className="space-y-5">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input
            id="password"
            label="Password"
            type={passwordVisible ? "text" : "password"}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            iconRight={passwordVisible ? "Hide" : "Show"}
            onIconClick={() => setPasswordVisible(!passwordVisible)}
          />

          <button
            type="button"
            className="w-full rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            Sign In
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10 dark:border-white/10" />
            </div>

            <span className="relative bg-white px-4 text-xs font-semibold text-black/40 dark:bg-black dark:text-white/40">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-3 text-[15px] font-semibold text-black/70 transition-colors hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66v-1.96c-1.37 1.2-2.95 1.96-4.68 1.96-3.46 0-6.4-2.2-7.56-5.21H2.19v2.05C3.27 21.62 7.09 23 12 23" />
              <path d="M5.84 14.09c-.19-.63-.3-1.31-.3-2.05s.11-1.42.3-2.05V7.07H2.19C1.09 8.77.29 11.26.29 14.09s.8 5.32 1.9 7v1.96c1.16-2.1 2.76-3.52 4.68-3.52s3.52 1.42 4.68 3.52v-1.96c-1.16-1.68-2.76-2.91-4.68-2.91" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64v2.06H12V7.07c-1.16-1.08-2.62-1.69-4.21-1.69S3.58 5.99 3.58 7.07v1.96c0 1.08.44 2.05 1.2 2.77h2.65c-.52-.96-.83-2.05-.83-3.21 0-1.16.31-2.25.83-3.21H5.04c.79-.69 1.76-1.09 2.83-1.09 1.16 0 2.12.4 2.83 1.09H12z" />
            </svg>
            Google
          </button>

          <p className="mt-4 text-left text-sm text-black/60 dark:text-white/60">
            <a href="#" className="font-semibold text-brand hover:underline">
              Forgot Password?
            </a>
          </p>

          <p className="mt-6 text-sm text-black/60 dark:text-white/60">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand hover:underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}