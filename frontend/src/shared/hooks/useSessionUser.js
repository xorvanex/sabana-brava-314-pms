"use client";

import { useEffect, useState } from "react";

export function useSessionUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuario");
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}