"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionUser } from "@/shared/hooks/useSessionUser";
import { ROUTES } from "@/shared/constants/routes";

function UserAvatarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function ProfileMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSessionUser();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");
    setOpen(false);
    router.replace(ROUTES.LOGIN || "/auth/login");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-lg border border-white/25 bg-white/10 px-3 py-2 hover:bg-white/15 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <UserAvatarIcon />
        </div>
        <div className="flex flex-col items-start text-left leading-tight">
          <p className="text-sm font-semibold max-w-[160px] truncate">
            {user?.nombre || "—"}
          </p>
          <p className="text-xs text-white/80 max-w-[160px] truncate">
            {user?.rol || ""}
          </p>
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg z-50"
          role="menu"
          aria-label="Opciones de perfil"
        >
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-emerald-50"
            role="menuitem"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}