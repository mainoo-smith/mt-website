/** Shared motion tokens — MVDS Volume IV, orange-adapted. */
export const motionTokens = {
  /** Micro interactions (hover, focus, toggle). */
  micro: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  /** UI section / card reveals. */
  ui: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  /** Cinematic / scroll-led transitions. */
  cinematic: { duration: 2.4, ease: [0.16, 1, 0.3, 1] as const },
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.ui.duration, ease: motionTokens.ui.ease },
  },
};

export const staggerChildren = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};
