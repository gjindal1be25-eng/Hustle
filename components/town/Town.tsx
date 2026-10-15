'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { CharacterSprite } from '@/components/ui/CharacterSprite';
import { ROAD_NODES, findShortestPath, MoveDirection } from '@/lib/roadGraph';

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
    tx: 0.0,
    ty: 0.6,
    k: 0.8,
    frontX: 2.0,
    frontY: 3.3,
    roofX: 1.6,
    roofY: 2.0,
    roofZ: 3.4,
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
    roofY: 1.4,
    roofZ: 3.8,
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
    roofZ: 3.4,
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
    roofZ: 2.4,
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
    roofY: 5.3,
    roofZ: 4.4,
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
    roofZ: 2.2,
  },
  {
    id: 'school',
    name: 'School',
    route: '/school',
    desc: '8 Financial Wisdom Book Lessons',
    doorNode: 'school_door',
    tx: 6.6,
    ty: 6.3,
    k: 0.8,
    frontX: 8.6,
    frontY: 9.7,
    roofX: 8.2,
    roofY: 7.8,
    roofZ: 3.2,
  },
];

const W = 28;
const Hh = 24;
const ox = 320;
const oy = 125;

export function projectIso(x: number, y: number, z: number): [number, number] {
  return [ox + (x - y) * W, oy + ((x + y) * W) / 2 - z * Hh];
}

function generateTownSceneElements(extraH: number, isNight: boolean): React.ReactNode[] {
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
  items.push([1.2, () => { tx = 0.0; ty = 0.6; k = 0.8; work(); }]);
  items.push([3.5, () => { tx = 3.9; ty = 0.0; k = 0.8; townhall(); }]);
  items.push([7.8, () => { tx = 7.3; ty = 0.9; k = 0.8; vault(); }]);
  items.push([4.5, () => { tx = 0.9; ty = 3.2; k = 0.8; home(); }]);
  items.push([9.5, () => { tx = 5.93; ty = 3.9; k = 0.62; bank(); }]);
  items.push([8.5, () => { tx = 1.0; ty = 6.6; k = 0.8; market(); }]);
  items.push([13.2, () => { tx = 6.6; ty = 6.3; k = 0.8; school(); }]);

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

  // Front lawn scenery (orchard trees, gate lamps, fences)
  items.push([11.5, () => tree(1.2, 10.3)]);
  items.push([12.9, () => tree(2.3, 10.6)]);
  items.push([13.6, () => tree(3.4, 10.2)]);
  items.push([14.8, () => tree(4.1, 10.7)]);
  items.push([15.85, () => lamp(4.8, 11.05)]);
  items.push([16.7, () => lamp(5.65, 11.05)]);
  items.push([16.7, () => tree(6.2, 10.5)]);

  // Fences at y = 11.1: x 0.5 to 4.6 and x 6.0 to 10.1 (gap is entrance)
  items.push([15.7, () => fence(0.5, 4.6, 11.1)]);
  items.push([21.2, () => fence(6.0, 10.1, 11.1)]);

  items.sort((a, b) => a[0] - b[0]);
  items.forEach((it) => it[1]());

  return elements;
}

export function Town() {
  const router = useRouter();
  const { state, level, activeEvent } = useGame();

  // Character movement state on road graph
  const [currentNodeId, setCurrentNodeId] = useState<string>('p_center');
  const [charPos, setCharPos] = useState<{ x: number; y: number }>({
    x: ROAD_NODES['p_center'].x,
    y: ROAD_NODES['p_center'].y,
  });
  const [facingDir, setFacingDir] = useState<MoveDirection>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  const walkingRef = useRef(false);
  const pathQueueRef = useRef<string[]>([]);
  const targetRouteRef = useRef<string | null>(null);
  const walkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
      }
    };
  }, []);

  const theme = state.profile?.theme || 'system';
  const isNight = theme === 'night';
  const isStorm = activeEvent.type === 'debt_spiral';
  const isStranded = activeEvent.type === 'stranded';

  const extraH = Math.max(0, (level - 1) * 0.25);
  const elements = useMemo(() => generateTownSceneElements(extraH, isNight), [extraH, isNight]);
  const [charX, charY] = projectIso(charPos.x, charPos.y, 0);

  // --- CR 4: Road Graph Movement & Keyboard Handlers ---
  const handleMove = useCallback((dir: MoveDirection) => {
    setFacingDir(dir);
    const currNode = ROAD_NODES[currentNodeId];
    if (!currNode) return;

    const nextId = currNode.neighbors[dir];
    if (nextId && ROAD_NODES[nextId]) {
      const nextNode = ROAD_NODES[nextId];
      setCurrentNodeId(nextId);
      setCharPos({ x: nextNode.x, y: nextNode.y });
      setIsWalking(true);
      setTimeout(() => setIsWalking(false), 200);
    }
  }, [currentNodeId]);

  // Keyboard navigation listener (Arrow keys + WASD + Enter/Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or modal is open
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove('right');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const currNode = ROAD_NODES[currentNodeId];
        if (currNode?.buildingId) {
          const b = BUILDINGS.find((bld) => bld.id === currNode.buildingId);
          if (b) {
            router.push(b.route);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNodeId, handleMove, router]);

  // Click a building: walk along road graph (shortest path) then open route
  const handleBuildingClick = (bDef: BuildingDef) => {
    const targetDoor = bDef.doorNode;
    if (currentNodeId === targetDoor) {
      router.push(bDef.route);
      return;
    }

    const path = findShortestPath(currentNodeId, targetDoor);
    if (path.length <= 1) {
      router.push(bDef.route);
      return;
    }

    // Clear existing walking interval if any
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }

    // Follow path node by node
    pathQueueRef.current = path.slice(1);
    targetRouteRef.current = bDef.route;
    walkingRef.current = true;
    setIsWalking(true);

    let stepIdx = 0;
    walkIntervalRef.current = setInterval(() => {
      if (stepIdx < pathQueueRef.current.length) {
        const nextNodeId = pathQueueRef.current[stepIdx];
        const nextNode = ROAD_NODES[nextNodeId];
        if (nextNode) {
          setCurrentNodeId(nextNodeId);
          setCharPos({ x: nextNode.x, y: nextNode.y });
        }
        stepIdx++;
      } else {
        if (walkIntervalRef.current) {
          clearInterval(walkIntervalRef.current);
          walkIntervalRef.current = null;
        }
        walkingRef.current = false;
        setIsWalking(false);
        if (targetRouteRef.current) {
          router.push(targetRouteRef.current);
          targetRouteRef.current = null;
        }
      }
    }, 220); // ~3 tiles per second
  };

  // Sky colors based on time and weather
  const skyTop = isStorm ? '#3A424D' : isNight ? '#0B1230' : '#9AD8FF';
  const skyMid = isStorm ? '#56606E' : isNight ? '#1B254B' : '#B5E3FF';
  const skyBot = isStorm ? '#748091' : isNight ? '#2A3A7A' : '#CFEEFF';

  return (
    <div className="relative w-full max-w-[760px] mx-auto select-none overflow-hidden rounded-none border-[3px] border-[#3B2516] bg-[#121316] shadow-[0_8px_0_#1B1B1F]">
      <svg
        id="town-canvas"
        viewBox="-10 0 700 530"
        role="img"
        className="w-full h-auto block"
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
          // Pixel Moon
          <g fill="#F3F1D8">
            <rect x="580" y="30" width="28" height="28" />
            <rect x="584" y="26" width="20" height="4" />
            <rect x="584" y="58" width="20" height="4" />
            <rect x="576" y="34" width="4" height="20" />
            <rect x="608" y="34" width="4" height="20" />
          </g>
        ) : (
          // Clouds
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

        {/* 3D Isometric Polygons Render */}
        <g id="scene-elements">{elements}</g>

        {/* Character Sprite walking on roads */}
        <g transform={`translate(${charX - 16}, ${charY - 36})`}>
          <foreignObject width="32" height="48">
            <div className="w-full h-full flex items-center justify-center">
              <CharacterSprite
                hairColor={state.profile?.avatar.hairColor || '#2C1810'}
                outfitColor={state.profile?.avatar.outfitColor || '#2B4C7E'}
                mood={
                  isStorm
                    ? 'worried'
                    : isStranded
                    ? 'sad'
                    : activeEvent.type === 'goal_reached'
                    ? 'celebrating'
                    : 'happy'
                }
                size={28}
                animate={isWalking}
                facing={facingDir === 'left' ? 'left' : 'right'}
              />
            </div>
          </foreignObject>
        </g>

        {/* CR 2 & CR 5: Name Tags & Live Badges per Section 5 */}
        {BUILDINGS.map((b) => {
          const [sx, sy] = projectIso(b.frontX, b.frontY, 0);
          const [rx, ry] = projectIso(b.roofX, b.roofY, b.roofZ + extraH);

          // Name tag width: 7px per char + 14px padding (Section 5)
          const tagW = b.name.length * 7 + 14;
          const isHovered = hoveredBuilding === b.id;

          // Check live badge condition
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

          return (
            <g
              key={b.id}
              className="cursor-pointer group"
              onClick={() => handleBuildingClick(b)}
              onMouseEnter={() => setHoveredBuilding(b.id)}
              onMouseLeave={() => setHoveredBuilding(null)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBuildingClick(b);
                }
              }}
            >
              {/* Click circle hotspot */}
              <circle
                cx={sx}
                cy={sy - 15}
                r="42"
                fill="transparent"
              />

              {/* Live Badge floating above roof (Section 5) */}
              {liveBadge && (
                <g transform={`translate(${rx}, ${ry - 14})`}>
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

              {/* Name Tag directly under building's front-centre point (Section 2 & 5) */}
              <g transform={`translate(${sx}, ${sy + 6})`}>
                <rect
                  x={-tagW / 2}
                  y="-8"
                  width={tagW}
                  height="17"
                  rx="3"
                  fill="#FFF6E0"
                  opacity={isHovered ? 1.0 : 0.92}
                  stroke={isHovered ? '#FFD95A' : '#D9A05E'}
                  strokeWidth={isHovered ? 2 : 1}
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontFamily="var(--font-body), monospace, sans-serif"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#2B3440"
                >
                  {b.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Hover Floating Guide Strip */}
      {hoveredBuilding && (
        <div className="absolute bottom-2 left-2 right-2 bg-[#1B1B1F]/90 border border-[#FFD95A] px-3 py-1.5 flex items-center justify-between text-xs text-[#FFF4D6] font-body pointer-events-none animate-fadeIn">
          <span className="font-heading text-[#FFD95A] text-[10px] uppercase">
            {BUILDINGS.find((b) => b.id === hoveredBuilding)?.name}
          </span>
          <span>
            {BUILDINGS.find((b) => b.id === hoveredBuilding)?.desc} (Click or walk here to enter)
          </span>
        </div>
      )}
    </div>
  );
}
