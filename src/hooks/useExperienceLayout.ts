"use client";

import { useEffect, useState } from "react";
import {
  getExperienceFraming,
  type ExperienceFraming,
  type ExperienceLayout,
} from "@/experience/core/experienceFraming";

export function useExperienceLayout(): ExperienceFraming {
  // Always seed with the SSR default so the first client render matches the
  // server markup (avoids a hydration mismatch). Real framing is measured after
  // mount in the effect below.
  const [framing, setFraming] = useState<ExperienceFraming>(() =>
    getExperienceFraming(1440, 900),
  );

  useEffect(() => {
    const update = () => setFraming(getExperienceFraming(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return framing;
}

export type { ExperienceLayout };
