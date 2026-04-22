"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmployeeIntakeOptions } from "@/types/app";

type EmployeeIntakeFormProps = {
  options: EmployeeIntakeOptions;
};

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function serializeForm(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  );
}

export function EmployeeIntakeForm({ options }: EmployeeIntakeFormProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const form = event.currentTarget;

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serializeForm(new FormData(form))),
      });

      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; employee?: { full_name?: string | null; email?: string | null }; error?: string; details?: string }
        | null;

      if (!response.ok || !body?.ok) {
        throw new Error(body?.details || body?.error || "No se pudo crear el colaborador.");
      }

      form.reset();
      setSuccess(
        `Cuenta creada para ${body.employee?.full_name ?? "la persona"} con correo ${body.employee?.email ?? "registrado"}.`,
      );
      startRefresh(() => {
        router.refresh();
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear el colaborador.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Alta manual</p>
          <h3 className="mt-1 text-2xl font-semibold">Nueva persona en la plataforma</h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Crea su cuenta de acceso y guarda su ficha laboral completa en un solo paso.
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-brand-teal/12 px-4 py-3 text-sm text-foreground/80">
          Usa una contrasena temporal. La cuenta queda lista para iniciar sesion.
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-foreground/10 bg-brand-coral/16 px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-2xl border border-foreground/10 bg-brand-green/18 px-4 py-3 text-sm text-foreground">
          {success}
        </div>
      ) : null}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[1.5rem] border border-foreground/10 bg-brand-yellow/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cuenta</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="firstName" label="Nombre">
                <Input id="firstName" name="firstName" required />
              </Field>
              <Field id="lastName" label="Apellido">
                <Input id="lastName" name="lastName" required />
              </Field>
              <Field id="email" label="Correo">
                <Input id="email" name="email" type="email" required />
              </Field>
              <Field id="password" label="Contrasena temporal">
                <Input id="password" name="password" type="password" minLength={8} required />
              </Field>
              <Field id="employeeCode" label="Codigo interno">
                <Input id="employeeCode" name="employeeCode" />
              </Field>
              <Field id="phone" label="Telefono">
                <Input id="phone" name="phone" />
              </Field>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-foreground/10 bg-brand-purple/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Organizacion</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="role" label="Rol de la plataforma">
                <select id="role" name="role" defaultValue="employee" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="employee">Employee</option>
                  <option value="leader">Leader</option>
                  <option value="hr_admin">HR Admin</option>
                </select>
              </Field>
              <Field id="employmentStatus" label="Estado laboral">
                <select id="employmentStatus" name="employmentStatus" defaultValue="active" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </Field>
              <Field id="locationId" label="Sede">
                <select id="locationId" name="locationId" required defaultValue="" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="" disabled>Selecciona una sede</option>
                  {options.locations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </Field>
              <Field id="orgUnitId" label="Area">
                <select id="orgUnitId" name="orgUnitId" required defaultValue="" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="" disabled>Selecciona un area</option>
                  {options.orgUnits.map((orgUnit) => (
                    <option key={orgUnit.id} value={orgUnit.id}>{orgUnit.name}</option>
                  ))}
                </select>
              </Field>
              <Field id="managerEmployeeId" label="Manager">
                <select id="managerEmployeeId" name="managerEmployeeId" defaultValue="" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="">Sin manager</option>
                  {options.managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                  ))}
                </select>
              </Field>
              <Field id="companyType" label="Tipo de empresa">
                <select id="companyType" name="companyType" defaultValue="internal" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="internal">Interna</option>
                  <option value="external">Externa</option>
                </select>
              </Field>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[1.5rem] border border-foreground/10 bg-brand-teal/12 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Perfil laboral</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="jobTitle" label="Cargo">
                <Input id="jobTitle" name="jobTitle" />
              </Field>
              <Field id="occupationalGroup" label="Grupo ocupacional">
                <Input id="occupationalGroup" name="occupationalGroup" />
              </Field>
              <Field id="contractType" label="Tipo de contrato">
                <Input id="contractType" name="contractType" />
              </Field>
              <Field id="workSchedule" label="Jornada">
                <select id="workSchedule" name="workSchedule" defaultValue="day" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="mixed">Mixed</option>
                </select>
              </Field>
              <Field id="costCenter" label="Centro de costo">
                <Input id="costCenter" name="costCenter" />
              </Field>
              <Field id="teamName" label="Equipo">
                <Input id="teamName" name="teamName" />
              </Field>
              <Field id="projectName" label="Proyecto">
                <Input id="projectName" name="projectName" />
              </Field>
              <Field id="shiftName" label="Turno operativo">
                <Input id="shiftName" name="shiftName" />
              </Field>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-foreground/10 bg-brand-green/12 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Datos personales</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="gender" label="Genero">
                <select id="gender" name="gender" defaultValue="" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                  <option value="">Sin especificar</option>
                  <option value="F">F</option>
                  <option value="M">M</option>
                  <option value="X">X</option>
                </select>
              </Field>
              <Field id="educationLevel" label="Nivel educativo">
                <Input id="educationLevel" name="educationLevel" />
              </Field>
              <Field id="birthDate" label="Fecha de nacimiento">
                <Input id="birthDate" name="birthDate" type="date" />
              </Field>
              <Field id="hireDate" label="Fecha de ingreso">
                <Input id="hireDate" name="hireDate" type="date" />
              </Field>
            </div>
          </section>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || isRefreshing} className="rounded-2xl px-5">
            {isSubmitting || isRefreshing ? "Guardando..." : "Crear persona"}
          </Button>
        </div>
      </form>
    </section>
  );
}
