"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/auth/services/auth.service";
import { getRedirectByRole } from "@/shared/API/roleRedirect";
import { ROUTES } from "@/shared/constants/routes";

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      const redirectTo = getRedirectByRole(data.usuario?.rol);
      router.push(redirectTo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  };
}