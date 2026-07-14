"use client";

import { useEffect, useRef, useState } from "react";
import {
  createExperienceScrollTimeline,
  refreshExperienceScroll,
  type ScrollDriver,
} from "@/experience/animations/experienceScrollTimeline";

export function useScrollProgress() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const driverRef = useRef<ScrollDriver>({ progress: 0 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frame = 0;
    const publish = (value: number) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setProgress(value);
      });
    };

    const binding = createExperienceScrollTimeline(el, driverRef.current, publish);

    const onResize = () => refreshExperienceScroll();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      binding.kill();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { progress, scrollRef };
}
