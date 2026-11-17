"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">You are not signed in</h1>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-20">
      <div className="rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand font-heading text-xl font-bold text-white">
          {user.name?.[0]?.toUpperCase() ?? "P"}
        </span>
        <h1 className="font-heading mt-4 text-2xl font-bold">{user.name}</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">{user.email}</p>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-8 w-full rounded-full border border-black/15 px-6 py-3 text-[15px] font-semibold transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
