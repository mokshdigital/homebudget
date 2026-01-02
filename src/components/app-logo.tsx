import { Home } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="flex items-center justify-center rounded-lg bg-primary/20 p-2 text-primary">
        <Home className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold tracking-tighter text-foreground group-data-[collapsible=icon]:hidden">
        MyHomeBudget
      </h1>
    </div>
  );
}
