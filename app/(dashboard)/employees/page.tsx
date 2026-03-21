import { connection } from "next/server";
import { ModuleHeader } from "@/components/layout/module-header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { requireRole } from "@/lib/auth/session";
import { getEmployees } from "@/lib/queries/moood";

export default async function EmployeesPage() {
  await connection();
  const user = await requireRole("hr_admin");
  const employeeList = await getEmployees(user);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Empleados"
        title="Maestro de colaboradores"
        description="Listado, filtros, perfil laboral, asignación de unidad, sede y manager. Preparado para importación CSV."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <select className="h-10 rounded-2xl border bg-white px-3 text-sm">
          <option>Ubicación</option>
        </select>
        <select className="h-10 rounded-2xl border bg-white px-3 text-sm">
          <option>Unidad</option>
        </select>
        <select className="h-10 rounded-2xl border bg-white px-3 text-sm">
          <option>Rol</option>
        </select>
        <button className="rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">Importar CSV</button>
      </div>
      <EmployeeTable employees={employeeList} />
    </div>
  );
}
