const messageMap: Record<string, string> = {
  "session-required": "Debes iniciar sesión para continuar.",
  "missing-env": "Configura las variables de entorno de Supabase antes de iniciar sesión.",
  "missing-employee-link": "Tu usuario autenticado no está vinculado a un empleado en la tabla employees.",
  "insufficient-role": "Tu rol no tiene permisos para acceder a esta sección.",
  "invalid-credentials": "Correo o contraseña inválidos.",
  "invalid-email": "Ingresa un correo válido.",
  "password-mismatch": "Las contraseñas no coinciden.",
  "recovery-sent": "Te enviamos el enlace de recuperación.",
  "signed-out": "La sesión fue cerrada correctamente.",
  "password-updated": "La contraseña fue actualizada.",
};

export function AuthMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const text = error ? messageMap[error] ?? error : success ? messageMap[success] ?? success : null;

  if (!text) {
    return null;
  }

  return (
    <div className={error ? "rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700" : "rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"}>
      {text}
    </div>
  );
}
