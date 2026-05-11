type Variant =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "rejected"
  | "active"
  | "admin"
  | "draft"
  | "default";

const styles: Record<Variant, { bg: string; text: string; border: string; dot?: string }> = {
  pending:    { bg: "rgba(245,163,30,0.1)",  text: "#f5a31e", border: "rgba(245,163,30,0.2)",  dot: "#f5a31e" },
  processing: { bg: "rgba(24,195,244,0.1)",  text: "#18c3f4", border: "rgba(24,195,244,0.2)",  dot: "#18c3f4" },
  completed:  { bg: "rgba(34,197,94,0.1)",   text: "#4ade80", border: "rgba(34,197,94,0.2)",   dot: "#4ade80" },
  failed:     { bg: "rgba(239,68,68,0.1)",   text: "#f87171", border: "rgba(239,68,68,0.2)",   dot: "#f87171" },
  rejected:   { bg: "rgba(239,68,68,0.1)",   text: "#f87171", border: "rgba(239,68,68,0.2)",   dot: "#f87171" },
  active:     { bg: "rgba(232,53,144,0.1)",  text: "#e83590", border: "rgba(232,53,144,0.2)",  dot: "#e83590" },
  admin:      { bg: "rgba(232,53,144,0.12)", text: "#e83590", border: "rgba(232,53,144,0.25)" },
  draft:      { bg: "rgba(255,255,255,0.05)", text: "rgba(237,237,237,0.5)", border: "rgba(255,255,255,0.1)" },
  default:    { bg: "rgba(255,255,255,0.05)", text: "rgba(237,237,237,0.6)", border: "rgba(255,255,255,0.1)" },
};

interface BadgeProps {
  label: string;
  variant?: Variant;
  dot?: boolean;
}

export default function Badge({ label, variant = "default", dot = true }: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {dot && s.dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: s.dot }}
        />
      )}
      {label}
    </span>
  );
}

export function statusVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    pending: "pending",
    processing: "processing",
    completed: "completed",
    failed: "failed",
    rejected: "rejected",
  };
  return map[status] ?? "default";
}
