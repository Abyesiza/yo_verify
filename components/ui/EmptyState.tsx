interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-base font-medium text-[rgba(237,237,237,0.7)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[rgba(237,237,237,0.4)] max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
