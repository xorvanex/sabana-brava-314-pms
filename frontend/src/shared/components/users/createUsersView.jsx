"use client";

import { useCreateUser } from "@/shared/hooks/useCreateUser";
import { useUsers } from "@/shared/hooks/useUsers";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Spinner from "@/shared/components/ui/spinner/Spinner";

export default function CreateUsersView() {
  const { formData, handleChange, handleSubmit, error, loading } = useCreateUser();
  const { users, loading: usersLoading, handleToggleStatus } = useUsers();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-emerald-900">
          Crear nuevo recepcionista
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario de creación */}
        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-emerald-900">
            Nuevo recepcionista
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
            />

            <Input
              label="Correo electrónico"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />

            <Input
              label="Contraseña"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Input
              label="Teléfono (opcional)"
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+57 300 123 4567"
              required={false}
            />

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Creando recepcionista...
                </span>
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        </div>

        {/* Lista de usuarios existentes */}
        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-emerald-900">
            Usuarios existentes
          </h2>

          {usersLoading ? (
            <p className="text-sm text-gray-500">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">No hay usuarios registrados</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.nombre}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {user.rol} • {user.is_active ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                  {user.rol === "RECEPCIONISTA" && (
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      user.is_active
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}
                  >
                    {user.is_active ? "Desactivar" : "Activar"}
                  </button>
                )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}