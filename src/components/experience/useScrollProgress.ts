"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createExperienceScrollTimeline,
  refreshExperienceScroll,
  type ScrollDriver,
} from "@/experience/animations/experienceScrollTimeline";
import { initLenisScroll } from "@/experience/animations/lenisScroll";

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress(options?: {
  smoothScroll?: boolean;
  reducedMotion?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const driverRef = useRef<ScrollDriver>({ progress: 0 });
  const smoothScroll = options?.smoothScroll ?? true;
  const reducedMotion = options?.reducedMotion ?? false;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frame = 0;
    const publish = (value: number) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setProgress(value);
        if (typeof window !== "undefined") {
          (window as Window & { __mainooProgress?: number }).__mainooProgress = value;
        }
      });
    };

    const lenisBinding = smoothScroll && !reducedMotion ? initLenisScroll() : null;
    const binding = createExperienceScrollTimeline(el, driverRef.current, publish, {
      reducedMotion,
    });

    if (typeof window !== "undefined") {
      (window as Window & {
        __mainooScrollTo?: (p: number) => void;
        __mainooSetProgress?: (p: number) => void;
      }).__mainooScrollTo = (p: number) => {
        const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const y = max * Math.min(1, Math.max(0, p));
        if (lenisBinding?.lenis) {
          lenisBinding.lenis.scrollTo(y, { immediate: true });
        } else {
          window.scrollTo(0, y);
        }
        ScrollTrigger.update();
        refreshExperienceScroll();
      };
      // Direct progress force for visual QA (pauses scrub so frames don't jump back).
      (window as Window & { __mainooSetProgress?: (p: number) => void }).__mainooSetProgress = (
        p: number,
      ) => {
        const value = Math.min(1, Math.max(0, p));
        ScrollTrigger.getAll().forEach((st) => st.disable(false));
        if (lenisBinding?.lenis) lenisBinding.lenis.stop();
        driverRef.current.progress = value;
        publish(value);
      };
    }

    const onResize = () => refreshExperienceScroll();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      binding.kill();
      lenisBinding?.destroy();
      if (frame) window.cancelAnimationFrame(frame);
      if (typeof window !== "undefined") {
        const w = window as Window & {
          __mainooScrollTo?: (p: number) => void;
          __mainooSetProgress?: (p: number) => void;
          __mainooProgress?: number;
        };
        delete w.__mainooScrollTo;
        delete w.__mainooSetProgress;
      }
    };
  }, [smoothScroll, reducedMotion]);

  return { progress, scrollRef };
}
