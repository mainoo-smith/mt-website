"use client";

import type { ScrollChapter } from "@/config/scenes";

export function ChapterCopy({ chapter, progress }: { chapter: ScrollChapter; progress: number }) {
  const local =
    (progress - chapter.range[0]) / Math.max(0.0001, chapter.range[1] - chapter.range[0]);
  const clamped = Math.min(1, Math.max(0, local));

  const lineIndex = Math.min(chapter.lines.length - 1, Math.floor(clamped * chapter.lines.length));

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end px-5 pb-24 pt-28 md:items-center md:px-12 md:pb-0">
      <div className="chapter-copy max-w-md">
        <p className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          {chapter.sceneLabel}
        </p>
        <div className="space-y-3">
          {chapter.lines.map((line, i) => {
            const visible = i <= lineIndex;
            return (
              <p
                key={line}
                className="font-display text-2xl font-semibold leading-snug transition-all duration-500 md:text-4xl"
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
