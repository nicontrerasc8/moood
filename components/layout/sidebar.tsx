"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Building2, ClipboardList, LayoutDashboard, Settings2, SmilePlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/app";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, minimumRole: "hr_admin" as Role },
  { href: "/mood", label: "Mood", icon: SmilePlus, minimumRole: "employee" as Role },
  { href: "/surveys", label: "Encuestas", icon: ClipboardList, minimumRole: "employee" as Role },
  { href: "/alerts", label: "Alertas", icon: AlertTriangle, minimumRole: "hr_admin" as Role },
  { href: "/employees", label: "Empleados", icon: Users, minimumRole: "hr_admin" as Role },
  { href: "/settings", label: "Configuracion", icon: Settings2, minimumRole: "hr_admin" as Role },
];

const roleWeight: Record<Role, number> = {
  employee: 1,
  hr_admin: 2,
  super_admin: 4,
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const visibleItems = items.filter((item) => roleWeight[role] >= roleWeight[item.minimumRole]);

  return (
    <aside className="surface-glass hidden w-72 shrink-0 border-r px-5 py-6 lg:flex lg:flex-col">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold">MOOOD</p>
          <p className="text-xs text-muted-foreground">Bienestar organizacional</p>
        </div>
      </Link>

   

      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-white/80 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
