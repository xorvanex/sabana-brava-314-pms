"use client";

import { useState, useEffect } from "react";
import { getAllUsers, toggleUserStatus } from "@/shared/serviceGlobal/user.services";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      const adaptedUsers = data.map(user => ({
        ...user,
        nombre: user.nombre || user.name || "",
        rol: user.rol || user.role || "",
        telefono: user.telefono || user.phone || "",
      }));
      setUsers(adaptedUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    handleToggleStatus,
  };
}