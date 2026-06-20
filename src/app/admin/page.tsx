import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/session";
import {
  computeStats,
  getPaginatedRegistrations,
} from "@/lib/registrations";
import type { RegistrationStatusFilter } from "@/lib/types";
import SummaryCards from "@/components/admin/SummaryCards";
import RegistrationsTable from "@/components/admin/RegistrationsTable";

const PAGE_SIZE = 20;

function firstQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseStatus(value: string): RegistrationStatusFilter {
  return value === "checked_in" || value === "not_checked_in" || value === "unable" || value === "deleted"
    ? value
    : "all";
}

export default async function AdminDashboardPage(
  props: PageProps<"/admin">
) {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const searchParams = await props.searchParams;
  const page = parsePage(firstQueryValue(searchParams.page));
  const query = firstQueryValue(searchParams.q).trim();
  const status = parseStatus(firstQueryValue(searchParams.status));
  const withNotes = firstQueryValue(searchParams.notes) === "with";

  const [stats, result] = await Promise.all([
    computeStats(),
    getPaginatedRegistrations({
      page,
      pageSize: PAGE_SIZE,
      query,
      status,
      withNotes,
    }),
  ]);

  if (page > result.totalPages) {
    const params = new URLSearchParams();
    params.set("page", String(result.totalPages));
    if (query) params.set("q", query);
    if (status !== "all") params.set("status", status);
    if (withNotes) params.set("notes", "with");
    redirect(`/admin?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <Link
          href="/api/admin/export"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-gold hover:text-gold"
        >
          Export CSV
        </Link>
      </div>

      <SummaryCards stats={stats} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Registrations
        </h2>
        <RegistrationsTable
          registrations={result.registrations}
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          totalPages={result.totalPages}
          query={query}
          status={status}
          withNotes={withNotes}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL || ""}
        />
      </div>
    </div>
  );
}
