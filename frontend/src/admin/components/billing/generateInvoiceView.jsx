"use client";

import { useEffect, useState } from "react";
import AdminErrorModal from "@/admin/components/ui/AdminErrorModal";
import AdminInfoBanner from "@/admin/components/ui/AdminInfoBanner";
import AdminSuccessBanner from "@/admin/components/ui/AdminSuccessBanner";
import { useAdminErrorModal } from "@/admin/hooks/useAdminErrorModal";
import { formatInvoiceStatus } from "@/admin/utils/formatLabels";
import { useBilling } from "@/admin/hooks/useBilling";
import Button from "@/shared/globalComponents/ui/button/Button";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

// ── helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StepBadge({ number, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${done ? "text-emerald-700" : active ? "text-emerald-900" : "text-gray-400"}`}>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-600 text-white" : active ? "bg-emerald-900 text-white" : "bg-gray-200 text-gray-500"}`}>
        {done ? "✓" : number}
      </span>
      {label}
    </div>
  );
}

// ── componente principal ──────────────────────────────────────────────────────
export default function GenerateInvoiceView() {
  const {
    companies, contracts, reservations,
    loading, loadingContracts, loadingReservations,
    error, loadContracts, loadReservations, handleGenerate,
  } = useBilling();

  const { errorModal, showError, closeError } = useAdminErrorModal();

  const [step, setStep] = useState(1);
  const [empresaId, setEmpresaId] = useState("");
  const [contractId, setContractId] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const handleSelectEmpresa = (id) => {
    setEmpresaId(id);
    setContractId("");
    setReservationId("");
    setStep(2);
    loadContracts(id);
    loadReservations(id);
  };

  const handleSelectContract = (id) => {
    setContractId(id);
    setReservationId("");
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!empresaId || !contractId || !reservationId) return;
    setSuccess(null);
    setSaving(true);

    const reservation = completedReservations.find((r) => r.id === reservationId);
    const period_start = reservation.start_date;
    const period_end = reservation.end_date;

    try {
      const invoice = await handleGenerate({ empresaId, period_start, period_end });
      setSuccess(`Factura ${invoice.invoice_number} generada. Estado: ${formatInvoiceStatus(invoice.invoice_status)}.`);

      setStep(1);
      setEmpresaId("");
      setContractId("");
      setReservationId("");
    } catch (err) {
      showError(err instanceof Error ? err.message : "No se pudo generar la factura.", {
        companyName: companies.find((c) => c.id === empresaId)?.name,
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedCompany = companies.find((c) => c.id === empresaId);
  const selectedContract = contracts.find((c) => c.id === contractId);

  // Solo se muestran reservas con estado COMPLETED para facturar
  const completedReservations = reservations.filter((r) => r.status === "COMPLETED");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-900">Generar factura mensual</h1>

      <AdminInfoBanner>
        Selecciona la empresa, su contrato vigente y la reserva a facturar. La factura quedará en estado{" "}
        <strong>pendiente de pago</strong>.
      </AdminInfoBanner>

      <AdminSuccessBanner message={success} onDismiss={() => setSuccess(null)} />

      <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white px-6 py-4 shadow-sm">
        <StepBadge number={1} label="Empresa" active={step === 1} done={step > 1} />
        <span className="h-px flex-1 bg-gray-200" />
        <StepBadge number={2} label="Contrato" active={step === 2} done={step > 2} />
        <span className="h-px flex-1 bg-gray-200" />
        <StepBadge number={3} label="Reserva" active={step === 3} done={false} />
      </div>

      <div className="max-w-lg rounded-xl border border-emerald-100 bg-white p-6 shadow-sm space-y-5">

        {/* ── STEP 1: seleccionar empresa ── */}
        {step === 1 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Empresa a facturar</label>
            {loading ? (
              <p className="flex items-center gap-2 text-sm text-gray-500"><Spinner /> Cargando empresas...</p>
            ) : (
              <select
                value={empresaId}
                onChange={(e) => handleSelectEmpresa(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Seleccionar empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.nit}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* ── STEP 2: seleccionar contrato ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2 text-sm">
              <span className="font-medium text-emerald-800">{selectedCompany?.name}</span>
              <button onClick={() => setStep(1)} className="text-xs text-emerald-600 underline">Cambiar</button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Contrato vigente</label>
              {loadingContracts ? (
                <p className="flex items-center gap-2 text-sm text-gray-500"><Spinner /> Cargando contratos...</p>
              ) : contracts.length === 0 ? (
                <p className="text-sm text-red-600">Esta empresa no tiene contratos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {contracts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectContract(c.id)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                        c.is_active
                          ? "border-emerald-300 hover:bg-emerald-50"
                          : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                      disabled={!c.is_active}
                    >
                      <span className="font-medium">{c.contract_number}</span>
                      <span className="ml-2 text-gray-500">
                        {formatDate(c.start_date)} → {formatDate(c.end_date)}
                      </span>
                      {!c.is_active && <span className="ml-2 text-xs text-gray-400">(inactivo)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: seleccionar reserva completada ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* resumen empresa + contrato */}
            <div className="space-y-1">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2 text-sm">
                <span className="font-medium text-emerald-800">{selectedCompany?.name}</span>
                <button onClick={() => setStep(1)} className="text-xs text-emerald-600 underline">Cambiar</button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2 text-sm">
                <span className="text-emerald-800">Contrato: <strong>{selectedContract?.contract_number}</strong></span>
                <button onClick={() => setStep(2)} className="text-xs text-emerald-600 underline">Cambiar</button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Reserva a facturar</label>

              {loadingReservations ? (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Spinner /> Cargando reservas...
                </p>
              ) : completedReservations.length === 0 ? (
                // Mensaje diferenciado: si hay reservas pero ninguna completada vs. no hay ninguna
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {reservations.length === 0
                    ? "Esta empresa no tiene reservas registradas."
                    : "Esta empresa no tiene reservas completadas disponibles para facturar. Solo se pueden facturar reservas con estado Completada."}
                </div>
              ) : (
                <div className="space-y-2">
                  {completedReservations.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReservationId(r.id)}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                        reservationId === r.id
                          ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium text-gray-800">
                        {formatDate(r.start_date)} → {formatDate(r.end_date)}
                      </div>
                      <div className="text-gray-500">
                        {r.guest_count} huésped{r.guest_count !== 1 ? "es" : ""} · Estado:{" "}
                        <span className="font-medium text-emerald-700">Completada</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saving || !reservationId}
            >
              {saving ? (
                <span className="flex items-center gap-2"><Spinner /> Generando...</span>
              ) : (
                "Generar factura"
              )}
            </Button>
          </div>
        )}
      </div>

      <AdminErrorModal open={!!errorModal} onClose={closeError} {...errorModal} />
    </section>
  );
}
