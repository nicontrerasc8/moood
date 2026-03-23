"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DashboardFilterOptions, DashboardFilters as DashboardFiltersValues } from "@/types/app";

type DashboardFiltersProps = {
  value: DashboardFiltersValues;
  onApply: (filters: DashboardFiltersValues) => void;
  isLoading?: boolean;
};

const emptyFilters: DashboardFiltersValues = {
  dateRange: "",
  companyId: "",
  locationId: "",
  orgUnitId: "",
  gender: "",
  ageRange: "",
  jobTitle: "",
  education: "",
  workShift: "",
  occupationalGroup: "",
  companyType: "",
};

function countActiveFilters(filters: DashboardFiltersValues) {
  return Object.values(filters).filter(Boolean).length;
}

export function DashboardFilters({ value, onApply, isLoading = false }: DashboardFiltersProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<DashboardFilterOptions | null>(null);
  const [draft, setDraft] = useState<DashboardFiltersValues>(value);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    fetch("/api/filters/options")
      .then((r) => r.json())
      .then((data: DashboardFilterOptions) => setOptions(data));
  }, []);

  const updateField =
    (field: keyof DashboardFiltersValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    onApply(emptyFilters);
    setOpen(false);
  };

  const activeCount = countActiveFilters(value);

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 shadow-sm">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              {activeCount} activos
            </span>
          )}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Collapsible panel */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-t px-5 pb-5 pt-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              type="date"
              value={draft.dateRange}
              onChange={updateField("dateRange")}
              className="rounded-2xl"
            />

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.companyId}
              onChange={updateField("companyId")}
            >
              <option value="">Empresa</option>
              {options?.companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.locationId}
              onChange={updateField("locationId")}
            >
              <option value="">Ubicación</option>
              {options?.locations.map((l) => (
                <option key={l.id} value={l.id}>{l.site_name}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.orgUnitId}
              onChange={updateField("orgUnitId")}
            >
              <option value="">Unidad organizacional</option>
              {options?.orgUnits.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.gender}
              onChange={updateField("gender")}
            >
              <option value="">Género</option>
              {options?.genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.ageRange}
              onChange={updateField("ageRange")}
            >
              <option value="">Edad</option>
              <option value="18-25">18–25</option>
              <option value="26-35">26–35</option>
              <option value="36-45">36–45</option>
              <option value="46+">46+</option>
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.workShift}
              onChange={updateField("workShift")}
            >
              <option value="">Jornada</option>
              {options?.workShifts.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.jobTitle}
              onChange={updateField("jobTitle")}
            >
              <option value="">Cargo</option>
              {options?.jobTitles.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.education}
              onChange={updateField("education")}
            >
              <option value="">Educación</option>
              {options?.educationLevels.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.occupationalGroup}
              onChange={updateField("occupationalGroup")}
            >
              <option value="">Grupo ocupacional</option>
              {options?.occupationalGroups.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border bg-background px-3 text-sm"
              value={draft.companyType}
              onChange={updateField("companyType")}
            >
              <option value="">Tipo de empresa</option>
              {options?.companyTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Actions */}
            <div className="flex gap-2 md:col-span-2 xl:col-span-1">
              <Button className="flex-1 rounded-2xl" onClick={handleApply} disabled={isLoading}>
                Aplicar
              </Button>
              <Button
                variant="outline"
                className="gap-1.5 rounded-2xl"
                onClick={handleReset}
                disabled={isLoading}
              >
                <X className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}