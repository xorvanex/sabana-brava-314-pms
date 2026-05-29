import Image from "next/image";
import Link from "next/link";
import ProfileMenu from "./ProfileMenu";

const NAV_COLOR = "#A67C52";

export default function Topbar({ title, dashboardHref = "/" }) {
  return (
    <header
      className="flex h-20 items-center justify-between border-b border-black/10 px-4 md:px-6 text-white shadow-sm z-40"
      style={{ backgroundColor: NAV_COLOR }}
    >
      <Link
        href={dashboardHref}
        className="flex items-center gap-3 rounded-lg transition hover:bg-white/10"
        aria-label="Ir al dashboard"
      >
        <Image
          src="/assets/images/logo-hotel.png"
          alt="Logo Hotel"
          width={42}
          height={42}
          className="rounded-full bg-white object-contain p-1"
        />
        <div className="hidden sm:block">
          <p className="text-sm opacity-90">Sabana Brava 314</p>
          <p className="text-lg font-semibold leading-5">{title}</p>
        </div>
      </Link>

      <ProfileMenu />
    </header>
  );
}