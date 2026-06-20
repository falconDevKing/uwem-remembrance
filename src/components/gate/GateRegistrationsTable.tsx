"use client";

import { useActionState } from "react";
import Link from "next/link";
import { gateDashboardCheckInAction } from "@/app/gate/actions";
import type { ActionResponse, RegistrationListItem } from "@/lib/types";

const initialState: ActionResponse = { success: false, message: "" };

function gateHref(page: number, query: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  const value = params.toString();
  return value ? `/gate?${value}` : "/gate";
}

export default function GateRegistrationsTable({
  registrations,
  total,
  page,
  pageSize,
  totalPages,
  query,
}: {
  registrations: RegistrationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
}) {
  const [state, checkInAction, pending] = useActionState(gateDashboardCheckInAction, initialState);
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <form action="/gate" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name or invite code..."
          className="min-w-0 flex-1 rounded-lg border border-border bg-white px-4 py-3 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <button type="submit" className="rounded-lg bg-foreground px-5 py-3 font-medium text-white">
          Search
        </button>
      </form>

      {state.message && (
        <p role="status" className={`rounded-lg px-4 py-3 text-sm ${state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-error"}`}>
          {state.message}
        </p>
      )}

      {/* Mobile: Card layout */}
      <div className="space-y-3 sm:hidden">
        {registrations.map((registration) => (
          <div key={registration.id} className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="font-medium text-foreground">{registration.full_name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">{registration.invite_code}</p>
              </div>
              {!registration.attendance_confirmed ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">Unable</span>
              ) : registration.checked_in ? (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">Checked In</span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">Pending</span>
              )}
            </div>
            <dl className="px-4 py-3 text-xs">
              {/* <div className="flex justify-between py-1">
                <dt className="w-20 text-muted">Type</dt>
                <dd className="flex-1 text-right text-foreground">{registration.is_primary_attendee ? "Primary" : "Extra"}</dd>
              </div> */}
              <div className="flex justify-between py-1">
                <dt className="w-20 text-muted">Guest Of</dt>
                <dd className="flex-1 text-right text-foreground">{registration.source_name || <span className="text-muted">&mdash;</span>}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="w-20 text-muted">Table</dt>
                <dd className="flex-1 text-right text-foreground">{registration.table_assignment || <span className="text-muted">&mdash;</span>}</dd>
              </div>
            </dl>
            {registration.attendance_confirmed && !registration.checked_in && (
              <div className="border-t border-border px-4 py-3">
                <form action={checkInAction}>
                  <input type="hidden" name="id" value={registration.id} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    Check In
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
        {registrations.length === 0 && <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted">No guests found.</div>}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background/60">
              <th className="px-4 py-3 font-medium text-muted">Name</th>
              <th className="px-4 py-3 font-medium text-muted">Code</th>
              <th className="hidden px-4 py-3 font-medium text-muted md:table-cell">Type</th>
              <th className="hidden px-4 py-3 font-medium text-muted md:table-cell">Guest Of</th>
              <th className="hidden px-4 py-3 font-medium text-muted lg:table-cell">Table</th>
              <th className="px-4 py-3 font-medium text-muted">Status</th>
              <th className="px-4 py-3 font-medium text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.map((registration) => (
              <tr key={registration.id}>
                <td className="px-4 py-3 font-medium text-foreground">{registration.full_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{registration.invite_code}</td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{registration.is_primary_attendee ? "Primary" : "Extra"}</td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{registration.source_name || "—"}</td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">{registration.table_assignment || "—"}</td>
                <td className="px-4 py-3">
                  {!registration.attendance_confirmed ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Unable</span>
                  ) : registration.checked_in ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Checked In</span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {registration.attendance_confirmed && !registration.checked_in ? (
                    <form action={checkInAction}>
                      <input type="hidden" name="id" value={registration.id} />
                      <button
                        type="submit"
                        disabled={pending}
                        className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                      >
                        Check In
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No guests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {first}–{last} of {total}
        </p>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link className="rounded-lg border border-border px-3 py-2" href={gateHref(page - 1, query)}>
              Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-2 opacity-40">Previous</span>
          )}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link className="rounded-lg border border-border px-3 py-2" href={gateHref(page + 1, query)}>
              Next
            </Link>
          ) : (
            <span className="rounded-lg border border-border px-3 py-2 opacity-40">Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
