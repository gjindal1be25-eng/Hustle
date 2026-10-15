'use client';

import React, { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface PixelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  labelClassName?: string;
}

export function PixelSelect({
  label,
  options,
  error,
  className = '',
  labelClassName = '',
  ...props
}: PixelSelectProps) {
  return (
    <div className="w-full flex flex-col gap-1.5 font-body">
      {label && (
        <label className={`text-[11px] sm:text-xs font-heading text-[#FFF4D6] uppercase tracking-wide flex justify-between min-h-[1.75rem] sm:min-h-[2rem] items-end ${labelClassName}`}>
          <span className="leading-snug">{label}</span>
        </label>
      )}

      <div className="relative">
        <select
          className={`w-full bg-[#181A1E] text-[#FFF4D6] text-base sm:text-lg px-3 py-2 border-2 appearance-none cursor-pointer ${
            error
              ? 'border-[#EE6A5E] focus:outline-none focus:border-[#EE6A5E]'
              : 'border-[#4E5561] focus:outline-none focus:border-[#FFD95A]'
          } shadow-[inset_2px_2px_0_rgba(0,0,0,0.5)] transition-colors ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1E2024] text-[#FFF4D6]">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom pixel dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFD95A] text-xs font-heading">
          ▼
        </div>
      </div>

      {error && (
        <span className="text-xs font-body text-[#EE6A5E] mt-0.5">{error}</span>
      )}
    </div>
  );
}
