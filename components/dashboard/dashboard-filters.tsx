"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DashboardFilters as DashboardFiltersValues } from "@/types/app";

type DashboardFiltersProps = {
  value: DashboardFiltersValues;
  onApply: (filters: DashboardFiltersValues) => void;
  isLoading?: boolean;
};

const emptyFilters: DashboardFiltersValues = {
  fromDate: "",
  toDate: "",
};

export function DashboardFilters({ value, onApply, isLoading = false }: DashboardFiltersProps) {
  const [draft, setDraft] = useState<DashboardFiltersValues>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const updateField =
    (field: "fromDate" | "toDate") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleApply = () => onApply(draft);

  const handleReset = () => {
    setDraft(emptyFilters);
    onApply(emptyFilters);
  };

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-1.5">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Desde
          </span>
          <Input type="date" value={draft.fromDate} onChange={updateField("fromDate")} className="rounded-2xl" />
        </label>

        <label className="space-y-1.5">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Hasta
          </span>
          <Input type="date" value={draft.toDate} onChange={updateField("toDate")} className="rounded-2xl" />
        </label>

        <div className="flex items-end gap-2">
          <Button className="rounded-2xl" onClick={handleApply} disabled={isLoading}>
            Aplicar
          </Button>
          <Button variant="outline" className="gap-1.5 rounded-2xl" onClick={handleReset} disabled={isLoading}>
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}
