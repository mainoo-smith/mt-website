"use client";

import { useEffect, useState } from "react";
import {
  getExperienceFraming,
  type ExperienceFraming,
  type ExperienceLayout,
} from "@/experience/core/experienceFraming";

export function useExperienceLayout(): ExperienceFraming {
  const [framing, setFraming] = useState<ExperienceFraming>(() =>
    typeof window === "undefined"
      ? getExperienceFraming(1440, 900)
      : getExperienceFraming(window.innerWidth, window.innerHeight),
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
