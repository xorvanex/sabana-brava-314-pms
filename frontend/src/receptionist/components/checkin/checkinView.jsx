"use client";

import { useState } from "react";
import { useCheckIn, getGuestCheckins } from "@/receptionist/hooks/useCheckIn";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

function formatDate(d) {
  if (!d) return "";
  const parts = d.split("-");
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

// ── Banner informativo por tab ────────────────────────────────────────────────
function FlowBanner({ tab }) {
  const config = {
    checkin: {
      color: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      title: "Flujo de Check In",
      steps: [
        "Solo aparecen reservas en estado Confirmado.",
        "Selecciona uno o más huéspedes registrados en la reserva.",
        "Presiona Registrar Check In — la reserva pasa a estado En estadía.",
      ],
    },
    checkout: {
      color: "border-red-200 bg-red-50 text-red-800",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      title: "Flujo de Check Out",
      steps: [
        "Solo aparecen reservas en estado En estadía.",
        "Verifica que los huéspedes estén listos para salir.",
        "Presiona Registrar Check Out — la reserva pasa a estado Completada.",
      ],
    },
    
    pending: {
      color: "border-amber-200 bg-amber-50 text-amber-800",
      icon: (
        <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Flujo de Confirmación",
      steps: [
        "Solo aparecen reservas en estado Pendiente.",
        "Revisa los datos de la reserva antes de confirmar.",
        "Presiona Confirmar reserva — pasa a estado Confirmada y queda lista para check in.",
      ],
    },

  };

  const c = config[tab];
  return (
    <div className={`rounded-xl border px-4 py-3 ${c.color}`}>
      <div className="flex items-center gap-2 font-semibold text-sm mb-2">
        {c.icon}
        {c.title}
      </div>
      <ol className="space-y-1 ml-7 list-decimal text-sm">
        {c.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  );
}

// ── Tarjeta Check In (con selección de huéspedes) ────────────────────────────
function CheckInCard({ reservation, onAction, loading }) {
  const { company, contract, start_date, end_date, guest_count, rooms, guests } = reservation;
  const [selectedGuests, setSelectedGuests] = useState([]);

  const toggleGuest = (guestId) => {
    setSelectedGuests((prev) =>
      prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]
    );
  };

  const selectAll = () => setSelectedGuests(guests.map((g) => g.id));
  const clearAll = () => setSelectedGuests([]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <p className="font-bold text-emerald-900 truncate">{company?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">Contrato: {contract?.contract_number}</p>
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

      {/* Selección de huéspedes */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Huéspedes ({selectedGuests.length}/{guests?.length ?? 0} seleccionados)
          </p>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-emerald-600 underline underline-offset-2">Todos</button>
            <button onClick={clearAll} className="text-xs text-gray-400 underline underline-offset-2">Ninguno</button>
          </div>
        </div>

        {guests?.length > 0 ? (
          <ul className="space-y-1.5">
            {guests.map((g) => {
              const checked = selectedGuests.includes(g.id);
              return (
                <li key={g.id}>
                  <label className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${
                    checked ? "border-emerald-300 bg-emerald-50" : "border-gray-100 bg-slate-50 hover:border-emerald-200"
                  }`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGuest(g.id)}
                      className="h-4 w-4 rounded accent-emerald-600"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {g.first_name} {g.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{g.document_type} · {g.document_number}</p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 italic">Sin huéspedes asignados.</p>
        )}
      </div>

      {/* Acción */}
      <div className="border-t border-gray-50 px-5 py-3">
        <button
          onClick={() => onAction(reservation.id, selectedGuests)}
          disabled={loading || selectedGuests.length === 0}
          className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><Spinner /> Procesando...</span>
            : selectedGuests.length === 0
            ? "Selecciona al menos un huésped"
            : `Registrar Check In (${selectedGuests.length} huésped${selectedGuests.length !== 1 ? "es" : ""})`}
        </button>
      </div>
    </div>
  );
}

// ── Tarjeta Check Out (muestra constancia de huéspedes) ──────────────────────
function CheckOutCard({ reservation, onAction, loading }) {
  const { company, contract, start_date, end_date, guest_count, rooms, guests } = reservation;
  const checkedInGuestIds = getGuestCheckins(reservation.id);
  const checkedInGuests = guests?.filter((g) => checkedInGuestIds.includes(g.id)) || [];
  const otherGuests = guests?.filter((g) => !checkedInGuestIds.includes(g.id)) || [];

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <p className="font-bold text-emerald-900 truncate">{company?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">Contrato: {contract?.contract_number}</p>
          <p className="text-xs text-gray-500 mt-1">
            📅 {formatDate(start_date)} → {formatDate(end_date)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
          En estadía
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

      {/* Constancia de huéspedes */}
      <div className="px-5 pb-3 space-y-2">
        {checkedInGuests.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
              ✓ Con check in registrado
            </p>
            <ul className="space-y-1">
              {checkedInGuests.map((g) => (
                <li key={g.id} className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">{g.first_name} {g.last_name}</p>
                    <p className="text-xs text-emerald-600">{g.document_type} · {g.document_number}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {otherGuests.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Sin registro de check in
            </p>
            <ul className="space-y-1">
              {otherGuests.map((g) => (
                <li key={g.id} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-slate-50 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{g.first_name} {g.last_name}</p>
                    <p className="text-xs text-gray-400">{g.document_type} · {g.document_number}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {guests?.length === 0 && (
          <p className="text-xs text-gray-400 italic">Sin huéspedes asignados.</p>
        )}
      </div>

      {/* Acción */}
      <div className="border-t border-gray-50 px-5 py-3">
        <button
          onClick={() => onAction(reservation.id)}
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><Spinner /> Procesando...</span>
            : "Registrar Check Out"}
        </button>
      </div>
    </div>
  );
}

function PendingCard({ reservation, onAction, loading }) {
  const { company, contract, start_date, end_date, guest_count, rooms, guests } = reservation;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <p className="font-bold text-emerald-900 truncate">{company?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">Contrato: {contract?.contract_number}</p>
          <p className="text-xs text-gray-500 mt-1">
            📅 {formatDate(start_date)} → {formatDate(end_date)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-100">
          Pendiente
        </span>
      </div>

      {rooms?.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1">
          {rooms.map((r) => (
            <span key={r.id} className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
              Hab. {r.room_number}
            </span>
          ))}
        </div>
      )}

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
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  {g.first_name} {g.last_name}
                  <span className="text-gray-400">· {g.document_number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="border-t border-gray-50 px-5 py-3">
        <button
          onClick={() => onAction(reservation.id)}
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><Spinner /> Procesando...</span>
            : "Confirmar reserva"}
        </button>
      </div>
    </div>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────────
export default function CheckinView() {
  const {
    confirmedReservations,
    checkedInReservations,
    pendingReservations,  
    loading,
    error,
    reload,
    handleCheckIn,
    handleCheckOut,
    handleConfirm,   
  } = useCheckIn();

  const TABS = [
    { key: "checkin",  label: "Check In",  count: confirmedReservations.length },
    { key: "checkout", label: "Check Out", count: checkedInReservations.length },
    { key: "pending",  label: "Pendientes", count: pendingReservations.length },
  ];

  const [activeTab, setActiveTab] = useState("checkin");
  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const onCheckIn = async (reservationId, guestIds) => {
    setProcessingId(reservationId);
    setErrorMsg(null);
    try {
      await handleCheckIn(reservationId, guestIds);
      showSuccess("Check-in registrado correctamente. La reserva ahora está en estadía.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const onCheckOut = async (reservationId) => {
    setProcessingId(reservationId);
    setErrorMsg(null);
    try {
      await handleCheckOut(reservationId);
      showSuccess("Check-out registrado correctamente. La reserva ha sido completada.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const onConfirm = async (reservationId) => {
    setProcessingId(reservationId);
    setErrorMsg(null);
    try {
      await handleConfirm(reservationId);
      showSuccess("Reserva confirmada. Ya puede proceder con el check in.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const currentList =
  activeTab === "pending"  ? pendingReservations  :
  activeTab === "checkin"  ? confirmedReservations :
  checkedInReservations;

  return (
    <section className="space-y-5">
      {/* Encabezado */}
      <div className="border-b border-emerald-50 pb-4">
        <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight">
          Check In / Check Out
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Las reservas deben estar <strong>Confirmadas</strong> para hacer check in. Una vez en estadía, puedes registrar el check out para completarlas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 rounded-xl border border-emerald-100 bg-white p-1 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key ? "bg-emerald-700 text-white shadow" : "text-gray-500 hover:text-emerald-700"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
              activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Banner de flujo */}
      <FlowBanner tab={activeTab} />

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
            {activeTab === "pending"
              ? "No hay reservas pendientes de confirmación."
              : activeTab === "checkin"
              ? "No hay reservas confirmadas pendientes de check-in."
              : "No hay huéspedes con check-in activo."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTab === "pending" &&
          pendingReservations.map((r) => (
            <PendingCard
              key={r.id}
              reservation={r}
              onAction={onConfirm}
              loading={processingId === r.id}
            />
          ))}
          {activeTab === "checkin" &&
            confirmedReservations.map((r) => (
              <CheckInCard
                key={r.id}
                reservation={r}
                onAction={onCheckIn}
                loading={processingId === r.id}
              />
            ))}
          {activeTab === "checkout" &&
            checkedInReservations.map((r) => (
              <CheckOutCard
                key={r.id}
                reservation={r}
                onAction={onCheckOut}
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