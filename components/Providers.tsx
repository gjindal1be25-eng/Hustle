'use client';

import React, { ReactNode } from 'react';
import { GameProvider } from '@/context/GameContext';
import { ToastContainer } from '@/components/ui/ToastContainer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      {children}
      <ToastContainer />
    </GameProvider>
  );
}
