"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EXPERIENCE_SCROLL_HEIGHT, SCROLL_CHAPTERS } from "@/config/scenes";
import { ChapterCopy } from "./ChapterCopy";
import { useScrollProgress } from "./useScrollProgress";

const SceneCanvas = dynamic(() => import("./SceneCanvas").then((m) => m.SceneCanvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-brand-ink" />,
});

export function ExperienceShell() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { progress, scrollRef } = useScrollProgress({ smoothScroll: !reducedMotion });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const activeChapter = useMemo(() => {
    return (
      SCROLL_CHAPTERS.find((c) => progress >= c.range[0] && progress < c.range[1]) ??
      SCROLL_CHAPTERS[SCROLL_CHAPTERS.length - 1]
    );
  }, [progress]);

  return (
    <div className="bg-brand-ink text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" className="font-display text-sm font-extrabold uppercase tracking-[0.18em]">
            Mainoo
          </a>
          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.14em] md:flex">
            <a href="#experience" className="opacity-80 hover:opacity-100">
              Experience
            </a>
            <Link href="/kontroliq.html" className="opacity-80 hover:opacity-100">
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
            className="rounded bg-brand-orange px-3 py-2 text-xs font-bold uppercase tracking-wider md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            Menu
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3 text-sm uppercase tracking-wider">
              <a href="#experience" onClick={() => setMenuOpen(false)}>
                Experience
              </a>
              <Link href="/kontroliq.html" onClick={() => setMenuOpen(false)}>
                KontrolIQ
              </Link>
              <a href="https://calendly.com/mainootechnologies" target="_blank" rel="noopener noreferrer">
                Schedule a Demo
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top">
        <section id="experience" ref={scrollRef} className="relative" style={{ height: EXPERIENCE_SCROLL_HEIGHT }}>
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            {!reducedMotion ? (
              <SceneCanvas progress={progress} />
            ) : (
              <ReducedMotionFallback progress={progress} />
            )}
            <ChapterCopy chapter={activeChapter} progress={progress} />
            <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-center text-[11px] uppercase tracking-[0.2em] text-white/55">
              Scroll to continue
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/10">
              <div
                className="h-full bg-brand-orange transition-[width] duration-100"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-white/10 bg-gradient-to-b from-brand-ink via-brand-charcoal to-black px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-brand-orange">
              Closing
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
              Building the digital coordination architecture for Africa
            </h2>
            <p className="mt-5 text-base text-white/75 md:text-lg">
              Phase 1 of the Mainoo experience — the continent, the isolation of critical systems, and the
              moment coordination becomes visible. Healthcare, emergency operations, KontrolIQ, and Labs
              arrive in the next chapters.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://calendly.com/mainootechnologies"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand-orange px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-orangeDark"
              >
                Schedule a Demo
              </a>
              <Link
                href="/kontroliq.html"
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-white hover:text-brand-ink"
              >
                Explore KontrolIQ
              </Link>
            </div>
            <p className="mt-8 text-xs text-white/45">
              Audio will accompany later scenes — muted by default.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function ReducedMotionFallback({ progress }: { progress: number }) {
  const labels = [
    "Digital continent",
    "Systems in isolation",
    "Coordination emerges",
    "The challenge",
    "The platform",
    "The framework",
  ];
  const step = Math.min(labels.length - 1, Math.floor(progress * labels.length));
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-brand-ink px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 h-40 w-40 rounded-full border border-brand-orange/50 bg-[radial-gradient(circle_at_30%_30%,#d37506,transparent_60%)] opacity-80" />
        <p className="font-display text-xs uppercase tracking-[0.2em] text-brand-orange">{labels[step]}</p>
        <p className="mt-3 text-sm text-white/70">
          Motion is reduced on this device. Scroll through the chapters to follow the story.
        </p>
      </div>
    </div>
  );
}
