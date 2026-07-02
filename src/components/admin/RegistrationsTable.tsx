"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkInGuestAction, deleteRegistrationAction, restoreRegistrationAction, updateAttendanceAction, markInviteSentAction } from "@/app/admin/actions";
import type { ActionResponse, RegistrationListItem, RegistrationStatusFilter } from "@/lib/types";

const initialState: ActionResponse = { success: false, message: "" };

function buildWhatsAppUrl(reg: RegistrationListItem): string {
  const message = [
    `Dear ${reg.full_name},`,
    "",
    "You are warmly invited to the Remembrance Ceremony of Dr. (Mrs.) Uwem Oyekan.",
    "",
    "*📆Date*: Saturday, July 4th, 2026",
    "*🕚Time*: 11:00 AM",
    "*⛪Venue*: Amen Event Center, Abesan Estate Gate, Ipaja, Lagos.",
    "",
    "Your personal access code is:",
    `*_${reg.invite_code}_*`,
    "",
    "Kindly present your personalised invite or access code to the access team upon arrival.",
    "",
    "To aid your movement, you can click on this link below to set your navigation to the venue:",
    "https://share.google/CiTIcCGUWKUZs4PGi",
    "",
    "",
    "We look forward to receiving you.",
    "",
    "",
    "*✍️ On Behalf of the Oyekan Family*",
  ].join("\n");

  const encoded = encodeURIComponent(message);
  const phone = (reg.phone_number || reg.source_phone)?.replace(/\D/g, "");
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function adminHref({ page, query, status, withNotes }: { page: number; query: string; status: RegistrationStatusFilter; withNotes: boolean }): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (status !== "all") params.set("status", status);
  if (withNotes) params.set("notes", "with");
  const queryString = params.toString();
  return queryString ? `/admin?${queryString}` : "/admin";
}

function getRowAccent(reg: RegistrationListItem): string {
  if (reg.checked_in) return "border-l-green-500";
  if (reg.invite_sent) return "border-l-amber-400";
  if (!reg.attendance_confirmed) return "border-l-red-400";
  return "border-l-transparent";
}

export default function RegistrationsTable({
  registrations,
  total,
  page,
  pageSize,
  totalPages,
  query,
  status,
  withNotes,
}: {
  registrations: RegistrationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  status: RegistrationStatusFilter;
  withNotes: boolean;
  siteUrl: string;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);
  const [, checkInAction, checkInPending] = useActionState(checkInGuestAction, initialState);
  const [, deleteAction, deletePending] = useActionState(deleteRegistrationAction, initialState);
  const [, attendanceAction, attendancePending] = useActionState(updateAttendanceAction, initialState);
  const [, restoreAction, restorePending] = useActionState(restoreRegistrationAction, initialState);
  const [, inviteSentAction, inviteSentPending] = useActionState(markInviteSentAction, initialState);
  const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value;
            setSearchValue(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              router.replace(adminHref({ page: 1, query: value, status, withNotes }), { scroll: false });
            }, 300);
          }}
          placeholder="Search by name or phone..."
          className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          {(["all", "checked_in", "not_checked_in", "unable", "not_sent", "deleted"] as const).map((filter) => (
            <Link
              key={filter}
              href={adminHref({ page: 1, query, status: filter, withNotes })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === filter ? "bg-gold-dark text-white" : "border border-border text-muted hover:border-gold hover:text-gold"
              }`}
            >
              {filter === "all"
                ? "All"
                : filter === "checked_in"
                  ? "Checked In"
                  : filter === "not_checked_in"
                    ? "Not Checked In"
                    : filter === "unable"
                      ? "Not Attending"
                      : filter === "not_sent"
                        ? "Not Sent"
                        : "Deleted"}
            </Link>
          ))}
          <Link
            href={adminHref({
              page: 1,
              query,
              status,
              withNotes: !withNotes,
            })}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              withNotes ? "bg-blue-700 text-white" : "border border-border text-muted hover:border-blue-500 hover:text-blue-700"
            }`}
          >
            With Notes
          </Link>
        </div>
      </div>

      {/* Mobile: Card layout */}
      <div className="space-y-3 md:hidden">
        {registrations.map((registration) => (
          <div key={registration.id} className={`rounded-xl border border-border bg-card shadow-sm border-l-4 ${getRowAccent(registration)}`}>
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <Link href={`/admin/registrations/${registration.id}`} className="font-medium text-foreground hover:text-gold">
                {registration.full_name}
              </Link>
              <div className="flex gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    registration.is_primary_attendee ? "bg-gold-light text-gold-dark" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {registration.is_primary_attendee ? "Primary" : "Extra"}
                </span>
                {registration.deleted ? (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">Deleted</span>
                ) : !registration.attendance_confirmed ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">Unable</span>
                ) : registration.checked_in ? (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">Checked In</span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">Pending</span>
                )}
              </div>
            </div>

            <dl className="px-4 py-3 text-xs">
              <div className="flex justify-between py-1">
                <dt className="w-24 text-muted">Phone</dt>
                <dd className="flex-1 text-right text-foreground">
                  {registration.phone_number ? (
                    <span className="inline-flex items-center gap-1">
                      {registration.phone_number}
                      {registration.duplicate_phone && (
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700">
                          !
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted">&mdash;</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="w-24 text-muted">Guest Of</dt>
                <dd className="flex-1 text-right text-foreground">{registration.source_name || <span className="text-muted">&mdash;</span>}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="w-24 text-muted">Table</dt>
                <dd className="flex-1 text-right text-foreground">{registration.table_assignment || <span className="text-muted">&mdash;</span>}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="w-24 text-muted">Invited By</dt>
                <dd className="flex-1 text-right text-foreground">{registration.invited_by || <span className="text-muted">&mdash;</span>}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="w-24 text-muted">Registered</dt>
                <dd className="flex-1 text-right text-foreground">{formatDate(registration.created_at)}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
              <Link
                href={`/admin/registrations/${registration.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
              >
                View
              </Link>
              {!registration.deleted && (
                <>
                  <button
                    type="button"
                    disabled={downloadingCode === registration.invite_code}
                    onClick={async () => {
                      setDownloadingCode(registration.invite_code);
                      try {
                        const res = await fetch(`/api/invite/${registration.invite_code}`);
                        if (!res.ok) {
                          alert("Failed to generate invite");
                          return;
                        }
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${registration.full_name} - Invite.jpeg`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } finally {
                        setDownloadingCode(null);
                      }
                    }}
                    className="rounded-lg border border-gold-light px-3 py-1.5 text-xs font-medium text-gold-dark hover:bg-gold-light disabled:opacity-50"
                  >
                    {downloadingCode === registration.invite_code ? "..." : "Download Invite"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(buildWhatsAppUrl(registration), "_blank")}
                    className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                  >
                    Share
                  </button>
                  <form action={inviteSentAction}>
                    <input type="hidden" name="id" value={registration.id} />
                    <input type="hidden" name="sent" value={registration.invite_sent ? "false" : "true"} />
                    <button
                      type="submit"
                      disabled={inviteSentPending}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                        registration.invite_sent
                          ? "border border-green-200 bg-green-50 text-green-700 hover:bg-white"
                          : "border border-border text-muted hover:border-gold hover:text-gold"
                      }`}
                    >
                      {registration.invite_sent ? "✓ Sent" : "Mark Sent"}
                    </button>
                  </form>
                </>
              )}
              {registration.deleted ? (
                <form action={restoreAction}>
                  <input type="hidden" name="id" value={registration.id} />
                  <button
                    type="submit"
                    disabled={restorePending}
                    className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-50"
                  >
                    Restore
                  </button>
                </form>
              ) : (
                <>
                  {registration.attendance_confirmed && !registration.checked_in && (
                    <form action={checkInAction}>
                      <input type="hidden" name="id" value={registration.id} />
                      <button
                        type="submit"
                        disabled={checkInPending}
                        className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 disabled:opacity-50"
                      >
                        Check In
                      </button>
                    </form>
                  )}
                  <form action={attendanceAction}>
                    <input type="hidden" name="id" value={registration.id} />
                    <input type="hidden" name="attendanceConfirmed" value={registration.attendance_confirmed ? "false" : "true"} />
                    <button
                      type="submit"
                      disabled={attendancePending}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                    >
                      {registration.attendance_confirmed ? "Not Attending" : "To Attend"}
                    </button>
                  </form>
                  <form
                    action={deleteAction}
                    onSubmit={(e) => {
                      if (!confirm(`Mark ${registration.full_name} as deleted?`)) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={registration.id} />
                    <button
                      type="submit"
                      disabled={deletePending}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-error hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))}
        {registrations.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted">No registrations found.</div>
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="px-4 py-3 font-medium text-muted">Name</th>
              <th className="px-4 py-3 font-medium text-muted">Type</th>
              <th className="hidden px-4 py-3 font-medium text-muted lg:table-cell">Guest Of</th>
              <th className="px-4 py-3 font-medium text-muted">Phone</th>
              <th className="hidden px-4 py-3 font-medium text-muted xl:table-cell">Invited By</th>
              <th className="px-4 py-3 font-medium text-muted">Status</th>
              <th className="hidden px-4 py-3 font-medium text-muted lg:table-cell">Table</th>
              <th className="hidden px-4 py-3 font-medium text-muted lg:table-cell">Registered</th>
              <th className="px-4 py-3 font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.map((registration) => (
              <tr key={registration.id} className={`hover:bg-background/30 border-l-4 ${getRowAccent(registration)}`}>
                <td className="px-4 py-3">
                  <Link href={`/admin/registrations/${registration.id}`} className="font-medium text-foreground hover:text-gold">
                    {registration.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      registration.is_primary_attendee ? "bg-gold-light text-gold-dark" : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {registration.is_primary_attendee ? "Primary" : "Extra"}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">{registration.source_name || "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {registration.phone_number ? (
                    <span className="flex items-center gap-1">
                      {registration.phone_number}
                      {registration.duplicate_phone && (
                        <span
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700"
                          title="Duplicate phone number"
                        >
                          !
                        </span>
                      )}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="hidden px-4 py-3 text-muted xl:table-cell">{registration.invited_by || "—"}</td>
                <td className="px-4 py-3">
                  {registration.deleted ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Deleted</span>
                  ) : !registration.attendance_confirmed ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Unable</span>
                  ) : registration.checked_in ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Checked In</span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Pending</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">{registration.table_assignment || "—"}</td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">{formatDate(registration.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/registrations/${registration.id}`}
                      className="rounded px-2 py-1 text-xs text-muted transition-colors hover:bg-background hover:text-foreground"
                    >
                      View
                    </Link>
                    {!registration.deleted && (
                      <>
                        <button
                          type="button"
                          disabled={downloadingCode === registration.invite_code}
                          onClick={async () => {
                            setDownloadingCode(registration.invite_code);
                            try {
                              const res = await fetch(`/api/invite/${registration.invite_code}`);
                              if (!res.ok) {
                                alert("Failed to generate invite");
                                return;
                              }
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${registration.full_name} - Invite.jpeg`;
                              a.click();
                              URL.revokeObjectURL(url);
                            } finally {
                              setDownloadingCode(null);
                            }
                          }}
                          className="rounded px-2 py-1 text-xs text-gold-dark transition-colors hover:bg-gold-light disabled:opacity-50"
                        >
                          {downloadingCode === registration.invite_code ? "..." : "Download Invite"}
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(buildWhatsAppUrl(registration), "_blank")}
                          className="rounded px-2 py-1 text-xs text-green-700 transition-colors hover:bg-green-50"
                        >
                          Share
                        </button>
                        <form action={inviteSentAction}>
                          <input type="hidden" name="id" value={registration.id} />
                          <input type="hidden" name="sent" value={registration.invite_sent ? "false" : "true"} />
                          <button
                            type="submit"
                            disabled={inviteSentPending}
                            className={`rounded px-2 py-1 text-xs transition-colors disabled:opacity-50 ${
                              registration.invite_sent ? "text-green-700 hover:bg-green-50" : "text-muted hover:bg-background hover:text-foreground"
                            }`}
                          >
                            {registration.invite_sent ? "✓ Sent" : "Sent?"}
                          </button>
                        </form>
                      </>
                    )}
                    {registration.deleted ? (
                      <form action={restoreAction}>
                        <input type="hidden" name="id" value={registration.id} />
                        <button
                          type="submit"
                          disabled={restorePending}
                          className="rounded px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
                        >
                          Restore
                        </button>
                      </form>
                    ) : (
                      <>
                        {registration.attendance_confirmed && !registration.checked_in && (
                          <form action={checkInAction}>
                            <input type="hidden" name="id" value={registration.id} />
                            <button
                              type="submit"
                              disabled={checkInPending}
                              className="rounded px-2 py-1 text-xs text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                            >
                              Check In
                            </button>
                          </form>
                        )}
                        <form action={attendanceAction}>
                          <input type="hidden" name="id" value={registration.id} />
                          <input type="hidden" name="attendanceConfirmed" value={registration.attendance_confirmed ? "false" : "true"} />
                          <button
                            type="submit"
                            disabled={attendancePending}
                            className="rounded px-2 py-1 text-xs text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
                          >
                            {registration.attendance_confirmed ? "Not Attending" : "To Attend"}
                          </button>
                        </form>
                        <form
                          action={deleteAction}
                          onSubmit={(e) => {
                            if (!confirm(`Mark ${registration.full_name} as deleted?`)) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={registration.id} />
                          <button
                            type="submit"
                            disabled={deletePending}
                            className="rounded px-2 py-1 text-xs text-error transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted">
                  No registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {firstResult}–{lastResult} of {total}
        </p>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={adminHref({ page: page - 1, query, status, withNotes })}
              className="rounded-lg border border-border px-3 py-1.5 font-medium transition-colors hover:border-gold hover:text-gold"
            >
              Previous
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-lg border border-border px-3 py-1.5 opacity-40">Previous</span>
          )}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={adminHref({ page: page + 1, query, status, withNotes })}
              className="rounded-lg border border-border px-3 py-1.5 font-medium transition-colors hover:border-gold hover:text-gold"
            >
              Next
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-lg border border-border px-3 py-1.5 opacity-40">Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
