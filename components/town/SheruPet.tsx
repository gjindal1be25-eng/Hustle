'use client';

import React, { useState } from 'react';
import { projectIso } from './Town';

interface SheruPetProps {
  x: number;
  y: number;
  facing?: 'left' | 'right';
  happiness?: number;
  onPet: () => void;
  idleTick?: number;
}

export function SheruPet({
  x,
  y,
  facing = 'right',
  happiness = 85,
  onPet,
  idleTick = 0,
}: SheruPetProps) {
  const [showHeart, setShowHeart] = useState(false);
  const [isoX, isoY] = projectIso(x, y, 0);

  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHeart(true);
    onPet();
    setTimeout(() => setShowHeart(false), 1400);
  };

  // Tail wagging frequency
  const tailAngle = Math.sin(idleTick * 6) * 18;
  const breathY = Math.sin(idleTick * 2.5) * 0.8;
  const isFlip = facing === 'left';

  return (
    <g
      id="sheru-pet"
      transform={`translate(${isoX}, ${isoY})`}
      className="cursor-pointer group"
      onClick={handlePetClick}
    >
      {/* Expanded invisible hit area for easy click & touch interaction */}
      <rect x="-24" y="-30" width="48" height="40" fill="transparent" />

      {/* Dynamic Ground Shadow */}
      <ellipse cx="0" cy="2" rx="10" ry="5" fill="#1B1B1F" opacity="0.35" />

      {/* Floating Heart reaction */}
      {showHeart && (
        <g
          transform="translate(0, -38)"
          className="animate-bounce select-none pointer-events-none"
        >
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg"
          >
            ❤️
          </text>
        </g>
      )}

      {/* Hover / Proximity Tooltip Pill */}
      <g
        transform="translate(0, -28)"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none"
      >
        <rect
          x="-36"
          y="-11"
          width="72"
          height="16"
          rx="4"
          fill="#FFF6E0"
          stroke="#1B1B1F"
          strokeWidth="1.2"
        />
        <text
          x="0"
          y="-2"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1B1B1F"
          fontSize="9"
          fontWeight="bold"
          fontFamily="system-ui"
        >
          Sheru 🐾 {happiness}%
        </text>
      </g>

      {/* Dog Sprite Container (with flip if facing left) */}
      <g
        transform={`scale(${isFlip ? -1 : 1}, 1) translate(0, ${breathY})`}
        shapeRendering="crispEdges"
      >
        {/* Tail (wagging) */}
        <g transform={`translate(-8, -8) rotate(${tailAngle})`}>
          <path
            d="M 0 0 C -4 -4, -6 -8, -3 -11 C -1 -8, 2 -4, 0 0 Z"
            fill="#E5A84B"
            stroke="#BA7B2B"
            strokeWidth="0.8"
          />
        </g>

        {/* Back legs */}
        <rect x="-8" y="-3" width="3.5" height="5" rx="1.5" fill="#C98A32" />
        <rect x="-4" y="-3" width="3.5" height="5" rx="1.5" fill="#BA7B2B" />

        {/* Dog Torso */}
        <rect
          x="-8"
          y="-12"
          width="15"
          height="10"
          rx="4"
          fill="#E5A84B"
          stroke="#BA7B2B"
          strokeWidth="0.8"
        />
        {/* Chest cream fluff */}
        <path
          d="M 1 -11 Q 5 -7 3 -3 Q -1 -6 1 -11 Z"
          fill="#FDE4B0"
        />

        {/* Red Collar & Golden Tag */}
        <rect x="4" y="-12" width="2.5" height="7" rx="1" fill="#E76F51" />
        <circle cx="5" cy="-8.5" r="1.2" fill="#FFD95A" />

        {/* Front legs */}
        <rect x="2" y="-3" width="3.2" height="5.5" rx="1.5" fill="#E5A84B" />
        <rect x="6" y="-3" width="3.2" height="5.5" rx="1.5" fill="#D8993C" />

        {/* Dog Head */}
        <g transform="translate(6, -15)">
          {/* Snout */}
          <rect x="2" y="3" width="6" height="4" rx="2" fill="#FDE4B0" />
          <ellipse cx="7" cy="4" rx="1.2" ry="0.9" fill="#1B1B1F" />

          {/* Head Base */}
          <circle cx="2" cy="2" r="5.5" fill="#E5A84B" stroke="#BA7B2B" strokeWidth="0.6" />

          {/* Floppy Ear */}
          <path
            d="M 0 -2 C -3 0, -4 6, -1 8 C 1 8, 2 3, 1 -2 Z"
            fill="#BA7B2B"
          />

          {/* Eye */}
          <circle cx="3" cy="1" r="1.1" fill="#1B1B1F" />
          <circle cx="3.4" cy="0.6" r="0.4" fill="#FFFFFF" />

          {/* Happy tongue if high happiness */}
          {happiness >= 80 && (
            <path
              d="M 5 7 Q 6 9.5 7 7 Z"
              fill="#FF708F"
            />
          )}
        </g>
      </g>
    </g>
  );
}
