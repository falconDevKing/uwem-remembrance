import { verifySession } from "@/lib/session";
import {
  getRegistrationByInviteCode,
  getExtrasForRegistration,
  getLinkedPrimary,
} from "@/lib/registrations";
import {
  ValidAccessCard,
  AlreadyCheckedInCard,
  InvalidInviteCard,
  NotAttendingCard,
} from "@/components/verify/VerificationCard";
import CheckInButton from "@/components/verify/CheckInButton";
import VerifyLoginForm from "@/components/verify/VerifyLoginForm";

export default async function VerifyPage({
  params,
}: PageProps<"/verify/[inviteCode]">) {
  const { inviteCode } = await params;
  const session = await verifySession();

  if (!session.authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border-t-4 border-gold bg-card p-8 shadow-lg">
            <p className="text-sm text-muted">Remembrance Event</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-foreground">
              Guest Verification
            </h1>
            <p className="mt-2 mb-6 text-sm text-muted">
              Enter the gate password to view guest details.
            </p>
            <VerifyLoginForm />
          </div>
        </div>
      </main>
    );
  }

  const registration = await getRegistrationByInviteCode(inviteCode);

  if (!registration) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-lg">
          <InvalidInviteCard />
        </div>
      </main>
    );
  }

  if (!registration.attendance_confirmed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-lg">
          <NotAttendingCard />
        </div>
      </main>
    );
  }

  if (registration.checked_in) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-lg">
          <AlreadyCheckedInCard
            registration={registration}
            adminNotes={registration.admin_notes}
          />
        </div>
      </main>
    );
  }

  const extras = registration.is_primary_attendee
    ? await getExtrasForRegistration(registration.id)
    : [];

  const primaryName =
    !registration.is_primary_attendee && registration.linked_to_id
      ? (await getLinkedPrimary(registration.linked_to_id))?.full_name
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
        <ValidAccessCard
          registration={registration}
          extras={extras}
          primaryName={primaryName}
          adminNotes={registration.admin_notes}
        />
        <CheckInButton inviteCode={inviteCode} />
      </div>
    </main>
  );
}
