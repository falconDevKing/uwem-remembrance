import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminHeader() {
  return (
    <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/admin"
            className="font-display text-lg font-semibold text-foreground"
          >
            Admin
          </Link>
        </div>

        <div className="hidden lg:block">
          <h1 className="text-sm font-medium text-muted">
            Remembrance Event Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-gold lg:hidden"
          >
            Public Site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-error hover:text-error"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <nav className="mt-2 flex gap-2 lg:hidden">
        <Link
          href="/admin"
          className="rounded-lg bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="/gate"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          Gate Check-in
        </Link>
      </nav>
    </header>
  );
}
