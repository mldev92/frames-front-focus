import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { adminActionClass, useAdminEditMode } from "@/lib/admin-edit-mode";
import { cn } from "@/lib/utils";

type EditActionProps = {
  href?: string;
  label: string;
  action: string;
  className?: string;
};

export function AdminEditAction({ className, href, label, action }: EditActionProps) {
  const editing = useAdminEditMode();
  if (!editing || !href) return null;
  return (
    <a href={href} target="_blank" rel="noopener" aria-label={label} className={cn(adminActionClass, "bg-muted text-foreground", className)}>
      <Pencil className="size-4 shrink-0" aria-hidden="true" />
      {action}
    </a>
  );
}

export function AdminEditableArea({ children, className, ...action }: EditActionProps & { children: ReactNode }) {
  const showAction = useAdminEditMode() && action.href;

  return (
    <div className={cn(className, showAction && "rounded outline outline-1 outline-offset-4 outline-muted-foreground")}>
      <AdminEditAction {...action} className="mb-2" />
      {children}
    </div>
  );
}
