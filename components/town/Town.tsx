'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { TownCharacter } from './TownCharacter';
import { playButtonSound, playFootstepSound } from '@/lib/sound';
import { MoodType } from '@/components/ui/CharacterSprite';
import {
  isWalkableRoad,
  getBuildingAtDoor,
  STAND_POINTS,
  Point2D,
  screenToWorld,
  findNearestWalkable,
  findAStarPath,
} from '@/lib/townGrid';
import { getTodayISO } from '@/lib/rules';
import { TOWN_NPCS, NpcDef, Dilemma } from '@/lib/gameplay';
import { SheruPet } from './SheruPet';
import { TownNpcSprite } from './TownNpcSprite';
import {
  CrystalFountain,
  RiversideGazebo,
  BlossomFlowerbeds,
  ClocktowerFinial,
} from './TownDecorations';
import { NpcDialogueModal } from './NpcDialogueModal';
import { DilemmaModal } from './DilemmaModal';
import { TownNoticeboardModal } from './TownNoticeboardModal';

interface BuildingDef {
  id: 'work' | 'townhall' | 'vault' | 'home' | 'bank' | 'market' | 'school';
  name: string;
  route: string;
  desc: string;
  doorNode: string;
  tx: number;
  ty: number;
  k: number;
  frontX: number;
  frontY: number;
  roofX: number;
  roofY: number;
  roofZ: number;
}

const BUILDINGS: BuildingDef[] = [
  {
    id: 'work',
    name: 'Work',
    route: '/work',
    desc: 'Log Income & View Career Ranks',
    doorNode: 'work_door',
    tx: 0.38,
    ty: 0.45,
    k: 0.8,
    frontX: 3.07,
    frontY: 3.14,
    roofX: 1.98,
    roofY: 2.05,
    roofZ: 3.2,
  },
  {
    id: 'townhall',
    name: 'Town Hall',
    route: '/townhall',
    desc: 'Summary Charts & Budget Analytics',
    doorNode: 'townhall_door',
    tx: 3.9,
    ty: 0.0,
    k: 0.8,
    frontX: 5.3,
    frontY: 3.3,
    roofX: 5.5,
    roofY: 1.72,
    roofZ: 3.7,
  },
  {
    id: 'vault',
    name: 'Vault',
    route: '/vault',
    desc: 'Savings Goals & Celebrations',
    doorNode: 'vault_door',
    tx: 7.3,
    ty: 0.9,
    k: 0.8,
    frontX: 8.6,
    frontY: 3.3,
    roofX: 8.9,
    roofY: 2.5,
    roofZ: 3.1,
  },
  {
    id: 'home',
    name: 'Home',
    route: '/story',
    desc: 'Daily Story & Character Quips',
    doorNode: 'home_door',
    tx: 0.9,
    ty: 3.2,
    k: 0.8,
    frontX: 2.0,
    frontY: 6.4,
    roofX: 2.5,
    roofY: 4.8,
    roofZ: 2.3,
  },
  {
    id: 'bank',
    name: 'Bank',
    route: '/bank',
    desc: 'Loan Simulator & EMI Manager',
    doorNode: 'bank_door',
    tx: 5.93,
    ty: 3.9,
    k: 0.62,
    frontX: 8.6,
    frontY: 6.4,
    roofX: 8.1,
    roofY: 5.45,
    roofZ: 3.1,
  },
  {
    id: 'market',
    name: 'Market',
    route: '/market',
    desc: 'Expenses & Category Budgets',
    doorNode: 'market_door',
    tx: 1.0,
    ty: 6.6,
    k: 0.8,
    frontX: 2.0,
    frontY: 9.7,
    roofX: 2.6,
    roofY: 8.2,
    roofZ: 1.95,
  },
  {
    id: 'school',
    name: 'School',
    route: '/school',
    desc: '8 Financial Wisdom Book Lessons',
    doorNode: 'school_door',
    tx: 6.85,
    ty: 6.65,
    k: 0.8,
    frontX: 9.70,
    frontY: 9.58,
    roofX: 8.45,
    roofY: 8.25,
    roofZ: 2.9,
  },
];

export const BUILDING_EMOTES: Record<string, { icon: string; label: string }> = {
  work: { icon: '🪙', label: 'Earn' },
  townhall: { icon: '📊', label: 'Stats' },
  vault: { icon: '🏆', label: 'Goals' },
  home: { icon: '📖', label: 'Story' },
  bank: { icon: '📜', label: 'Loans' },
  market: { icon: '🛒', label: 'Budget' },
  school: { icon: '🎓', label: 'Learn' },
};

export interface DustParticle {
  id: number;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
}

const W = 28;
const Hh = 24;
const ox = 320;
const oy = 125;

export function projectIso(x: number, y: number, z: number): [number, number] {
  return [ox + (x - y) * W, oy + ((x + y) * W) / 2 - z * Hh];
}

function generateTownSceneElements(
  extraH: number,
  isNight: boolean,
  charPos?: Point2D,
  charSpriteNode?: React.ReactNode,
  dustNodes?: React.ReactNode,
  decorations: string[] = [],
  npcNodes: { depth: number; node: React.ReactNode }[] = [],
  petNode?: { depth: number; node: React.ReactNode } | null,
  idleTick = 0
): React.ReactNode[] {
  let tx = 0;
  let ty = 0;
  let k = 1;

  function P(x: number, y: number, z: number): [number, number] {
    const X = x * k + tx;
    const Y = y * k + ty;
    return [ox + (X - Y) * W, oy + ((X + Y) * W) / 2 - z * k * Hh];
  }

  function pts(a: number[][]): string {
    return a
      .map((p) => {
        const q = P(p[0], p[1], p[2]);
        return `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
      })
      .join(' ');
  }

  function sh(h: string, f: number): string {
    const n = parseInt(h.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const d = (v: number) => Math.round(v * (1 - f));
    return (
      '#' +
      [d(r), d(g), d(b)]
        .map((v) => ('0' + v.toString(16)).slice(-2))
        .join('')
    );
  }

  const elements: React.ReactNode[] = [];
  let elemKey = 0;

  function poly(a: number[][], f: string, w = 2, keyPrefix = 'poly') {
    elements.push(
      <polygon
        key={`${keyPrefix}_${elemKey++}`}
        points={pts(a)}
        fill={f}
        stroke={f}
        strokeWidth={w}
        strokeLinejoin="round"
      />
    );
  }

  function box(
    x: number,
    y: number,
    z: number,
    dx: number,
    dy: number,
    dz: number,
    c: string,
    cs?: [string, string, string],
    keyPrefix = 'box'
  ) {
    const x1 = x + dx;
    const y1 = y + dy;
    const z1 = z + dz;
    const t = cs ? cs[0] : c;
    const l = cs ? cs[1] : sh(c, 0.12);
    const r = cs ? cs[2] : sh(c, 0.24);

    poly([[x, y1, z], [x1, y1, z], [x1, y1, z1], [x, y1, z1]], l, 2, `${keyPrefix}_l`);
    poly([[x1, y, z], [x1, y1, z], [x1, y1, z1], [x1, y, z1]], r, 2, `${keyPrefix}_r`);
    poly([[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]], t, 2, `${keyPrefix}_t`);
  }

  function dl(x0: number, x1: number, y: number, z0: number, z1: number, f: string) {
    poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], f, 1.2, 'dl');
  }

  function dr(y0: number, y1: number, x: number, z0: number, z1: number, f: string) {
    poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], f, 1.2, 'dr');
  }

  function G() {
    tx = 0;
    ty = 0;
    k = 1;
  }

  function tree(x: number, y: number) {
    G();
    box(x, y, 0, 0.25, 0.25, 0.7, '#A27140', undefined, `tr_${x}_${y}`);
    box(x - 0.3, y - 0.3, 0.7, 0.85, 0.85, 0.7, '#5DB84A', undefined, `tr_l1_${x}_${y}`);
    box(x - 0.15, y - 0.15, 1.4, 0.55, 0.55, 0.4, '#79CE5E', undefined, `tr_l2_${x}_${y}`);
  }

  function bush(x: number, y: number) {
    G();
    box(x, y, 0, 0.5, 0.5, 0.4, '#5DB84A', undefined, `bsh_${x}_${y}`);
    box(x + 0.08, y + 0.08, 0.4, 0.34, 0.34, 0.15, '#79CE5E', undefined, `bsh_t_${x}_${y}`);
  }

  function lamp(x: number, y: number) {
    G();
    box(x, y, 0, 0.1, 0.1, 1.0, '#6E747E', undefined, `lmp_${x}_${y}`);
    box(x - 0.05, y - 0.05, 1.0, 0.2, 0.2, 0.22, '#FFE27A', undefined, `lmp_g_${x}_${y}`);
    if (decorations.includes('lanterns')) {
      const [lx, ly] = P(x + 0.05, y + 0.05, 1.1);
      elements.push(
        <circle
          key={`lmp_glow_${x}_${y}`}
          cx={lx}
          cy={ly}
          r="16"
          fill="#FFD95A"
          opacity={isNight ? 0.4 : 0.22}
          className="pointer-events-none"
        />
      );
    }
  }

  function fence(x0: number, x1: number, y: number) {
    G();
    for (let x = x0; x <= x1 + 0.01; x += 0.45) {
      box(x, y, 0, 0.1, 0.1, 0.4, '#C98F4E', undefined, `fnc_p_${x.toFixed(2)}_${y}`);
    }
    box(x0, y + 0.03, 0.2, x1 - x0 + 0.1, 0.04, 0.07, '#E0B070', undefined, `fnc_r_${x0}_${y}`);
  }

  function winL(x0: number, x1: number, z0: number, z1: number, y: number) {
    dl(x0 - 0.06, x1 + 0.06, y + 0.01, z0 - 0.08, z1 + 0.08, '#FFF6E0');
    dl(x0, x1, y + 0.02, z0, z1, isNight ? '#FFD86B' : '#A9DCF7');
  }

  function winR(y0: number, y1: number, z0: number, z1: number, x: number) {
    dr(y0 - 0.06, y1 + 0.06, x + 0.01, z0 - 0.08, z1 + 0.08, '#F2E7C9');
    dr(y0, y1, x + 0.02, z0, z1, isNight ? '#FFD86B' : '#8CC6E8');
  }

  function home() {
    box(1, 1, 0, 2, 2, 1.4 + extraH, '#D9A05E');
    dl(1.7, 2.3, 3.01, 0, 1, '#A9763F');
    dl(1.15, 1.55, 3.01, 0.5, 1, isNight ? '#FFD86B' : '#A9DCF7');
    dl(2.45, 2.85, 3.01, 0.5, 1, isNight ? '#FFD86B' : '#A9DCF7');
    dr(1.5, 2.5, 3.01, 0.5, 1, isNight ? '#FFD86B' : '#8CC6E8');
    box(0.8, 0.8, 1.4 + extraH, 2.4, 2.4, 0.4, '#EE6A5E');
    box(1.2, 1.2, 1.8 + extraH, 1.6, 1.6, 0.4, '#EE6A5E');
    box(2.3, 1.3, 2.2 + extraH, 0.35, 0.35, 0.6, '#B4BAC4');
  }

  function work() {
    box(1, 1, 0, 2, 2, 3.4 + extraH, '#9ED6F5');
    [0.5, 1.3, 2.1, 2.9].forEach((z) => {
      dl(1.2, 1.75, 3.01, z, z + 0.5, isNight ? '#FFD86B' : '#E0F4FF');
      dl(2.25, 2.8, 3.01, z, z + 0.5, isNight ? '#FFD86B' : '#E0F4FF');
      dr(1.2, 1.75, 3.01, z, z + 0.5, isNight ? '#FFD86B' : '#E0F4FF');
      dr(2.25, 2.8, 3.01, z, z + 0.5, isNight ? '#FFD86B' : '#E0F4FF');
    });
    dl(1.75, 2.25, 3.01, 0, 0.45, '#6A7078');
    box(1.2, 1.4, 3.4 + extraH, 1.6, 0.25, 0.5, '#FFD95A');
  }

  function townhall() {
    box(0.3, 1.0, 0, 3.4, 2.4, 0.3, '#F0EAD6');
    box(1.4, 3.4, 0, 1.2, 0.4, 0.15, '#FFF6E0');
    box(0.6, 1.3, 0.3, 2.8, 1.7, 1.6 + extraH, '#E3E6EB');
    dl(1.0, 1.45, 3.01, 0.75, 1.5, isNight ? '#FFD86B' : '#A9DCF7');
    dl(2.55, 3.0, 3.01, 0.75, 1.5, isNight ? '#FFD86B' : '#A9DCF7');
    dl(1.85, 2.15, 3.01, 0.3, 1.3, '#A9763F');
    [0.65, 1.55, 2.2, 3.1].forEach((x) => {
      box(x, 3.0, 0.3, 0.25, 0.25, 1.6 + extraH, '#FFF6E0');
    });
    box(0.5, 1.2, 1.9 + extraH, 3.0, 2.3, 0.5, '#B4BAC4');
    dl(0.65, 3.35, 3.51, 1.95 + extraH, 2.35 + extraH, '#D9A05E');
    box(0.9, 1.6, 2.4 + extraH, 2.2, 1.5, 0.25, '#DDE0E6');
    box(1.3, 1.7, 2.65 + extraH, 1.4, 1.1, 0.5, '#E3E6EB');
    dl(1.8, 2.2, 2.81, 2.72 + extraH, 3.08 + extraH, '#FFF6E0');
    dl(1.98, 2.02, 2.82, 2.8 + extraH, 3.02 + extraH, '#6A7078');
    box(1.45, 1.8, 3.15 + extraH, 1.1, 0.9, 0.4, '#4C6FFF');
    box(1.7, 1.95, 3.55 + extraH, 0.6, 0.6, 0.3, '#4C6FFF');
    box(1.96, 2.15, 3.85 + extraH, 0.08, 0.08, 0.7, '#8A9099');
    dl(2.04, 2.5, 2.19, 4.2 + extraH, 4.5 + extraH, '#EE6A5E');
  }

  function vault() {
    box(0.6, 0.6, 0, 2.8, 2.8, 0.5, '#DDE0E6');
    box(0.9, 0.9, 0.5, 2.2, 2.2, 2.0 + extraH, '#B4BAC4');
    box(0.9, 3.1, 0.5, 0.3, 0.3, 2.0 + extraH, '#DDE0E6');
    box(2.8, 3.1, 0.5, 0.3, 0.3, 2.0 + extraH, '#DDE0E6');
    dl(1.45, 2.55, 3.11, 0.6, 2.0, '#FFD95A');
    dl(1.55, 2.45, 3.12, 0.7, 1.9, '#6A7078');
    dl(1.9, 2.1, 3.13, 1.15, 1.45, '#FFD95A');
    box(0.8, 0.8, 2.5 + extraH, 2.4, 2.4, 0.3, '#8E949C');
    box(1.3, 1.3, 2.8 + extraH, 1.4, 1.4, 0.6, '#A9763F');
    box(1.25, 1.25, 3.4 + extraH, 1.5, 1.5, 0.3, '#C98F4E');
    box(1.75, 1.25, 2.8 + extraH, 0.25, 1.5, 0.95, '#FFD95A');
  }

  function market() {
    box(0.5, 0.7, 0, 3.0, 2.7, 0.2, '#E8E2CC');
    box(0.6, 0.8, 0.2, 2.8, 0.4, 1.8, '#C98F4E');
    box(0.6, 0.8, 0.2, 0.35, 2.4, 1.8, '#B67F41');
    box(1.1, 2.2, 0.2, 2.1, 0.7, 0.6, '#C98F4E');
    box(1.05, 2.15, 0.8, 2.2, 0.8, 0.1, '#E0B070');
    box(1.25, 2.4, 0.9, 0.5, 0.5, 0.3, '#EE6A5E');
    box(1.9, 2.4, 0.9, 0.5, 0.5, 0.3, '#F4B63A');
    box(2.55, 2.4, 0.9, 0.5, 0.5, 0.3, '#79CE5E');
    box(0.55, 3.05, 0.2, 0.16, 0.16, 1.8, '#8A5A2B');
    box(3.3, 3.05, 0.2, 0.16, 0.16, 1.8, '#8A5A2B');
    dl(1.1, 2.9, 3.12, 1.2, 1.65, '#C98F4E');
    for (let i = 0; i < 6; i++) {
      const c = i % 2 ? '#FFF6E0' : '#EE6A5E';
      box(0.45 + i * 0.5, 0.65, 2.0, 0.5, 2.75, 0.3, c);
      box(0.45 + i * 0.5, 3.4, 1.75, 0.5, 0.15, 0.25, c);
    }
  }

  function school() {
    box(0.5, 1.2, 0, 3.0, 1.8, 1.6 + extraH, '#F6D84A');
    dl(0.75, 1.25, 3.01, 0.5, 1.2, isNight ? '#FFD86B' : '#A9DCF7');
    dl(2.75, 3.25, 3.01, 0.5, 1.2, isNight ? '#FFD86B' : '#A9DCF7');
    dr(1.5, 2.0, 3.51, 0.5, 1.2, '#E0B93A');
    dr(2.2, 2.7, 3.51, 0.5, 1.2, '#E0B93A');
    box(1.4, 3.0, 0, 1.2, 0.4, 1.4, '#F6D84A');
    box(1.3, 2.95, 1.4, 1.4, 0.55, 0.2, '#EE6A5E');
    dl(1.8, 2.2, 3.41, 0, 0.9, '#EE6A5E');
    dl(1.8, 2.2, 3.42, 1.0, 1.3, '#FFF6E0');
    box(0.4, 1.1, 1.6 + extraH, 3.2, 2.0, 0.3, '#EE6A5E');
    box(1.5, 1.5, 1.9 + extraH, 1.0, 1.0, 1.0, '#E3E6EB');
    dl(1.75, 2.25, 2.51, 2.15 + extraH, 2.75 + extraH, '#6A7078');
    dl(1.9, 2.1, 2.52, 2.3 + extraH, 2.65 + extraH, '#FFD95A');
    box(1.4, 1.4, 2.9 + extraH, 1.2, 1.2, 0.3, '#EE6A5E');
    box(1.85, 1.85, 3.2 + extraH, 0.3, 0.3, 0.3, '#FFD95A');
  }

  function bank() {
    box(1.3, 0.8, 0, 4.4, 3.4, 0.4, '#F0EAD6');
    box(2.7, 4.2, 0, 1.6, 0.6, 0.2, '#FFF6E0');
    box(2.7, 4.2, 0.2, 1.6, 0.3, 0.2, '#FFF6E0');
    box(1.6, 1.1, 0.4, 3.8, 2.8, 2.6 + extraH, '#E3E6EB');
    winR(1.9, 2.7, 1.2, 2.4, 5.4);
    winL(2.15, 2.65, 1.2, 2.4, 3.9);
    winL(4.35, 4.85, 1.2, 2.4, 3.9);
    dl(3.15, 3.85, 3.91, 0.4, 1.9, '#A9763F');
    [1.65, 2.85, 3.85, 5.05].forEach((x) => {
      box(x, 3.9, 0.4, 0.3, 0.3, 2.6 + extraH, '#FFF6E0');
    });
    box(1.4, 0.9, 3.0 + extraH, 4.2, 3.4, 0.5, '#B4BAC4');
    dl(2.3, 4.7, 4.31, 3.05 + extraH, 3.45 + extraH, '#D9A05E');
    box(2, 1.5, 3.5 + extraH, 3, 2.4, 0.4, '#DDE0E6');
    box(3, 2.3, 3.9 + extraH, 1, 0.25, 1, '#FFD95A');
    dl(3.15, 3.85, 2.56, 4.05 + extraH, 4.75 + extraH, '#EAC24A');
    dl(3.3, 3.7, 2.57, 4.2 + extraH, 4.6 + extraH, '#FFD95A');
    [1.45, 5.45].forEach((x) => {
      box(x, 4, 3.5 + extraH, 0.09, 0.09, 1.3, '#8A9099');
      dl(x + 0.1, x + 0.9, 4.05, 4.35 + extraH, 4.8 + extraH, '#EE6A5E');
    });
  }

  // --- Ground & Scenery Render ---
  G();
  box(0.5, 0.5, -1.1, 11.4, 10.2, 0.6, '#9A6A3A', ['#9A6A3A', '#85592F', '#6B4524'], 'ground1');
  box(1.6, 1.5, -1.7, 8.2, 7.4, 0.6, '#8B5E34', ['#8B5E34', '#7A5230', '#5E3C1F'], 'ground2');
  box(0, 0, -0.5, 12.6, 11.4, 0.5, '#8FD672', ['#8FD672', '#A27140', '#85592F'], 'ground3');

  // Grass checkerboard: i < 12, j < 11
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 11; j++) {
      if ((i + j) % 2) {
        poly([[i, j, 0], [i + 1, j, 0], [i + 1, j + 1, 0], [i, j + 1, 0]], '#86D068', 0, `chk_${i}_${j}`);
      }
    }
  }

  // River and water to y = 11.4
  const riverWater = isNight ? '#1F4F9A' : '#59B9F2';
  const riverDeep = isNight ? '#173D7A' : '#4AA9E8';
  poly([[10.25, 0, 0], [10.4, 0, 0], [10.4, 11.4, 0], [10.25, 11.4, 0]], '#C9A86A', 0, 'sand1');
  poly([[10.4, 0, 0], [11.2, 0, 0], [11.2, 11.4, 0], [10.4, 11.4, 0]], riverWater, 0, 'river1');
  poly([[10.4, 0, 0], [10.7, 0, 0], [10.7, 11.4, 0], [10.4, 11.4, 0]], riverDeep, 0, 'river2');
  poly([[11.2, 0, 0], [11.35, 0, 0], [11.35, 11.4, 0], [11.2, 11.4, 0]], '#C9A86A', 0, 'sand2');
  [1.2, 4.4, 7.6, 10.4].forEach((y, idx) => {
    poly([[10.65, y, 0], [11.05, y, 0], [11.05, y + 0.25, 0], [10.65, y + 0.25, 0]], '#A8E0FC', 0, `rip_${idx}`);
  });

  // Front lawn Pond
  poly([[7.45, 10.15, 0], [9.95, 10.15, 0], [9.95, 11.15, 0], [7.45, 11.15, 0]], '#E6D3A0', 0, 'pond_sand');
  poly([[7.6, 10.3, 0], [9.8, 10.3, 0], [9.8, 11.0, 0], [7.6, 11.0, 0]], riverWater, 0, 'pond_water');
  poly([[7.9, 10.5, 0], [8.3, 10.5, 0], [8.3, 10.6, 0], [7.9, 10.6, 0]], '#A8E0FC', 0, 'pond_rip1');
  poly([[8.8, 10.75, 0], [9.2, 10.75, 0], [9.2, 10.85, 0], [8.8, 10.85, 0]], '#A8E0FC', 0, 'pond_rip2');

  // --- Clearer Roads with darker border and centre dashes ---
  function road(
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    keyPrefix: string,
    dashDir?: 'x' | 'y',
    dashPos?: number
  ) {
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    // Darker border: #B79A60, 0.06 larger on every side
    poly(
      [
        [minX - 0.06, minY - 0.06, 0],
        [maxX + 0.06, minY - 0.06, 0],
        [maxX + 0.06, maxY + 0.06, 0],
        [minX - 0.06, maxY + 0.06, 0],
      ],
      '#B79A60',
      0,
      `${keyPrefix}_border`
    );

    // Road fill: #E2C48C
    poly(
      [
        [minX, minY, 0],
        [maxX, minY, 0],
        [maxX, maxY, 0],
        [minX, maxY, 0],
      ],
      '#E2C48C',
      0,
      `${keyPrefix}_fill`
    );

    // Centre dashes in #FFF3D2: length 0.28, pitch 0.55, thickness 0.06
    if (dashDir === 'x' && dashPos !== undefined) {
      let dIdx = 0;
      for (let x = minX + 0.12; x + 0.28 <= maxX - 0.06; x += 0.55) {
        poly(
          [
            [x, dashPos - 0.03, 0],
            [x + 0.28, dashPos - 0.03, 0],
            [x + 0.28, dashPos + 0.03, 0],
            [x, dashPos + 0.03, 0],
          ],
          '#FFF3D2',
          0,
          `${keyPrefix}_dash_${dIdx++}`
        );
      }
    } else if (dashDir === 'y' && dashPos !== undefined) {
      let dIdx = 0;
      for (let y = minY + 0.12; y + 0.28 <= maxY - 0.06; y += 0.55) {
        poly(
          [
            [dashPos - 0.03, y, 0],
            [dashPos + 0.03, y, 0],
            [dashPos + 0.03, y + 0.28, 0],
            [dashPos - 0.03, y + 0.28, 0],
          ],
          '#FFF3D2',
          0,
          `${keyPrefix}_dash_${dIdx++}`
        );
      }
    }
  }

  // Road list:
  // Main horizontal: (.8, 10.0, 3.0, 3.5) with dashes at y 3.25; east bank (11.45, 12.3, 3.0, 3.5) with dashes at y 3.25
  road(0.8, 10.0, 3.0, 3.5, 'rd_main', 'x', 3.25);
  road(11.45, 12.3, 3.0, 3.5, 'rd_east_bank', 'x', 3.25);

  // Lower horizontal: (.8, 9.9, 6.5, 7.0) with dashes at y 6.75
  road(0.8, 9.9, 6.5, 7.0, 'rd_lower', 'x', 6.75);

  // Vertical spine: (5.1, 5.5, 7.0, 11.4) with dashes at x 5.3, and short link (5.1, 5.5, 3.5, 3.7)
  road(5.1, 5.5, 7.0, 11.4, 'rd_vert_spine', 'y', 5.3);
  road(5.1, 5.5, 3.5, 3.7, 'rd_vert_link');

  // NEW front road to the Market and School doors: (1.8, 8.8, 9.6, 10.0) with dashes at y 9.8, plus stubs (1.8, 2.2, 9.4, 9.6) and (8.4, 8.8, 9.4, 9.6)
  road(1.8, 8.8, 9.6, 10.0, 'rd_front', 'x', 9.8);
  road(1.8, 2.2, 9.4, 9.6, 'rd_stub_mkt_front');
  road(8.4, 8.8, 9.4, 9.6, 'rd_stub_sch_front');

  // Door stubs: (1.8,2.2,2.7,3.0), (5.1,5.5,2.7,3.0), (8.4,8.8,2.7,3.0), (1.8,2.2,5.9,6.5), (8.4,8.8,6.5,6.6)
  road(1.8, 2.2, 2.7, 3.0, 'rd_stub_work');
  road(5.1, 5.5, 2.7, 3.0, 'rd_stub_th');
  road(8.4, 8.8, 2.7, 3.0, 'rd_stub_vault');
  road(1.8, 2.2, 5.9, 6.5, 'rd_stub_home');
  road(8.4, 8.8, 6.5, 6.6, 'rd_stub_bank');

  // Cobblestone Plaza (3.9 to 6.7, 3.6 to 6.4)
  poly([[3.9, 3.6, 0], [6.7, 3.6, 0], [6.7, 6.4, 0], [3.9, 6.4, 0]], '#9AA0A8', 0, 'plaza_base');
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      poly(
        [[4.0 + 1.3 * i, 3.7 + 1.3 * j, 0], [5.3 + 1.3 * i, 3.7 + 1.3 * j, 0], [5.3 + 1.3 * i, 5.0 + 1.3 * j, 0], [4.0 + 1.3 * i, 5.0 + 1.3 * j, 0]],
        (i + j) % 2 ? '#DCDFE4' : '#C2C7CF',
        0,
        `plz_${i}_${j}`
      );
    }
  }
  // Plaza Well (4.95 to 5.65, 4.65 to 5.35)
  box(4.95, 4.65, 0, 0.7, 0.7, 0.3, '#B4BAC4', undefined, 'well_wall');
  poly([[5.05, 4.75, 0.3], [5.55, 4.75, 0.3], [5.55, 5.25, 0.3], [5.05, 5.25, 0.3]], riverWater, 0, 'well_water');

  // Wooden Plank Bridge across river (10.0 to 11.45, length 1.45, y 3.0 to 3.5)
  box(10.0, 3.0, 0, 1.45, 0.5, 0.15, '#C98F4E', undefined, 'bridge_floor');
  for (let i = 0; i < 5; i++) {
    box(10.08 + i * 0.28, 3.0, 0.15, 0.05, 0.5, 0.01, '#A9763F', undefined, `br_plank_${i}`);
  }
  box(10.0, 3.0, 0.15, 1.45, 0.07, 0.22, '#8A5A2B', undefined, 'br_rail1');
  box(10.0, 3.43, 0.15, 1.45, 0.07, 0.22, '#8A5A2B', undefined, 'br_rail2');

  // Pebbles moved to road edges: y 3.07 and 3.37 on main road, y 6.57 and 6.87 on lower road
  function peb(x: number, y: number, key: string) {
    poly([[x, y, 0], [x + 0.12, y, 0], [x + 0.12, y + 0.1, 0], [x, y + 0.1, 0]], '#C8CDD4', 0, key);
  }
  for (let x = 1.2; x < 9.8; x += 0.9) {
    peb(x, 3.07, `peb_m1_${x.toFixed(1)}`);
    peb(x + 0.45, 3.37, `peb_m2_${x.toFixed(1)}`);
  }
  for (let x = 1.2; x < 9.6; x += 0.9) {
    peb(x, 6.57, `peb_l1_${x.toFixed(1)}`);
    peb(x + 0.45, 6.87, `peb_l2_${x.toFixed(1)}`);
  }

  // Tiny flowers
  function fl(x: number, y: number, c: string, key: string) {
    box(x, y, 0, 0.12, 0.12, 0.14, c, undefined, `${key}_f1`);
    box(x + 0.2, y + 0.12, 0, 0.12, 0.12, 0.14, '#FFF6E0', undefined, `${key}_f2`);
  }
  fl(3.3, 2.2, '#EE6A5E', 'fl1');
  fl(6.95, 1.9, '#F4B63A', 'fl2');
  fl(3.7, 7.2, '#EE6A5E', 'fl3');
  fl(6.4, 7.2, '#F4B63A', 'fl4');
  fl(4.6, 9.0, '#FFF6E0', 'fl5');
  fl(0.5, 8.6, '#EE6A5E', 'fl6');
  fl(9.7, 8.8, '#F4B63A', 'fl7');
  fl(11.9, 6.9, '#EE6A5E', 'fl_eb1');
  fl(0.8, 10.8, '#F4B63A', 'fl_fl1');
  fl(6.3, 10.6, '#EE6A5E', 'fl_fl2');
  fl(11.6, 9.6, '#FFF6E0', 'fl_eb2');

  // Buildings & Scenery items depth-sorted
  const items: [number, () => void][] = [];
  items.push([1.2, () => { tx = 0.38; ty = 0.45; k = 0.8; work(); }]);
  items.push([3.5, () => { tx = 3.9; ty = 0.0; k = 0.8; townhall(); }]);
  items.push([7.8, () => { tx = 7.3; ty = 0.9; k = 0.8; vault(); }]);
  items.push([4.5, () => { tx = 0.9; ty = 3.2; k = 0.8; home(); }]);
  items.push([9.5, () => { tx = 5.93; ty = 3.9; k = 0.62; bank(); }]);
  items.push([8.5, () => { tx = 1.0; ty = 6.6; k = 0.8; market(); }]);
  items.push([13.5, () => { tx = 6.85; ty = 6.65; k = 0.8; school(); }]);

  // East bank scenery
  items.push([13.0, () => tree(11.7, 1.3)]);
  items.push([15.8, () => lamp(12.2, 3.6)]);
  items.push([16.8, () => tree(11.8, 5.0)]);
  items.push([17.8, () => {
    box(11.6, 6.2, 0, 0.7, 0.25, 0.2, '#C98F4E', undefined, 'bench_seat');
    box(11.6, 6.2, 0.2, 0.7, 0.07, 0.2, '#A9763F', undefined, 'bench_back');
  }]);
  items.push([19.6, () => tree(11.6, 8.0)]);

  // Inner town scenery (lamps & bushes around plaza)
  items.push([8.8, () => bush(0.6, 4.8)]);
  items.push([9.8, () => lamp(3.7, 5.9)]);
  items.push([11.8, () => bush(7.3, 4.8)]);
  items.push([12.2, () => lamp(6.9, 5.9)]);

  // Town Decorations
  if (decorations.includes('fountain')) {
    items.push([10.3, () => elements.push(<CrystalFountain key="dec-fountain" idleTick={idleTick} />)]);
  }
  if (decorations.includes('gazebo') || decorations.includes('park_bench')) {
    items.push([18.0, () => elements.push(<RiversideGazebo key="dec-gazebo" />)]);
  }
  if (decorations.includes('flowerbeds') || decorations.includes('flowerbed_blossom')) {
    items.push([9.5, () => elements.push(<BlossomFlowerbeds key="dec-flowers" />)]);
  }
  if (decorations.includes('clocktower') || decorations.includes('deco_clocktower')) {
    items.push([11.0, () => elements.push(<ClocktowerFinial key="dec-clock" />)]);
  }

  // NPC Sprites
  for (const n of npcNodes) {
    items.push([n.depth, () => elements.push(n.node)]);
  }

  // Pet Sheru
  if (petNode) {
    items.push([petNode.depth, () => elements.push(petNode.node)]);
  }

  // Front lawn scenery (orchard trees, gate lamps, fences)
  items.push([11.5, () => tree(1.2, 10.3)]);
  items.push([12.9, () => tree(2.3, 10.6)]);
  items.push([15.85, () => lamp(4.8, 11.05)]);
  items.push([16.7, () => lamp(5.65, 11.05)]);
  items.push([16.7, () => tree(6.2, 10.5)]);

  // Fences at y = 11.1: x 0.5 to 4.6 and x 6.0 to 10.1 (gap is entrance)
  items.push([15.7, () => fence(0.5, 4.6, 11.1)]);
  items.push([21.2, () => fence(6.0, 10.1, 11.1)]);

  // Dust particles depth-sorted right beneath character feet
  if (charPos && dustNodes) {
    items.push([charPos.x + charPos.y - 0.05, () => elements.push(dustNodes)]);
  }

  // Character sprite depth-sorted with buildings using x + y
  if (charPos && charSpriteNode) {
    items.push([charPos.x + charPos.y, () => elements.push(charSpriteNode)]);
  }

  items.sort((a, b) => a[0] - b[0]);
  items.forEach((it) => it[1]());

  return elements;
}

export function Town() {
  const router = useRouter();
  const {
    state,
    level,
    activeEvent,
    petDog,
    completeQuest,
    resolveDilemma,
    questProgress,
    dailyHabits,
    viewMode,
    setViewMode,
  } = useGame();

  // Character movement state (continuous sub-grid units on the plaza road)
  const [charPos, setCharPos] = useState<Point2D>({ x: 5.3, y: 6.0 });
  const [isWalking, setIsWalking] = useState(false);
  const [walkStep, setWalkStep] = useState(0);
  const [facingDir, setFacingDir] = useState<'left' | 'right'>('right');
  const [isEntering, setIsEntering] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);
  const [idleTick, setIdleTick] = useState(0);
  const [clickTarget, setClickTarget] = useState<Point2D | null>(null);
  const [showControls, setShowControls] = useState(true);

  // RPG Pillar state: dialogue modals & dilemmas
  const [selectedNpc, setSelectedNpc] = useState<NpcDef | null>(null);
  const [activeDilemma, setActiveDilemma] = useState<Dilemma | null>(null);
  const [pettedRecently, setPettedRecently] = useState(false);
  const [dismissedSheruPos, setDismissedSheruPos] = useState<Point2D | null>(null);
  const [showNoticeboard, setShowNoticeboard] = useState(false);

  const charPosRef = useRef<Point2D>({ x: 5.3, y: 6.0 });
  const walkPathRef = useRef<Point2D[]>([]);
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const activeKeysRef = useRef<Set<string>>(new Set());
  const strideAccumRef = useRef<number>(0);
  const dustParticlesRef = useRef<DustParticle[]>([]);
  const nextDustIdRef = useRef<number>(1);
  const isNavigatingRef = useRef(false);
  const idleTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const theme = state.profile?.theme || 'system';
  const isNight = theme === 'night';
  const isStorm = activeEvent.type === 'debt_spiral';
  const isStranded = activeEvent.type === 'stranded';

  const extraH = Math.max(0, (level - 1) * 0.25);

  const mood: MoodType = isStorm
    ? 'worried'
    : isStranded
    ? 'sad'
    : activeEvent.type === 'goal_reached'
    ? 'celebrating'
    : 'happy';

  // Proximity to nearby building for thought bubble emote
  const nearbyBuilding = useMemo(() => {
    for (const b of BUILDINGS) {
      const sp = STAND_POINTS[b.id];
      if (sp) {
        const dist = Math.hypot(charPos.x - sp.x, charPos.y - sp.y);
        if (dist <= 1.35) {
          return b.id;
        }
      }
    }
    return null;
  }, [charPos.x, charPos.y]);

  const thoughtBubble = nearbyBuilding ? BUILDING_EMOTES[nearbyBuilding] : null;

  // Proximity to nearest NPC
  const nearestNpc = useMemo(() => {
    for (const npc of TOWN_NPCS) {
      const dist = Math.hypot(charPos.x - npc.x, charPos.y - npc.y);
      if (dist <= 1.4) {
        return npc;
      }
    }
    return null;
  }, [charPos.x, charPos.y]);

  const today = getTodayISO();
  const hasPettedToday = state.lastPettedDate === today;

  // Pet Sheru position (Cobblestone plaza North-East sunny corner, well clear of Uncle Sharma and town spawn)
  const petPos = useMemo(() => {
    return { x: 6.2, y: 4.2 };
  }, []);

  const distToSheru = Math.hypot(charPos.x - petPos.x, charPos.y - petPos.y);
  const isNearSheru = distToSheru <= 1.15;

  // Derive banner dismissal without setState inside an effect
  const sheruBannerDismissed = Boolean(
    dismissedSheruPos &&
      Math.hypot(charPos.x - dismissedSheruPos.x, charPos.y - dismissedSheruPos.y) < 1.0
  );

  const handlePetSheru = useCallback(() => {
    petDog();
    setPettedRecently(true);
    setTimeout(() => {
      setPettedRecently(false);
      setDismissedSheruPos({ ...charPosRef.current });
    }, 2200);
  }, [petDog]);

  // Town NPC Sprites
  const npcNodes = useMemo(() => {
    return TOWN_NPCS.map((npc) => {
      const isNear = nearestNpc?.id === npc.id;
      return {
        depth: npc.x + npc.y,
        node: (
          <TownNpcSprite
            key={`town-npc-${npc.id}`}
            npc={npc}
            isNearby={isNear}
            onTalk={(n) => {
              setSelectedNpc(n);
              playButtonSound();
            }}
            idleTick={idleTick}
          />
        ),
      };
    });
  }, [nearestNpc, idleTick]);

  // Sheru Pet Node
  const petNode = useMemo(() => {
    return {
      depth: petPos.x + petPos.y,
      node: (
        <SheruPet
          key="sheru-pet"
          x={petPos.x}
          y={petPos.y}
          happiness={state.petHappiness ?? 80}
          onPet={handlePetSheru}
          idleTick={idleTick}
        />
      ),
    };
  }, [petPos.x, petPos.y, state.petHappiness, handlePetSheru, idleTick]);

  // Character figure matching customized avatar appearance, animations, juice, and direction
  const charSpriteNode = useMemo(
    () => (
      <TownCharacter
        key="town-character"
        x={charPos.x}
        y={charPos.y}
        facing={facingDir}
        isWalking={isWalking}
        walkStep={walkStep}
        hairColor={state.profile?.avatar.hairColor || '#2C1810'}
        outfitColor={state.profile?.avatar.outfitColor || '#2B4C7E'}
        mood={mood}
        isEntering={isEntering}
        thoughtBubble={thoughtBubble}
        idleTick={idleTick}
      />
    ),
    [
      charPos.x,
      charPos.y,
      facingDir,
      isWalking,
      walkStep,
      state.profile?.avatar.hairColor,
      state.profile?.avatar.outfitColor,
      mood,
      isEntering,
      thoughtBubble,
      idleTick,
    ]
  );

  // Render dust puffs behind character feet
  const dustNodes = useMemo(() => {
    if (dustParticles.length === 0) return null;
    return (
      <g key="town-dust-particles" className="pointer-events-none">
        {dustParticles.map((p) => {
          const [px, py] = projectIso(p.x, p.y, 0);
          const progress = 1 - p.life / p.maxLife;
          const size = p.size * (1 + progress * 0.4);
          const opacity = Math.max(0, (1 - progress) * 0.7);
          return (
            <rect
              key={p.id}
              x={px - size / 2}
              y={py - size / 2}
              width={size}
              height={size}
              fill="#EAD7B3"
              stroke="#C9AC7A"
              strokeWidth="0.7"
              opacity={opacity}
              transform={`rotate(45 ${px} ${py})`}
            />
          );
        })}
      </g>
    );
  }, [dustParticles]);

  // Scene elements with character & dust depth-sorted with buildings using x + y
  const elements = useMemo(
    () =>
      generateTownSceneElements(
        extraH,
        isNight,
        charPos,
        charSpriteNode,
        dustNodes,
        state.decorations || [],
        npcNodes,
        petNode,
        idleTick
      ),
    [
      extraH,
      isNight,
      charPos,
      charSpriteNode,
      dustNodes,
      state.decorations,
      npcNodes,
      petNode,
      idleTick,
    ]
  );

  // Click a building: step directly into the doorway, then open menu
  const handleBuildingClick = (e: React.MouseEvent | React.KeyboardEvent, bDef: BuildingDef) => {
    e.stopPropagation();
    if (isNavigatingRef.current) return;
    const sp = STAND_POINTS[bDef.id];
    setCharPos(sp);
    charPosRef.current = sp;
    walkPathRef.current = [];
    setClickTarget(null);
    setIsEntering(true);
    playButtonSound();
    isNavigatingRef.current = true;
    setTimeout(() => {
      router.push(bDef.route);
    }, 140);
  };

  // Click anywhere on town map to walk to that spot
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isNavigatingRef.current) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = -10 + ((e.clientX - rect.left) / rect.width) * 710;
    const py = 0 + ((e.clientY - rect.top) / rect.height) * 530;
    const worldPt = screenToWorld(px, py);
    const target = findNearestWalkable(worldPt.x, worldPt.y);
    const path = findAStarPath(charPosRef.current.x, charPosRef.current.y, target.x, target.y);
    if (path.length > 1) {
      walkPathRef.current = path.slice(1);
      setClickTarget(target);
    }
  };

  // Keyboard input listeners: track active keys and quick enter interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT' ||
        isNavigatingRef.current
      ) {
        return;
      }

      const keyLower = e.key.toLowerCase();
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(
          keyLower
        )
      ) {
        e.preventDefault();
        walkPathRef.current = [];
        setClickTarget(null);
        activeKeysRef.current.add(keyLower);
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const curr = charPosRef.current;
        const b = BUILDINGS.find((bld) => {
          const sp = STAND_POINTS[bld.id];
          return Math.hypot(curr.x - sp.x, curr.y - sp.y) < 1.35;
        });
        if (b && !isNavigatingRef.current) {
          playButtonSound();
          setIsEntering(true);
          isNavigatingRef.current = true;
          setTimeout(() => router.push(b.route), 140);
          return;
        }
        if (nearestNpc) {
          setSelectedNpc(nearestNpc);
          playButtonSound();
          return;
        }
        if (isNearSheru) {
          handlePetSheru();
          return;
        }
      } else if (keyLower === 'e') {
        e.preventDefault();
        if (nearestNpc) {
          setSelectedNpc(nearestNpc);
          playButtonSound();
        } else if (isNearSheru) {
          handlePetSheru();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyLower = e.key.toLowerCase();
      activeKeysRef.current.delete(keyLower);
    };

    const handleBlur = () => {
      activeKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [router, nearestNpc, isNearSheru, handlePetSheru]);

  // Continuous game loop with inertia, corner sliding, doorway funnel, SFX, and dust
  useEffect(() => {
    let lastTime: number | null = null;

    const loop = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
      }
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!isNavigatingRef.current) {
        // 1. Calculate target velocity from active keys or click-to-walk path
        const keys = activeKeysRef.current;
        let targetVx = 0;
        let targetVy = 0;

        if (keys.size > 0) {
          walkPathRef.current = [];
          setClickTarget(null);

          if (keys.has('arrowup') || keys.has('w')) {
            targetVy -= 1;
          }
          if (keys.has('arrowdown') || keys.has('s')) {
            targetVy += 1;
          }
          if (keys.has('arrowleft') || keys.has('a')) {
            targetVx -= 1;
          }
          if (keys.has('arrowright') || keys.has('d')) {
            targetVx += 1;
          }

          // Normalize diagonal vector
          if (targetVx !== 0 && targetVy !== 0) {
            targetVx *= Math.SQRT1_2;
            targetVy *= Math.SQRT1_2;
          }
        } else if (walkPathRef.current.length > 0) {
          const curr = charPosRef.current;
          while (walkPathRef.current.length > 0) {
            const nextWp = walkPathRef.current[0];
            const wpDx = nextWp.x - curr.x;
            const wpDy = nextWp.y - curr.y;
            const wpDist = Math.hypot(wpDx, wpDy);

            if (wpDist < 0.18) {
              walkPathRef.current.shift();
            } else {
              targetVx = wpDx / wpDist;
              targetVy = wpDy / wpDist;
              break;
            }
          }
          if (walkPathRef.current.length === 0) {
            setClickTarget(null);
          }
        }

        // 2. Velocity lerping (inertia / smooth acceleration & deceleration)
        const lerpFactor = targetVx !== 0 || targetVy !== 0 ? 0.32 : 0.22;
        velocityRef.current.vx += (targetVx - velocityRef.current.vx) * lerpFactor;
        velocityRef.current.vy += (targetVy - velocityRef.current.vy) * lerpFactor;

        if (Math.abs(velocityRef.current.vx) < 0.001) velocityRef.current.vx = 0;
        if (Math.abs(velocityRef.current.vy) < 0.001) velocityRef.current.vy = 0;

        const vx = velocityRef.current.vx;
        const vy = velocityRef.current.vy;
        const speed = Math.hypot(vx, vy);

        const MOVE_SPEED = 3.2; // 3.2 units per second = fluid, responsive pace

        if (speed > 0.01) {
          // Reset idle timer when moving
          idleTimeRef.current = 0;
          setIdleTick(0);

          // Facing direction
          if (vx < -0.05) {
            setFacingDir('left');
          } else if (vx > 0.05) {
            setFacingDir('right');
          }

          const curr = charPosRef.current;
          const prevX = curr.x;
          const prevY = curr.y;
          let dx = vx * dt * MOVE_SPEED;
          const dy = vy * dt * MOVE_SPEED;

          // Doorway magnetism / funnel:
          // When moving vertically towards doorways (vy < -0.05), gently align with doorway columns
          if (vy < -0.05) {
            const DOOR_X_COLS = [2.0, 5.3, 8.6];
            for (const doorX of DOOR_X_COLS) {
              if (Math.abs(curr.x - doorX) < 0.32) {
                dx += (doorX - curr.x) * 0.12;
                break;
              }
            }
          }

          const nextX = curr.x + dx;
          const nextY = curr.y + dy;

          // Wall sliding & corner smoothing
          let moved = false;
          if (isWalkableRoad(nextX, nextY)) {
            curr.x = nextX;
            curr.y = nextY;
            moved = true;
          } else {
            // Slide along X if X alone is walkable
            if (Math.abs(dx) > 0.0001 && isWalkableRoad(nextX, curr.y)) {
              curr.x = nextX;
              moved = true;
            }
            // Slide along Y if Y alone is walkable
            if (Math.abs(dy) > 0.0001 && isWalkableRoad(curr.x, nextY)) {
              curr.y = nextY;
              moved = true;
            }
          }

          if (moved) {
            charPosRef.current = { x: curr.x, y: curr.y };
            setCharPos({ x: curr.x, y: curr.y });
            setIsWalking(true);

            // Stride & footstep SFX & dust puffs
            const distMoved = Math.hypot(curr.x - prevX, curr.y - prevY);
            strideAccumRef.current += distMoved;

            if (strideAccumRef.current >= 0.32) {
              strideAccumRef.current -= 0.32;
              setWalkStep((s) => s + 1);
              playFootstepSound();

              // Spawn 2 dust particles behind character
              const p1: DustParticle = {
                id: nextDustIdRef.current++,
                x: curr.x + (Math.random() - 0.5) * 0.12 - (vx * 0.04),
                y: curr.y + (Math.random() - 0.5) * 0.12 - (vy * 0.04),
                life: 0.35,
                maxLife: 0.35,
                size: 3.5 + Math.random() * 2,
              };
              const p2: DustParticle = {
                id: nextDustIdRef.current++,
                x: curr.x + (Math.random() - 0.5) * 0.15 - (vx * 0.05),
                y: curr.y + (Math.random() - 0.5) * 0.15 - (vy * 0.05),
                life: 0.3,
                maxLife: 0.3,
                size: 2.8 + Math.random() * 1.8,
              };
              dustParticlesRef.current = [...dustParticlesRef.current, p1, p2];
            }

            // Check if character walked directly INTO a building doorway
            const door = getBuildingAtDoor(curr.x, curr.y);
            if (door && !isNavigatingRef.current) {
              isNavigatingRef.current = true;
              setIsEntering(true);
              playButtonSound();
              setTimeout(() => {
                router.push(door.route);
              }, 140);
            }
          }
        } else {
          // Idle / breathing fidgets
          setIsWalking(false);
          idleTimeRef.current += dt;
          if (idleTimeRef.current >= 2.0) {
            setIdleTick(Math.floor((idleTimeRef.current - 2.0) * 2));
          }
        }

        // Update dust particles
        if (dustParticlesRef.current.length > 0) {
          const remaining: DustParticle[] = [];
          for (const p of dustParticlesRef.current) {
            p.life -= dt;
            if (p.life > 0) {
              remaining.push(p);
            }
          }
          dustParticlesRef.current = remaining;
          setDustParticles(remaining);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [router]);

  // Sky colors based on time and weather
  const skyTop = isStorm ? '#3A424D' : isNight ? '#0B1230' : '#9AD8FF';
  const skyMid = isStorm ? '#56606E' : isNight ? '#1B254B' : '#B5E3FF';
  const skyBot = isStorm ? '#748091' : isNight ? '#2A3A7A' : '#CFEEFF';

  return (
    <div className="relative w-full max-w-[850px] mx-auto select-none overflow-hidden rounded-none border-[3px] border-[#3B2516] bg-[#121316] shadow-[0_8px_0_#1B1B1F]">
      <svg
        id="town-canvas"
        viewBox="-10 0 700 530"
        role="img"
        onClick={handleSvgClick}
        className="w-full h-auto block cursor-pointer"
        style={{ display: 'block' }}
      >
        <title>Hustle Floating Island RPG Town</title>
        <desc>
          A compact floating grass island reflecting your real financial habits.
        </desc>

        {/* Sky Background */}
        <rect x="-10" y="0" width="700" height="177" fill={skyTop} />
        <rect x="-10" y="177" width="700" height="177" fill={skyMid} />
        <rect x="-10" y="354" width="700" height="177" fill={skyBot} />

        {/* Moon / Sun / Clouds */}
        {isNight ? (
          <g fill="#F3F1D8">
            <rect x="580" y="30" width="28" height="28" />
            <rect x="584" y="26" width="20" height="4" />
            <rect x="584" y="58" width="20" height="4" />
            <rect x="576" y="34" width="4" height="20" />
            <rect x="608" y="34" width="4" height="20" />
          </g>
        ) : (
          <g fill="#FFFFFF" opacity=".92">
            <rect x="40" y="36" width="84" height="14" />
            <rect x="60" y="24" width="44" height="12" />
            <rect x="540" y="50" width="90" height="14" />
            <rect x="566" y="38" width="44" height="12" />
          </g>
        )}

        {/* Storm rain if in debt spiral */}
        {isStorm && (
          <g stroke="#9AD8FF" strokeWidth="1.5" opacity="0.6">
            <line x1="100" y1="20" x2="80" y2="70" />
            <line x1="250" y1="30" x2="230" y2="80" />
            <line x1="420" y1="15" x2="400" y2="65" />
            <line x1="580" y1="40" x2="560" y2="90" />
            <line x1="160" y1="120" x2="140" y2="170" />
            <line x1="320" y1="100" x2="300" y2="150" />
            <line x1="480" y1="110" x2="460" y2="160" />
          </g>
        )}

        {/* 3D Isometric Polygons Render with depth-sorted character figure */}
        <g id="scene-elements">{elements}</g>

        {/* Destination Click Ping Beacon */}
        {clickTarget && (
          <g
            id="click-target-beacon"
            transform={`translate(${projectIso(clickTarget.x, clickTarget.y, 0)[0]}, ${projectIso(clickTarget.x, clickTarget.y, 0)[1]})`}
            className="pointer-events-none"
          >
            <ellipse
              cx="0"
              cy="0"
              rx="12"
              ry="6"
              fill="none"
              stroke="#FFD95A"
              strokeWidth="2"
              opacity="0.85"
            />
            <ellipse cx="0" cy="0" rx="4" ry="2" fill="#FFD95A" opacity="0.9" />
          </g>
        )}

        {/* Building Click Hitspots, Live Badges & Highlighted Name Tags */}
        {BUILDINGS.map((b) => {
          const [sx, sy] = projectIso(b.frontX, b.frontY, 0);
          const [rx, ry] = projectIso(b.roofX, b.roofY, b.roofZ + extraH);

          const tagW = Math.round(b.name.length * 6.6 + 14);
          const isHovered = hoveredBuilding === b.id;

          // Only show labels when player character is up close to the building entrance or hovering
          const sp = STAND_POINTS[b.id];
          const distToChar = sp ? Math.hypot(charPos.x - sp.x, charPos.y - sp.y) : 999;
          const isUpClose = distToChar <= 2.2;
          const showLabel = isUpClose || isHovered;

          let liveBadge: string | null = null;
          if (b.id === 'market') {
            const hasOver = state.categories.some((c) => {
              if (!c.monthlyLimit) return false;
              const spent = state.transactions
                .filter((t) => t.type === 'expense' && t.categoryId === c.id)
                .reduce((s, t) => s + t.amount, 0);
              return spent >= c.monthlyLimit;
            });
            if (hasOver) liveBadge = '⚠️ OVER';
          } else if (b.id === 'vault') {
            const hasReached = state.goals.some((g) => g.reachedDate);
            if (hasReached) liveBadge = '🏆 GOAL';
          } else if (b.id === 'bank') {
            if (state.loan?.active) liveBadge = '📜 DEBT';
          }

          const midX = (sx + rx) / 2;
          const midY = (sy + ry) / 2;
          const hitRadiusY = Math.max(38, Math.abs(sy - ry) / 2 + 12);

          return (
            <g
              key={b.id}
              className="cursor-pointer group"
              onClick={(e) => handleBuildingClick(e, b)}
              onMouseEnter={() => setHoveredBuilding(b.id)}
              onMouseLeave={() => setHoveredBuilding(null)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBuildingClick(e, b);
                }
              }}
            >
              {/* Click hit area covering roof down to doorstep */}
              <ellipse
                cx={midX}
                cy={midY}
                rx="46"
                ry={hitRadiusY}
                fill="transparent"
              />

              {/* Active Quest Beacon floating above roof apex */}
              {viewMode !== 'finance' && questProgress?.activeBuildingId === b.id && (
                <g
                  transform={`translate(${rx}, ${showLabel && liveBadge ? ry - 54 : ry - 32})`}
                  className="pointer-events-none select-none"
                >
                  <g className="animate-bounce">
                    <rect
                      x="-44"
                      y="-11"
                      width="88"
                      height="20"
                      rx="4"
                      fill="#FFD95A"
                      stroke="#8A5A2B"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fontFamily="var(--font-heading), monospace"
                      fontSize="9"
                      fill="#1B1B1F"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      ★ QUEST TARGET
                    </text>
                    <polygon
                      points="0,13 -4,9 4,9"
                      fill="#FFD95A"
                      stroke="#8A5A2B"
                      strokeWidth="1"
                    />
                  </g>
                </g>
              )}

              {/* Live Badge floating directly above the Name Tag on the roof - only up close or on hover */}
              {showLabel && liveBadge && (
                <g transform={`translate(${rx}, ${ry - 30})`} className="pointer-events-none select-none animate-fadeIn">
                  <rect
                    x="-24"
                    y="-9"
                    width="48"
                    height="16"
                    rx="2"
                    fill="#1B1B1F"
                    stroke="#FFD95A"
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontFamily="var(--font-body), monospace"
                    fontSize="11"
                    fill="#FFD95A"
                    fontWeight="bold"
                  >
                    {liveBadge}
                  </text>
                </g>
              )}

              {/* Name Tag: ON TOP OF BUILDING (Roof Apex) - only up close or on hover */}
              {showLabel && (
                <g transform={`translate(${rx}, ${ry - 10})`} className="pointer-events-none select-none animate-fadeIn">
                  <rect
                    x={-tagW / 2}
                    y="-8"
                    width={tagW}
                    height="17"
                    rx="3"
                    fill={isHovered ? '#FFD95A' : '#FFF6E0'}
                    opacity={isHovered ? 1.0 : 0.94}
                    stroke={isHovered ? '#B38B00' : '#8A5A2B'}
                    strokeWidth={isHovered ? 2 : 1.2}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontFamily="var(--font-body), monospace, sans-serif"
                    fontSize="11"
                    fontWeight="bold"
                    fill={isHovered ? '#1B1B1F' : '#2B3440'}
                  >
                    {b.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Top Right HUD: Renown & Sheru Happiness */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 sm:gap-2 select-none">
        <div
          className="px-2 py-1 bg-[#1B1B1F]/90 border border-[#B79A60] text-[#FFD95A] font-heading text-[10px] sm:text-xs flex items-center gap-1.5 shadow"
          title="Town Renown (Earned from budgeting, bounties & quizzes)"
        >
          <span>⭐</span>
          <span>{state.renown ?? 0}</span>
          <span className="text-[#8E929A] text-[9px] hidden sm:inline">RENOWN</span>
        </div>
        <div
          className="px-2 py-1 bg-[#1B1B1F]/90 border border-[#B79A60] text-[#FFF4D6] font-heading text-[10px] sm:text-xs flex items-center gap-1 shadow"
          title="Sheru's Happiness (Pet him daily!)"
        >
          <span>🐕</span>
          <span>{state.petHappiness ?? 80}%</span>
        </div>
      </div>

      {/* Floating Action Banners: Dynamic for Doorways and NPCs */}
      {nearbyBuilding && !isEntering ? (
        <button
          type="button"
          onClick={() => {
            const b = BUILDINGS.find((bld) => bld.id === nearbyBuilding);
            if (b && !isNavigatingRef.current) {
              playButtonSound();
              setIsEntering(true);
              isNavigatingRef.current = true;
              setTimeout(() => router.push(b.route), 140);
            }
          }}
          className="absolute top-3 left-3 sm:left-4 z-20 px-3 py-1.5 bg-[#1B1B1F]/95 border-2 border-[#FFD95A] text-[#FFD95A] font-heading text-[10px] sm:text-xs shadow-[0_4px_0_#000] cursor-pointer hover:bg-[#FFD95A] hover:text-[#1B1B1F] transition-all flex items-center gap-2 animate-bounce"
        >
          <span>🚪</span>
          <span>Enter {BUILDINGS.find((b) => b.id === nearbyBuilding)?.name} (Press SPACE/ENTER)</span>
          <span>➔</span>
        </button>
      ) : nearestNpc && !isEntering ? (
        <button
          type="button"
          onClick={() => {
            setSelectedNpc(nearestNpc);
            playButtonSound();
          }}
          className="absolute top-3 left-3 sm:left-4 z-20 px-3 py-1.5 bg-[#1B1B1F]/95 border-2 border-[#FFD95A] text-[#FFD95A] font-heading text-[10px] sm:text-xs shadow-[0_4px_0_#000] cursor-pointer hover:bg-[#FFD95A] hover:text-[#1B1B1F] transition-all flex items-center gap-2 animate-bounce"
        >
          <span>💬</span>
          <span>Talk to {nearestNpc.name} (Press E or SPACE)</span>
          <span>➔</span>
        </button>
      ) : isNearSheru && !isEntering && !sheruBannerDismissed ? (
        pettedRecently ? (
          <div className="absolute top-3 left-3 sm:left-4 z-20 px-3 py-1.5 bg-[#1B1B1F]/95 border-2 border-[#79CE5E] text-[#FFF4D6] font-heading text-[10px] sm:text-xs shadow-[0_4px_0_#000] flex items-center gap-2 animate-fadeIn">
            <span>🐾</span>
            <span className="text-[#79CE5E]">Sheru wags his tail happily! (+10% Happiness)</span>
            <span>❤️</span>
          </div>
        ) : !hasPettedToday ? (
          <div className="absolute top-3 left-3 sm:left-4 z-20 flex items-center gap-1 shadow-[0_4px_0_#000] animate-bounce">
            <button
              type="button"
              onClick={handlePetSheru}
              className="px-3 py-1.5 bg-[#1B1B1F]/95 border-2 border-[#FFD95A] text-[#FFD95A] font-heading text-[10px] sm:text-xs cursor-pointer hover:bg-[#FFD95A] hover:text-[#1B1B1F] transition-all flex items-center gap-2"
            >
              <span>🐾</span>
              <span>Pet Sheru (+10% Happiness! Press SPACE or E)</span>
              <span>❤️</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissedSheruPos({ x: charPos.x, y: charPos.y })}
              className="px-2 py-1.5 bg-[#1B1B1F]/95 border-2 border-[#4B515A] hover:border-[#FFD95A] text-[#B4BAC4] hover:text-[#FFF4D6] text-xs cursor-pointer font-bold"
              title="Dismiss"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        ) : null
      ) : null}

      {/* On-Screen Mobile / Touch Virtual Controls */}
      <div className="absolute bottom-12 right-2 flex flex-col items-end gap-1 z-20 select-none">
        <button
          type="button"
          onClick={() => setShowControls(!showControls)}
          className="text-[9px] font-heading px-2 py-0.5 bg-[#1B1B1F]/85 text-[#FFD95A] border border-[#4E5561] hover:border-[#FFD95A] cursor-pointer shadow"
          title="Toggle on-screen controls"
        >
          {showControls ? '🎮 HIDE D-PAD' : '🎮 D-PAD'}
        </button>

        {showControls && (
          <div className="bg-[#121316]/90 border-2 border-[#5C3826] p-1 shadow-[0_4px_0_#000] backdrop-blur-xs flex flex-col items-center gap-1">
            {/* Up */}
            <button
              type="button"
              onMouseDown={() => activeKeysRef.current.add('w')}
              onMouseUp={() => activeKeysRef.current.delete('w')}
              onMouseLeave={() => activeKeysRef.current.delete('w')}
              onTouchStart={(e) => { e.preventDefault(); activeKeysRef.current.add('w'); }}
              onTouchEnd={() => activeKeysRef.current.delete('w')}
              className="w-8 h-8 bg-[#2E333B] active:bg-[#FFD95A] active:text-[#1B1B1F] border border-[#4E5561] text-[#FFF4D6] font-heading text-xs flex items-center justify-center cursor-pointer shadow-sm select-none"
              aria-label="Move Up"
            >
              ▲
            </button>

            {/* Middle: Left, Action/Enter, Right */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onMouseDown={() => activeKeysRef.current.add('a')}
                onMouseUp={() => activeKeysRef.current.delete('a')}
                onMouseLeave={() => activeKeysRef.current.delete('a')}
                onTouchStart={(e) => { e.preventDefault(); activeKeysRef.current.add('a'); }}
                onTouchEnd={() => activeKeysRef.current.delete('a')}
                className="w-8 h-8 bg-[#2E333B] active:bg-[#FFD95A] active:text-[#1B1B1F] border border-[#4E5561] text-[#FFF4D6] font-heading text-xs flex items-center justify-center cursor-pointer shadow-sm select-none"
                aria-label="Move Left"
              >
                ◀
              </button>

              <button
                type="button"
                onClick={() => {
                  const curr = charPosRef.current;
                  const b = BUILDINGS.find((bld) => {
                    const sp = STAND_POINTS[bld.id];
                    return Math.hypot(curr.x - sp.x, curr.y - sp.y) < 1.35;
                  });
                  if (b && !isNavigatingRef.current) {
                    playButtonSound();
                    setIsEntering(true);
                    isNavigatingRef.current = true;
                    setTimeout(() => router.push(b.route), 140);
                    return;
                  }
                  if (nearestNpc) {
                    setSelectedNpc(nearestNpc);
                    playButtonSound();
                    return;
                  }
                  if (isNearSheru) {
                    handlePetSheru();
                    return;
                  }
                }}
                className={`w-8 h-8 border font-heading text-[9px] flex items-center justify-center cursor-pointer shadow-sm select-none transition-colors ${
                  nearbyBuilding
                    ? 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] animate-pulse font-bold'
                    : nearestNpc
                    ? 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] animate-pulse font-bold'
                    : isNearSheru
                    ? (hasPettedToday
                        ? 'bg-[#2A9D8F] text-[#FFF4D6] border-[#FFD95A] font-bold'
                        : 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] animate-pulse font-bold')
                    : 'bg-[#3A3F47] text-[#B4BAC4] border-[#4E5561]'
                }`}
                title={
                  nearbyBuilding
                    ? 'Enter building'
                    : nearestNpc
                    ? `Talk to ${nearestNpc.name}`
                    : isNearSheru
                    ? 'Pet Sheru'
                    : 'Action'
                }
                aria-label="Action / Enter"
              >
                {nearbyBuilding ? 'IN' : nearestNpc ? 'TALK' : isNearSheru ? 'PET' : 'OK'}
              </button>

              <button
                type="button"
                onMouseDown={() => activeKeysRef.current.add('d')}
                onMouseUp={() => activeKeysRef.current.delete('d')}
                onMouseLeave={() => activeKeysRef.current.delete('d')}
                onTouchStart={(e) => { e.preventDefault(); activeKeysRef.current.add('d'); }}
                onTouchEnd={() => activeKeysRef.current.delete('d')}
                className="w-8 h-8 bg-[#2E333B] active:bg-[#FFD95A] active:text-[#1B1B1F] border border-[#4E5561] text-[#FFF4D6] font-heading text-xs flex items-center justify-center cursor-pointer shadow-sm select-none"
                aria-label="Move Right"
              >
                ▶
              </button>
            </div>

            {/* Down */}
            <button
              type="button"
              onMouseDown={() => activeKeysRef.current.add('s')}
              onMouseUp={() => activeKeysRef.current.delete('s')}
              onMouseLeave={() => activeKeysRef.current.delete('s')}
              onTouchStart={(e) => { e.preventDefault(); activeKeysRef.current.add('s'); }}
              onTouchEnd={() => activeKeysRef.current.delete('s')}
              className="w-8 h-8 bg-[#2E333B] active:bg-[#FFD95A] active:text-[#1B1B1F] border border-[#4E5561] text-[#FFF4D6] font-heading text-xs flex items-center justify-center cursor-pointer shadow-sm select-none"
              aria-label="Move Down"
            >
              ▼
            </button>
          </div>
        )}
      </div>

      {/* Hover Floating Guide Strip */}
      {hoveredBuilding && (
        <div className="absolute bottom-12 left-2 right-2 bg-[#1B1B1F]/90 border border-[#FFD95A] px-3 py-1.5 flex items-center justify-between text-xs text-[#FFF4D6] font-body pointer-events-none animate-fadeIn z-15">
          <span className="font-heading text-[#FFD95A] text-[10px] uppercase">
            {BUILDINGS.find((b) => b.id === hoveredBuilding)?.name}
          </span>
          <span>
            {BUILDINGS.find((b) => b.id === hoveredBuilding)?.desc} (Click to walk & enter)
          </span>
        </div>
      )}

      {/* Quick Fast-Travel Town Strip */}
      <div className="w-full bg-[#15161A] border-t-2 border-[#3B2516] p-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 z-10">
        <span className="text-[10px] font-heading text-[#B4BAC4] uppercase mr-1 hidden sm:inline">
          Fast Travel:
        </span>
        {BUILDINGS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={(e) => handleBuildingClick(e, b)}
            className="px-2 py-1 bg-[#25282E] hover:bg-[#FFD95A] hover:text-[#1B1B1F] text-[#FFF4D6] border border-[#4E5561] hover:border-[#FFD95A] text-[10px] sm:text-xs font-heading cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
            title={b.desc}
          >
            <span>{BUILDING_EMOTES[b.id]?.icon}</span>
            <span>{b.name}</span>
          </button>
        ))}

        <div className="h-4 w-px bg-[#4E5561] mx-1 hidden sm:inline" />

        {/* Noticeboard Button */}
        <button
          type="button"
          onClick={() => setShowNoticeboard(true)}
          className="px-2.5 py-1 bg-[#3A2E1A] hover:bg-[#FFD95A] hover:text-[#1B1B1F] text-[#FFD95A] border border-[#B79A60] text-[10px] sm:text-xs font-heading cursor-pointer transition-colors flex items-center gap-1 shadow-xs font-bold"
          title="Daily Financial Noticeboard & Habits"
        >
          <span>📋</span>
          <span>Noticeboard ({dailyHabits?.completedCount ?? 0}/{dailyHabits?.totalCount ?? 4})</span>
        </button>

        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'finance' ? 'quest' : 'finance')}
          className={`px-2 py-1 border text-[10px] sm:text-xs font-heading cursor-pointer transition-colors flex items-center gap-1 shadow-xs ${
            viewMode === 'finance'
              ? 'bg-[#1e293b] text-[#38bdf8] border-[#38bdf8]'
              : 'bg-[#25282E] text-[#B4BAC4] border-[#4E5561] hover:text-[#FFF4D6]'
          }`}
          title={viewMode === 'finance' ? 'Switch to Quest Mode' : 'Switch to Pure Financial Mode'}
        >
          <span>{viewMode === 'finance' ? '📊 Finance' : '🎮 Quests'}</span>
        </button>
      </div>

      {/* NPC Dialogue & Bounty Modal */}
      {selectedNpc && (
        <NpcDialogueModal
          npc={selectedNpc}
          isQuestCompleted={state.completedQuests?.includes(selectedNpc.bounty.id) ?? false}
          onClose={() => setSelectedNpc(null)}
          onCompleteQuest={(questId) => {
            completeQuest(questId);
          }}
        />
      )}

      {/* Random Life Dilemma Choice Modal */}
      {activeDilemma && (
        <DilemmaModal
          dilemma={activeDilemma}
          onClose={() => setActiveDilemma(null)}
          onChoose={(choiceIndex) => {
            resolveDilemma(activeDilemma.id, choiceIndex);
            setActiveDilemma(null);
          }}
        />
      )}

      {/* Daily Town Noticeboard Modal */}
      {showNoticeboard && (
        <TownNoticeboardModal onClose={() => setShowNoticeboard(false)} />
      )}
    </div>
  );
}
