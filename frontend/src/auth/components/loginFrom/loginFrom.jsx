"use client";

import Image from "next/image";
import { useLogin } from "@/auth/hooks/useLogin";
import Button from "@/shared/globalComponents/ui/button/Button";
import Input from "@/shared/globalComponents/ui/input/Input";
import Spinner from "@/shared/globalComponents/ui/spinner/Spinner";

const BACKGROUND_IMAGE = "/assets/images/fachada-hotel.png";
const LOGO_IMAGE = "/assets/images/logo-hotel.png";

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url('${BACKGROUND_IMAGE}')` }}
    >
      <div className="absolute inset-0 bg-black/45" aria-hidden />

      <section className="relative z-10 w-full max-w-md rounded-2xl bg-white/95 px-8 pb-8 pt-16 shadow-2xl backdrop-blur-sm">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
            <Image
              src={LOGO_IMAGE}
              alt="Logo Hotel Sabana Brava"
              width={96}
              height={96}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
        </div>

        <header className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-emerald-900">
            Sabana Brava 314
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sistema de gestión hotelera
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            id="username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="username"
          />

          <Input
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}