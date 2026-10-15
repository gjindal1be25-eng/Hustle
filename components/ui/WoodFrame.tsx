'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowBackIcon } from './PixelIcons';

interface WoodFrameProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackToTown?: boolean;
  backHref?: string;
  className?: string;
}

export function WoodFrame({
  children,
  title,
  subtitle,
  showBackToTown = true,
  backHref = '/',
  className = '',
}: WoodFrameProps) {
  return (
    <div
      className={`relative max-w-[720px] mx-auto w-full p-3 sm:p-5 rounded-none border-[4px] border-[#3B2516] bg-[#A9763F] shadow-[0_6px_0_#2A180E] ${className}`}
    >
      {/* Wood plank inner border */}
      <div className="relative p-2 sm:p-4 border-[3px] border-[#D9A05E] bg-[#8B5E34]">
        {/* Stone Corner Studs */}
        <div className="absolute -top-3 -left-3 w-5 h-5 bg-[#B4BAC4] border-2 border-[#1B1B1F] shadow-[inset_1px_1px_0_#FFF4D6,inset_-1px_-1px_0_#6A7078] z-20" />
        <div className="absolute -top-3 -right-3 w-5 h-5 bg-[#B4BAC4] border-2 border-[#1B1B1F] shadow-[inset_1px_1px_0_#FFF4D6,inset_-1px_-1px_0_#6A7078] z-20" />
        <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-[#B4BAC4] border-2 border-[#1B1B1F] shadow-[inset_1px_1px_0_#FFF4D6,inset_-1px_-1px_0_#6A7078] z-20" />
        <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-[#B4BAC4] border-2 border-[#1B1B1F] shadow-[inset_1px_1px_0_#FFF4D6,inset_-1px_-1px_0_#6A7078] z-20" />

        {/* Header Bar */}
        {(title || showBackToTown) && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#5C3826]">
            {showBackToTown ? (
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-heading text-[#FFF4D6] bg-[#5C3826] border-2 border-[#D9A05E] shadow-[0_2px_0_#2A180E] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
              >
                <ArrowBackIcon size={14} />
                <span>TOWN</span>
              </Link>
            ) : (
              <div />
            )}

            {title && (
              <div className="text-center flex-1">
                <h1 className="text-[14px] font-heading text-[#FFD95A] tracking-wider uppercase drop-shadow-[0_2px_0_#2A180E]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm sm:text-base font-body text-[#FFF4D6] opacity-90 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            <div className="w-16 hidden sm:block" />
          </div>
        )}

        {/* Inner Content Slot: scrolls inside frame, not window */}
        <div className="relative z-10 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
