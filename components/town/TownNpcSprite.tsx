'use client';

import React from 'react';
import { projectIso } from './Town';
import { NpcDef } from '@/lib/gameplay';

interface TownNpcSpriteProps {
  npc: NpcDef;
  isNearby?: boolean;
  onTalk: (npc: NpcDef) => void;
  idleTick?: number;
}

export function TownNpcSprite({
  npc,
  isNearby = false,
  onTalk,
  idleTick = 0,
}: TownNpcSpriteProps) {
  const [isoX, isoY] = projectIso(npc.x, npc.y, 0);
  const breathY = Math.sin(idleTick * 2 + npc.x) * 0.7;

  return (
    <g
      id={`npc-${npc.id}`}
      transform={`translate(${isoX}, ${isoY})`}
      className="cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation();
        onTalk(npc);
      }}
    >
      {/* Ground Shadow */}
      <ellipse cx="0" cy="2" rx="9" ry="4.5" fill="#1B1B1F" opacity="0.38" />

      {/* Floating Talk Indicator if player is nearby or on hover */}
      <g
        transform={`translate(0, ${-46 + Math.sin(idleTick * 3) * 2})`}
        className={`transition-all duration-200 pointer-events-none select-none ${
          isNearby ? 'opacity-100 scale-105' : 'opacity-85 group-hover:opacity-100'
        }`}
      >
        <rect
          x="-32"
          y="-11"
          width="64"
          height="16"
          rx="4"
          fill="#FFF6E0"
          stroke="#1B1B1F"
          strokeWidth="1.2"
        />
        <polygon points="-3,5 0,8 3,5" fill="#FFF6E0" stroke="#1B1B1F" strokeWidth="1" />
        <rect x="-31" y="-10" width="62" height="14" fill="#FFF6E0" />
        <text
          x="0"
          y="-2"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1B1B1F"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="system-ui"
        >
          💬 {npc.name.split(' ')[0]}
        </text>
      </g>

      {/* NPC Body */}
      <g transform={`translate(0, ${breathY})`}>
        {/* Legs / Trousers */}
        <rect x="-4.5" y="-6" width="3.5" height="7" rx="1" fill="#3D3D48" />
        <rect x="1" y="-6" width="3.5" height="7" rx="1" fill="#2E2E38" />
        {/* Shoes */}
        <rect x="-5" y="0" width="4.5" height="2.5" rx="1" fill="#1B1B1F" />
        <rect x="0.5" y="0" width="4.5" height="2.5" rx="1" fill="#1B1B1F" />

        {/* Torso Shirt */}
        <rect
          x="-6"
          y="-18"
          width="12"
          height="13"
          rx="2"
          fill={npc.shirtColor}
          stroke="#1B1B1F"
          strokeWidth="0.8"
        />

        {/* NPC Unique accessories */}
        {npc.id === 'kaka' && (
          // Chai stall apron & hot tea glass
          <>
            <rect x="-4" y="-15" width="8" height="10" fill="#FFF4D6" opacity="0.85" />
            <rect x="6" y="-14" width="3.5" height="5" rx="1" fill="#D4A373" />
            <text x="8" y="-16" fontSize="6">♨️</text>
          </>
        )}

        {npc.id === 'uncle_sharma' && (
          // Green vest & brown accounts ledger
          <>
            <rect x="-3" y="-16" width="6" height="10" fill="#1D4E47" />
            <rect x="5.5" y="-13" width="5" height="6.5" rx="1" fill="#7F4F24" stroke="#1B1B1F" strokeWidth="0.5" />
          </>
        )}

        {npc.id === 'priya' && (
          // Student satchel & yellow scroll
          <>
            <line x1="-5" y1="-17" x2="5" y2="-9" stroke="#E0A96D" strokeWidth="1.5" />
            <rect x="-7.5" y="-13" width="4" height="6" rx="1" fill="#E0A96D" />
            <rect x="5" y="-14" width="3.5" height="7" rx="1" fill="#FFD95A" />
          </>
        )}

        {/* Head */}
        <circle cx="0" cy="-24" r="6" fill="#F1C27D" stroke="#1B1B1F" strokeWidth="0.8" />

        {/* Hair */}
        <path
          d="M -6 -24 C -6 -31, 6 -31, 6 -24 C 5 -27, -5 -27, -6 -24 Z"
          fill={npc.avatarColor}
        />

        {/* Eyes */}
        <circle cx="-2" cy="-24" r="0.9" fill="#1B1B1F" />
        <circle cx="2.5" cy="-24" r="0.9" fill="#1B1B1F" />

        {/* Specific features */}
        {npc.id === 'uncle_sharma' && (
          // Glasses
          <g stroke="#1B1B1F" strokeWidth="0.7" fill="none">
            <circle cx="-2" cy="-24" r="1.8" />
            <circle cx="2.5" cy="-24" r="1.8" />
            <line x1="-0.2" y1="-24" x2="0.7" y2="-24" />
          </g>
        )}

        {npc.id === 'kaka' && (
          // Mustache
          <path d="M -3 -21 Q 0 -22.5 3 -21" stroke="#3D261A" strokeWidth="1" fill="none" />
        )}

        {/* Friendly smile */}
        <path d="M -1.5 -21 Q 0.5 -19.5 2 -21" stroke="#1B1B1F" strokeWidth="0.8" fill="none" />
      </g>
    </g>
  );
}
