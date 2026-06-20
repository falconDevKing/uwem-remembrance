import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getPaginatedGateRegistrations } from "@/lib/registrations";
import GateLoginForm from "@/components/gate/GateLoginForm";
import GateRegistrationsTable from "@/components/gate/GateRegistrationsTable";
import { gateDashboardLogoutAction } from "./actions";

const PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parsePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function GatePage(props: PageProps<"/gate">) {
  const session = await verifySession();
  const canAccess = session.authenticated && (session.role === "gate" || session.role === "admin");

  if (!canAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border-t-4 border-gold bg-card p-8 shadow-lg">
          <p className="text-sm text-muted">Remembrance Event</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">Gate Check-in</h1>
          <p className="mt-2 mb-6 text-sm text-muted">Sign in to search guests and record arrivals. {process.env.ADMIN_PASSWORD}</p>
          <GateLoginForm />
          <Link href="/" className="mt-6 block text-center text-sm text-muted hover:text-gold">
            Back to public site
          </Link>
        </div>
      </main>
    );
  }

  const searchParams = await props.searchParams;
  const page = parsePage(firstValue(searchParams.page));
  const query = firstValue(searchParams.q).trim();
  const result = await getPaginatedGateRegistrations({
    page,
    pageSize: PAGE_SIZE,
    query,
  });

  if (page > result.totalPages) {
    const params = new URLSearchParams();
    params.set("page", String(result.totalPages));
    if (query) params.set("q", query);
    redirect(`/gate?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Remembrance Event</p>
            <h1 className="font-display text-3xl font-semibold text-foreground">Gate Check-in</h1>
          </div>
          {session.role === "admin" ? (
            <Link href="/admin" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">
              Back to Admin
            </Link>
          ) : (
            <form action={gateDashboardLogoutAction}>
              <button type="submit" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">
                Sign Out
              </button>
            </form>
          )}
        </header>

        <GateRegistrationsTable
          registrations={result.registrations}
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          totalPages={result.totalPages}
          query={query}
        />
      </div>
    </main>
  );
}
