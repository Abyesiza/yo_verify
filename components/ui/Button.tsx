import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#e83590] hover:bg-[#c5226e] active:bg-[#a81d5e] text-white shadow-[0_0_20px_rgba(232,53,144,0.25)]",
  secondary:
    "bg-[rgba(24,195,244,0.08)] hover:bg-[rgba(24,195,244,0.15)] text-[#18c3f4] border border-[rgba(24,195,244,0.25)]",
  danger:
    "bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] text-red-400 border border-[rgba(239,68,68,0.25)]",
  ghost:
    "hover:bg-[rgba(255,255,255,0.06)] text-[rgba(237,237,237,0.65)] hover:text-[#ededed]",
};

const sizeStyles: Record<Size, string> = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed select-none
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}
