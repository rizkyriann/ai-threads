import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center",
        className,
      )}
    >
      <div className="grid max-w-sm justify-items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-tint text-notion-blue">
          <Icon size={19} />
        </span>
        <strong className="text-sm text-slate-800">{title}</strong>
        <p className="text-xs leading-5 text-slate-500">{description}</p>
        {action}
      </div>
    </div>
  );
}
