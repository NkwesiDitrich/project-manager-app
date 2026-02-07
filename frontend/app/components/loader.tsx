import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  );
};
