"use client";

import type { ScrollChapter } from "@/config/scenes";
import { useExperienceLayout } from "@/hooks/useExperienceLayout";

export function ChapterCopy({ chapter, progress }: { chapter: ScrollChapter; progress: number }) {
  const { layout } = useExperienceLayout();
  const local =
    (progress - chapter.range[0]) / Math.max(0.0001, chapter.range[1] - chapter.range[0]);
  const clamped = Math.min(1, Math.max(0, local));

  const lineIndex = Math.min(chapter.lines.length - 1, Math.floor(clamped * chapter.lines.length));
  const isStacked = layout !== "desktop";

  return (
    <div
      className={
        isStacked
          ? "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:inset-0 lg:items-center lg:px-12 lg:pb-0"
          : "pointer-events-none absolute inset-0 z-10 flex items-center px-12"
      }
    >
      {isStacked ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[52vh] bg-gradient-to-t from-brand-ink via-brand-ink/94 to-transparent sm:h-[48vh] lg:hidden"
        />
      ) : null}

      <div
        className={
          isStacked
            ? "chapter-copy relative z-10 max-w-[18rem] sm:max-w-xs lg:max-w-md"
            : "chapter-copy max-w-md"
        }
      >
        <p className="mb-2 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange sm:mb-3 sm:text-[11px] sm:tracking-[0.24em]">
          {chapter.sceneLabel}
        </p>
        <div className="space-y-2 sm:space-y-3">
          {chapter.lines.map((line, i) => {
            const visible = i <= lineIndex;
            return (
              <p
                key={line}
                className="font-display text-xl font-semibold leading-snug transition-all duration-500 sm:text-2xl lg:text-4xl"
                style={{
                  opacity: visible ? 1 : 0.15,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
