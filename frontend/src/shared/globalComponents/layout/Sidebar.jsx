import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_COLOR = "#A67C52";

function HamburgerButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Alternar menú lateral"
      className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/40 bg-white/10 transition hover:bg-white/20"
    >
      <span className="block h-0.5 w-5 rounded bg-white" />
      <span className="block h-0.5 w-5 rounded bg-white" />
      <span className="block h-0.5 w-5 rounded bg-white" />
    </button>
  );
}

export default function Sidebar({
  menuItems,
  open,
  onTogglePinned,
  onMouseEnter,
  onMouseLeave,
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`border-r border-black/10 text-white transition-all duration-300 ${
        open ? "w-[260px]" : "w-[72px]"
      }`}
      style={{ backgroundColor: NAV_COLOR }}
    >
      <div className="flex items-center justify-between p-4">
        {open && (
          <p className="text-sm font-semibold tracking-wide">Menú</p>
        )}
        <HamburgerButton onClick={onTogglePinned} />
      </div>

      <nav
        className="px-2 pb-4"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {open ? (
          menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-2 block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-white font-semibold text-[#6f4f2f]"
                    : "hover:bg-white/15"
                }`}
              >
                {item.label}
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-2">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition ${
                    active
                      ? "bg-white text-[#6f4f2f]"
                      : "hover:bg-white/15"
                  }`}
                >
                  {item.label.charAt(0)}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}