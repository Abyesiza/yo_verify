import type { ReactNode } from "react";
import Badge from "@/components/ui/Badge";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: { label: string; variant?: "pending" | "active" | "completed" | "default" };
}

export default function TopBar({ title, subtitle, actions, badge }: TopBarProps) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#ededed] tracking-tight">{title}</h1>
          {badge && <Badge label={badge.label} variant={badge.variant ?? "default"} />}
        </div>
        {subtitle && (
          <p className="text-sm mt-1 text-[rgba(237,237,237,0.5)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
