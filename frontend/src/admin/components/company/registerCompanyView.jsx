"use client";

import AdminAlert from "@/admin/components/ui/AdminAlert";
import { validateCompanyForm } from "@/admin/utils/parseApiError";
import { useState } from "react";
import { useCompanies } from "@/admin/hooks/useCompanies";
import Button from "@/shared/globalComponents/ui/button/Button";
import Input from "@/shared/globalComponents/ui/input/Input";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

const EMPTY_FORM = {
  nombre: "",
  nit: "",
  representante: "",
  direccion: "",
  telefono: "",
  correo: "",
};

export default function RegisterCompanyView() {
  const { companies, loading, error, handleCreate } = useCompanies();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    const validationError = validateCompanyForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await handleCreate(form);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
          Registrar Empresa
        </h1>
        <p className="text-sm text-gray-500">
          Agregue y gestione organizaciones para la creación de contratos comerciales.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Column 1: Registration Form */}
        <div className="lg:col-span-7 rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-md font-bold text-emerald-950">Datos del Formulario</h2>
              <p className="text-xs text-gray-500">Ingrese la información comercial y de contacto obligatoria.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre de la Empresa"
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ej. ACME S.A.S."
              />
              <Input
                label="NIT"
                id="nit"
                name="nit"
                value={form.nit}
                onChange={handleChange}
                required
                placeholder="Ej. 900.123.456-7"
              />
            </div>
            
            <Input
              label="Representante Legal"
              id="representante"
              name="representante"
              value={form.representante}
              onChange={handleChange}
              required
              placeholder="Nombre y apellido"
            />
            
            <Input
              label="Dirección Comercial"
              id="direccion"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Calle 123 #45-67"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Teléfono de Contacto"
                id="telefono"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej. +57 300 123 4567"
              />
              <Input
                label="Correo Electrónico"
                id="correo"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="correo@empresa.com"
              />
            </div>

            {formError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {formError}
              </p>
            )}

            <div className="pt-2 border-t border-slate-50 flex justify-end">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition font-medium">
                {saving ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Spinner />
                    Registrando...
                  </span>
                ) : (
                  "Registrar Empresa"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Column 2: Registered Companies List */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-md font-bold text-emerald-950">Empresas Registradas</h2>
              <p className="text-xs text-gray-500">Listado de organizaciones actuales en el sistema.</p>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-400">
              <Spinner />
              <p className="text-xs">Cargando empresas...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-100 text-center text-slate-400">
              <p className="text-sm font-medium">No hay empresas registradas</p>
              <p className="text-xs">Los registros nuevos aparecerán aquí.</p>
            </div>
          ) : (
            <ul className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {companies.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50 transition duration-150"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">NIT: {c.nit}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      c.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span className="h-1 w-1 rounded-full bg-current"></span>
                    {c.is_active ? "Activa" : "Inactiva"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}