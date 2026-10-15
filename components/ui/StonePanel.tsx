'use client';

import React, { ReactNode } from 'react';

interface StonePanelProps {
  children: ReactNode;
  title?: string;
  variant?: 'dark' | 'slab' | 'inset';
  className?: string;
}

export function StonePanel({
  children,
  title,
  className = '',
}: StonePanelProps) {
  return (
    <section
      className={`bg-[#3A3F47] border border-[#4B515A] p-4 sm:p-5 text-[#FFF4D6] space-y-4 font-sans text-sm sm:text-base ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between pb-2 border-b border-[#4B515A]/70">
          <span className="text-xs sm:text-sm font-heading text-[#FFD95A] uppercase tracking-wider">
            {title}
          </span>
        </div>
      )}
      {children}
    </section>
  );
}
