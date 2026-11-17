"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export default function DemoSignIn({ label = "Continue" }) {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        login();
        router.push("/");
      }}
      className="mt-6 w-full rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
    >
      {label}
    </button>
  );
}
