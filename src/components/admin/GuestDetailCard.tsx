"use client";

import { useActionState } from "react";
import {
  checkInGuestAction,
  uncheckInGuestAction,
  updateTableAction,
  updateNotesAction,
  updateInvitedByAction,
  updateAttendanceAction,
  restoreRegistrationAction,
} from "@/app/admin/actions";
import type { Registration, ActionResponse } from "@/lib/types";
import { INVITED_BY_OPTIONS, TABLE_OPTIONS } from "@/lib/event-options";

const initialState: ActionResponse = { success: false, message: "" };

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function GuestDetailCard({
  registration,
  primaryName,
}: {
  registration: Registration;
  primaryName?: string;
}) {
  const [, checkInAction, checkInPending] = useActionState(
    checkInGuestAction,
    initialState
  );
  const [, uncheckAction, uncheckPending] = useActionState(
    uncheckInGuestAction,
    initialState
  );
  const [tableState, tableAction, tablePending] = useActionState(
    updateTableAction,
    initialState
  );
  const [notesState, notesAction, notesPending] = useActionState(
    updateNotesAction,
    initialState
  );
  const [invitedByState, invitedByAction, invitedByPending] = useActionState(
    updateInvitedByAction,
    initialState
  );
  const [, attendanceAction, attendancePending] = useActionState(
    updateAttendanceAction,
    initialState
  );
  const [, restoreAction, restorePending] = useActionState(
    restoreRegistrationAction,
    initialState
  );
  const hasCustomTable = Boolean(
    registration.table_assignment &&
      !TABLE_OPTIONS.includes(registration.table_assignment)
  );

  if (registration.deleted) {
    return (
      <div className="rounded-xl border border-red-200 bg-card p-6 shadow-sm">
        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          Deleted
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold text-foreground">
          {registration.full_name}
        </h2>
        <p className="mt-2 text-sm text-muted">
          This record is hidden from active lists, verification, and gate check-in.
        </p>
        <form action={restoreAction} className="mt-5">
          <input type="hidden" name="id" value={registration.id} />
          <button
            type="submit"
            disabled={restorePending}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {restorePending ? "Restoring..." : "Restore Registration"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {registration.full_name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  registration.is_primary_attendee
                    ? "bg-gold-light text-gold-dark"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {registration.is_primary_attendee ? "Primary" : "Extra Person"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  !registration.attendance_confirmed
                    ? "bg-gray-100 text-gray-700"
                    : registration.checked_in
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {!registration.attendance_confirmed
                  ? "Unable to Attend"
                  : registration.checked_in
                    ? "Checked In"
                    : "Not Checked In"}
              </span>
            </div>
          </div>

          {!registration.attendance_confirmed ? (
            <form action={attendanceAction}>
              <input type="hidden" name="id" value={registration.id} />
              <input type="hidden" name="attendanceConfirmed" value="true" />
              <button
                type="submit"
                disabled={attendancePending}
                className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold disabled:opacity-50"
              >
                Mark as Attending
              </button>
            </form>
          ) : !registration.checked_in ? (
            <form action={checkInAction}>
              <input type="hidden" name="id" value={registration.id} />
              <button
                type="submit"
                disabled={checkInPending}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {checkInPending ? "Checking in..." : "Mark as Checked In"}
              </button>
            </form>
          ) : (
            <form action={uncheckAction}>
              <input type="hidden" name="id" value={registration.id} />
              <button
                type="submit"
                disabled={uncheckPending}
                className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
              >
                {uncheckPending ? "Undoing..." : "Undo Check-in"}
              </button>
            </form>
          )}
        </div>

        {registration.attendance_confirmed && (
          <form action={attendanceAction} className="mt-4">
            <input type="hidden" name="id" value={registration.id} />
            <input type="hidden" name="attendanceConfirmed" value="false" />
            <button
              type="submit"
              disabled={attendancePending}
              className="text-sm font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50"
            >
              Mark as unable to attend
            </button>
          </form>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-muted">Phone Number</dt>
            <dd className="mt-0.5 text-sm text-foreground">
              {registration.phone_number || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">Email</dt>
            <dd className="mt-0.5 text-sm text-foreground">
              {registration.email || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">Invite Code</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">
              {registration.invite_code}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">Registered At</dt>
            <dd className="mt-0.5 text-sm text-foreground">
              {formatDateTime(registration.created_at)}
            </dd>
          </div>
          {registration.checked_in && registration.checked_in_at && (
            <div>
              <dt className="text-xs font-medium text-muted">Checked In At</dt>
              <dd className="mt-0.5 text-sm text-green-700">
                {formatDateTime(registration.checked_in_at)}
              </dd>
            </div>
          )}
          {!registration.is_primary_attendee && primaryName && (
            <div>
              <dt className="text-xs font-medium text-muted">Guest Of</dt>
              <dd className="mt-0.5 text-sm text-foreground">{primaryName}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">
          Table Assignment
        </h3>
        <form action={tableAction} className="mt-3 flex gap-2">
          <input type="hidden" name="id" value={registration.id} />
          <select
            key={registration.table_assignment ?? "unassigned"}
            name="table"
            defaultValue={registration.table_assignment || ""}
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="">Unassigned</option>
            {hasCustomTable && (
              <option value={registration.table_assignment || ""}>
                {registration.table_assignment} (current)
              </option>
            )}
            {TABLE_OPTIONS.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={tablePending}
            className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold disabled:opacity-50"
          >
            {tablePending ? "Saving..." : "Update"}
          </button>
        </form>
        {tableState.message && (
          <p
            className={`mt-2 text-xs ${tableState.success ? "text-green-600" : "text-error"}`}
          >
            {tableState.message}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Invited By</h3>
        <form action={invitedByAction} className="mt-3 flex gap-2">
          <input type="hidden" name="id" value={registration.id} />
          <select
            key={registration.invited_by ?? "unassigned"}
            name="invitedBy"
            defaultValue={registration.invited_by || ""}
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="">Unassigned</option>
            {INVITED_BY_OPTIONS.map((inviter) => (
              <option key={inviter} value={inviter}>
                {inviter}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={invitedByPending}
            className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold disabled:opacity-50"
          >
            {invitedByPending ? "Saving..." : "Update"}
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          This assignment applies to the primary attendee and linked extras.
        </p>
        {invitedByState.message && (
          <p
            className={`mt-2 text-xs ${invitedByState.success ? "text-green-600" : "text-error"}`}
          >
            {invitedByState.message}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Admin Notes</h3>
        <form action={notesAction} className="mt-3 space-y-2">
          <input type="hidden" name="id" value={registration.id} />
          <textarea
            name="notes"
            rows={3}
            defaultValue={registration.admin_notes || ""}
            placeholder="Add notes about this guest..."
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <button
            type="submit"
            disabled={notesPending}
            className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold disabled:opacity-50"
          >
            {notesPending ? "Saving..." : "Save Notes"}
          </button>
        </form>
        {notesState.message && (
          <p
            className={`mt-2 text-xs ${notesState.success ? "text-green-600" : "text-error"}`}
          >
            {notesState.message}
          </p>
        )}
      </div>
    </div>
  );
}
