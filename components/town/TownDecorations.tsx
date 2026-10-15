'use client';

import React from 'react';
import { projectIso } from './Town';

export function CrystalFountain({ idleTick = 0 }: { idleTick?: number }) {
  // Center in the cobblestone plaza at x: 5.3, y: 4.8
  const [isoX, isoY] = projectIso(5.3, 4.8, 0);
  const sprayOffset = Math.sin(idleTick * 5) * 1.5;

  return (
    <g id="deco-crystal-fountain" transform={`translate(${isoX}, ${isoY})`}>
      {/* Outer Basin Ground Shadow */}
      <ellipse cx="0" cy="8" rx="28" ry="15" fill="#1B1B1F" opacity="0.32" />

      {/* Stone Basin Outer Rim */}
      <ellipse cx="0" cy="5" rx="24" ry="12" fill="#8E949C" stroke="#5E636A" strokeWidth="1.5" />
      {/* Stone Basin Inner Depth */}
      <ellipse cx="0" cy="3" rx="20" ry="10" fill="#4AA9E8" />
      {/* Water Shimmer / Ripple */}
      <ellipse
        cx="0"
        cy="3"
        rx={17 + Math.sin(idleTick * 3) * 1.5}
        ry={8 + Math.sin(idleTick * 3) * 0.8}
        fill="#A8E0FC"
        opacity="0.6"
      />

      {/* Center Pillar */}
      <rect x="-4" y="-14" width="8" height="17" fill="#DDE0E6" stroke="#8E949C" strokeWidth="0.8" />

      {/* Upper Tier Basin */}
      <ellipse cx="0" cy="-14" rx="11" ry="5.5" fill="#B4BAC4" stroke="#5E636A" strokeWidth="1" />
      <ellipse cx="0" cy="-15" rx="9" ry="4.5" fill="#59B9F2" />

      {/* Spout Finial */}
      <circle cx="0" cy="-21" r="2.5" fill="#FFD95A" />

      {/* Animated Water Jet Spray */}
      <g stroke="#E0F4FF" strokeWidth="1.2" opacity="0.85" fill="none">
        <path d={`M 0 -22 Q -7 ${-28 + sprayOffset} -10 -15`} />
        <path d={`M 0 -22 Q 7 ${-28 - sprayOffset} 10 -15`} />
        <path d={`M 0 -22 Q -4 ${-26 - sprayOffset} -7 -14`} />
        <path d={`M 0 -22 Q 4 ${-26 + sprayOffset} 7 -14`} />
      </g>
    </g>
  );
}

export function RiversideGazebo() {
  // East bank at x: 11.6, y: 6.2
  const [isoX, isoY] = projectIso(11.6, 6.2, 0);

  return (
    <g id="deco-riverside-gazebo" transform={`translate(${isoX}, ${isoY})`}>
      {/* Shadow */}
      <ellipse cx="0" cy="6" rx="26" ry="14" fill="#1B1B1F" opacity="0.3" />

      {/* Stone Base Pad */}
      <ellipse cx="0" cy="4" rx="22" ry="11" fill="#C4CBD4" stroke="#8E949C" strokeWidth="1.2" />

      {/* Wooden Pillars */}
      <rect x="-16" y="-20" width="3.5" height="23" fill="#8A5A2B" />
      <rect x="13" y="-20" width="3.5" height="23" fill="#8A5A2B" />
      <rect x="-7" y="-24" width="3.5" height="27" fill="#6A4521" />
      <rect x="4" y="-24" width="3.5" height="27" fill="#6A4521" />

      {/* Gazebo Railing */}
      <line x1="-16" y1="-5" x2="16" y2="-5" stroke="#C98F4E" strokeWidth="2" />
      <line x1="-16" y1="-10" x2="16" y2="-10" stroke="#C98F4E" strokeWidth="1.5" />

      {/* Ornate Cedar Pagoda Roof */}
      <polygon
        points="0,-36 -22,-20 22,-20"
        fill="#EE6A5E"
        stroke="#B23A30"
        strokeWidth="1.2"
      />
      <polygon
        points="0,-42 -14,-32 14,-32"
        fill="#D9534F"
        stroke="#8A2B23"
        strokeWidth="1"
      />
      {/* Gold roof finial */}
      <circle cx="0" cy="-44" r="2.5" fill="#FFD95A" />
    </g>
  );
}

export function BlossomFlowerbeds() {
  // Flower borders along plaza road edges
  const [isoX1, isoY1] = projectIso(4.2, 4.4, 0);
  const [isoX2, isoY2] = projectIso(6.4, 4.4, 0);

  const renderBed = (isoX: number, isoY: number, key: string) => (
    <g key={key} transform={`translate(${isoX}, ${isoY})`}>
      {/* Wooden Planter Box */}
      <polygon
        points="-14,0 0,-7 14,0 0,7"
        fill="#6A4521"
        stroke="#4A3017"
        strokeWidth="1"
      />
      <polygon
        points="-12,0 0,-6 12,0 0,6"
        fill="#3D261A"
      />
      {/* Blossom flowers */}
      <circle cx="-6" cy="-2" r="2.5" fill="#FF708F" />
      <circle cx="0" cy="-3" r="2.8" fill="#FFD95A" />
      <circle cx="6" cy="-2" r="2.5" fill="#FF9E4A" />
      <circle cx="-3" cy="2" r="2.5" fill="#FFD95A" />
      <circle cx="4" cy="2" r="2.5" fill="#FF708F" />
    </g>
  );

  return (
    <g id="deco-flowerbeds">
      {renderBed(isoX1, isoY1, 'bed_left')}
      {renderBed(isoX2, isoY2, 'bed_right')}
    </g>
  );
}

export function ClocktowerFinial() {
  // Roof of Town Hall at x: 5.5, y: 1.72, z: 3.7
  const [isoX, isoY] = projectIso(5.5, 1.72, 3.8);

  return (
    <g id="deco-clocktower" transform={`translate(${isoX}, ${isoY})`}>
      {/* Clocktower Spire Base */}
      <rect x="-8" y="-18" width="16" height="18" fill="#FFF6E0" stroke="#8E949C" strokeWidth="1" />
      {/* Golden Roman Clock Face */}
      <circle cx="0" cy="-9" r="6" fill="#FFD95A" stroke="#1B1B1F" strokeWidth="1" />
      <line x1="0" y1="-9" x2="0" y2="-13" stroke="#1B1B1F" strokeWidth="1" />
      <line x1="0" y1="-9" x2="2.5" y2="-9" stroke="#1B1B1F" strokeWidth="1" />
      {/* Golden Bell Cupola */}
      <polygon points="0,-28 -10,-18 10,-18" fill="#4C6FFF" stroke="#2B3D8F" strokeWidth="1" />
      <line x1="0" y1="-28" x2="0" y2="-34" stroke="#FFD95A" strokeWidth="1.5" />
      <circle cx="0" cy="-35" r="2" fill="#FFD95A" />
    </g>
  );
}
