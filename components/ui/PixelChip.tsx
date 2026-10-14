'use client';

import React from 'react';

interface PixelChipProps {
  label: string;
  variant?: 'need' | 'want' | 'normal' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function PixelChip({
  label,
  variant = 'neutral',
  size = 'md',
  onClick,
  selected = false,
  className = '',
}: PixelChipProps) {
  const variantStyles = {
    need: 'bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]',
    want: 'bg-[#E76F51]/20 text-[#E76F51] border-[#E76F51]',
    normal: 'bg-[#5DB84A]/20 text-[#79CE5E] border-[#5DB84A]',
    warning: 'bg-[#F4B63A]/20 text-[#FFD95A] border-[#F4B63A]',
    danger: 'bg-[#EE6A5E]/20 text-[#EE6A5E] border-[#EE6A5E]',
    neutral: 'bg-[#3A3F47] text-[#FFF4D6] border-[#5E6675]',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px] tracking-wider',
    md: 'px-2.5 py-1 text-xs tracking-wide',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center justify-center font-heading uppercase border select-none transition-all ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:brightness-110 active:scale-95' : ''
      } ${selected ? 'ring-2 ring-[#FFD95A] brightness-125' : ''} ${className}`}
    >
      {label}
    </span>
  );
}
