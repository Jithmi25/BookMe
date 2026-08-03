import { WeeklyAvailability } from "@/types/provider";

const DAY_LABELS: { key: keyof WeeklyAvailability; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function AvailabilityDisplay({
  availability,
}: {
  availability: WeeklyAvailability;
}) {
  return (
    <div className="space-y-1.5">
      {DAY_LABELS.map(({ key, label }) => {
        const day = availability[key];
        return (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-foreground/70">{label}</span>
            <span
              className={
                day.available ? "text-foreground" : "text-foreground/40"
              }
            >
              {day.available ? `${day.start} - ${day.end}` : "Unavailable"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
