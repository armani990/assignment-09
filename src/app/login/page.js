import Link from "next/link";
import DemoSignIn from "@/components/demo-sign-in";

export const metadata = {
  title: "Sign In · PizzaHub",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
        <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Sign in to order your favorite pizza.
        </p>
        <DemoSignIn label="Sign In" />
        <p className="mt-6 text-sm text-black/60 dark:text-white/60">
          New here?{" "}
          <Link href="/signup" className="text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
