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
          subtitle="Explore the mathematics of debt, compound interest, and EMI sustainability"
        >
          <div className="space-y-4">
            {/* Main Action (top, always visible): Loan Simulator with live result */}
            <StonePanel title="Loan EMI Simulator">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PixelInput
                    label="Principal Borrowing (₹)"
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

                {/* One Result Card: EMI, Total Interest, Total Payable, EMI-to-income */}
                <div className="p-3 bg-[#2E333B] border border-[#4B515A] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">Monthly EMI</span>
                    <strong className="text-[20px] font-heading text-[#FFD95A]">
                      ₹{simSummary.emi.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">Total Interest</span>
                    <strong className="text-[20px] font-heading text-[#EE6A5E]">
                      ₹{simSummary.totalInterest.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">Total Payable</span>
                    <strong className="text-[20px] font-heading text-[#FFF4D6]">
                      ₹{simSummary.totalPayable.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">EMI-to-Income</span>
                    <strong
                      className={`text-[20px] font-heading ${
                        isHighRisk ? 'text-[#EE6A5E]' : 'text-[#79CE5E]'
                      }`}
                    >
                      {(simSummary.emiToIncome * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>

                {/* High Debt Warning */}
                {isHighRisk && (
                  <div className="p-2.5 bg-[#4A2626] border border-[#EE6A5E] text-[16px] text-[#FFF4D6]">
                    <strong className="text-[#EE6A5E] block font-heading text-[12px]">⚠️ High Debt Load Warning (&gt;40% Income)</strong>
                    <span>
                      Taking this loan will consume {(simSummary.emiToIncome * 100).toFixed(0)}% of your monthly income. Exceeding 40% triggers a debt spiral in Hustle!
                    </span>
                  </div>
                )}

                {/* Take Loan Button (Primary Button) */}
                <div className="flex justify-end pt-1">
                  {!activeLoan ? (
                    <PixelButton
                      variant="primary"
                      size="md"
                      onClick={handleTakeLoan}
                    >
                      🏦 Take Loan & Start EMI Schedule
                    </PixelButton>
                  ) : (
                    <span className="text-xs text-[#B4BAC4] italic">
                      Active loan already in progress. Pay it off before taking another.
                    </span>
                  )}
                </div>
              </div>
            </StonePanel>

            {/* Two Tabs: Tab 1: Simulator Details, Tab 2: Active Loan */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'simulator'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Simulator Wisdom
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 text-[14px] font-heading cursor-pointer transition-colors ${
                  activeTab === 'active'
                    ? 'bg-[#8B5E34] text-[#FFD95A] border-2 border-[#D9A05E]'
                    : 'bg-[#5C3826] text-[#FFF4D6] border-2 border-[#8B5E34] hover:bg-[#6E442F]'
                }`}
              >
                Active Loan {activeLoan ? '●' : ''}
              </button>
            </div>

            {/* Tab 1: Simulator Wisdom */}
            {activeTab === 'simulator' && (
              <StonePanel title="The Lesson: Assets vs. Liabilities">
                <p className="text-[20px] font-body text-[#B4BAC4] leading-relaxed">
                  A loan is an agreement to purchase future freedom with today&apos;s cash. While loans can finance productive growth, high-interest consumer debt drains compound interest straight into the lender&apos;s vault. Always calculate total interest before borrowing.
                </p>
              </StonePanel>
            )}

            {/* Tab 2: Active Loan */}
            {activeTab === 'active' && (
              <StonePanel title="Active Loan Details">
                {activeLoan ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 bg-[#2E333B] border border-[#4B515A]">
                      <div>
                        <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">Principal</span>
                        <strong className="text-[20px] font-heading text-[#FFF4D6]">
                          ₹{activeLoan.principal.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">Rate</span>
                        <strong className="text-[20px] font-heading text-[#FFD95A]">
                          {activeLoan.annualRatePct}% p.a.
                        </strong>
                      </div>
                      <div>
                        <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">Monthly EMI</span>
                        <strong className="text-[20px] font-heading text-[#EE6A5E]">
                          ₹{calculateEMI(activeLoan.principal, activeLoan.annualRatePct, activeLoan.months).toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[12px] font-heading text-[#B4BAC4] block uppercase">Paid Count</span>
                        <strong className="text-[20px] font-heading text-[#79CE5E]">
                          {emisPaidCount} / {activeLoan.months}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#2E333B] border border-[#4B515A]">
                      <span className="text-xs text-[#B4BAC4]">
                        EMIs post automatically on the monthly anniversary date.
                      </span>
                      <PixelButton variant="primary" size="sm" onClick={() => closeLoan()}>
                        📜 Pay Off / Close Loan
                      </PixelButton>
                    </div>
                  </div>
                ) : (
                  <p className="text-center italic py-4 text-[#B4BAC4]">
                    No active bank loan. Your balance is debt-free!
                  </p>
                )}
              </StonePanel>
            )}
          </div>
        </WoodFrame>

        {/* 96px Bottom RPG Dialogue Text Box */}
        <div className="w-full mt-auto">
          <RpgTextBox />
        </div>
      </div>
    </div>
  );
}
