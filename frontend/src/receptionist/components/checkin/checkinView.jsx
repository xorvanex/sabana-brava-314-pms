"use client";

import { useState } from "react";
import { useCheckIn } from "@/receptionist/hooks/useCheckIn";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

function formatDate(d) {
  if (!d) return "";
  const parts = d.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

// ── Tarjeta de reserva ────────────────────────────────────────────────────────
function ReservationCard({ reservation, onAction, actionLabel, actionStyle, loading }) {
  const [expanded, setExpanded] = useState(false);
  const { company, contract, start_date, end_date, guest_count, rooms, guests } = reservation;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="font-bold text-emerald-900 truncate">{company?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Contrato: {contract?.contract_number}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            📅 {formatDate(start_date)} → {formatDate(end_date)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
          {guest_count} huésped{guest_count !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Habitaciones */}
      {rooms?.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1">
          {rooms.map((r) => (
            <span key={r.id} className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
              Hab. {r.room_number}
            </span>
          ))}
        </div>
      )}

      {/* Huéspedes desplegables */}
      {guests?.length > 0 && (
        <div className="px-5 pb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-emerald-600 underline underline-offset-2"
          >
            {expanded ? "Ocultar huéspedes" : `Ver ${guests.length} huésped${guests.length !== 1 ? "es" : ""}`}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1">
              {guests.map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {g.first_name} {g.last_name}
                  <span className="text-gray-400">· {g.document_number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Acción */}
      <div className="border-t border-gray-50 px-5 py-3">
        <button
          onClick={() => onAction(reservation.id)}
          disabled={loading}
          className={`w-full rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:opacity-60 ${actionStyle}`}
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><Spinner /> Procesando...</span>
            : actionLabel}
        </button>
      </div>
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-emerald-700 text-white shadow" : "text-gray-500 hover:text-emerald-700"
      }`}
    >
      {children}
    </button>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────────
export default function CheckinView() {
  const {
    pendingReservations,
    confirmedReservations,
    checkedInReservations,
    loading,
    error,
    reload,
    handleConfirm,
    handleCheckIn,
    handleCheckOut,
  } = useCheckIn();

  const TABS = [
    { key: "pending",   label: "Pendientes",   count: pendingReservations.length },
    { key: "checkin",   label: "Check In",     count: confirmedReservations.length },
    { key: "checkout",  label: "Check Out",    count: checkedInReservations.length },
  ];

  const [activeTab, setActiveTab] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const exec = async (fn, id, successText) => {
    setProcessingId(id);
    setErrorMsg(null);
    try {
      await fn(id);
      showSuccess(successText);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const currentList = {
    pending:  pendingReservations,
    checkin:  confirmedReservations,
    checkout: checkedInReservations,
  }[activeTab];

  const actionConfig = {
    pending:  { label: "Confirmar reserva",    style: "bg-amber-600 hover:bg-amber-700",   fn: (id) => exec(handleConfirm,   id, "Reserva confirmada correctamente.") },
    checkin:  { label: "Registrar Check In",   style: "bg-emerald-700 hover:bg-emerald-800", fn: (id) => exec(handleCheckIn,  id, "Check-in registrado correctamente.") },
    checkout: { label: "Registrar Check Out",  style: "bg-red-600 hover:bg-red-700",       fn: (id) => exec(handleCheckOut, id, "Check-out registrado correctamente.") },
  }[activeTab];

  return (
    <section className="space-y-5">
      <div className="border-b border-emerald-50 pb-4">
        <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight">
          Check In / Check Out
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona el ciclo de vida de las reservas: confirmación, entrada y salida de huéspedes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 rounded-xl border border-emerald-100 bg-white p-1 shadow-sm w-fit">
        {TABS.map((tab) => (
          <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
              activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </TabButton>
        ))}
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          ✓ {successMsg}
        </div>
      )}
      {(errorMsg || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          ⚠ {errorMsg || error}
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-400">
          <Spinner className="border-emerald-400 border-t-transparent" /> Cargando reservas...
        </div>
      ) : currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-100 py-16 text-slate-400">
          <svg className="h-12 w-12 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-semibold text-slate-500">
            {{
              pending:  "No hay reservas pendientes de confirmación.",
              checkin:  "No hay reservas confirmadas pendientes de check-in.",
              checkout: "No hay huéspedes con check-in activo.",
            }[activeTab]}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentList.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              actionLabel={actionConfig.label}
              actionStyle={actionConfig.style}
              onAction={actionConfig.fn}
              loading={processingId === r.id}
            />
          ))}
        </div>
      )}

      <button
        onClick={reload}
        className="text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-800"
      >
        ↺ Actualizar lista
      </button>
    </section>
  );
}