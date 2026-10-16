'use client';

import React, { ReactNode } from 'react';
import { GameProvider } from '@/context/GameContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ContextualNudgeModal } from '@/components/teaching/ContextualNudgeModal';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      {children}
      <ToastContainer />
      <ContextualNudgeModal />
    </GameProvider>
  );
}
