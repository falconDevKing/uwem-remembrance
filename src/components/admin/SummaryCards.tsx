import type { DashboardStats } from "@/lib/types";

const cards: {
  key: keyof DashboardStats;
  label: string;
  color: string;
}[] = [
  { key: "totalRegistrations", label: "Registrations", color: "text-gold" },
  { key: "totalExtraPersons", label: "Extra Persons", color: "text-blue-600" },
  { key: "totalExpectedGuests", label: "Expected Guests", color: "text-gold-dark" },
  { key: "totalCheckedIn", label: "Checked In", color: "text-green-600" },
  { key: "notYetCheckedIn", label: "Not Checked In", color: "text-amber-600" },
];

export default function SummaryCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <p className={`font-display text-3xl font-bold ${card.color}`}>
            {stats[card.key]}
          </p>
          <p className="mt-1 text-xs font-medium text-muted">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
