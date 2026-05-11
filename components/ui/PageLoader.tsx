import Spinner from "./Spinner";

export default function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[300px]">
      <Spinner size="lg" />
      <p className="text-sm text-[rgba(237,237,237,0.35)]">{label}</p>
    </div>
  );
}
