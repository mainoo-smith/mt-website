import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export type LenisBinding = {
  lenis: Lenis;
  destroy: () => void;
};

/** Smooth scroll input for GSAP ScrollTrigger (skipped when reduced motion). */
export function initLenisScroll(): LenisBinding {
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy: () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    },
  };
}
