"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe prefers-reduced-motion. Starts as null until measured so callers can
 * avoid mounting heavy motion (3D / Lenis) before the preference is known.
 */
export function usePrefersReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
