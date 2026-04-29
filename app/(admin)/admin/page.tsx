import { Building2, MapPin, Network, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCompanyAction,
  createEmployeeAction,
  createLocationAction,
  createOrgUnitAction,
  deleteCompanyAction,
  deleteEmployeeAction,
  deleteLocationAction,
  deleteOrgUnitAction,
  getPlatformAdminData,
  updateCompanyAction,
  updateEmployeeAction,
  updateLocationAction,
  updateOrgUnitAction,
} from "@/lib/admin/platform";

function Select({
  name,
  defaultValue,
  children,
  required,
}: {
  name: string;
  defaultValue?: string | null;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
      className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm"
    >
      {children}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Panel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function companyName(companies: Awaited<ReturnType<typeof getPlatformAdminData>>["companies"], id: string) {
  return companies.find((company) => company.id === id)?.name ?? "Sin empresa";
}

export default async function AdminPage() {
  const { companies, locations, orgUnits, employees } = await getPlatformAdminData();

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Consola de plataforma</p>
        <h1 className="mt-2 text-3xl font-semibold">Crear todo desde cero</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Gestiona empresas, sedes, areas y cuentas. Este panel es solo para admins globales y no depende de una empresa.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Empresas</p>
            <p className="text-2xl font-semibold">{companies.length}</p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Sedes</p>
            <p className="text-2xl font-semibold">{locations.length}</p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Areas</p>
            <p className="text-2xl font-semibold">{orgUnits.length}</p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Usuarios</p>
            <p className="text-2xl font-semibold">{employees.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel icon={Building2} title="Empresas" description="Crea, edita o elimina empresas completas.">
          <form action={createCompanyAction} className="grid gap-3 md:grid-cols-2">
            <Field label="Nombre">
              <Input name="name" required />
            </Field>
            <Field label="Razon social">
              <Input name="legal_name" />
            </Field>
            <Field label="Tipo">
              <Select name="company_type" defaultValue="internal">
                <option value="internal">Interna</option>
                <option value="external">Externa</option>
              </Select>
            </Field>
            <Field label="Industria">
              <Input name="industry" />
            </Field>
            <Button className="rounded-2xl md:col-span-2">Crear empresa</Button>
          </form>

          <div className="mt-5 space-y-3">
            {companies.map((company) => (
              <form key={company.id} action={updateCompanyAction} className="rounded-2xl border p-3">
                <input type="hidden" name="id" value={company.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input name="name" defaultValue={company.name} required />
                  <Input name="legal_name" defaultValue={company.legal_name ?? ""} />
                  <Select name="company_type" defaultValue={company.company_type}>
                    <option value="internal">Interna</option>
                    <option value="external">Externa</option>
                  </Select>
                  <Input name="industry" defaultValue={company.industry ?? ""} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="active" defaultChecked={company.active} />
                    Activa
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Guardar</Button>
                    <Button size="sm" variant="destructive" formAction={deleteCompanyAction}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        </Panel>

        <Panel icon={MapPin} title="Sedes" description="Administra ubicaciones por empresa.">
          <form action={createLocationAction} className="grid gap-3 md:grid-cols-2">
            <Field label="Empresa">
              <Select name="company_id" required>
                <option value="">Selecciona empresa</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </Select>
            </Field>
            <Field label="Nombre de sede">
              <Input name="site_name" required />
            </Field>
            <Input name="country" placeholder="Pais" />
            <Input name="region" placeholder="Region" />
            <Input name="city" placeholder="Ciudad" />
            <Input name="address" placeholder="Direccion" />
            <Button className="rounded-2xl md:col-span-2">Crear sede</Button>
          </form>

          <div className="mt-5 space-y-3">
            {locations.map((location) => (
              <form key={location.id} action={updateLocationAction} className="rounded-2xl border p-3">
                <input type="hidden" name="id" value={location.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Select name="company_id" defaultValue={location.company_id}>
                    {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                  </Select>
                  <Input name="site_name" defaultValue={location.site_name ?? ""} required />
                  <Input name="country" defaultValue={location.country ?? ""} />
                  <Input name="region" defaultValue={location.region ?? ""} />
                  <Input name="city" defaultValue={location.city ?? ""} />
                  <Input name="address" defaultValue={location.address ?? ""} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{companyName(companies, location.company_id)}</span>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" name="active" defaultChecked={location.active} />
                      Activa
                    </label>
                    <Button size="sm" variant="outline">Guardar</Button>
                    <Button size="sm" variant="destructive" formAction={deleteLocationAction}>Eliminar</Button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        </Panel>

        <Panel icon={Network} title="Areas" description="Crea areas y sub-areas dentro de cada empresa.">
          <form action={createOrgUnitAction} className="grid gap-3 md:grid-cols-2">
            <Field label="Empresa">
              <Select name="company_id" required>
                <option value="">Selecciona empresa</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </Select>
            </Field>
            <Field label="Area padre">
              <Select name="parent_id">
                <option value="">Sin padre</option>
                {orgUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </Select>
            </Field>
            <Input name="name" placeholder="Nombre del area" required />
            <Input name="code" placeholder="Codigo" />
            <Input name="unit_type" placeholder="Tipo: division, departamento..." />
            <Input name="level_no" placeholder="Nivel" defaultValue="1" type="number" min={1} />
            <Button className="rounded-2xl md:col-span-2">Crear area</Button>
          </form>

          <div className="mt-5 space-y-3">
            {orgUnits.map((unit) => (
              <form key={unit.id} action={updateOrgUnitAction} className="rounded-2xl border p-3">
                <input type="hidden" name="id" value={unit.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Select name="company_id" defaultValue={unit.company_id}>
                    {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                  </Select>
                  <Select name="parent_id" defaultValue={unit.parent_id}>
                    <option value="">Sin padre</option>
                    {orgUnits.filter((item) => item.id !== unit.id).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </Select>
                  <Input name="name" defaultValue={unit.name} required />
                  <Input name="code" defaultValue={unit.code ?? ""} />
                  <Input name="unit_type" defaultValue={unit.unit_type ?? ""} />
                  <Input name="level_no" defaultValue={unit.level_no} type="number" min={1} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{companyName(companies, unit.company_id)}</span>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" name="active" defaultChecked={unit.active} />
                      Activa
                    </label>
                    <Button size="sm" variant="outline">Guardar</Button>
                    <Button size="sm" variant="destructive" formAction={deleteOrgUnitAction}>Eliminar</Button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        </Panel>

        <Panel icon={UserPlus} title="Usuarios" description="Crea HR leaders y usuarios normales con acceso.">
          <form action={createEmployeeAction} className="grid gap-3 md:grid-cols-2">
            <Field label="Empresa">
              <Select name="company_id" required>
                <option value="">Selecciona empresa</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </Select>
            </Field>
            <Field label="Rol">
              <Select name="app_role" defaultValue="employee">
                <option value="employee">Usuario normal</option>
                <option value="hr_admin">HR leader</option>
              </Select>
            </Field>
            <Input name="first_name" placeholder="Nombre" required />
            <Input name="last_name" placeholder="Apellido" required />
            <Input name="email" placeholder="Correo" type="email" required />
            <Input name="password" placeholder="Contrasena temporal" type="password" minLength={8} required />
            <Select name="location_id" required>
              <option value="">Selecciona sede</option>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.site_name}</option>)}
            </Select>
            <Select name="org_unit_id" required>
              <option value="">Selecciona area</option>
              {orgUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
            </Select>
            <Input name="phone" placeholder="Telefono" />
            <Input name="job_title" placeholder="Cargo" />
            <Select name="status" defaultValue="active">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </Select>
            <Button className="rounded-2xl">Crear usuario</Button>
          </form>

          <div className="mt-5 space-y-3">
            {employees.map((employee) => {
              const profile = employee.employee_profiles?.[0];
              return (
                <form key={employee.id} action={updateEmployeeAction} className="rounded-2xl border p-3">
                  <input type="hidden" name="id" value={employee.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Select name="company_id" defaultValue={employee.company_id}>
                      {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                    </Select>
                    <Select name="app_role" defaultValue={employee.app_role === "hr_admin" ? "hr_admin" : "employee"}>
                      <option value="employee">Usuario normal</option>
                      <option value="hr_admin">HR leader</option>
                    </Select>
                    <Input name="first_name" defaultValue={employee.first_name} required />
                    <Input name="last_name" defaultValue={employee.last_name} required />
                    <Input name="email" defaultValue={employee.email ?? ""} type="email" required />
                    <Input name="phone" defaultValue={employee.phone ?? ""} />
                    <Select name="location_id" defaultValue={profile?.location_id} required>
                      {locations.map((location) => <option key={location.id} value={location.id}>{location.site_name}</option>)}
                    </Select>
                    <Select name="org_unit_id" defaultValue={profile?.org_unit_id} required>
                      {orgUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                    </Select>
                    <Input name="job_title" defaultValue={profile?.job_title ?? ""} />
                    <Select name="status" defaultValue={employee.status === "inactive" ? "inactive" : "active"}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </Select>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      {companyName(companies, employee.company_id)} · {employee.email}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Guardar</Button>
                      <Button size="sm" variant="destructive" formAction={deleteEmployeeAction}>Eliminar</Button>
                    </div>
                  </div>
                </form>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
