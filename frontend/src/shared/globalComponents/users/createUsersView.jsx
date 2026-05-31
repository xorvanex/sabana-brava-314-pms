"use client";

import { useState } from "react";
import { useCreateUser } from "@/shared/hooks/useCreateUser";
import { useUsers } from "@/shared/hooks/useUsers";
import Button from "@/shared/globalComponents/ui/button/Button";
import Input from "@/shared/globalComponents/ui/input/Input";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

export default function CreateUsersView() {
  const { formData, handleChange, handleSubmit, error, loading, setFormData, setError } = useCreateUser();
  const { users, loading: usersLoading, handleToggleStatus } = useUsers();
  const [showErrorModal, setShowErrorModal] = useState(false);

  if (error && error.includes("already registered") && !showErrorModal) {
    setShowErrorModal(true);
  }

  const handleCloseModal = () => {
    setShowErrorModal(false);
    setError(null);
    setFormData({ nombre: "", email: "", password: "", telefono: "" });
  };

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

            {error && !error.includes("already registered") && (
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
              {users.map((user) => {
                const rol = user.rol || user.role || "";
                const nombre = user.nombre || user.name || "";
                const telefono = user.telefono || user.phone || "";

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{nombre}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        {rol} • {telefono || "Sin teléfono"} •{" "}
                        {user.is_active ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                    {(rol === "RECEPCIONISTA" || rol === "RECEPTIONIST") && (
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de error para email duplicado */}
      {showErrorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center gap-3 bg-red-700 px-6 py-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-medium text-white">Email ya registrado</p>
                <p className="text-sm text-red-200">No es posible usar este correo</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="mb-4 text-sm text-gray-600">
                El correo electrónico{" "}
                <span className="font-medium text-gray-900">{formData.email}</span>{" "}
                ya está registrado en el sistema.
              </p>

              <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <svg className="h-5 w-5 flex-shrink-0 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-red-900">{formData.email}</span>
              </div>

              <p className="mb-5 text-sm text-gray-500">
                Por favor, utiliza otro correo electrónico para continuar.
              </p>

              <button
                onClick={handleCloseModal}
                className="w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
              >
                Entendido, volver al formulario
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}