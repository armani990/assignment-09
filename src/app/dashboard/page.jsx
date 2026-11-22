"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const DASHBOARD_ROUTES = {
  admin: "/dashboard/admin",
  vendor: "/dashboard/vendor",
  customer: "/dashboard/customer",
};

export default function DashboardIndex() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const userId = session?.user?.id;
  const role = session?.user?.role;

  useEffect(() => {
    if (isPending) return;

    if (!userId) {
      router.replace("/signin");
      return;
    }

    const dashboardPath = DASHBOARD_ROUTES[role];

    if (!dashboardPath) {
      router.replace("/");
      return;
    }

    router.replace(dashboardPath);
  }, [isPending, userId, role, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="status"
        aria-label="Redirecting to dashboard"
        className="size-10 animate-spin rounded-full border-4 border-brand border-t-transparent"
      />
    </div>
  );
}