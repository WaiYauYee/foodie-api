import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  X, 
  Check, 
  Camera, 
  Calendar, 
  Sparkles, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { MealEntry } from '../types/types';
import { 
  calculateStreak, 
  getStreakHistory7Days, 
  STREAK_MILESTONES,
  StreakMilestone
} from '../utils/streak';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: MealEntry[];
  onLogMeal: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  meals,
  onLogMeal,
}) => {
  const streakInfo = calculateStreak(meals);
  const past7Days = getStreakHistory7Days(meals);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Find next milestone
  const nextMilestone: StreakMilestone = 
    STREAK_MILESTONES.find(m => m.days > streakInfo.streak) || 
    STREAK_MILESTONES[STREAK_MILESTONES.length - 1];

  const prevMilestoneDays = 
    [...STREAK_MILESTONES].reverse().find(m => m.days <= streakInfo.streak)?.days || 0;

  const milestoneProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((streakInfo.streak - prevMilestoneDays) / 
          Math.max(1, nextMilestone.days - prevMilestoneDays)) * 100
      )
    )
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
          >
            {/* Ambient Background Gradient Banner */}
            <div className={`p-20 pt-7 text-center relative overflow-hidden transition-colors ${
              streakInfo.hasLoggedToday 
                ? 'bg-gradient-to-b from-orange-500 via-amber-500 to-amber-50' 
                : streakInfo.streak > 0
                ? 'bg-gradient-to-b from-amber-500 via-amber-400 to-amber-50'
                : 'bg-gradient-to-b from-slate-600 via-slate-500 to-slate-50'
            }`}>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/15 hover:bg-black/25 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Glowing Streak Flame Icon */}
              <div className="mx-auto mb-3 w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md p-1 shadow-lg flex items-center justify-center ring-4 ring-white/30">
                <div className={`w-full h-full rounded-2xl flex items-center justify-center shadow-inner ${
                  streakInfo.hasLoggedToday
                    ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white'
                    : streakInfo.streak > 0
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-white'
                    : 'bg-slate-300 text-slate-500'
                }`}>
                  <Flame 
                    size={44} 
                    className={streakInfo.streak > 0 ? "fill-white animate-pulse" : ""} 
                  />
                </div>
              </div>

              {/* Day Count */}
              <div className="inline-flex items-baseline space-x-1.5 text-white drop-shadow-xs">
                <span className="text-5xl font-black tracking-tight">{streakInfo.streak}</span>
                <span className="text-xl font-bold opacity-90">Days</span>
              </div>

              {/* Status Pill */}
              <div className="mt-2.5 flex justify-center pb-44">
                <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-[10px] font-black shadow-sm ${
                  streakInfo.hasLoggedToday
                    ? 'bg-white text-orange-700'
                    : streakInfo.streak > 0
                    ? 'bg-white text-amber-800'
                    : 'bg-white text-slate-700'
                }`}>
                  <span>{streakInfo.statusBadge}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                  <span className="font-semibold">{streakInfo.statusMessage}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
              
              {/* 7-Day Rolling Calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <Calendar size={16} className="text-orange-500" />
                    <span>Past 7 Days</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {streakInfo.hasLoggedToday ? 'Today Complete' : 'Awaiting Today'}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  {past7Days.map((day) => (
                    <div 
                      key={day.dateKey}
                      className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl transition-all ${
                        day.isToday 
                          ? 'bg-white shadow-xs border-2 border-orange-400' 
                          : 'bg-transparent'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {day.dayLabel}
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 my-0.5">
                        {day.dayNumber}
                      </span>
                      <div className="mt-1">
                        {day.logged ? (
                          <div 
                            className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xs"
                            title={`${day.mealCount} meal(s) logged`}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        ) : day.isToday ? (
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center text-amber-500 bg-amber-50"
                            title="Log today to keep streak!"
                          >
                            <Clock size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                          </div>
                        ) : (
                          <div 
                            className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold"
                            title="No meals logged"
                          >
                            —
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Milestone Card */}
              <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white p-4 rounded-2xl border border-amber-200/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{nextMilestone.badgeEmoji}</span>
                    <div>
                      <p className="text-xs font-extrabold text-amber-900">
                        Next Goal: {nextMilestone.title} ({nextMilestone.days} Days)
                      </p>
                      <p className="text-[11px] text-amber-700/80 font-medium">
                        Reward: +{nextMilestone.rewardCoins} MakanCoins
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    {Math.max(0, nextMilestone.days - streakInfo.streak)} days left
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-amber-200/50 h-2.5 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  />
                </div>
              </div>

              {/* Streak Rules & Tips */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-start space-x-2.5">
                  <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-800">Daily Requirement:</strong> Log at least 1 meal before midnight to keep your flame blazing.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-800">Missed Day Rule:</strong> If no meal is logged for the full day, your streak will reset to zero on the next day.
                  </p>
                </div>
              </div>

            </div>

            {/* Action Buttons Footer */}
            <div className="p-5 border-t border-slate-100 bg-white flex flex-col space-y-2.5">
              {streakInfo.isPending || streakInfo.streak === 0 ? (
                <button
                  onClick={() => {
                    onClose();
                    onLogMeal();
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Camera size={18} />
                  <span>Log a Meal Now to Keep Streak!</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onLogMeal();
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Camera size={18} />
                  <span>Log Another Meal</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StreakModal;
