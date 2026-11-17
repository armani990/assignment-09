import Link from "next/link";
import DemoSignIn from "@/components/demo-sign-in";

export const metadata = {
  title: "Sign Up · PizzaHub",
};

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
        <h1 className="font-heading text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Join PizzaHub and get your first slice delivered.
        </p>
        <DemoSignIn label="Sign Up" />
        <p className="mt-6 text-sm text-black/60 dark:text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
