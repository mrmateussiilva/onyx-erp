import { cn } from "@/lib/utils";

type StatusType = "ok" | "expiring" | "expired";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  ok: {
    label: "OK",
    className: "bg-status-ok/15 text-status-ok border-status-ok/25",
  },
  expiring: {
    label: "Vencendo",
    className: "bg-status-expiring/15 text-status-expiring border-status-expiring/25",
  },
  expired: {
    label: "Vencido",
    className: "bg-status-expired/15 text-status-expired border-status-expired/25",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {label || config.label}
    </span>
  );
}
