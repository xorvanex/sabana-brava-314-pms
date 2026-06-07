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
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm space-y-6">
          
          {/* Header decoration */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
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
              <h2 className="text-lg font-bold text-emerald-950">Registrar Empresa</h2>
              <p className="text-xs text-gray-500">Ingrese los datos comerciales y de contacto de la organización.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Section: Legal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Información Comercial
                  </h3>
                </div>
                
                <Input
                  label="Nombre de la Empresa"
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej. ACME Corporation S.A.S."
                />
                
                <Input
                  label="NIT"
                  id="nit"
                  name="nit"
                  value={form.nit}
                  onChange={handleChange}
                  required
                  placeholder="Ej. 900123456-7"
                />
                
                <Input
                  label="Representante Legal"
                  id="representante"
                  name="representante"
                  value={form.representante}
                  onChange={handleChange}
                  required
                  placeholder="Nombre y apellido"
                />
              </div>

              {/* Section: Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Ubicación y Contacto
                  </h3>
                </div>

                <Input
                  label="Dirección"
                  id="direccion"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Dirección física comercial"
                />
                
                <Input
                  label="Teléfono"
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
                  placeholder="ejemplo@empresa.com"
                />
              </div>
            </div>

            {/* Success notification */}
            {success && (
              <div className="pt-2">
                <AdminSuccessBanner message={success} onDismiss={() => setSuccess(null)} />
              </div>
            )}

            {/* Submit button aligned to right on desktop */}
            <div className="flex justify-end pt-4 border-t border-slate-50">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition font-medium">
                {saving ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Spinner /> Registrando empresa...
                  </span>
                ) : (
                  "Registrar Empresa"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <AdminErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </>
  );
}