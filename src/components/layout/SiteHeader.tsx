"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HOMEPAGE_NAV } from "@/config/homepage";

const DESKTOP_NAV = HOMEPAGE_NAV.filter((item) =>
  ["#nyansapo", "#solutions", "#industries", "#research"].includes(item.href),
);

type SiteHeaderProps = {
  active?: "experience" | "kontroliq" | "solutions";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
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
        <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.14em] lg:flex">
          <a
            href="/#experience"
            className={active === "experience" ? "text-brand-orange" : "opacity-80 hover:opacity-100"}
          >
            Experience
          </a>
          {DESKTOP_NAV.map((item) => (
            <a
              key={item.href}
              href={`/${item.href}`}
              className={
                active === "solutions" && item.href === "#solutions"
                  ? "text-brand-orange"
                  : "opacity-80 hover:opacity-100"
              }
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/kontroliq/"
            className={active === "kontroliq" ? "text-brand-orange" : "opacity-80 hover:opacity-100"}
          >
            KontrolIQ
          </Link>
          <a
            href="https://calendly.com/mainootechnologies"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-orange px-4 py-2 text-white hover:bg-brand-orangeDark"
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
          <div className="flex flex-col gap-3 text-sm uppercase tracking-wider">
            {HOMEPAGE_NAV.map((item) => (
              <a
                key={item.href}
                href={`/${item.href}`}
                onClick={closeMenu}
                className={active === "solutions" && item.href === "#solutions" ? "text-brand-orange" : ""}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/kontroliq/"
              onClick={closeMenu}
              className={active === "kontroliq" ? "text-brand-orange" : ""}
            >
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
