import GlassCard from "@/components/ui/GlassCard";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, color = "#18c3f4", sub }: StatCardProps) {
  return (
    <GlassCard className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[rgba(237,237,237,0.4)]">
          {label}
        </span>
        {icon && <span className="text-xl opacity-60">{icon}</span>}
      </div>
      <div className="text-3xl font-bold" style={{ color }}>
        {value ?? "—"}
      </div>
      {sub && <div className="text-xs text-[rgba(237,237,237,0.35)]">{sub}</div>}
    </GlassCard>
  );
}
