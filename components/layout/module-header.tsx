import { Badge } from "@/components/ui/badge";

export function ModuleHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border bg-white/80 p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {eyebrow}
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
