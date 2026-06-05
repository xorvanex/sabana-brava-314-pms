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
      <h1 className="text-2xl font-semibold text-emerald-900">Registrar empresa</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre" id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
<Input label="NIT" id="nit" name="nit" value={form.nit} onChange={handleChange} required />
<Input
  label="Representante legal"
  id="representante"
  name="representante"
  value={form.representante}
  onChange={handleChange}
  required
/>
<Input label="Dirección" id="direccion" name="direccion" value={form.direccion} onChange={handleChange} />
<Input label="Teléfono" id="telefono" name="telefono" value={form.telefono} onChange={handleChange} />
<Input label="Correo" id="correo" name="correo" type="email" value={form.correo} onChange={handleChange} />
            {formError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Registrando...
                </span>
              ) : (
                "Registrar empresa"
              )}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-emerald-900">Empresas registradas</h2>
          {error && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : companies.length === 0 ? (
            <p className="text-sm text-gray-500">No hay empresas registradas.</p>
          ) : (
            <ul className="max-h-[420px] space-y-2 overflow-y-auto">
              {companies.map((c) => (
                <li key={c.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-gray-500">NIT: {c.nit}</p>
                  <p className="text-gray-500">
                    {c.is_active ? "Activa" : "Inactiva"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}