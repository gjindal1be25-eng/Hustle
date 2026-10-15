'use client';

import React from 'react';
import { projectIso } from './Town';
import { MoodType } from '@/components/ui/CharacterSprite';

interface TownCharacterProps {
  x: number;
  y: number;
  facing?: 'left' | 'right';
  isWalking?: boolean;
  walkStep?: number;
  hairColor?: string;
  outfitColor?: string;
  mood?: MoodType;
  isEntering?: boolean;
}

export function TownCharacter({
  x,
  y,
  facing = 'right',
  isWalking = false,
  walkStep = 0,
  hairColor = '#2C1810',
  outfitColor = '#2B4C7E',
  mood = 'neutral',
  isEntering = false,
}: TownCharacterProps) {
  const [isoX, isoY] = projectIso(x, y, 0);

  const skin = '#F1C27D';
  const skinShadow = '#D9A05E';
  const trousers = '#3A4A9A';
  const trousersShadow = '#28346E';
  const shoes = '#1B1B1F';

  // Walk stride alternating
  const isAltStep = walkStep % 2 === 1;
  const bobY = isWalking ? (isAltStep ? -1.5 : 0) : 0;

  return (
    <g
      id="town-character"
      transform={`translate(${isoX}, ${isoY})`}
      shapeRendering="crispEdges"
      className="transition-opacity duration-200"
      style={{ opacity: isEntering ? 0.25 : 1 }}
    >
      {/* Soft Ground Shadow on road */}
      <ellipse cx="0" cy="0" rx="9" ry="4.5" fill="#1B1B1F" opacity="0.4" />

      {/* Character Figure scaled 1.5x with feet pinned to ground */}
      <g
        transform={`scale(${facing === 'left' ? -1.5 : 1.5}, 1.5) translate(-8, -22)`}
      >
        {/* Head Bob / Walk Stride Offset */}
        <g transform={`translate(0, ${bobY})`}>
          {/* Hair Top & Cap */}
          <rect x="4" y="1" width="8" height="3" fill={hairColor} />
          <rect x="3" y="2" width="10" height="2" fill={hairColor} />
          <rect x="3" y="4" width="2" height="3" fill={hairColor} />
          <rect x="11" y="4" width="2" height="3" fill={hairColor} />

          {/* Head & Skin */}
          <rect x="5" y="3" width="6" height="5" fill={skin} />
          <rect x="4" y="4" width="8" height="4" fill={skin} />
          {/* Neck */}
          <rect x="6" y="8" width="4" height="1" fill={skinShadow} />

          {/* Facial Expressions */}
          {mood === 'neutral' && (
            <g>
              <rect x="5" y="5" width="2" height="2" fill="#1B1B1F" />
              <rect x="9" y="5" width="2" height="2" fill="#1B1B1F" />
              <rect x="5" y="5" width="1" height="1" fill="#FFFFFF" />
              <rect x="9" y="5" width="1" height="1" fill="#FFFFFF" />
              <rect x="7" y="7" width="2" height="1" fill="#5C3826" />
            </g>
          )}

          {mood === 'happy' && (
            <g>
              <rect x="5" y="5" width="2" height="1" fill="#1B1B1F" />
              <rect x="9" y="5" width="2" height="1" fill="#1B1B1F" />
              <rect x="5" y="4" width="1" height="1" fill="#1B1B1F" />
              <rect x="10" y="4" width="1" height="1" fill="#1B1B1F" />
              <rect x="6" y="7" width="4" height="1" fill="#EE6A5E" />
              <rect x="7" y="8" width="2" height="1" fill="#FFFFFF" />
            </g>
          )}

          {mood === 'worried' && (
            <g>
              <rect x="5" y="5" width="2" height="2" fill="#1B1B1F" />
              <rect x="9" y="5" width="2" height="2" fill="#1B1B1F" />
              <rect x="12" y="3" width="1" height="2" fill="#59B9F2" />
              <rect x="6" y="7" width="4" height="1" fill="#5C3826" />
              <rect x="8" y="7" width="1" height="1" fill={skin} />
            </g>
          )}

          {mood === 'sad' && (
            <g>
              <rect x="5" y="5" width="2" height="2" fill="#1B1B1F" />
              <rect x="9" y="5" width="2" height="2" fill="#1B1B1F" />
              <rect x="5" y="7" width="1" height="2" fill="#59B9F2" />
              <rect x="6" y="8" width="4" height="1" fill="#5C3826" />
            </g>
          )}

          {mood === 'celebrating' && (
            <g>
              <rect x="5" y="4" width="2" height="2" fill="#FFD95A" />
              <rect x="9" y="4" width="2" height="2" fill="#FFD95A" />
              <rect x="6" y="4" width="1" height="2" fill="#1B1B1F" />
              <rect x="10" y="4" width="1" height="2" fill="#1B1B1F" />
              <rect x="6" y="7" width="4" height="2" fill="#EE6A5E" />
              <rect x="7" y="7" width="2" height="1" fill="#FFFFFF" />
            </g>
          )}

          {mood === 'side-eye' && (
            <g>
              <rect x="5" y="5" width="2" height="2" fill="#FFFFFF" />
              <rect x="9" y="5" width="2" height="2" fill="#FFFFFF" />
              <rect x="6" y="5" width="1" height="2" fill="#1B1B1F" />
              <rect x="10" y="5" width="1" height="2" fill="#1B1B1F" />
              <rect x="8" y="7" width="2" height="1" fill="#5C3826" />
            </g>
          )}

          {/* Torso / Outfit */}
          <rect x="4" y="9" width="8" height="6" fill={outfitColor} />
          {/* White Collar & Gold Belt Buckle */}
          <rect x="7" y="9" width="2" height="2" fill="#FFF4D6" />
          <rect x="4" y="14" width="8" height="1" fill="#1B1B1F" />
          <rect x="7" y="14" width="2" height="1" fill="#FFD95A" />

          {/* Arms with Walking Swing */}
          {mood === 'celebrating' ? (
            <g>
              <rect x="2" y="6" width="2" height="5" fill={outfitColor} />
              <rect x="12" y="6" width="2" height="5" fill={outfitColor} />
              <rect x="2" y="5" width="2" height="2" fill={skin} />
              <rect x="12" y="5" width="2" height="2" fill={skin} />
            </g>
          ) : isWalking ? (
            isAltStep ? (
              <g>
                <rect x="2" y="8" width="2" height="5" fill={outfitColor} />
                <rect x="12" y="10" width="2" height="5" fill={outfitColor} />
                <rect x="2" y="12" width="2" height="2" fill={skin} />
                <rect x="12" y="14" width="2" height="2" fill={skin} />
              </g>
            ) : (
              <g>
                <rect x="2" y="10" width="2" height="5" fill={outfitColor} />
                <rect x="12" y="8" width="2" height="5" fill={outfitColor} />
                <rect x="2" y="14" width="2" height="2" fill={skin} />
                <rect x="12" y="12" width="2" height="2" fill={skin} />
              </g>
            )
          ) : (
            <g>
              <rect x="2" y="9" width="2" height="5" fill={outfitColor} />
              <rect x="12" y="9" width="2" height="5" fill={outfitColor} />
              <rect x="2" y="13" width="2" height="2" fill={skin} />
              <rect x="12" y="13" width="2" height="2" fill={skin} />
            </g>
          )}
        </g>

        {/* Legs & Shoes with Walking Stride */}
        {isWalking ? (
          isAltStep ? (
            <g>
              {/* Left leg slightly forward */}
              <rect x="3" y="15" width="3" height="5" fill={trousers} />
              <rect x="2" y="20" width="4" height="2" fill={shoes} />
              {/* Right leg slightly back */}
              <rect x="10" y="15" width="3" height="5" fill={trousersShadow} />
              <rect x="10" y="20" width="4" height="2" fill={shoes} />
            </g>
          ) : (
            <g>
              {/* Left leg slightly back */}
              <rect x="5" y="15" width="3" height="5" fill={trousers} />
              <rect x="5" y="20" width="4" height="2" fill={shoes} />
              {/* Right leg slightly forward */}
              <rect x="8" y="15" width="3" height="5" fill={trousersShadow} />
              <rect x="8" y="20" width="4" height="2" fill={shoes} />
            </g>
          )
        ) : (
          <g>
            <rect x="4" y="15" width="3" height="5" fill={trousers} />
            <rect x="9" y="15" width="3" height="5" fill={trousersShadow} />
            <rect x="3" y="20" width="4" height="2" fill={shoes} />
            <rect x="9" y="20" width="4" height="2" fill={shoes} />
          </g>
        )}
      </g>
    </g>
  );
}
