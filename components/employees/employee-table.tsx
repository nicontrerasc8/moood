import { Badge } from "@/components/ui/badge";
import type { EmployeeDirectoryRecord } from "@/types/app";

function formatRole(role: EmployeeDirectoryRecord["role"]) {
  return role.replace("_", " ");
}

function formatTenure(tenureYears: number | null) {
  if (tenureYears === null) return "Sin dato";
  return `${tenureYears} anos`;
}

export function EmployeeTable({ employees }: { employees: EmployeeDirectoryRecord[] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Cargo</th>
            <th className="px-4 py-3">Sede</th>
            <th className="px-4 py-3">Unidad</th>
            <th className="px-4 py-3">Manager</th>
            <th className="px-4 py-3">Grupo</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Antiguedad</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                No hay colaboradores para mostrar.
              </td>
            </tr>
          ) : null}
          {employees.map((employee) => (
            <tr key={employee.id} className="border-t">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">{employee.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {employee.email || employee.employee_code || "Sin correo"}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">{employee.job_title ?? "Sin cargo"}</td>
              <td className="px-4 py-3">{employee.location_name ?? "Sin sede"}</td>
              <td className="px-4 py-3">{employee.org_unit_name ?? "Sin unidad"}</td>
              <td className="px-4 py-3">{employee.manager_name ?? "Sin manager"}</td>
              <td className="px-4 py-3">{employee.occupational_group ?? "Sin grupo"}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary" className="rounded-full capitalize">
                  {formatRole(employee.role)}
                </Badge>
              </td>
              <td className="px-4 py-3">{formatTenure(employee.tenure_years)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
