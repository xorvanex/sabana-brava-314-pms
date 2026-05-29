"use client";

import { useEffect, useState } from "react";

export function useSessionUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuario");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser({
          nombre: userData.nombre || userData.name || "",
          rol: userData.rol || userData.role || ""
        });
      }
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}