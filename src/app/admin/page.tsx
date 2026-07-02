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
  return value === "checked_in" || value === "not_checked_in" || value === "unable" || value === "deleted" || value === "not_sent"
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
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-gold hover:text-gold"
            title="Refresh data"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 4.356v4.992" />
            </svg>
          </Link>
          <Link
            href="/api/admin/export"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-gold hover:text-gold"
          >
            Export CSV
          </Link>
        </div>
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
