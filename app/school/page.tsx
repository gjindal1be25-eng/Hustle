'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { WoodFrame } from '@/components/ui/WoodFrame';
import { StonePanel } from '@/components/ui/StonePanel';
import { PixelButton } from '@/components/ui/PixelButton';
import { RpgTextBox } from '@/components/ui/RpgTextBox';
import { HudBar } from '@/components/ui/HudBar';
import { LESSONS } from '@/lib/constants';
import { FINANCIAL_QUIZ_QUESTIONS } from '@/lib/gameplay';
import { playCoinSound, playFanfareSound, playWarningSound } from '@/lib/sound';
import { OpportunityCostTimeMachine } from '@/components/teaching/OpportunityCostTimeMachine';
import { BehavioralBiasSimulator } from '@/components/teaching/BehavioralBiasSimulator';
import { IndianBenchmarksView } from '@/components/teaching/IndianBenchmarksView';
import { BookModeReader } from '@/components/teaching/BookModeReader';

type SchoolTab = 'scrolls' | 'timemachine' | 'biases' | 'benchmarks' | 'quiz' | 'book';

function SchoolContent() {
  const searchParams = useSearchParams();
  const paramTab = searchParams.get('tab') as SchoolTab | null;

  const validTabs: SchoolTab[] = ['scrolls', 'timemachine', 'biases', 'benchmarks', 'quiz', 'book'];
  const initialTab: SchoolTab = paramTab && validTabs.includes(paramTab) ? paramTab : 'scrolls';

  const { state, addRenown, recordBuildingVisit } = useGame();
  const [activeTab, setActiveTab] = useState<SchoolTab>(initialTab);
  const [scrollSubTab, setScrollSubTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [showAllScrolls, setShowAllScrolls] = useState(false);

  useEffect(() => {
    recordBuildingVisit('school');
  }, [recordBuildingVisit]);

  // Speed Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const unlockedLessonIds = new Set(
    state.lessonsSeen.map((l) => l.lessonId)
  );

  const unlockedLessons = LESSONS.filter((l) => unlockedLessonIds.has(l.id));
  const lockedLessons = LESSONS.filter((l) => !unlockedLessonIds.has(l.id));

  const currentLessons = scrollSubTab === 'unlocked' ? unlockedLessons : lockedLessons;
  const displayedLessons = showAllScrolls ? currentLessons : currentLessons.slice(0, 3);

  const handleOptionSelect = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswerChecked) return;
    const q = FINANCIAL_QUIZ_QUESTIONS[quizIndex];
    const isCorrect = selectedOption === q.correctIndex;
    setIsAnswerChecked(true);
    if (isCorrect) {
      playCoinSound();
      setQuizScore((s) => s + 1);
    } else {
      playWarningSound();
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex + 1 < FINANCIAL_QUIZ_QUESTIONS.length) {
      setQuizIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      playFanfareSound();
      const finalScore = quizScore;
      const renownWon = finalScore * 25;
      if (renownWon > 0) {
        addRenown(renownWon, 'School Wisdom Quiz');
      }
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="w-full max-w-[760px] px-3 sm:px-4 py-4 space-y-4 flex-1">
      <WoodFrame
        title="TOWN SCHOOL OF WISDOM"
        subtitle="Foundational mental models, interactive opportunity cost calculators & psychology labs"
      >
        <div className="space-y-4">
          {/* Main Navigation Tabs */}
          <div className="flex border-b border-[#4B515A] gap-2 sm:gap-4 pb-2 overflow-x-auto text-xs sm:text-sm font-heading select-none">
            <button
              type="button"
              onClick={() => setActiveTab('scrolls')}
              className={`pb-1 px-1 cursor-pointer transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'scrolls'
                  ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                  : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
              }`}
            >
              <span>📜</span>
              <span>Scrolls ({unlockedLessons.length}/8)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timemachine')}
              className={`pb-1 px-1 cursor-pointer transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'timemachine'
                  ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                  : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
              }`}
            >
              <span>⏳</span>
              <span>Time Machine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('biases')}
              className={`pb-1 px-1 cursor-pointer transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'biases'
                  ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                  : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
              }`}
            >
              <span>🧠</span>
              <span>Psychology & Biases</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('benchmarks')}
              className={`pb-1 px-1 cursor-pointer transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'benchmarks'
                  ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                  : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
              }`}
            >
              <span>🇮🇳</span>
              <span>Indian Benchmarks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`pb-1 px-1 cursor-pointer transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'quiz'
                  ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                  : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
              }`}
            >
              <span>⚡</span>
              <span>Speed Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`pb-1 px-1 cursor-pointer transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'book'
                  ? 'text-[#FFD95A] border-b-2 border-[#FFD95A] font-bold'
                  : 'text-[#B4BAC4] hover:text-[#FFF4D6]'
              }`}
            >
              <span>📖</span>
              <span>Book Mode</span>
            </button>
          </div>

          {/* TAB 1: Classic Scrolls */}
          {activeTab === 'scrolls' && (
            <StonePanel className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#4B515A]/60 text-xs sm:text-sm">
                <span className="text-[#FFF4D6]">
                  Curriculum Mastery:{' '}
                  <strong className="text-[#FFD95A] font-bold">
                    {unlockedLessons.length} of 8 Scrolls Unlocked
                  </strong>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScrollSubTab('unlocked');
                      setShowAllScrolls(false);
                    }}
                    className={`text-xs px-2.5 py-1 rounded border cursor-pointer ${
                      scrollSubTab === 'unlocked'
                        ? 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] font-bold'
                        : 'bg-[#2E333B] text-[#B4BAC4] border-[#4B515A]'
                    }`}
                  >
                    Unlocked ({unlockedLessons.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScrollSubTab('locked');
                      setShowAllScrolls(false);
                    }}
                    className={`text-xs px-2.5 py-1 rounded border cursor-pointer ${
                      scrollSubTab === 'locked'
                        ? 'bg-[#FFD95A] text-[#1B1B1F] border-[#FFF4D6] font-bold'
                        : 'bg-[#2E333B] text-[#B4BAC4] border-[#4B515A]'
                    }`}
                  >
                    Locked ({lockedLessons.length})
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-1">
                <span className="text-xs text-[#B4BAC4] uppercase tracking-wider">
                  {scrollSubTab === 'unlocked' ? 'Unlocked Wisdom Scrolls' : 'Clues to Discover'}
                </span>
                {currentLessons.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllScrolls(!showAllScrolls)}
                    className="text-xs text-[#D4A373] hover:text-[#FFD95A] underline cursor-pointer"
                  >
                    {showAllScrolls ? 'Show latest 3' : `See all (${currentLessons.length})`}
                  </button>
                )}
              </div>

              {currentLessons.length === 0 ? (
                <p className="text-center italic py-4 text-xs text-[#B4BAC4]">
                  {scrollSubTab === 'unlocked'
                    ? 'No scrolls unlocked yet. Complete Socratic villager dialogues or log transactions to unlock scrolls!'
                    : 'All 8 scrolls have been unlocked! You have mastered the town curriculum! 🎓'}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {displayedLessons.map((lesson) => {
                    const isUnlocked = unlockedLessonIds.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`p-3 border space-y-1.5 ${
                          isUnlocked
                            ? 'border-[#4B515A] bg-[#2E333B]'
                            : 'border-[#4B515A]/60 bg-[#25282E] opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] text-[#FFD95A] font-bold uppercase block">
                              Scroll #{lesson.id} · {lesson.book}
                            </span>
                            <h4 className="font-heading text-xs sm:text-sm text-[#FFF4D6]">
                              {lesson.title}
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              isUnlocked
                                ? 'bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/40'
                                : 'bg-[#B4BAC4]/20 text-[#B4BAC4] border border-[#4B515A]'
                            }`}
                          >
                            {isUnlocked ? 'MASTERED' : 'LOCKED'}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <p className="text-xs text-[#FFF4D6] italic leading-relaxed">
                            &ldquo;{lesson.cardText}&rdquo;
                          </p>
                        ) : (
                          <div className="text-xs text-[#B4BAC4]">
                            <strong className="text-[#FFD95A] block mb-0.5">How to unlock:</strong>
                            <p>{lesson.triggerHint}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick links to other tools */}
              <div className="pt-3 border-t border-[#4B515A] flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('timemachine')}
                  className="text-xs text-[#FFD95A] hover:underline flex items-center gap-1 font-heading cursor-pointer"
                >
                  <span>⏳</span>
                  <span>Test Daily Leaks in Opportunity Cost Time Machine ➔</span>
                </button>
                <Link href="/">
                  <PixelButton variant="primary">
                    Return to Town
                  </PixelButton>
                </Link>
              </div>
            </StonePanel>
          )}

          {/* TAB 2: The Opportunity Cost Time Machine */}
          {activeTab === 'timemachine' && (
            <OpportunityCostTimeMachine />
          )}

          {/* TAB 3: Behavioral Bias Simulator */}
          {activeTab === 'biases' && (
            <BehavioralBiasSimulator />
          )}

          {/* TAB 4: Indian Financial Benchmarks */}
          {activeTab === 'benchmarks' && (
            <IndianBenchmarksView />
          )}

          {/* TAB 5: Speed Quiz */}
          {activeTab === 'quiz' && (
            <StonePanel className="space-y-4 font-sans text-xs sm:text-sm">
              {quizFinished ? (
                <div className="bg-[#23252B] p-5 rounded border border-[#B79A60] space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-4xl block">📜</span>
                    <h3 className="text-base sm:text-lg font-heading text-[#FFD95A]">
                      QUIZ COMPLETE!
                    </h3>
                    <p className="text-xs text-[#FFF4D6]">
                      You tested your mastery of the classical financial books.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-center">
                    <div className="p-3 bg-[#1B1B1F] rounded border border-[#4B515A]">
                      <span className="text-[10px] text-[#B4BAC4] block uppercase">Correct Answers</span>
                      <span className="text-lg font-bold font-mono text-[#FFD95A]">
                        {quizScore} / {FINANCIAL_QUIZ_QUESTIONS.length}
                      </span>
                    </div>
                    <div className="p-3 bg-[#1B1B1F] rounded border border-[#2A9D8F]">
                      <span className="text-[10px] text-[#B4BAC4] block uppercase">Renown Earned</span>
                      <span className="text-lg font-bold font-mono text-[#2A9D8F]">
                        +{quizScore * 25} ⭐
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center pt-2">
                    <PixelButton variant="primary" onClick={handleRestartQuiz}>
                      Retake Quiz 🔄
                    </PixelButton>
                    <Link href="/">
                      <PixelButton variant="stone">
                        Return to Town Map ➔
                      </PixelButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-[#23252B] p-4 rounded border border-[#4B515A] space-y-4">
                  {/* Progress Header */}
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#4B515A]">
                    <span className="text-[#FFD95A] font-heading">
                      QUESTION {quizIndex + 1} OF {FINANCIAL_QUIZ_QUESTIONS.length}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#1B1B1F] border border-[#B79A60] text-[#FFD95A] text-[10px] font-bold">
                      📖 {FINANCIAL_QUIZ_QUESTIONS[quizIndex].book}
                    </span>
                  </div>

                  {/* Question text */}
                  <h3 className="text-sm sm:text-base font-semibold text-[#FFF4D6] leading-relaxed">
                    {FINANCIAL_QUIZ_QUESTIONS[quizIndex].question}
                  </h3>

                  {/* Options list */}
                  <div className="space-y-2">
                    {FINANCIAL_QUIZ_QUESTIONS[quizIndex].options.map((option: string, idx: number) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectOption = idx === FINANCIAL_QUIZ_QUESTIONS[quizIndex].correctIndex;
                      let optionStyle = 'bg-[#1B1B1F] border-[#4B515A] text-[#FFF4D6] hover:border-[#FFD95A]';

                      if (isAnswerChecked) {
                        if (isCorrectOption) {
                          optionStyle = 'bg-[#2A9D8F]/20 border-[#2A9D8F] text-[#2A9D8F] font-bold';
                        } else if (isSelected && !isCorrectOption) {
                          optionStyle = 'bg-[#EE6A5E]/20 border-[#EE6A5E] text-[#EE6A5E] line-through';
                        }
                      } else if (isSelected) {
                        optionStyle = 'bg-[#FFD95A]/15 border-[#FFD95A] text-[#FFD95A] font-semibold';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full p-2.5 rounded border text-left text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2.5 ${optionStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Banner */}
                  {isAnswerChecked && (
                    <div
                      className={`p-3 rounded border text-xs leading-relaxed animate-fadeIn ${
                        selectedOption === FINANCIAL_QUIZ_QUESTIONS[quizIndex].correctIndex
                          ? 'bg-[#2A9D8F]/15 border-[#2A9D8F] text-[#FFF4D6]'
                          : 'bg-[#EE6A5E]/15 border-[#EE6A5E] text-[#FFF4D6]'
                      }`}
                    >
                      <strong className="block text-[#FFD95A] mb-1 font-heading">
                        {selectedOption === FINANCIAL_QUIZ_QUESTIONS[quizIndex].correctIndex
                          ? '✓ Correct Insight!'
                          : '✗ Keep Learning!'}
                      </strong>
                      <p>{FINANCIAL_QUIZ_QUESTIONS[quizIndex].explanation}</p>
                    </div>
                  )}

                  {/* Action button */}
                  <div className="pt-2 flex justify-end">
                    {!isAnswerChecked ? (
                      <PixelButton
                        variant="primary"
                        disabled={selectedOption === null}
                        onClick={handleCheckAnswer}
                      >
                        Check Answer ⚡
                      </PixelButton>
                    ) : (
                      <PixelButton variant="primary" onClick={handleNextQuestion}>
                        {quizIndex + 1 < FINANCIAL_QUIZ_QUESTIONS.length
                          ? 'Next Question ➔'
                          : 'View Results 🏆'}
                      </PixelButton>
                    )}
                  </div>
                </div>
              )}
            </StonePanel>
          )}

          {/* TAB 6: Town Financial Library / Book Mode */}
          {activeTab === 'book' && (
            <BookModeReader />
          )}
        </div>
      </WoodFrame>

      {/* 96px Bottom RPG Dialogue Text Box */}
      <div className="w-full mt-auto">
        <RpgTextBox />
      </div>
    </div>
  );
}

export default function SchoolPage() {
  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-[#1B1B1F]">
      <HudBar />
      <Suspense fallback={<div className="p-8 text-[#FFD95A] font-heading text-center">Loading School of Wisdom...</div>}>
        <SchoolContent />
      </Suspense>
    </div>
  );
}
