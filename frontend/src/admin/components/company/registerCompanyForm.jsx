"use client";

import { useState } from "react";
import AdminErrorModal from "@/admin/components/ui/AdminErrorModal";
import AdminSuccessBanner from "@/admin/components/ui/AdminSuccessBanner";
import { useAdminErrorModal } from "@/admin/hooks/useAdminErrorModal";
import { validateCompanyForm } from "@/admin/utils/parseApiError";
import Button from "@/shared/globalComponents/ui/button/Button";
import Input from "@/shared/globalComponents/ui/input/Input";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

const EMPTY_FORM = { nombre: "", nit: "", representante: "", direccion: "", telefono: "", correo: "" };

export default function RegisterCompanyForm({ onCreate }) {
  const { errorModal, showError, closeError } = useAdminErrorModal();
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateCompanyForm(form);
    if (validationError) {
      showError(validationError, { nit: form.nit, correo: form.correo });
      return;
    }
    setSuccess(null);
    setSaving(true);
    try {
      await onCreate(form);
      setForm(EMPTY_FORM);
      setSuccess("Empresa registrada correctamente.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al registrar la empresa.", {
        nit: form.nit,
        correo: form.correo,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="max-w-xl rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-emerald-900">Registrar empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Input label="NIT" id="nit" name="nit" value={form.nit} onChange={handleChange} required />
          <Input label="Representante legal" id="representante" name="representante" value={form.representante} onChange={handleChange} required />
          <Input label="Dirección" id="direccion" name="direccion" value={form.direccion} onChange={handleChange} />
          <Input label="Teléfono" id="telefono" name="telefono" value={form.telefono} onChange={handleChange} />
          <Input label="Correo" id="correo" name="correo" type="email" value={form.correo} onChange={handleChange} />
          <AdminSuccessBanner message={success} onDismiss={() => setSuccess(null)} />
          <Button type="submit" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2"><Spinner /> Registrando...</span>
            ) : (
              "Registrar empresa"
            )}
          </Button>
        </form>
      </div>
      <AdminErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </>
  );
}