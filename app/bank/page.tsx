'use client';

import React, { useState } from 'react';
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
  } = useGame();

  const [activeTab, setActiveTab] = useState<'simulator' | 'active'>('simulator');

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
          subtitle="Explore debt mathematics, compound interest, and EMI sustainability"
        >
          {/* Single Calm Stone Panel with Gold Tab Underline */}
          <StonePanel className="space-y-4">
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
                {/* 3-Field Single Row / Column Form */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    label="Annual Interest (%)"
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

                {/* 4-Metric Result Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[11px] text-[#B4BAC4] block uppercase">Monthly EMI</span>
                    <strong className="text-sm sm:text-base font-mono text-[#FFD95A] block mt-0.5">
                      ₹{simSummary.emi.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[11px] text-[#B4BAC4] block uppercase">Total Interest</span>
                    <strong className="text-sm sm:text-base font-mono text-[#EE6A5E] block mt-0.5">
                      ₹{simSummary.totalInterest.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[11px] text-[#B4BAC4] block uppercase">Total Payable</span>
                    <strong className="text-sm sm:text-base font-mono text-[#FFF4D6] block mt-0.5">
                      ₹{simSummary.totalPayable.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                    <span className="text-[11px] text-[#B4BAC4] block uppercase">EMI-to-Income</span>
                    <strong
                      className={`text-sm sm:text-base font-mono block mt-0.5 ${
                        isHighRisk ? 'text-[#EE6A5E]' : 'text-[#79CE5E]'
                      }`}
                    >
                      {(simSummary.emiToIncome * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>

                {/* High Debt Warning */}
                {isHighRisk && (
                  <div className="p-2.5 bg-[#3A2222] border border-[#EE6A5E] text-xs text-[#FFF4D6]">
                    <strong className="text-[#EE6A5E] block mb-0.5">⚠️ High Debt Load Warning (&gt;40% Income)</strong>
                    <span>
                      Borrowing this amount consumes {(simSummary.emiToIncome * 100).toFixed(0)}% of your monthly earnings. Exceeding 40% will trigger a debt spiral event!
                    </span>
                  </div>
                )}

                {/* Exactly One Primary Action Button per screen in solid gold */}
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
                    <div className="text-center py-2 text-xs text-[#B4BAC4]">
                      <span>Active loan already active. </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('active')}
                        className="text-[#FFD95A] underline hover:text-[#FFE885] cursor-pointer"
                      >
                        View active loan details ➔
                      </button>
                    </div>
                  )}
                </div>

                {/* Financial Wisdom Note */}
                <p className="text-xs text-[#B4BAC4] pt-2 border-t border-[#4B515A]/60 leading-relaxed">
                  Financial note: High-interest consumer loans trade future freedom for present consumption. Always verify total interest and sustainability before borrowing.
                </p>
              </div>
            )}

            {/* Tab 2: Active Loan */}
            {activeTab === 'active' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                {activeLoan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                        <span className="text-[11px] text-[#B4BAC4] block uppercase">Principal</span>
                        <strong className="text-sm sm:text-base font-mono text-[#FFF4D6] block mt-0.5">
                          ₹{activeLoan.principal.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                        <span className="text-[11px] text-[#B4BAC4] block uppercase">Rate</span>
                        <strong className="text-sm sm:text-base font-mono text-[#FFD95A] block mt-0.5">
                          {activeLoan.annualRatePct}% p.a.
                        </strong>
                      </div>
                      <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                        <span className="text-[11px] text-[#B4BAC4] block uppercase">Monthly EMI</span>
                        <strong className="text-sm sm:text-base font-mono text-[#EE6A5E] block mt-0.5">
                          ₹{calculateEMI(activeLoan.principal, activeLoan.annualRatePct, activeLoan.months).toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-[#2E333B] border border-[#4B515A]">
                        <span className="text-[11px] text-[#B4BAC4] block uppercase">EMIs Paid</span>
                        <strong className="text-sm sm:text-base font-mono text-[#79CE5E] block mt-0.5">
                          {emisPaidCount} / {activeLoan.months}
                        </strong>
                      </div>
                    </div>

                    <p className="text-xs text-[#B4BAC4]">
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
