import { connection } from "next/server";
import { EmployeeIntakeForm } from "@/components/employees/employee-intake-form";
import { EmployeeTable } from "@/components/employees/employee-table";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireRole } from "@/lib/auth/session";
import { getEmployees, getFilterOptions } from "@/lib/queries/moood";

export default async function EmployeesPage() {
  await connection();
  const user = await requireRole("hr_admin");
  const [employeeList, filterOptions] = await Promise.all([
    getEmployees(user),
    getFilterOptions(user),
  ]);

  const intakeOptions = {
    locations: filterOptions.locations.map((location) => ({
      id: location.id,
      name: location.site_name,
    })),
    orgUnits: filterOptions.orgUnits.map((orgUnit) => ({
      id: orgUnit.id,
      name: orgUnit.name,
    })),
    managers: employeeList.map((employee) => ({
      id: employee.id,
      name: employee.full_name,
    })),
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Empleados"
        title="Maestro de colaboradores"
        description="Alta manual de nuevas personas, creacion de cuenta y directorio laboral completo en un solo espacio."
      />

      <EmployeeIntakeForm options={intakeOptions} />
      <EmployeeTable employees={employeeList} />
    </div>
  );
}
