import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const jar = await cookies();
  if (jar.get("dp_admin")?.value === "1") {
    redirect("/admin/panel");
  }

  const sp = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-3 py-12 sm:px-4 sm:py-16">
      <p className="mb-2 text-center text-xs uppercase tracking-widest text-[var(--dp-muted)]">
        Hidden route
      </p>
      <h1 className="font-[family-name:var(--font-syne)] text-center text-2xl font-bold text-white">
        Admin sign in
      </h1>
      {sp.error ? (
        <p className="mt-3 text-center text-sm text-red-400">
          Invalid username or password.
        </p>
      ) : null}

      <form action={loginAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="user" className="mb-1 block text-sm text-[var(--dp-muted)]">
            Username
          </label>
          <input
            id="user"
            name="user"
            autoComplete="username"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-[var(--dp-muted)]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none ring-[var(--dp-accent)] focus:ring-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--dp-accent)] py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Log in
        </button>
      </form>

      <Link
        href="/"
        className="mt-8 block text-center text-sm text-[var(--dp-muted)] hover:text-white"
      >
        ← Back to site
      </Link>
    </main>
  );
}
