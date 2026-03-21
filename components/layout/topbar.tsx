import { signOutAction } from "@/lib/auth/actions";
import { Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { AppUser } from "@/types/app";

export function Topbar({ user }: { user: AppUser }) {
  const initials = user.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="surface-glass sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-4 py-4 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">Vista activa</p>
        <h1 className="text-2xl font-semibold">MOOOD Command Center</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="w-64 rounded-full bg-white pl-9" placeholder="Buscar equipo, sede o alerta" />
        </div>

        <form action={signOutAction}>
          <button className="rounded-full border bg-white px-4 py-2 text-sm">Salir</button>
        </form>

        <div className="flex items-center gap-3 rounded-full border border-white/80 bg-white/92 px-3 py-2 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8E3B8F_0%,#74C1B3_100%)] text-sm font-semibold text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">{user.full_name}</p>
              <Badge className="rounded-full border-0 bg-[#F4B233]/20 px-2.5 py-0.5 text-[11px] font-medium capitalize text-[#8E3B8F] hover:bg-[#F4B233]/20">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
