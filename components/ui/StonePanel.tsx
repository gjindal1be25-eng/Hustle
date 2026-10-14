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
      className={`bg-[#3A3F47] border-2 border-[#4B515A] p-4 text-[#FFF4D6] space-y-3 font-body text-[20px] ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 pb-2 border-b border-[#4B515A]">
          <span className="text-[14px] font-heading text-[#FFD95A] uppercase tracking-wide">
            {title}
          </span>
        </div>
      )}
      {children}
    </section>
  );
}
