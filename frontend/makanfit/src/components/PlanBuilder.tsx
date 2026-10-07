import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Flame,
  Droplet,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Check,
  Calendar,
  TrendingDown,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { OnboardingData, User } from '../types/types';
import { calculateNutritionPlan } from '../utils/nutritionCalculator';
import StoryCategoryIcon from './StoryCategoryIcon';

interface PlanBuilderProps {
  onboardingData: OnboardingData;
  onConfirmPlan: (planValues: Partial<User>) => void;
  onBackToOnboarding?: () => void;
  isAuthenticated?: boolean;
}

const BUILD_CHECKLIST = [
  'Analyzing your body metrics & BMR...',
  'Calibrating activity level & daily burn...',
  'Balancing Malaysian Suku-Suku Separuh macros...',
  'Setting daily fiber & hydration targets...',
  'Finalizing your personal MakanFit blueprint...',
];

const PlanBuilder: React.FC<PlanBuilderProps> = ({
  onboardingData,
  onConfirmPlan,
  onBackToOnboarding,
  isAuthenticated = false,
}) => {
  const [stage, setStage] = useState<'building' | 'reveal'>('building');
  const [progress, setProgress] = useState(0);
  const [activeCheckIndex, setActiveCheckIndex] = useState(0);

  const calculated = useMemo(() => calculateNutritionPlan(onboardingData), [onboardingData]);

  // Editable state on the Reveal screen so user can fine-tune if desired
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [customCalories, setCustomCalories] = useState(calculated.targetCalories);
  const [customProtein, setCustomProtein] = useState(calculated.targetProtein);
  const [customCarbs, setCustomCarbs] = useState(calculated.targetCarbs);
  const [customFat, setCustomFat] = useState(calculated.targetFat);
  const [customFiber, setCustomFiber] = useState(calculated.targetFiber);
  const [customWater, setCustomWater] = useState(calculated.targetWater);

  useEffect(() => {
    setCustomCalories(calculated.targetCalories);
    setCustomProtein(calculated.targetProtein);
    setCustomCarbs(calculated.targetCarbs);
    setCustomFat(calculated.targetFat);
    setCustomFiber(calculated.targetFiber);
    setCustomWater(calculated.targetWater);
  }, [calculated]);

  // Animate the "Building a plan for you" progress from 0% -> 100%
  useEffect(() => {
    if (stage !== 'building') return;

    const durationMs = 3400;
    const intervalMs = 40;
    const step = 100 / (durationMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + step);
        const checkIdx = Math.min(
          BUILD_CHECKLIST.length - 1,
          Math.floor((next / 100) * BUILD_CHECKLIST.length)
        );
        setActiveCheckIndex(checkIdx);

        if (next >= 100) {
          clearInterval(timer);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [stage]);

  const handleConfirm = () => {
    const isCustomized =
      customCalories !== calculated.targetCalories ||
      customProtein !== calculated.targetProtein ||
      customCarbs !== calculated.targetCarbs ||
      customFat !== calculated.targetFat ||
      customFiber !== calculated.targetFiber;

    onConfirmPlan({
      targetCalories: customCalories,
      targetProtein: customProtein,
      targetCarbs: customCarbs,
      targetFat: customFat,
      targetFiber: customFiber,
      targetWater: customWater,
      goalOrigin: isCustomized ? 'custom' : 'standard',
      macroGoalOrigin: isCustomized ? 'custom' : 'standard',
    });
  };

  const weightDiff = Number((onboardingData.goalWeight - onboardingData.startWeight).toFixed(1));
  const isWeightLoss = weightDiff < 0;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] select-none overflow-x-hidden">
      {/* Left Desktop Showcase Pane */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#064E3B] p-14 lg:p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-10">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/15 text-emerald-50 text-xs font-bold tracking-wider">
              PERSONALIZED BLUEPRINT • SUKU-SUKU SEPARUH
            </span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              {stage === 'building' ? (
                <>
                  Crafting your <br />
                  <span className="text-emerald-200">custom plan.</span>
                </>
              ) : (
                <>
                  Your daily <br />
                  <span className="text-emerald-200">makan blueprint.</span>
                </>
              )}
            </h2>
            <p className="text-emerald-50/85 text-lg font-medium leading-relaxed">
              Calculated using the scientific Mifflin-St Jeor equation and balanced for Malaysian meals so you never have to give up Nasi Lemak.
            </p>
          </div>
        </div>

        {/* <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 max-w-md">
          <div className="flex items-center space-x-3.5">
            <StoryCategoryIcon
              type="companion"
              size={56}
              className="!w-14 !h-14 !rounded-2xl bg-white shadow-sm"
            />
            <div>
              <p className="text-white font-black text-sm">Lemmy’s Promise</p>
              <p className="text-emerald-100/90 text-xs font-medium leading-relaxed mt-0.5">
                “Kita jaga portion ikut kalori harian awak — steady & sustainable setiap hari!”
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Right Interactive Pane */}
      <div className="flex-1 flex flex-col justify-center min-h-screen bg-white relative">
        <AnimatePresence mode="wait">
          {stage === 'building' ? (
            /* ============================================================ */
            /* STAGE 1: BUILDING A PLAN FOR YOU                             */
            /* ============================================================ */
            <motion.div
              key="building-stage"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 max-w-md mx-auto w-full text-center"
            >
              {/* Animated Circular Progress Ring with Custom Icon */}
              <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 76}
                    strokeDashoffset={
                      2 * Math.PI * 76 - (Math.min(100, progress) / 100) * (2 * Math.PI * 76)
                    }
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-100"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <StoryCategoryIcon
                    type="nutrition"
                    size={72}
                    className="!w-16 !h-16 !rounded-2xl bg-emerald-50 border border-emerald-100 mb-1"
                  />
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {progress >= 100 ? 'Your plan is ready!' : 'Building a plan for you...'}
                </h2>
                <p className="text-sm font-medium text-slate-400">
                  {progress >= 100
                    ? 'All calculations complete. Tap Next to view your personalized targets.'
                    : 'Tailoring your daily calories & macros to your body metrics'}
                </p>
              </div>

              {/* Animated Step-by-Step Checklist */}
              <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-3.5 text-left">
                {BUILD_CHECKLIST.map((item, idx) => {
                  const isDone = idx < activeCheckIndex || progress >= 100;
                  const isCurrent = idx === activeCheckIndex && progress < 100;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 transition-opacity duration-300 ${
                        idx > activeCheckIndex ? 'opacity-35' : 'opacity-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'border-2 border-emerald-500 bg-emerald-50'
                            : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {isDone && <Check size={12} strokeWidth={3.5} />}
                        {isCurrent && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isDone || isCurrent ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Explicit Next Button */}
              <div className="w-full flex space-x-3 mt-5">
                {onBackToOnboarding && (
                  <button
                    type="button"
                    onClick={onBackToOnboarding}
                    className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                    aria-label="Back to onboarding"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={progress < 100}
                  onClick={() => setStage('reveal')}
                  className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                    progress >= 100
                      ? 'bg-[#1A2A33] hover:bg-black text-white shadow-xl active:scale-[0.98] cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{progress >= 100 ? 'Next' : `Calculating (${Math.round(progress)}%)`}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* ============================================================ */
            /* STAGE 2: YOUR CUSTOMIZED PLAN IS READY                       */
            /* ============================================================ */
            <motion.div
              key="reveal-stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col justify-between p-6 sm:p-10 max-w-lg mx-auto w-full"
            >
              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between pt-1 mb-4">
                {onBackToOnboarding ? (
                  <button
                    type="button"
                    onClick={onBackToOnboarding}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    aria-label="Back to onboarding"
                  >
                    <ChevronLeft size={20} />
                  </button>
                ) : (
                  <div className="w-10" />
                )}

                <div className="flex items-center space-x-1.5 text-emerald-600 font-black text-xs uppercase tracking-widest">
                  <span>Custom Plan Ready</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingTargets(!isEditingTargets)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>{isEditingTargets ? 'Done' : 'Edit'}</span>
                </button>
              </div>

              {/* Main Scrollable Content */}
              <div className="space-y-5 my-auto py-2">
                {/* Header Summary */}
                <div className="text-center space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Your customized plan is ready!
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-400">
                    Based on {onboardingData.heightCm} cm · {onboardingData.startWeight} kg ·{' '}
                    {onboardingData.activityLevel}
                  </p>
                </div>

                {/* Hero Daily Calorie Ring & Target Card */}
                <div className="bg-gradient-to-br from-[#1A2A33] to-[#0F172A] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Daily Calorie Target
                      </span>
                      {isEditingTargets ? (
                        <div className="flex items-baseline space-x-2 pt-1">
                          <input
                            type="number"
                            value={customCalories}
                            onChange={(e) =>
                              setCustomCalories(Math.max(1000, parseInt(e.target.value) || 0))
                            }
                            className="w-28 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-3xl font-black text-white outline-none focus:border-emerald-400 tabular-nums"
                          />
                          <span className="text-sm font-bold text-slate-300">kcal / day</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums">
                            {customCalories}
                          </span>
                          <span className="text-sm font-bold text-slate-400 uppercase">
                            kcal / day
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-slate-300 font-medium pt-1">
                        Goal: <strong className="text-white">{onboardingData.dietaryGoal}</strong>
                      </p>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex flex-col items-center justify-center shrink-0">
                      <Flame className="text-emerald-400 fill-emerald-400" size={26} />
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 mt-0.5">
                        TDEE {calculated.tdee}
                      </span>
                    </div>
                  </div>

                  {/* Macro Split Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-800">
                      <div
                        className="bg-[#99E0FF]"
                        style={{ width: `${calculated.carbsPct}%` }}
                      />
                      <div
                        className="bg-[#FF9999]"
                        style={{ width: `${calculated.proteinPct}%` }}
                      />
                      <div
                        className="bg-[#FFE066]"
                        style={{ width: `${calculated.fatPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-300">
                      <span>Carbs {calculated.carbsPct}%</span>
                      <span>Protein {calculated.proteinPct}%</span>
                      <span>Fat {calculated.fatPct}%</span>
                    </div>
                  </div>
                </div>

                {/* 4-Card Macronutrient Breakdown (Protein, Carbs, Fat, Fiber) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Daily Macronutrients
                    </h3>
                    {isEditingTargets && (
                      <span className="text-[11px] font-bold text-emerald-600">
                        Tap numbers to edit
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        label: 'Protein',
                        value: customProtein,
                        setter: setCustomProtein,
                        dotColor: 'bg-[#FF9999]',
                        borderColor: 'border-rose-100',
                        bgColor: 'bg-rose-50/40',
                        sub: 'Muscle & repair',
                      },
                      {
                        label: 'Carbs',
                        value: customCarbs,
                        setter: setCustomCarbs,
                        dotColor: 'bg-[#99E0FF]',
                        borderColor: 'border-sky-100',
                        bgColor: 'bg-sky-50/40',
                        sub: 'Daily energy',
                      },
                      {
                        label: 'Fats',
                        value: customFat,
                        setter: setCustomFat,
                        dotColor: 'bg-[#FFE066]',
                        borderColor: 'border-amber-100',
                        bgColor: 'bg-amber-50/40',
                        sub: 'Hormone health',
                      },
                      {
                        label: 'Fiber',
                        value: customFiber,
                        setter: setCustomFiber,
                        dotColor: 'bg-[#D5B4B4]',
                        borderColor: 'border-stone-200',
                        bgColor: 'bg-stone-50/60',
                        sub: 'Digestion',
                      },
                    ].map((macro) => (
                      <div
                        key={macro.label}
                        className={`rounded-2xl p-3.5 border ${macro.borderColor} ${macro.bgColor} flex flex-col justify-between`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${macro.dotColor}`} />
                          <span className="text-xs font-black text-slate-700">{macro.label}</span>
                        </div>

                        <div className="my-2">
                          {isEditingTargets ? (
                            <div className="flex items-baseline space-x-1">
                              <input
                                type="number"
                                value={macro.value}
                                onChange={(e) =>
                                  macro.setter(Math.max(0, parseInt(e.target.value) || 0))
                                }
                                className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-lg font-black text-slate-900 outline-none focus:border-emerald-500 tabular-nums"
                              />
                              <span className="text-xs font-bold text-slate-400">g</span>
                            </div>
                          ) : (
                            <p className="text-2xl font-black text-slate-900 tabular-nums">
                              {macro.value}
                              <span className="text-xs font-bold text-slate-400 ml-0.5">g</span>
                            </p>
                          )}
                        </div>

                        <p className="text-[10px] font-semibold text-slate-400">{macro.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goal Projection & Hydration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Weight Timeline Card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                      {weightDiff === 0 ? (
                        <Scale size={20} />
                      ) : isWeightLoss ? (
                        <TrendingDown size={20} />
                      ) : (
                        <TrendingUp size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Target Weight: {onboardingData.goalWeight} kg
                      </p>
                      <p className="text-sm font-black text-slate-900 truncate">
                        {weightDiff === 0
                          ? 'Maintain Current Weight'
                          : `${weightDiff > 0 ? '+' : ''}${weightDiff} kg by ${calculated.targetDateLabel}`}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        <span>
                          BMI {calculated.bmi} ({calculated.bmiCategory})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Hydration Target Card */}
                  <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <Droplet size={20} className="fill-sky-400 text-sky-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-600/80">
                        Daily Hydration
                      </p>
                      <p className="text-sm font-black text-slate-900 tabular-nums">
                        {(customWater / 1000).toFixed(1)} Litres ({customWater} ml)
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        ~{Math.round(customWater / 250)} glasses of air kosong
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 pb-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full bg-[#1A2A33] hover:bg-black text-white py-5 px-6 rounded-3xl font-black text-sm uppercase tracking-wider shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>
                    {isAuthenticated ? 'Start My MakanFit Journey' : 'Save My Plan & Create Account'}
                  </span>
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlanBuilder;
