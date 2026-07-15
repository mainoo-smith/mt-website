"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { EXPERIENCE_SCROLL_HEIGHT, SCROLL_CHAPTERS } from "@/config/scenes";
import { HomepageSections } from "@/components/sections/HomepageSections";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ChapterCopy } from "./ChapterCopy";
import { useScrollProgress } from "./useScrollProgress";

const SceneCanvas = dynamic(() => import("./SceneCanvas").then((m) => m.SceneCanvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-brand-ink" />,
});

export function ExperienceShell() {
  const [reducedMotion, setReducedMotion] = useState(false);
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
      <SiteHeader />

      <main id="top">
        <section id="experience" ref={scrollRef} className="relative" style={{ height: EXPERIENCE_SCROLL_HEIGHT }}>
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            {!reducedMotion ? (
              <SceneCanvas progress={progress} />
            ) : (
              <ReducedMotionFallback progress={progress} />
            )}
            <ChapterCopy chapter={activeChapter} progress={progress} />
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-center text-[10px] uppercase tracking-[0.18em] text-white/45 sm:bottom-5 sm:text-[11px] sm:tracking-[0.2em] lg:text-white/55">
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

        <HomepageSections />
      </main>
    </div>
  );
}

function ReducedMotionFallback({ progress }: { progress: number }) {
  const labels = [
    "Digital continent",
    "Systems in isolation",
    "The event",
    "Coordination emerges",
    "The challenge",
    "Nyansapo",
    "The framework",
    "Health emergency coordination",
    "KontrolIQ",
    "The road ahead",
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
