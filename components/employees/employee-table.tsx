import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/types/app";

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Cargo</th>
            <th className="px-4 py-3">Ubicación</th>
            <th className="px-4 py-3">Grupo</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Antigüedad</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-t">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">{employee.full_name}</p>
                  <p className="text-xs text-muted-foreground">{employee.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">{employee.job_title}</td>
              <td className="px-4 py-3">{employee.location_id}</td>
              <td className="px-4 py-3">{employee.occupational_group}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary" className="rounded-full capitalize">
                  {employee.role.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-4 py-3">{employee.tenure_years} años</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
