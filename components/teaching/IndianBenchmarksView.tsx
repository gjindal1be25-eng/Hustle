'use client';

import React, { useState } from 'react';
import { INDIAN_BENCHMARKS } from '@/lib/teaching';
import { StonePanel } from '@/components/ui/StonePanel';

export function IndianBenchmarksView() {
  const [salaryInput, setSalaryInput] = useState<string>('60000');
  const [loanEmiInput, setLoanEmiInput] = useState<string>('15000');

  const salaryNum = parseFloat(salaryInput) || 0;
  const emiNum = parseFloat(loanEmiInput) || 0;

  const emiRatio = salaryNum > 0 ? (emiNum / salaryNum) * 100 : 0;
  const maxSafeEmi = Math.round(salaryNum * 0.35);

  return (
    <StonePanel className="space-y-5">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[#4B515A]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-heading text-xs sm:text-sm text-[#FFD95A] flex items-center gap-1.5">
            <span>🇮🇳</span>
            <span>GROUNDED INDIAN FINANCIAL BENCHMARKS</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/40">
            Domestic Realities
          </span>
        </div>
        <p className="text-xs text-[#B4BAC4]">
          Forget generic 401(k) rules that don’t apply to India. Master the actual domestic rules of thumb that protect your family from bankruptcy and debt traps.
        </p>
      </div>

      {/* Interactive 30% EMI Cap Calculator Box */}
      <div className="bg-[#1B1B1F] p-4 rounded border-2 border-[#B79A60] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-heading text-xs text-[#FFD95A] flex items-center gap-1.5">
            <span>🛡️</span>
            <span>INTERACTIVE TEST: THE 30% FIXED EMI CEILING</span>
          </span>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              emiRatio > 35
                ? 'bg-[#E76F51]/20 text-[#E76F51] border-[#E76F51]'
                : emiRatio > 30
                ? 'bg-[#FFD95A]/20 text-[#FFD95A] border-[#FFD95A]'
                : 'bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]'
            }`}
          >
            {emiRatio.toFixed(1)}% of Monthly Income
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[#B4BAC4] mb-1 font-bold">
              Net In-Hand Monthly Salary (₹):
            </label>
            <input
              type="number"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              className="w-full bg-[#2E333B] border border-[#4B515A] text-[#FFF4D6] p-2 rounded focus:outline-none focus:border-[#FFD95A] font-mono"
              placeholder="e.g. 60000"
            />
          </div>
          <div>
            <label className="block text-[#B4BAC4] mb-1 font-bold">
              Total Monthly Loan EMIs (Home + Car + Personal):
            </label>
            <input
              type="number"
              value={loanEmiInput}
              onChange={(e) => setLoanEmiInput(e.target.value)}
              className="w-full bg-[#2E333B] border border-[#4B515A] text-[#FFF4D6] p-2 rounded focus:outline-none focus:border-[#FFD95A] font-mono"
              placeholder="e.g. 15000"
            />
          </div>
        </div>

        {/* Live Calculation Feedback */}
        <div className="p-3 bg-[#23252B] rounded border border-[#4B515A] text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[#B4BAC4]">Your Maximum Safe EMI (35% Ceiling):</span>
            <strong className="text-[#FFD95A] font-heading font-bold text-sm">
              ₹{maxSafeEmi.toLocaleString('en-IN')}/month
            </strong>
          </div>
          <p
            className={`text-xs pt-1 border-t border-[#3A3F47] ${
              emiRatio > 35
                ? 'text-[#E76F51] font-bold'
                : 'text-[#2A9D8F]'
            }`}
          >
            {emiRatio > 35
              ? `⚠️ DANGER: Your EMIs exceed the 35% Indian safety threshold by ₹${Math.round(
                  emiNum - maxSafeEmi
                ).toLocaleString('en-IN')}/mo! If floating interest rates rise by 1.5%, you face loan tenure extensions or default.`
              : `✓ HEALTHY: Your EMIs are safely within the 35% domestic buffer. You maintain room for unexpected lifestyle and medical shocks.`}
          </p>
        </div>
      </div>

      {/* Benchmark Cards Grid */}
      <div className="space-y-3">
        {INDIAN_BENCHMARKS.map((bm) => (
          <div
            key={bm.id}
            className="bg-[#1B1B1F] p-4 rounded border border-[#4B515A] space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFD95A]/15 text-[#FFD95A] border border-[#FFD95A]/30 uppercase tracking-wider inline-block mb-1">
                  {bm.badge}
                </span>
                <h3 className="font-heading text-xs sm:text-sm text-[#FFF4D6]">
                  {bm.title}
                </h3>
              </div>
            </div>

            {/* The Golden Rule */}
            <div className="p-2.5 bg-[#2A9D8F]/15 border-l-3 border-[#2A9D8F] text-xs text-[#FFF4D6] font-bold">
              Rule: {bm.benchmarkRule}
            </div>

            {/* Why It Matters */}
            <div className="text-xs text-[#B4BAC4] space-y-1 leading-relaxed">
              <strong className="text-[#FFF4D6] block">Why This Matters:</strong>
              <p>{bm.whyItMatters}</p>
            </div>

            {/* Domestic Indian Context */}
            <div className="text-xs text-[#D4A373] bg-[#23252B] p-2.5 rounded border border-[#4B515A] space-y-1 leading-relaxed">
              <strong className="text-[#FFD95A] block">🇮🇳 The Indian Reality:</strong>
              <p>{bm.indianContext}</p>
            </div>

            {/* Actionable Step */}
            <div className="text-xs text-[#2A9D8F] font-bold flex items-center gap-1.5 pt-1">
              <span>➔</span>
              <span>Action: {bm.actionableStep}</span>
            </div>
          </div>
        ))}
      </div>
    </StonePanel>
  );
}
