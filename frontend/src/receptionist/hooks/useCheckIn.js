"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllReservations } from "@/receptionist/services/receptionist.service";
import { API_URL } from "@/shared/API/api";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
}

async function patchReservation(reservationId, action) {
  const res = await fetch(`${API_URL}/reservations/${reservationId}/${action}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const detail = err?.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : "No se pudo completar la acción.";
    throw new Error(msg);
  }
  return await res.json();
}

// ── Constancia local de huéspedes que hicieron check in ──────────────────────
function loadCheckinRecord() {
  try {
    return JSON.parse(localStorage.getItem("checkin_guests") || "{}");
  } catch {
    return {};
  }
}

function saveCheckinRecord(record) {
  localStorage.setItem("checkin_guests", JSON.stringify(record));
}

export function saveGuestCheckins(reservationId, guestIds) {
  const record = loadCheckinRecord();
  record[reservationId] = guestIds;
  saveCheckinRecord(record);
}

export function getGuestCheckins(reservationId) {
  return loadCheckinRecord()[reservationId] || [];
}

export function clearGuestCheckins(reservationId) {
  const record = loadCheckinRecord();
  delete record[reservationId];
  saveCheckinRecord(record);
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useCheckIn() {
  const [confirmedReservations, setConfirmedReservations] = useState([]);
  const [checkedInReservations, setCheckedInReservations] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getAllReservations();
      setConfirmedReservations(all.filter((r) => r.status === "CONFIRMED"));
      setCheckedInReservations(all.filter((r) => r.status === "CHECKED_IN"));
      setPendingReservations(all.filter((r) => r.status === "PENDING"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // CONFIRMED → CHECKED_IN  (guarda qué huéspedes hicieron check in)
  const handleCheckIn = async (reservationId, selectedGuestIds) => {
    const updated = await patchReservation(reservationId, "check-in");
    saveGuestCheckins(reservationId, selectedGuestIds);
    setConfirmedReservations((prev) => prev.filter((r) => r.id !== reservationId));
    setCheckedInReservations((prev) => [...prev, updated]);
    return updated;
  };

  // CHECKED_IN → COMPLETED  (limpia la constancia local)
  const handleCheckOut = async (reservationId) => {
    const updated = await patchReservation(reservationId, "check-out");
    clearGuestCheckins(reservationId);
    setCheckedInReservations((prev) => prev.filter((r) => r.id !== reservationId));
    return updated;
  };
  
  const handleConfirm = async (reservationId) => {
    const updated = await patchReservation(reservationId, "confirm");
    setPendingReservations((prev) => prev.filter((r) => r.id !== reservationId));
    setConfirmedReservations((prev) => [...prev, updated]);
    return updated;
  };

  return {
    confirmedReservations,
    checkedInReservations,
    pendingReservations,   
    loading,
    error,
    reload: load,
    handleCheckIn,
    handleCheckOut,
    handleConfirm,  
  };
}