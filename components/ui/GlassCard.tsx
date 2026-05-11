import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: string;
  hover?: boolean;
}

export default function GlassCard({
  children,
  padding = "p-6",
  hover = false,
  className = "",
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl ${padding} transition-all duration-200 ${
        hover ? "cursor-pointer hover:border-[rgba(232,53,144,0.25)] hover:bg-[rgba(255,255,255,0.06)]" : ""
      } ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
