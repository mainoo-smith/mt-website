import Link from "next/link";
import { HOMEPAGE_NAV } from "@/config/homepage";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
          Mainoo Technologies
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {HOMEPAGE_NAV.map((item) => (
            <a
              key={item.href}
              href={`/${item.href}`}
              className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 hover:text-brand-orange"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/kontroliq/"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 hover:text-brand-orange"
          >
            KontrolIQ
          </Link>
        </nav>
        <p className="text-xs text-white/35">© {new Date().getFullYear()} Mainoo Technologies</p>
      </div>
    </footer>
  );
}
