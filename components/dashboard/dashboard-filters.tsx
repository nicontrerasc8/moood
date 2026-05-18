"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DashboardFilterOptions, DashboardFilters as DashboardFiltersValues } from "@/types/app";

type DashboardFiltersProps = {
  value: DashboardFiltersValues;
  options: DashboardFilterOptions;
  onApply: (filters: DashboardFiltersValues) => void;
  isLoading?: boolean;
};

const emptyFilters: DashboardFiltersValues = {
  fromDate: "",
  toDate: "",
};

type FilterField = keyof DashboardFiltersValues;

const fieldLabels: Partial<Record<FilterField, string>> = {
  locationId: "Sede",
  orgUnitId: "Area",
  gender: "Genero",
  education: "Educacion",
  jobTitle: "Cargo",
  occupationalGroup: "Grupo ocupacional",
  workShift: "Jornada",
  ageRange: "Edad",
  tenureBand: "Antiguedad",
  shiftName: "Turno",
  costCenter: "Centro de costo",
  teamName: "Equipo",
  projectName: "Proyecto",
  isLeader: "Liderazgo",
};

function normalizeOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function formatOptionLabel(field: FilterField, value: string) {
  if (field === "isLeader") return value === "true" ? "Lideres" : "No lideres";
  if (field === "workShift") {
    const labels: Record<string, string> = {
      day: "Dia",
      night: "Noche",
      mixed: "Mixta",
      rotating: "Rotativa",
    };
    return labels[value] ?? value;
  }
  return value;
}

export function DashboardFilters({ value, options, onApply, isLoading = false }: DashboardFiltersProps) {
  const [draft, setDraft] = useState<DashboardFiltersValues>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const updateField =
    (field: FilterField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleApply = () => onApply(draft);

  const handleReset = () => {
    setDraft(emptyFilters);
    onApply(emptyFilters);
  };

  const allSelectFilters: Array<{ field: FilterField; values: Array<{ value: string; label: string }> }> = [
    { field: "locationId", values: options.locations.map((item) => ({ value: item.id, label: item.site_name })) },
    { field: "orgUnitId", values: options.orgUnits.map((item) => ({ value: item.id, label: item.name })) },
    { field: "gender", values: normalizeOptions(options.genders).map((item) => ({ value: item, label: item })) },
    { field: "education", values: normalizeOptions(options.educationLevels).map((item) => ({ value: item, label: item })) },
    { field: "jobTitle", values: normalizeOptions(options.jobTitles).map((item) => ({ value: item, label: item })) },
    { field: "occupationalGroup", values: normalizeOptions(options.occupationalGroups).map((item) => ({ value: item, label: item })) },
    { field: "workShift", values: normalizeOptions(options.workShifts).map((item) => ({ value: item, label: formatOptionLabel("workShift", item) })) },
    { field: "ageRange", values: normalizeOptions(options.ageBands).map((item) => ({ value: item, label: item })) },
    { field: "tenureBand", values: normalizeOptions(options.tenureBands).map((item) => ({ value: item, label: item })) },
    { field: "shiftName", values: normalizeOptions(options.shiftNames).map((item) => ({ value: item, label: item })) },
    { field: "costCenter", values: normalizeOptions(options.costCenters).map((item) => ({ value: item, label: item })) },
    { field: "teamName", values: normalizeOptions(options.teamNames).map((item) => ({ value: item, label: item })) },
    { field: "projectName", values: normalizeOptions(options.projectNames).map((item) => ({ value: item, label: item })) },
    { field: "isLeader", values: normalizeOptions(options.leaderStatuses).map((item) => ({ value: item, label: formatOptionLabel("isLeader", item) })) },
  ];
  const selectFilters = allSelectFilters.filter((item) => item.values.length > 0);

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Desde
          </span>
          <Input type="date" value={draft.fromDate} onChange={updateField("fromDate")} className="rounded-2xl" />
        </label>

        <label className="space-y-1.5">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Hasta
          </span>
          <Input type="date" value={draft.toDate} onChange={updateField("toDate")} className="rounded-2xl" />
        </label>

        {selectFilters.map(({ field, values }) => (
          <label key={field} className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{fieldLabels[field]}</span>
            <select
              className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm"
              value={String(draft[field] ?? "")}
              onChange={updateField(field)}
            >
              <option value="">Todos</option>
              {values.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="flex items-end gap-2 xl:col-span-2">
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
