'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';

export function ToastContainer() {
  const { toasts, removeToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className="pointer-events-auto cursor-pointer p-3 bg-[#A9763F] border-[3px] border-[#5C3826] shadow-[0_4px_0_#2A180E] text-[#FFF4D6] transition-all transform animate-slide-in-right"
        >
          <div className="p-2 border-2 border-[#D9A05E] bg-[#8B5E34]">
            <div className="flex items-center justify-between gap-2 border-b border-[#5C3826] pb-1 mb-1.5">
              <span className="font-heading text-xs text-[#FFD95A] tracking-wider uppercase">
                {toast.title}
              </span>
              <span className="text-[10px] text-[#D9A05E] font-heading">✕</span>
            </div>
            <p className="font-body text-sm text-[#FFF4D6] leading-tight">
              {toast.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
