"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HOMEPAGE_NAV } from "@/config/homepage";

const DESKTOP_NAV = HOMEPAGE_NAV.filter((item) =>
  ["#nyansapo", "#solutions", "#industries", "#research"].includes(item.href),
);

const SECTION_IDS = [
  "experience",
  "nyansapo",
  "solutions",
  "industries",
  "research",
  "contact",
] as const;

type NavKey = (typeof SECTION_IDS)[number] | "kontroliq";

type SiteHeaderProps = {
  /** Optional override; when omitted, derived from pathname + scroll/hash. */
  active?: NavKey;
};

function resolveFromPath(pathname: string | null): NavKey | null {
  if (!pathname) return null;
  if (pathname.includes("kontroliq")) return "kontroliq";
  if (pathname.includes("solutions")) return "solutions";
  return null;
}

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full bg-brand-orange px-3 py-1.5 text-white"
    : "rounded-full px-3 py-1.5 text-white/70 hover:bg-white/10 hover:text-white";
}

export function SiteHeader({ active: activeOverride }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState<NavKey>(
    () => resolveFromPath(pathname) ?? "experience",
  );

  useEffect(() => {
    const fromPath = resolveFromPath(pathname);
    if (fromPath) {
      setSection(fromPath);
      return;
    }

    // Homepage — track hash + which section is in view.
    const readHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && (SECTION_IDS as readonly string[]).includes(hash)) {
        setSection(hash as NavKey);
      }
    };
    readHash();

    const onHash = () => readHash();
    window.addEventListener("hashchange", onHash);

    const observers: IntersectionObserver[] = [];
    const visible = new Map<string, number>();

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          visible.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
          let best: NavKey = "experience";
          let bestRatio = 0;
          visible.forEach((ratio, key) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = key as NavKey;
            }
          });
          if (bestRatio > 0.12) setSection(best);
        },
        { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.35, 0.55] },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      window.removeEventListener("hashchange", onHash);
      observers.forEach((o) => o.disconnect());
    };
  }, [pathname]);

  const active = activeOverride ?? section;
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Mainoo Technologies" className="flex items-center">
          <Image
            src="/assets/IMG_0090.png"
            alt="Mainoo Technologies"
            width={44}
            height={44}
            priority
            className="h-9 w-9 rounded-full bg-brand-cream/95 p-0.5"
          />
        </Link>
        <nav className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] lg:flex">
          <a href="/#experience" className={navClass(active === "experience")}>
            Experience
          </a>
          {DESKTOP_NAV.map((item) => {
            const key = item.href.slice(1) as NavKey;
            return (
              <a key={item.href} href={`/${item.href}`} className={navClass(active === key)}>
                {item.label}
              </a>
            );
          })}
          <Link href="/kontroliq/" className={navClass(active === "kontroliq")}>
            KontrolIQ
          </Link>
          <a
            href="https://calendly.com/mainootechnologies"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-full bg-brand-orange px-4 py-2 text-white hover:bg-brand-orangeDark"
          >
            Schedule a Demo
          </a>
        </nav>
        <button
          type="button"
          className="rounded bg-brand-orange px-3 py-2 text-xs font-bold uppercase tracking-wider lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
        >
          Menu
        </button>
      </div>
      {menuOpen ? (
        <div className="border-t border-white/10 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-2 text-sm uppercase tracking-wider">
            {HOMEPAGE_NAV.map((item) => {
              const key = item.href.slice(1) as NavKey;
              return (
                <a
                  key={item.href}
                  href={`/${item.href}`}
                  onClick={closeMenu}
                  className={navClass(active === key)}
                >
                  {item.label}
                </a>
              );
            })}
            <Link href="/kontroliq/" onClick={closeMenu} className={navClass(active === "kontroliq")}>
              KontrolIQ
            </Link>
            <a href="https://calendly.com/mainootechnologies" target="_blank" rel="noopener noreferrer">
              Schedule a Demo
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
