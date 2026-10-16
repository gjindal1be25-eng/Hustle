'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { calculateOpportunityCostEngine, formatInr } from '@/lib/teaching';
import { StonePanel } from '@/components/ui/StonePanel';
import { playButtonSound } from '@/lib/sound';

export function OpportunityCostTimeMachine() {
  const [dailyLeak, setDailyLeak] = useState<number>(100);
  const [years, setYears] = useState<number>(10);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const presets = [
    { label: 'Chai & Samosa (₹50)', value: 50 },
    { label: 'Takeout / Latte (₹100)', value: 100 },
    { label: 'Cab / Delivery (₹200)', value: 200 },
    { label: 'Weekend Splurge (₹500)', value: 500 },
  ];

  const yearOptions = [5, 10, 20, 30];

  const result = useMemo(() => {
    return calculateOpportunityCostEngine(dailyLeak, years);
  }, [dailyLeak, years]);

  // Chart Dimensions
  const svgWidth = 620;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 35, left: 65 };

  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Max value for scale
  const maxVal = Math.max(
    ...result.chartPoints.map((p) => Math.max(p.niftyValue, p.principal, p.fdValue)),
    1000
  );

  const getX = useCallback(
    (y: number) => padding.left + (y / years) * innerWidth,
    [padding.left, years, innerWidth]
  );
  const getY = useCallback(
    (val: number) => padding.top + innerHeight - (val / maxVal) * innerHeight,
    [padding.top, innerHeight, maxVal]
  );

  // Generate SVG path strings
  const niftyPath = useMemo(() => {
    return result.chartPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.niftyValue)}`)
      .join(' ');
  }, [result.chartPoints, getX, getY]);

  const fdPath = useMemo(() => {
    return result.chartPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.fdValue)}`)
      .join(' ');
  }, [result.chartPoints, getX, getY]);

  const cashPath = useMemo(() => {
    return result.chartPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.cashPurchasingPower)}`)
      .join(' ');
  }, [result.chartPoints, getX, getY]);

  const principalPath = useMemo(() => {
    return result.chartPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.principal)}`)
      .join(' ');
  }, [result.chartPoints, getX, getY]);

  // Area fill for Nifty
  const niftyArea = `${niftyPath} L ${getX(years)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  const activePoint = hoveredYear !== null
    ? result.chartPoints.find((p) => p.year === hoveredYear) || result.chartPoints[result.chartPoints.length - 1]
    : result.chartPoints[result.chartPoints.length - 1];

  return (
    <StonePanel className="space-y-5">
      {/* Header and Core Philosophy */}
      <div className="space-y-1.5 pb-2 border-b border-[#4B515A]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-heading text-xs sm:text-sm text-[#FFD95A] flex items-center gap-1.5">
            <span>⏳</span>
            <span>THE OPPORTUNITY COST TIME MACHINE</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/40">
            Rule of 72: Doubling every 6 yrs @ 12%
          </span>
        </div>
        <p className="text-xs text-[#B4BAC4]">
          Every small daily leak (chai, takeout, impulse delivery) is a missed compounding engine. Slide the controls below to travel forward in time and witness the exponential curve.
        </p>
      </div>

      {/* Preset Buttons & Slider Controls */}
      <div className="space-y-3 bg-[#1B1B1F] p-3 sm:p-4 rounded border border-[#4B515A]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-[#FFF4D6] uppercase tracking-wider">
            Daily Small Leak / Savings:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-heading text-[#FFD95A]">
              ₹{dailyLeak}/day
            </span>
            <span className="text-xs text-[#8E929A] font-mono">
              (₹{result.monthlyAmount.toLocaleString('en-IN')}/mo)
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={20}
            max={1000}
            step={10}
            value={dailyLeak}
            onChange={(e) => setDailyLeak(parseInt(e.target.value, 10))}
            className="w-full accent-[#FFD95A] h-2 bg-[#2E333B] rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E929A] font-mono">
            <span>₹20/day</span>
            <span>₹250/day</span>
            <span>₹500/day</span>
            <span>₹1,000/day</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setDailyLeak(p.value);
                playButtonSound();
              }}
              className={`text-[10px] sm:text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                dailyLeak === p.value
                  ? 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] font-bold'
                  : 'bg-[#2E333B] text-[#B4BAC4] border-[#4B515A] hover:text-[#FFF4D6]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Horizon Selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-bold text-[#FFF4D6]">Select Time Horizon:</span>
        <div className="flex gap-1.5">
          {yearOptions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                setYears(y);
                setHoveredYear(null);
                playButtonSound();
              }}
              className={`text-xs px-3 py-1 font-heading border cursor-pointer transition-colors ${
                years === y
                  ? 'bg-[#2A9D8F] text-[#FFF4D6] border-[#FFD95A] font-bold shadow'
                  : 'bg-[#1B1B1F] text-[#B4BAC4] border-[#4B515A] hover:text-[#FFF4D6]'
              }`}
            >
              {y} Years
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Multi-Curve SVG Chart */}
      <div className="bg-[#121316] p-2 sm:p-3 rounded border border-[#4B515A] space-y-2">
        <div className="flex items-center justify-between text-[11px] px-1 text-[#B4BAC4]">
          <span className="font-heading text-[#FFD95A] text-xs">
            Year {activePoint.year} Compounding Projection
          </span>
          <span className="text-[#8E929A] italic text-[10px]">
            Hover or tap chart to inspect specific years
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[500px] select-none"
          >
            <defs>
              <linearGradient id="niftyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A9D8F" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2A9D8F" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const yPos = padding.top + innerHeight * (1 - ratio);
              const val = maxVal * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={svgWidth - padding.right}
                    y2={yPos}
                    stroke="#2E333B"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={yPos + 3}
                    textAnchor="end"
                    fill="#8E929A"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {formatInr(val)}
                  </text>
                </g>
              );
            })}

            {/* Year X-Axis Labels */}
            {result.chartPoints.map((p) => {
              if (p.year % (years <= 10 ? 2 : 5) !== 0 && p.year !== years) return null;
              const xPos = getX(p.year);
              return (
                <g key={p.year}>
                  <line
                    x1={xPos}
                    y1={padding.top + innerHeight}
                    x2={xPos}
                    y2={padding.top + innerHeight + 4}
                    stroke="#4B515A"
                  />
                  <text
                    x={xPos}
                    y={padding.top + innerHeight + 16}
                    textAnchor="middle"
                    fill="#8E929A"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    Yr {p.year}
                  </text>
                </g>
              );
            })}

            {/* Nifty 50 Area Fill */}
            <path d={niftyArea} fill="url(#niftyGradient)" />

            {/* 1. Cash (Eroded by inflation) Curve */}
            <path
              d={cashPath}
              fill="none"
              stroke="#E76F51"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* 2. Total Cash Deposited (Baseline Principal) */}
            <path
              d={principalPath}
              fill="none"
              stroke="#B4BAC4"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.6"
            />

            {/* 3. Bank FD (6.5%) Curve */}
            <path d={fdPath} fill="none" stroke="#FFD95A" strokeWidth="2.5" />

            {/* 4. Nifty 50 (12% CAGR) Curve */}
            <path d={niftyPath} fill="none" stroke="#2A9D8F" strokeWidth="3.5" />

            {/* Interactive Year Hover Columns */}
            {result.chartPoints.map((p) => {
              const xPos = getX(p.year);
              return (
                <rect
                  key={p.year}
                  x={xPos - innerWidth / (years * 2)}
                  y={padding.top}
                  width={innerWidth / years}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer hover:fill-white/5"
                  onMouseEnter={() => setHoveredYear(p.year)}
                />
              );
            })}

            {/* Active Year Vertical Guide Line */}
            {activePoint && (
              <g>
                <line
                  x1={getX(activePoint.year)}
                  y1={padding.top}
                  x2={getX(activePoint.year)}
                  y2={padding.top + innerHeight}
                  stroke="#FFF4D6"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                {/* Dots on Curves */}
                <circle
                  cx={getX(activePoint.year)}
                  cy={getY(activePoint.niftyValue)}
                  r="4.5"
                  fill="#2A9D8F"
                  stroke="#FFF4D6"
                  strokeWidth="1.5"
                />
                <circle
                  cx={getX(activePoint.year)}
                  cy={getY(activePoint.fdValue)}
                  r="3.5"
                  fill="#FFD95A"
                  stroke="#1B1B1F"
                  strokeWidth="1"
                />
                <circle
                  cx={getX(activePoint.year)}
                  cy={getY(activePoint.cashPurchasingPower)}
                  r="3.5"
                  fill="#E76F51"
                  stroke="#1B1B1F"
                  strokeWidth="1"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] sm:text-xs pt-2 border-t border-[#2E333B]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#2A9D8F] rounded" />
            <strong className="text-[#2A9D8F]">Nifty 50 Index (12% CAGR)</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#FFD95A] rounded" />
            <span className="text-[#FFD95A]">Bank FD (6.5% pre-tax)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#E76F51] border-b border-dashed" />
            <span className="text-[#E76F51]">Under Mattress (6% Inflation Loss)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#B4BAC4] opacity-60" />
            <span className="text-[#B4BAC4]">Total Principal Invested</span>
          </div>
        </div>
      </div>

      {/* Key Metric Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-[#1B1B1F] p-2.5 rounded border border-[#4B515A]">
          <span className="text-[10px] text-[#8E929A] uppercase block">
            Principal Out of Pocket
          </span>
          <span className="text-sm sm:text-base font-heading text-[#FFF4D6]">
            {formatInr(activePoint.principal)}
          </span>
          <span className="text-[9px] text-[#B4BAC4] block mt-0.5">
            ₹{dailyLeak * 365}/year saved
          </span>
        </div>

        <div className="bg-[#1B1B1F] p-2.5 rounded border border-[#E76F51]/40">
          <span className="text-[10px] text-[#E76F51] uppercase block">
            Mattress (Inflation)
          </span>
          <span className="text-sm sm:text-base font-heading text-[#E76F51]">
            {formatInr(activePoint.cashPurchasingPower)}
          </span>
          <span className="text-[9px] text-[#8E929A] block mt-0.5">
            Lost {formatInr(activePoint.principal - activePoint.cashPurchasingPower)} to inflation
          </span>
        </div>

        <div className="bg-[#1B1B1F] p-2.5 rounded border border-[#FFD95A]/40">
          <span className="text-[10px] text-[#FFD95A] uppercase block">
            Fixed Deposit (6.5%)
          </span>
          <span className="text-sm sm:text-base font-heading text-[#FFD95A]">
            {formatInr(activePoint.fdValue)}
          </span>
          <span className="text-[9px] text-[#8E929A] block mt-0.5">
            Pre-tax bank growth
          </span>
        </div>

        <div className="bg-[#1B1B1F] p-2.5 rounded border-2 border-[#2A9D8F] shadow-[0_0_12px_rgba(42,157,143,0.3)]">
          <span className="text-[10px] text-[#2A9D8F] font-bold uppercase block">
            Nifty 50 Index (12%)
          </span>
          <span className="text-sm sm:text-base font-heading text-[#2A9D8F]">
            {formatInr(activePoint.niftyValue)}
          </span>
          <span className="text-[9px] text-[#FFF4D6] block mt-0.5">
            +{formatInr(activePoint.niftyValue - activePoint.principal)} wealth created
          </span>
        </div>
      </div>

      {/* The Punchline Box */}
      <div className="p-3 bg-[#23252B] rounded border border-[#FFD95A] space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-[#FFD95A] font-bold">
          <span>⚡</span>
          <span>THE REAL COST OF INERTIA:</span>
        </div>
        <p className="text-xs text-[#FFF4D6] leading-relaxed">
          Leaving this ₹{dailyLeak}/day unchecked doesn’t just cost ₹{result.annualAmount.toLocaleString('en-IN')} a year. Over {years} years, the opportunity cost gap is{' '}
          <strong className="text-[#2A9D8F] font-bold">
            {formatInr(result.opportunityCostGap)}
          </strong>
          . In the Indian market, equity index compounding doubles every 6 years via the Rule of 72. That is the down payment of a home, your children’s education, or years of financial freedom.
        </p>
      </div>
    </StonePanel>
  );
}
