'use client';

import React, { useState } from 'react';
import { TOWN_LIBRARY_BOOK, BookChapter } from '@/lib/teaching';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';

export function BookModeReader() {
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

  const chapter: BookChapter = TOWN_LIBRARY_BOOK[activeChapterIdx];

  return (
    <StonePanel className="space-y-5">
      {/* Book Mode Header */}
      <div className="space-y-1.5 pb-3 border-b border-[#4B515A]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-heading text-xs sm:text-sm text-[#FFD95A] flex items-center gap-1.5">
            <span>📖</span>
            <span>TOWN FINANCIAL LIBRARY (BOOK MODE)</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD95A]/20 text-[#FFD95A] border border-[#FFD95A]/40">
            Self-Paced Curriculum
          </span>
        </div>
        <p className="text-xs text-[#B4BAC4]">
          Prefer reading straight through like a book? Here is the entire financial wisdom curriculum compiled in clean, distraction-free chapters.
        </p>
      </div>

      {/* Chapter Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TOWN_LIBRARY_BOOK.map((ch, idx) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setActiveChapterIdx(idx)}
            className={`p-2.5 rounded border text-left cursor-pointer transition-all space-y-1 ${
              activeChapterIdx === idx
                ? 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] shadow-[0_3px_0_#000]'
                : 'bg-[#1B1B1F] text-[#FFF4D6] border-[#4B515A] hover:border-[#FFD95A]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-bold">CHAPTER {ch.chapterNumber}</span>
              <span className={activeChapterIdx === idx ? 'text-[#1B1B1F]' : 'text-[#8E929A]'}>
                {ch.readingTime}
              </span>
            </div>
            <h4 className="font-heading text-xs line-clamp-1">{ch.title}</h4>
          </button>
        ))}
      </div>

      {/* Active Chapter Book Reader Sheet */}
      <div className="bg-[#17181C] p-4 sm:p-6 rounded border border-[#4B515A] space-y-6">
        {/* Chapter Title & Subtitle */}
        <div className="space-y-1 pb-3 border-b border-[#2E333B]">
          <span className="text-xs font-mono text-[#FFD95A] uppercase tracking-wider block">
            Chapter {chapter.chapterNumber}
          </span>
          <h2 className="font-heading text-base sm:text-lg text-[#FFF4D6]">
            {chapter.title}
          </h2>
          <p className="text-xs text-[#D4A373] italic">
            {chapter.subtitle}
          </p>
        </div>

        {/* Chapter Sections */}
        <div className="space-y-6 font-body text-xs sm:text-sm text-[#FFF4D6] leading-relaxed">
          {chapter.sections.map((sec, sIdx) => (
            <article key={sIdx} className="space-y-3">
              <h3 className="font-heading text-xs sm:text-sm text-[#FFD95A] pt-1 border-t border-[#2E333B]/60">
                {sec.heading}
              </h3>

              <p className="text-[#E0E2E8] leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>

              {sec.quote && (
                <div className="p-3 my-2 bg-[#23252B] border-l-4 border-[#FFD95A] rounded-r text-xs italic text-[#FFF4D6]">
                  <p className="mb-1 leading-snug">“{sec.quote.text}”</p>
                  <span className="text-[10px] text-[#D4A373] not-italic block text-right font-sans">
                    — {sec.quote.author}
                  </span>
                </div>
              )}

              {sec.takeawayBox && (
                <div className="p-2.5 bg-[#2A9D8F]/15 border border-[#2A9D8F]/40 rounded text-xs text-[#FFF4D6] font-sans flex items-start gap-2">
                  <span className="text-sm shrink-0">💡</span>
                  <span>{sec.takeawayBox}</span>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Bottom Chapter Pager */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2E333B] flex-wrap gap-2">
          {activeChapterIdx > 0 ? (
            <PixelButton
              variant="stone"
              onClick={() => setActiveChapterIdx((i) => i - 1)}
            >
              ⬅ Previous Chapter
            </PixelButton>
          ) : (
            <div />
          )}

          {activeChapterIdx < TOWN_LIBRARY_BOOK.length - 1 ? (
            <PixelButton
              variant="gold"
              onClick={() => setActiveChapterIdx((i) => i + 1)}
            >
              Next Chapter: {TOWN_LIBRARY_BOOK[activeChapterIdx + 1].title} ➔
            </PixelButton>
          ) : (
            <div className="text-xs text-[#2A9D8F] font-bold">
              ✓ Curriculum Complete! Mastered all 3 Chapters 🎓
            </div>
          )}
        </div>
      </div>
    </StonePanel>
  );
}
