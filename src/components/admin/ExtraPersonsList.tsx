import Link from "next/link";
import type { Registration } from "@/lib/types";

export default function ExtraPersonsList({
  extras,
}: {
  extras: Registration[];
}) {
  if (extras.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">
          Extra Persons (0)
        </h3>
        <p className="mt-2 text-sm text-muted">
          No extra persons registered with this guest.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">
        Extra Persons ({extras.length})
      </h3>
      <div className="mt-3 divide-y divide-border">
        {extras.map((extra) => (
          <div key={extra.id} className="flex items-center justify-between py-3">
            <div>
              <Link
                href={`/admin/registrations/${extra.id}`}
                className="text-sm font-medium text-foreground hover:text-gold"
              >
                {extra.full_name}
              </Link>
              <p className="text-xs text-muted">
                {extra.phone_number || "No phone"} &middot;{" "}
                {extra.invite_code}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                extra.checked_in
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {extra.checked_in ? "Checked In" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
