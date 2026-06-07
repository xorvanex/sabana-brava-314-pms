"use client";

import { useState } from "react";
import AdminErrorModal from "@/admin/components/ui/AdminErrorModal";
import AdminInfoBanner from "@/admin/components/ui/AdminInfoBanner";
import AdminSuccessBanner from "@/admin/components/ui/AdminSuccessBanner";
import { useAdminErrorModal } from "@/admin/hooks/useAdminErrorModal";
import { validateCompanyUpdateForm } from "@/admin/utils/parseApiError";
import Button from "@/shared/globalComponents/ui/button/Button";
import Input from "@/shared/globalComponents/ui/input/Input";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

function mapCompanyToForm(company) {
  return {
    nombre: company.name ?? "",
    nit: company.nit ?? "",
    representante: company.company_representative ?? "",
    direccion: company.address ?? "",
    telefono: company.phone ?? "",
    correo: company.email ?? "",
    activo: company.is_active ?? true,
  };
}

export default function CompanyDetailForm({ company, loading, onBack, onUpdate }) {
  const { errorModal, showError, closeError } = useAdminErrorModal();
  const [readOnly, setReadOnly] = useState(true);
  const [form, setForm] = useState(() => mapCompanyToForm(company));
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateCompanyUpdateForm(form);
    if (validationError) {
      showError(validationError, { nit: form.nit, correo: form.correo });
      return;
    }
    setSuccess(null);
    setSaving(true);
    try {
      await onUpdate(company.id, {
        representante: form.representante,
        direccion: form.direccion,
        telefono: form.telefono,
        correo: form.correo,
        activo: form.activo,
      });
      setSuccess("Empresa actualizada correctamente.");
      setReadOnly(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al actualizar.", {
        nit: form.nit,
        correo: form.correo,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="text-sm font-medium text-emerald-700 hover:underline">
          ← Volver al listado
        </button>
        <button
          type="button"
          onClick={() => {
            setReadOnly((v) => !v);
            setSuccess(null);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {readOnly ? "Editar datos" : "Cancelar edición"}
        </button>
      </div>

      <AdminInfoBanner>
        El <strong>nombre de la empresa</strong> y el <strong>NIT</strong> no son editables. Solo puedes
        actualizar representante legal, dirección, teléfono, correo y estado activo.
      </AdminInfoBanner>

      <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-emerald-900">{form.nombre}</h2>
        <AdminSuccessBanner message={success} onDismiss={() => setSuccess(null)} />

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Nombre (no editable)" id="nombre" name="nombre" value={form.nombre} readOnly required={false} />
          <Input label="NIT (no editable)" id="nit" name="nit" value={form.nit} readOnly required={false} />
          <Input
            label="Representante legal"
            id="representante"
            name="representante"
            value={form.representante}
            onChange={handleChange}
            disabled={readOnly}
            required
          />
          <Input label="Dirección" id="direccion" name="direccion" value={form.direccion} onChange={handleChange} disabled={readOnly} />
          <Input label="Teléfono" id="telefono" name="telefono" value={form.telefono} onChange={handleChange} disabled={readOnly} />
          <Input label="Correo" id="correo" name="correo" type="email" value={form.correo} onChange={handleChange} disabled={readOnly} />
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} disabled={readOnly} />
            Empresa activa
          </label>
          {!readOnly && (
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving || loading}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Guardando...
                  </span>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          )}
        </form>
      </div>

      <AdminErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </div>
  );
}