import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export function CoinIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`inline-block ${className}`}
      shapeRendering="crispEdges"
    >
      <rect x="3" y="1" width="10" height="14" fill="#FFD95A" />
      <rect x="2" y="3" width="12" height="10" fill="#FFD95A" />
      <rect x="4" y="2" width="8" height="12" fill="#FFEAA7" />
      <rect x="3" y="4" width="10" height="8" fill="#FFEAA7" />
      <rect x="6" y="5" width="4" height="6" fill="#D4A310" />
      <rect x="7" y="4" width="2" height="8" fill="#D4A310" />
      {/* ₹ symbol hint */}
      <rect x="6" y="6" width="4" height="1" fill="#8F6B00" />
      <rect x="6" y="8" width="3" height="1" fill="#8F6B00" />
    </svg>
  );
}

export function HeartIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`inline-block ${className}`}
      shapeRendering="crispEdges"
    >
      <rect x="2" y="3" width="4" height="4" fill="#EE6A5E" />
      <rect x="10" y="3" width="4" height="4" fill="#EE6A5E" />
      <rect x="3" y="2" width="2" height="2" fill="#EE6A5E" />
      <rect x="11" y="2" width="2" height="2" fill="#EE6A5E" />
      <rect x="1" y="4" width="14" height="5" fill="#EE6A5E" />
      <rect x="3" y="9" width="10" height="3" fill="#EE6A5E" />
      <rect x="5" y="12" width="6" height="2" fill="#EE6A5E" />
      <rect x="7" y="14" width="2" height="1" fill="#EE6A5E" />
      <rect x="3" y="4" width="2" height="2" fill="#FFA5A5" />
    </svg>
  );
}

export function TownIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`inline-block ${className}`}
      shapeRendering="crispEdges"
    >
      <rect x="2" y="8" width="12" height="7" fill="#8E949C" />
      <rect x="6" y="10" width="4" height="5" fill="#5C3826" />
      <rect x="1" y="6" width="14" height="2" fill="#EE6A5E" />
      <rect x="3" y="4" width="10" height="2" fill="#EE6A5E" />
      <rect x="5" y="2" width="6" height="2" fill="#EE6A5E" />
      <rect x="7" y="1" width="2" height="1" fill="#FFD95A" />
      <rect x="3" y="9" width="2" height="2" fill="#A9DCF7" />
      <rect x="11" y="9" width="2" height="2" fill="#A9DCF7" />
    </svg>
  );
}

export function GearIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`inline-block ${className}`}
      shapeRendering="crispEdges"
    >
      <rect x="6" y="1" width="4" height="14" fill="#B4BAC4" />
      <rect x="1" y="6" width="14" height="4" fill="#B4BAC4" />
      <rect x="3" y="3" width="10" height="10" fill="#B4BAC4" />
      <rect x="4" y="4" width="8" height="8" fill="#8E949C" />
      <rect x="6" y="6" width="4" height="4" fill="#1B1B1F" />
    </svg>
  );
}

export function ArrowBackIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`inline-block ${className}`}
      shapeRendering="crispEdges"
    >
      <rect x="8" y="3" width="2" height="2" fill="currentColor" />
      <rect x="6" y="5" width="2" height="2" fill="currentColor" />
      <rect x="4" y="7" width="2" height="2" fill="currentColor" />
      <rect x="2" y="7" width="2" height="2" fill="currentColor" />
      <rect x="4" y="9" width="2" height="2" fill="currentColor" />
      <rect x="6" y="11" width="2" height="2" fill="currentColor" />
      <rect x="8" y="13" width="2" height="2" fill="currentColor" />
      <rect x="6" y="7" width="8" height="2" fill="currentColor" />
    </svg>
  );
}

export function TrophyIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`inline-block ${className}`}
      shapeRendering="crispEdges"
    >
      <rect x="4" y="2" width="8" height="7" fill="#FFD95A" />
      <rect x="2" y="3" width="2" height="4" fill="#D4A310" />
      <rect x="12" y="3" width="2" height="4" fill="#D4A310" />
      <rect x="6" y="9" width="4" height="3" fill="#B67F41" />
      <rect x="4" y="12" width="8" height="2" fill="#5C3826" />
      <rect x="5" y="4" width="2" height="3" fill="#FFEAA7" />
    </svg>
  );
}
