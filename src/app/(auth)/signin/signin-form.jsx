"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authClient, useSession } from "@/lib/auth-client";

function Input({ id, label, type, value, onChange, iconRight, onIconClick }) {
  return (
    <div className="space-y-1.5 text-left">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-nav-muted"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required
          className="w-full rounded-lg border border-white/10 px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand dark:border-white/20 dark:text-white"
        />

        {iconRight && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-nav-muted transition-colors hover:text-brand dark:text-white/40 dark:hover:text-brand"
            aria-label={iconRight}
          >
            {iconRight}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SignInForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users to Home.
  // Redirect authenticated users to their dashboard.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isPending, session?.user, router]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: form.email,
        password: form.password,
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(error.message || "Sign in failed.");
        setLoading(false);
        toast.error(error.message || "Sign in failed.");
        return;
      }

      toast.success("Signed in successfully.");
      router.replace("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleGoogleSignin = async () => {
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/signin",
      });

      if (error) {
        setError(error.message || "Google sign in failed.");
        setLoading(false);
        toast.error(error.message || "Google sign in failed.");
      }
    } catch {
      setError("Google sign in failed. Please try again.");
      setLoading(false);
      toast.error("Google sign in failed. Please try again.");
    }
  };

  // Prevent showing the form while checking the session.
  if (isPending || session?.user) {
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 p-8 text-center bg-white/5 dark:bg-white/5">
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

        <h1 className="mb-2 font-heading text-2xl font-bold text-white">
          Welcome back
        </h1>

        <p className="mb-8 mt-2 text-sm text-nav-muted">
          Sign in to order your favorite pizza.
        </p>

        <form onSubmit={handleSignin} className="space-y-5">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            id="password"
            label="Password"
            type={passwordVisible ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            iconRight={passwordVisible ? "Hide" : "Show"}
            onIconClick={() => setPasswordVisible(!passwordVisible)}
          />

          {error && <p className="text-left text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/10 dark:border-white/10" />
            </div>

            <span className="relative bg-white/10 px-4 text-xs font-semibold text-nav-muted">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/5"
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
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64v2.06H12V7.07c-1.16-1.08-2.62-1.69-4.21-1.69S3.58 5.99 3.58 7.07v1.96c0 1.08.44 2.05 1.2 2.77h2.65c-.52-.96-.83-2.05-.83-3.21H5.04c.79-.69 1.76-1.09 2.83-1.09 1.16 0 2.12.4 2.83 1.09H12z" />
            </svg>
            Google
          </button>

          <p className="mt-4 text-left text-sm text-nav-muted">
            <a href="#" className="font-semibold text-brand hover:underline">
              Forgot Password?
            </a>
          </p>

          <p className="mt-6 text-sm text-nav-muted">
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
