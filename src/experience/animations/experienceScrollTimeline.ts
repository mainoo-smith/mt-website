import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_CHAPTERS, SCROLL_TRIGGER } from "@/config/scenes";

gsap.registerPlugin(ScrollTrigger);

export type ScrollDriver = {
  progress: number;
};

export type ExperienceScrollTimeline = {
  timeline: gsap.core.Timeline;
  scrollTrigger: ScrollTrigger;
  kill: () => void;
};

/**
 * Binds the master experience scroll timeline to a DOM trigger.
 * Named labels match SCROLL_CHAPTERS for debugging and future scene tweens.
 */
export function createExperienceScrollTimeline(
  trigger: HTMLElement,
  driver: ScrollDriver,
  onProgress: (progress: number) => void,
): ExperienceScrollTimeline {
  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger,
      start: SCROLL_TRIGGER.start,
      end: SCROLL_TRIGGER.end,
      scrub: SCROLL_TRIGGER.scrub,
      invalidateOnRefresh: true,
      onUpdate: () => onProgress(driver.progress),
    },
  });

  timeline.to(driver, { progress: 1, duration: 1 }, 0);

  for (const chapter of SCROLL_CHAPTERS) {
    timeline.addLabel(chapter.id, chapter.range[0]);
  }
  timeline.addLabel("closing", 1);

  const scrollTrigger = timeline.scrollTrigger!;

  onProgress(driver.progress);

  return {
    timeline,
    scrollTrigger,
    kill: () => {
      timeline.kill();
      scrollTrigger.kill();
    },
  };
}

/** Recalculate ScrollTrigger measurements after layout changes. */
export function refreshExperienceScroll() {
  ScrollTrigger.refresh();
}
