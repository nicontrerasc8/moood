"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DashboardFilterOptions, DashboardFilters as DashboardFiltersValues } from "@/types/app";

type DashboardFiltersProps = {
  value: DashboardFiltersValues;
  onApply: (filters: DashboardFiltersValues) => void;
  isLoading?: boolean;
};

export function DashboardFilters({ value, onApply, isLoading = false }: DashboardFiltersProps) {
  const [options, setOptions] = useState<DashboardFilterOptions | null>(null);
  const [draft, setDraft] = useState<DashboardFiltersValues>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    fetch("/api/filters/options")
      .then((response) => response.json())
      .then((data: DashboardFilterOptions) => setOptions(data));
  }, []);

  const updateField =
    (field: keyof DashboardFiltersValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }));
    };

  const resetFilters = () => {
    const cleared: DashboardFiltersValues = {
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

    setDraft(cleared);
    onApply(cleared);
  };

  return (
    <div className="rounded-[2rem] border bg-white/85 p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="h-4 w-4" />
        Filtros globales
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input type="date" value={draft.dateRange} onChange={updateField("dateRange")} />

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.companyId}
          onChange={updateField("companyId")}
        >
          <option value="">Empresa</option>
          {options?.companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.locationId}
          onChange={updateField("locationId")}
        >
          <option value="">Ubicacion</option>
          {options?.locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.site_name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.orgUnitId}
          onChange={updateField("orgUnitId")}
        >
          <option value="">Unidad organizacional</option>
          {options?.orgUnits.map((orgUnit) => (
            <option key={orgUnit.id} value={orgUnit.id}>
              {orgUnit.name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.gender}
          onChange={updateField("gender")}
        >
          <option value="">Genero</option>
          {options?.genders.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.ageRange}
          onChange={updateField("ageRange")}
        >
          <option value="">Edad</option>
          <option value="18-25">18-25</option>
          <option value="26-35">26-35</option>
          <option value="36-45">36-45</option>
          <option value="46+">46+</option>
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.workShift}
          onChange={updateField("workShift")}
        >
          <option value="">Jornada</option>
          {options?.workShifts.map((workShift) => (
            <option key={workShift} value={workShift}>
              {workShift}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.jobTitle}
          onChange={updateField("jobTitle")}
        >
          <option value="">Cargo</option>
          {options?.jobTitles.map((jobTitle) => (
            <option key={jobTitle} value={jobTitle}>
              {jobTitle}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.education}
          onChange={updateField("education")}
        >
          <option value="">Educacion</option>
          {options?.educationLevels.map((education) => (
            <option key={education} value={education}>
              {education}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.occupationalGroup}
          onChange={updateField("occupationalGroup")}
        >
          <option value="">Grupo ocupacional</option>
          {options?.occupationalGroups.map((occupationalGroup) => (
            <option key={occupationalGroup} value={occupationalGroup}>
              {occupationalGroup}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={draft.companyType}
          onChange={updateField("companyType")}
        >
          <option value="">Tipo de empresa</option>
          {options?.companyTypes.map((companyType) => (
            <option key={companyType} value={companyType}>
              {companyType}
            </option>
          ))}
        </select>

        <div className="flex gap-3 md:col-span-2 xl:col-span-2">
          <Button className="rounded-2xl" onClick={() => onApply(draft)} disabled={isLoading}>
            Aplicar
          </Button>
          <Button variant="outline" className="rounded-2xl" onClick={resetFilters} disabled={isLoading}>
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}
