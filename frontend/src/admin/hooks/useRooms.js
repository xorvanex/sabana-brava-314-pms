"use client";

import { useState, useEffect } from "react";
import {
  getAllRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} from "@/admin/services/admin.services";

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (roomData) => {
    await createRoom({
      numero: roomData.numero,
      descripcion: roomData.descripcion,
      status: "AVAILABLE",
    });
    await loadRooms();
  };

  const handleUpdate = async (roomId, roomData) => {
    await updateRoom(roomId, roomData);
    await loadRooms();
  };

  const handleUpdateStatus = async (roomId, status) => {
    try {
      await updateRoomStatus(roomId, status);
      await loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (roomId) => {
    try {
      await deleteRoom(roomId);
      await loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    loadRooms,
    handleCreate,
    handleUpdate,
    handleUpdateStatus,
    handleDelete,
  };
}
