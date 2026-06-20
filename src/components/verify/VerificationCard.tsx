import type { Registration } from "@/lib/types";

function maskPhone(phone: string | null): string {
  if (!phone) return "Not provided";
  if (phone.length <= 4) return phone;
  return "*".repeat(phone.length - 4) + phone.slice(-4);
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ProtocolNotes({ notes }: { notes: string | null | undefined }) {
  if (!notes) return null;
  return (
    <div className="mx-auto mt-4 max-w-sm rounded-lg border border-amber-200 bg-amber-50 p-3 text-left">
      <p className="text-xs font-medium text-amber-800">Protocol Notes</p>
      <p className="mt-1 text-sm text-amber-900">{notes}</p>
    </div>
  );
}

export function ValidAccessCard({
  registration,
  extras,
  primaryName,
  adminNotes,
}: {
  registration: Registration;
  extras: Registration[];
  primaryName?: string;
  adminNotes?: string | null;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-14 w-14 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-green-700">
        Access Confirmed
      </h1>
      <p className="mt-2 text-2xl font-semibold text-foreground">
        {registration.full_name}
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border bg-card p-5 text-left shadow-sm">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Phone</dt>
            <dd className="font-medium">{maskPhone(registration.phone_number)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Status</dt>
            <dd className="font-medium text-green-600">Confirmed</dd>
          </div>
          {!registration.is_primary_attendee && primaryName && (
            <div className="flex justify-between">
              <dt className="text-muted">Guest Of</dt>
              <dd className="font-medium">{primaryName}</dd>
            </div>
          )}
          {registration.table_assignment && (
            <div className="flex justify-between">
              <dt className="text-muted">Table</dt>
              <dd className="font-medium">{registration.table_assignment}</dd>
            </div>
          )}
        </dl>

        {registration.is_primary_attendee && extras.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted">
              Attending with {extras.length} guest(s):
            </p>
            <ul className="mt-1 space-y-1">
              {extras.map((e) => (
                <li key={e.id} className="text-sm text-foreground">
                  {e.full_name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ProtocolNotes notes={adminNotes} />
    </div>
  );
}

export function AlreadyCheckedInCard({
  registration,
  adminNotes,
}: {
  registration: Registration;
  adminNotes?: string | null;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
        <svg
          className="h-14 w-14 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-amber-700">
        Already Checked In
      </h1>
      <p className="mt-2 text-2xl font-semibold text-foreground">
        {registration.full_name}
      </p>
      {registration.checked_in_at && (
        <p className="mt-2 text-sm text-muted">
          Checked in at {formatDateTime(registration.checked_in_at)}
        </p>
      )}
      <p className="mt-4 text-sm text-muted">
        This guest has already been admitted.
      </p>

      <ProtocolNotes notes={adminNotes} />
    </div>
  );
}

export function InvalidInviteCard() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-14 w-14 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-red-700">
        Invalid Invite
      </h1>
      <p className="mt-4 text-lg text-muted">
        This QR code is not recognised. Please check with the event organiser.
      </p>
    </div>
  );
}

export function NotAttendingCard() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-14 w-14 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-gray-600">
        Attendance Not Confirmed
      </h1>
      <p className="mt-4 text-lg text-muted">
        This guest has not confirmed their attendance.
      </p>
    </div>
  );
}
