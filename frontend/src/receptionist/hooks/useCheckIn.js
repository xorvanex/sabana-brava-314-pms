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

export function useCheckIn() {
  const [pendingReservations, setPendingReservations] = useState([]);
  const [confirmedReservations, setConfirmedReservations] = useState([]);
  const [checkedInReservations, setCheckedInReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getAllReservations();
      setPendingReservations(all.filter((r) => r.status === "PENDING"));
      setConfirmedReservations(all.filter((r) => r.status === "CONFIRMED"));
      setCheckedInReservations(all.filter((r) => r.status === "CHECKED_IN"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // PENDING → CONFIRMED
  const handleConfirm = async (reservationId) => {
    const updated = await patchReservation(reservationId, "confirm");
    setPendingReservations((prev) => prev.filter((r) => r.id !== reservationId));
    setConfirmedReservations((prev) => [...prev, updated]);
    return updated;
  };

  // CONFIRMED → CHECKED_IN
  const handleCheckIn = async (reservationId) => {
    const updated = await patchReservation(reservationId, "check-in");
    setConfirmedReservations((prev) => prev.filter((r) => r.id !== reservationId));
    setCheckedInReservations((prev) => [...prev, updated]);
    return updated;
  };

  // CHECKED_IN → COMPLETED
  const handleCheckOut = async (reservationId) => {
    const updated = await patchReservation(reservationId, "check-out");
    setCheckedInReservations((prev) => prev.filter((r) => r.id !== reservationId));
    return updated;
  };

  return {
    pendingReservations,
    confirmedReservations,
    checkedInReservations,
    loading,
    error,
    reload: load,
    handleConfirm,
    handleCheckIn,
    handleCheckOut,
  };
}