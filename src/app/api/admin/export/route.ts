import { verifySession } from "@/lib/session";
import { getAllRegistrations } from "@/lib/registrations";

export async function GET() {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  let registrations;
  try {
    registrations = await getAllRegistrations();
  } catch (error) {
    console.error("CSV export failed", error);
    return new Response("Unable to export registrations", { status: 500 });
  }

  const headers = [
    "Full Name",
    "Phone Number",
    "Email",
    "Primary/Extra",
    "Invite Code",
    "Checked In",
    "Checked In At",
    "Table Assignment",
    "Invited By",
    "Admin Notes",
    "Registered At",
  ];

  const rows = registrations.map((r) => [
    r.full_name,
    r.phone_number || "",
    r.email || "",
    r.is_primary_attendee ? "Primary" : "Extra",
    r.invite_code,
    r.checked_in ? "Yes" : "No",
    r.checked_in_at || "",
    r.table_assignment || "",
    r.invited_by || "",
    r.admin_notes || "",
    r.created_at,
  ]);

  const escapeCsv = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
