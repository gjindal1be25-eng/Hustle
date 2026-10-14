'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { playButtonSound } from '@/lib/sound';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'wood' | 'primary' | 'stone' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function PixelButton({
  children,
  variant = 'wood',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}: PixelButtonProps) {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm sm:text-base',
  };

  const variantStyles = {
    wood: 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] shadow-[0_3px_0_#2A180E] hover:bg-[#6E442F] active:shadow-none active:translate-y-[3px]',
    primary: 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E] shadow-[0_3px_0_#3B2516] hover:bg-[#A9763F] active:shadow-none active:translate-y-[3px]',
    gold: 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E] shadow-[0_3px_0_#3B2516] hover:bg-[#A9763F] active:shadow-none active:translate-y-[3px]',
    stone: 'bg-[#3A3F47] text-[#FFF4D6] border-2 border-[#4B515A] shadow-[0_3px_0_#1E2024] hover:bg-[#464C56] active:shadow-none active:translate-y-[3px]',
    danger: 'bg-[#B23B3B] text-[#FFF4D6] border-2 border-[#EE6A5E] shadow-[0_3px_0_#5E1E1E] hover:bg-[#C74343] active:shadow-none active:translate-y-[3px]',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none grayscale';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playButtonSound();
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`font-heading tracking-wide uppercase transition-all duration-75 select-none inline-flex items-center justify-center gap-2 cursor-pointer ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? disabledStyles : 'hover:-translate-y-[1px]'} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
