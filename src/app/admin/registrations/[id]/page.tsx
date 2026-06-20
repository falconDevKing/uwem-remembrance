import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/session";
import {
  getRegistrationById,
  getExtrasForRegistration,
  getLinkedPrimary,
} from "@/lib/registrations";
import GuestDetailCard from "@/components/admin/GuestDetailCard";
import ExtraPersonsList from "@/components/admin/ExtraPersonsList";

export default async function GuestDetailPage({
  params,
}: PageProps<"/admin/registrations/[id]">) {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const { id } = await params;
  const registration = await getRegistrationById(id);
  if (!registration) notFound();

  const extras = registration.is_primary_attendee
    ? await getExtrasForRegistration(registration.id)
    : [];

  const primaryName =
    !registration.is_primary_attendee && registration.linked_to_id
      ? (await getLinkedPrimary(registration.linked_to_id))?.full_name
      : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-gold"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back to Dashboard
      </Link>

      <GuestDetailCard registration={registration} primaryName={primaryName} />

      {registration.is_primary_attendee && (
        <ExtraPersonsList extras={extras} />
      )}
    </div>
  );
}
