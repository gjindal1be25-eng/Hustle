'use client';

import React, { InputHTMLAttributes } from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: string;
  labelClassName?: string;
}

export function PixelInput({
  label,
  error,
  helperText,
  prefix,
  className = '',
  labelClassName = '',
  ...props
}: PixelInputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5 font-body">
      {label && (
        <label className={`text-xs font-body font-semibold text-[#FFF4D6] uppercase tracking-wider flex justify-between items-center min-h-[1.5rem] ${labelClassName}`}>
          <span className="leading-snug">{label}</span>
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-base sm:text-lg text-[#FFD95A] font-body font-bold pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          className={`w-full bg-[#181A1E] text-[#FFF4D6] text-base sm:text-lg px-3 py-2 border-2 ${prefix ? 'pl-8' : ''} ${
            error
              ? 'border-[#EE6A5E] focus:outline-none focus:border-[#EE6A5E]'
              : 'border-[#4E5561] focus:outline-none focus:border-[#FFD95A]'
          } shadow-[inset_2px_2px_0_rgba(0,0,0,0.5)] placeholder:text-[#6A7078] transition-colors ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <div className="flex items-center gap-1.5 text-xs font-body text-[#EE6A5E] mt-0.5">
          <span className="font-heading">!</span>
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <span className="text-xs text-[#B4BAC4] mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}
