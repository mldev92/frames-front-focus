import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { adminActionClass, useAdminEditMode } from "@/lib/admin-edit-mode";
import { cn } from "@/lib/utils";

export function AdminEditableArea({ children, className, href, label, action }: {
  children: ReactNode;
  className?: string;
  href?: string;
  label: string;
  action: string;
}) {
  const showAction = useAdminEditMode() && href;

  return (
    <div className={cn(className, showAction && "rounded outline outline-1 outline-offset-4 outline-muted-foreground")}>
      {showAction && (
        <a href={href} target="_blank" rel="noopener" aria-label={label} className={cn(adminActionClass, "mb-2 bg-muted")}>
          <Pencil className="size-4 shrink-0" aria-hidden="true" />
          {action}
        </a>
      )}
      {children}
    </div>
  );
}
