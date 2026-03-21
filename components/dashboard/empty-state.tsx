import { Sparkles } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[2rem] border border-dashed bg-white/70 p-8 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
