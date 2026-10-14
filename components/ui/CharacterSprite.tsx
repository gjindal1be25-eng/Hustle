'use client';

import React from 'react';

export type MoodType =
  | 'neutral'
  | 'happy'
  | 'worried'
  | 'sad'
  | 'side-eye'
  | 'celebrating';

interface CharacterSpriteProps {
  hairColor?: string;
  outfitColor?: string;
  mood?: MoodType;
  size?: number;
  className?: string;
  animate?: boolean;
  facing?: 'left' | 'right';
}

export function CharacterSprite({
  hairColor = '#2C1810',
  outfitColor = '#2B4C7E',
  mood = 'neutral',
  size = 64,
  className = '',
  animate = true,
  facing = 'right',
}: CharacterSpriteProps) {
  const skin = '#F1C27D';
  const skinShadow = '#D9A05E';
  const trousers = '#3A4A9A';
  const trousersShadow = '#28346E';
  const shoes = '#1B1B1F';

  return (
    <div
      className={`inline-block ${animate ? 'animate-idle-bob' : ''} ${className}`}
      style={{
        width: size,
        height: size * 1.5,
        transform: facing === 'left' ? 'scaleX(-1)' : 'none',
      }}
    >
      <svg
        viewBox="0 0 16 24"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="w-full h-full drop-shadow-md"
      >
        {/* Hair Top / Cap */}
        <rect x="4" y="1" width="8" height="3" fill={hairColor} />
        <rect x="3" y="2" width="10" height="2" fill={hairColor} />
        <rect x="3" y="4" width="2" height="3" fill={hairColor} />
        <rect x="11" y="4" width="2" height="3" fill={hairColor} />

        {/* Head / Skin */}
        <rect x="5" y="3" width="6" height="5" fill={skin} />
        <rect x="4" y="4" width="8" height="4" fill={skin} />
        {/* Neck */}
        <rect x="6" y="8" width="4" height="1" fill={skinShadow} />

        {/* Faces / Mood Expressions */}
        {mood === 'neutral' && (
          <g>
            {/* Eyes */}
            <rect x="5" y="5" width="2" height="2" fill="#1B1B1F" />
            <rect x="9" y="5" width="2" height="2" fill="#1B1B1F" />
            <rect x="5" y="5" width="1" height="1" fill="#FFFFFF" />
            <rect x="9" y="5" width="1" height="1" fill="#FFFFFF" />
            {/* Mouth */}
            <rect x="7" y="7" width="2" height="1" fill="#5C3826" />
          </g>
        )}

        {mood === 'happy' && (
          <g>
            {/* Closed joyful eyes */}
            <rect x="5" y="5" width="2" height="1" fill="#1B1B1F" />
            <rect x="9" y="5" width="2" height="1" fill="#1B1B1F" />
            <rect x="5" y="4" width="1" height="1" fill="#1B1B1F" />
            <rect x="10" y="4" width="1" height="1" fill="#1B1B1F" />
            {/* Smile */}
            <rect x="6" y="7" width="4" height="1" fill="#EE6A5E" />
            <rect x="7" y="8" width="2" height="1" fill="#FFFFFF" />
          </g>
        )}

        {mood === 'worried' && (
          <g>
            {/* Wide nervous eyes */}
            <rect x="5" y="5" width="2" height="2" fill="#1B1B1F" />
            <rect x="9" y="5" width="2" height="2" fill="#1B1B1F" />
            {/* Sweat drop */}
            <rect x="12" y="3" width="1" height="2" fill="#59B9F2" />
            {/* Wavy mouth */}
            <rect x="6" y="7" width="4" height="1" fill="#5C3826" />
            <rect x="8" y="7" width="1" height="1" fill={skin} />
          </g>
        )}

        {mood === 'sad' && (
          <g>
            {/* Droopy eyes */}
            <rect x="5" y="5" width="2" height="2" fill="#1B1B1F" />
            <rect x="9" y="5" width="2" height="2" fill="#1B1B1F" />
            {/* Tear */}
            <rect x="5" y="7" width="1" height="2" fill="#59B9F2" />
            {/* Frown */}
            <rect x="6" y="8" width="4" height="1" fill="#5C3826" />
          </g>
        )}

        {mood === 'side-eye' && (
          <g>
            {/* Eyes looking to the right */}
            <rect x="5" y="5" width="2" height="2" fill="#FFFFFF" />
            <rect x="9" y="5" width="2" height="2" fill="#FFFFFF" />
            <rect x="6" y="5" width="1" height="2" fill="#1B1B1F" />
            <rect x="10" y="5" width="1" height="2" fill="#1B1B1F" />
            {/* Smirk */}
            <rect x="8" y="7" width="2" height="1" fill="#5C3826" />
          </g>
        )}

        {mood === 'celebrating' && (
          <g>
            {/* Starry joyful expression */}
            <rect x="5" y="4" width="2" height="2" fill="#FFD95A" />
            <rect x="9" y="4" width="2" height="2" fill="#FFD95A" />
            <rect x="6" y="4" width="1" height="2" fill="#1B1B1F" />
            <rect x="10" y="4" width="1" height="2" fill="#1B1B1F" />
            {/* Open cheer mouth */}
            <rect x="6" y="7" width="4" height="2" fill="#EE6A5E" />
            <rect x="7" y="7" width="2" height="1" fill="#FFFFFF" />
          </g>
        )}

        {/* Torso / Outfit */}
        <rect x="4" y="9" width="8" height="6" fill={outfitColor} />
        {/* Collar & Belt */}
        <rect x="7" y="9" width="2" height="2" fill="#FFF4D6" />
        <rect x="4" y="14" width="8" height="1" fill="#1B1B1F" />
        <rect x="7" y="14" width="2" height="1" fill="#FFD95A" />

        {/* Arms */}
        {mood === 'celebrating' ? (
          // Arms raised!
          <g>
            <rect x="2" y="6" width="2" height="5" fill={outfitColor} />
            <rect x="12" y="6" width="2" height="5" fill={outfitColor} />
            <rect x="2" y="5" width="2" height="2" fill={skin} />
            <rect x="12" y="5" width="2" height="2" fill={skin} />
          </g>
        ) : (
          // Arms by sides
          <g>
            <rect x="2" y="9" width="2" height="5" fill={outfitColor} />
            <rect x="12" y="9" width="2" height="5" fill={outfitColor} />
            <rect x="2" y="13" width="2" height="2" fill={skin} />
            <rect x="12" y="13" width="2" height="2" fill={skin} />
          </g>
        )}

        {/* Legs / Trousers */}
        <rect x="4" y="15" width="3" height="5" fill={trousers} />
        <rect x="9" y="15" width="3" height="5" fill={trousersShadow} />

        {/* Shoes */}
        <rect x="3" y="20" width="4" height="2" fill={shoes} />
        <rect x="9" y="20" width="4" height="2" fill={shoes} />
      </svg>
    </div>
  );
}
