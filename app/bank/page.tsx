'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelInput } from '@/components/ui/PixelInput';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { calculateEMI, calculateLoanSummary } from '@/lib/rules';

export default function BankPage() {
  const {
    state,
    avgMonthlyIncome,
    takeLoan,
    closeLoan,
    recordBuildingVisit,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'simulator' | 'active'>('simulator');

  useEffect(() => {
    recordBuildingVisit('bank');
  }, [recordBuildingVisit]);

  // Simulator state
  const [principal, setPrincipal] = useState<string>('50000');
  const [annualRate, setAnnualRate] = useState<string>('12');
  const [months, setMonths] = useState<string>('12');

  const p = Math.max(0, parseFloat(principal) || 0);
  const r = Math.max(0, parseFloat(annualRate) || 0);
  const m = Math.max(1, parseInt(months, 10) || 1);

  const simSummary = calculateLoanSummary(p, r, m, avgMonthlyIncome);
  const isHighRisk = simSummary.emiToIncome > 0.4;

  const activeLoan = state.loan?.active ? state.loan : null;
  const loanTx = state.transactions.filter((t) => t.source === 'loan');
  const emisPaidCount = loanTx.length;

  const handleTakeLoan = () => {
    if (p <= 0 || m <= 0) return;
    takeLoan(p, r, m);
    setActiveTab('active');
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />

      <div className="w-full max-w-[720px] px-3 sm:px-4 py-4 space-y-4 flex-1">
        <WoodFrame
          title="TOWN BANK & LOAN SIMULATOR"
          subtitle="Explore the mathematics of debt, compound interest, and EMI sustainability"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel title="Loan EMI Simulator" className="space-y-4">
            {/* Tabs with Gold Underline */}
            <div className="flex border-b border-[#4B515A] gap-6 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'simulator'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Loan Simulator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`pb-1 text-xs sm:text-sm font-heading cursor-pointer transition-colors ${
                  activeTab === 'active'
                    ? 'text-[#FFD95A] border-b-2 border-[#FFD95A]'
                    : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
                }`}
              >
                Active Loan {activeLoan ? '●' : ''}
              </button>
            </div>

            {/* Tab 1: Loan Simulator */}
            {activeTab === 'simulator' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {/* 3-Field Single Row / Column Form with balanced labels and aligned inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                  <PixelInput
                    label="Principal (₹)"
                    prefix="₹"
                    type="number"
                    min="1000"
                    step="5000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    required
                  />

                  <PixelInput
                    label="Annual Rate (%)"
                    type="number"
                    min="0"
                    max="60"
                    step="0.5"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                    required
                  />

                  <PixelInput
                    label="Tenure (Months)"
                    type="number"
                    min="1"
                    max="60"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    required
                  />
                </div>

                {/* 4-Metric Result Strip matching retro pixel theme with crisp tabular alignment */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-body">
                  <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">Monthly EMI</span>
                    <strong className="text-base sm:text-lg font-bold text-[#FFD95A] block mt-1 tabular-nums">
                      ₹{simSummary.emi.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">Total Interest</span>
                    <strong className="text-base sm:text-lg font-bold text-[#EE6A5E] block mt-1 tabular-nums">
                      ₹{simSummary.totalInterest.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">Total Payable</span>
                    <strong className="text-base sm:text-lg font-bold text-[#FFF4D6] block mt-1 tabular-nums">
                      ₹{simSummary.totalPayable.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">EMI-to-Income</span>
                    <strong
                      className={`text-base sm:text-lg font-bold block mt-1 tabular-nums ${
                        simSummary.emiToIncome > 0.4 ? 'text-[#EE6A5E]' : simSummary.emiToIncome > 0.3 ? 'text-[#E9C46A]' : 'text-[#79CE5E]'
                      }`}
                    >
                      {(simSummary.emiToIncome * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>

                {/* Indian Domestic 30% EMI Cap Rule Safety Gauge */}
                <div className="p-2.5 bg-[#23252B] border border-[#4B515A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇮🇳</span>
                    <div>
                      <span className="font-heading text-[#FFD95A] block text-[11px]">
                        30% FIXED EMI SAFETY CAP RULE
                      </span>
                      <span className="text-[11px] text-[#B4BAC4]">
                        Total monthly debt obligations should not exceed 30–35% of net take-home salary.
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold uppercase font-heading shrink-0 text-center border ${
                      simSummary.emiToIncome <= 0.30
                        ? 'bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]'
                        : simSummary.emiToIncome <= 0.40
                        ? 'bg-[#E9C46A]/20 text-[#E9C46A] border-[#E9C46A]'
                        : 'bg-[#E76F51]/20 text-[#E76F51] border-[#E76F51]'
                    }`}
                  >
                    {simSummary.emiToIncome <= 0.30
                      ? '✓ SAFE (<30% TAKE-HOME)'
                      : simSummary.emiToIncome <= 0.40
                      ? '⚠ CAUTION (30–40% STRETCH)'
                      : '🚨 DANGER (>40% HIGH RISK)'}
                  </span>
                </div>

                {/* High Debt Warning */}
                {isHighRisk && (
                  <div className="p-3 bg-[#3A2222] border-2 border-[#EE6A5E] text-xs sm:text-sm text-[#FFF4D6] shadow-[inset_1px_1px_0_rgba(0,0,0,0.4)]">
                    <strong className="text-[#EE6A5E] block mb-1 font-heading text-xs uppercase tracking-wider">
                      ⚠️ High Debt Load Warning (&gt;40% Income)
                    </strong>
                    <span>
                      Borrowing this amount consumes {(simSummary.emiToIncome * 100).toFixed(0)}% of your monthly earnings. Exceeding 40% will trigger a debt spiral event!
                    </span>
                  </div>
                )}

                {/* Action Area: Take Loan Button OR Prominent Active Loan Card */}
                <div className="pt-2">
                  {!activeLoan ? (
                    <PixelButton
                      variant="primary"
                      size="md"
                      onClick={handleTakeLoan}
                      fullWidth
                    >
                      Take Loan & Start EMI Schedule
                    </PixelButton>
                  ) : (
                    <div className="p-3.5 bg-[#2E333B] border-2 border-[#D4A373] text-[#FFF4D6] shadow-[inset_1px_1px_0_rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-center sm:text-left">
                        <span className="text-2xl select-none">🔒</span>
                        <div>
                          <div className="font-heading text-xs sm:text-sm text-[#FFD95A] uppercase tracking-wider">
                            Active Loan In Progress
                          </div>
                          <div className="text-xs sm:text-sm text-[#FFF4D6] mt-0.5 font-body">
                            Active loan already in progress. Pay it off before taking another.
                          </div>
                        </div>
                      </div>
                      <PixelButton
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('active')}
                        className="whitespace-nowrap"
                      >
                        View & Pay Off Loan ➔
                      </PixelButton>
                    </div>
                  )}
                </div>

                {/* Opportunity Cost Time Machine & Indian EMI Benchmark Quick Callout */}
                <div className="p-3 bg-[#1B1B1F] rounded border border-[#B79A60] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-heading text-[#FFD95A] flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>OPPORTUNITY COST TIME MACHINE</span>
                    </span>
                    <Link
                      href="/school?tab=timemachine"
                      className="text-[#2A9D8F] hover:underline font-heading text-[11px] font-bold"
                    >
                      Open Simulator ➔
                    </Link>
                  </div>
                  <p className="text-xs text-[#B4BAC4] leading-relaxed">
                    A ₹{simSummary.emi.toLocaleString('en-IN')}/mo loan payment builds zero wealth. Put that same monthly amount into the School’s Opportunity Cost Time Machine to see how it compounds at 12% in the Nifty 50 over 10 to 20 years.
                  </p>
                  <div className="pt-1 border-t border-[#3A3F47] flex items-center justify-between text-[11px] text-[#D4A373]">
                    <span>🇮🇳 Domestic Benchmark: 30% EMI Cap Rule</span>
                    <Link href="/school?tab=benchmarks" className="underline hover:text-[#FFD95A]">
                      View Rules ➔
                    </Link>
                  </div>
                </div>

                {/* Financial Wisdom Note */}
                <p className="text-xs sm:text-sm text-[#B4BAC4] pt-2 border-t border-[#4B515A]/60 leading-relaxed font-body">
                  <span className="text-[#FFD95A] font-semibold">Financial note:</span> High-interest consumer loans trade future freedom for present consumption. Always verify total interest and sustainability before borrowing.
                </p>
              </div>
            )}

            {/* Tab 2: Active Loan */}
            {activeTab === 'active' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {activeLoan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-body">
                      <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                        <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">Principal</span>
                        <strong className="text-base sm:text-lg font-bold text-[#FFF4D6] block mt-1 tabular-nums">
                          ₹{activeLoan.principal.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                        <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">Rate</span>
                        <strong className="text-base sm:text-lg font-bold text-[#FFD95A] block mt-1 tabular-nums">
                          {activeLoan.annualRatePct}% p.a.
                        </strong>
                      </div>
                      <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                        <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">Monthly EMI</span>
                        <strong className="text-base sm:text-lg font-bold text-[#EE6A5E] block mt-1 tabular-nums">
                          ₹{calculateEMI(activeLoan.principal, activeLoan.annualRatePct, activeLoan.months).toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="p-2.5 sm:p-3 bg-[#2E333B] border border-[#4B515A] shadow-[inset_1px_1px_0_rgba(0,0,0,0.3)] flex flex-col justify-between">
                        <span className="text-[11px] sm:text-xs font-semibold text-[#B4BAC4] block uppercase tracking-wider whitespace-nowrap">EMIs Paid</span>
                        <strong className="text-base sm:text-lg font-bold text-[#79CE5E] block mt-1 tabular-nums">
                          {emisPaidCount} / {activeLoan.months}
                        </strong>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#FFF4D6] leading-relaxed">
                      EMIs post automatically on your monthly anniversary date. You can choose to retire the liability early below.
                    </p>

                    {/* Exactly One Primary Action Button per screen in solid gold */}
                    <div className="pt-2">
                      <PixelButton
                        variant="primary"
                        size="md"
                        onClick={() => closeLoan()}
                        fullWidth
                      >
                        Pay Off & Close Loan
                      </PixelButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <p className="italic text-xs sm:text-sm text-[#79CE5E]">
                      No active bank loan. Your balance is 100% debt-free!
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('simulator')}
                      className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                    >
                      Return to Simulator to test loan scenarios ➔
                    </button>
                  </div>
                )}
              </div>
            )}
          </StonePanel>
        </WoodFrame>

        {/* 96px Bottom RPG Dialogue Text Box */}
        <div className="w-full mt-auto">
          <RpgTextBox />
        </div>
      </div>
    </div>
  );
}
