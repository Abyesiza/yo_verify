interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
const borders = { sm: "border-2", md: "border-2", lg: "border-[3px]" };

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      className={`inline-block rounded-full border-transparent animate-yo-spin ${sizes[size]} ${borders[size]} ${className}`}
      style={{
        borderTopColor: "#e83590",
        borderRightColor: "#18c3f4",
      }}
    />
  );
}
