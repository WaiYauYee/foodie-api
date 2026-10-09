import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  X,
  Check,
  Camera,
  Calendar,
  Sparkles,
  Clock,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { MealEntry } from "../types/types";
import {
  calculateStreak,
  getStreakHistory7Days,
  STREAK_MILESTONES,
  StreakMilestone,
} from "../utils/streak";

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
  const streakInfo = useMemo(() => calculateStreak(meals), [meals]);
  const past7Days = useMemo(() => getStreakHistory7Days(meals), [meals]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const lastMilestone = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const upcoming = STREAK_MILESTONES.find((m) => m.days > streakInfo.streak);
  const allDone = !upcoming;
  const nextMilestone: StreakMilestone = upcoming || lastMilestone;

  const prevMilestoneDays =
    [...STREAK_MILESTONES].reverse().find((m) => m.days <= streakInfo.streak)
      ?.days || 0;

  const milestoneProgress = allDone
    ? 100
    : Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((streakInfo.streak - prevMilestoneDays) /
              Math.max(1, nextMilestone.days - prevMilestoneDays)) *
              100,
          ),
        ),
      );

  const isActive = streakInfo.streak > 0;

  const heroBg = streakInfo.hasLoggedToday
    ? "from-orange-100 via-amber-50 to-white"
    : isActive
      ? "from-amber-100 via-amber-50 to-white"
      : "from-slate-100 via-slate-50 to-white";

  const flameBg = streakInfo.hasLoggedToday
    ? "bg-gradient-to-tr from-orange-500 to-amber-400 text-white"
    : isActive
      ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-white"
      : "bg-gray-200 text-gray-400";

  const handleLogMeal = () => {
    onClose();
    onLogMeal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Meal logging streak"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-[#F8FAFC] rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
          >
            {/* Hero */}
            <div
              className={`relative bg-gradient-to-b ${heroBg} px-6 pt-8 pb-6 flex flex-col items-center text-center`}
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2.5 bg-white rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm active:scale-95 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-lg border border-white p-1.5">
                <div
                  className={`w-full h-full rounded-3xl flex items-center justify-center shadow-inner ${flameBg}`}
                >
                  <Flame
                    size={40}
                    className={isActive ? "fill-white animate-pulse" : ""}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-baseline space-x-2 text-gray-900">
                <span className="text-5xl font-black tracking-tight tabular-nums">
                  {streakInfo.streak}
                </span>
                <span className="text-sm font-black uppercase tracking-widest text-gray-400">
                  {streakInfo.streak === 1 ? "Day" : "Days"}
                </span>
              </div>

              <div className="mt-4 inline-flex items-center space-x-2 bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                  {streakInfo.statusBadge}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[11px] font-semibold text-gray-500">
                  {streakInfo.statusMessage}
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 pt-2 pb-6 space-y-6 overflow-y-auto flex-1">
              {/* 7-Day Calendar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-orange-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Past 7 Days
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      streakInfo.hasLoggedToday
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  >
                    {streakInfo.hasLoggedToday
                      ? "Today Complete"
                      : "Awaiting Today"}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 bg-white p-2.5 rounded-3xl border border-gray-100 shadow-lg">
                  {past7Days.map((day) => (
                    <div
                      key={day.dateKey}
                      className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all ${
                        day.isToday
                          ? "bg-orange-50 border-2 border-orange-300"
                          : "bg-gray-50 border-2 border-transparent"
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                        {day.dayLabel}
                      </span>
                      <span className="text-xs font-black text-gray-700 my-1">
                        {day.dayNumber}
                      </span>
                      {day.logged ? (
                        <div
                          className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm"
                          title={`${day.mealCount} meal(s) logged`}
                        >
                          <Check size={13} strokeWidth={3.5} />
                        </div>
                      ) : day.isToday ? (
                        <div
                          className="w-6 h-6 rounded-full border-2 border-dashed border-amber-400 bg-amber-50 flex items-center justify-center text-amber-500"
                          title="Log today to keep your streak!"
                        >
                          <Clock
                            size={12}
                            className="animate-spin"
                            style={{ animationDuration: "6s" }}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-[10px] font-black"
                          title="No meals logged"
                        >
                          —
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Milestone */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 px-2">
                  <Trophy size={14} className="text-orange-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {allDone ? "All Milestones Reached" : "Next Milestone"}
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-lg">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 shrink-0 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-2xl">
                        {nextMilestone.badgeEmoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 tracking-tight truncate">
                          {nextMilestone.title}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-400">
                          {nextMilestone.days} days · +
                          {nextMilestone.rewardCoins} MakanCoins
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
                      {allDone
                        ? "Done"
                        : `${Math.max(0, nextMilestone.days - streakInfo.streak)} left`}
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestoneProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    />
                  </div>
                  <p className="mt-2 text-right text-[10px] font-black uppercase tracking-widest text-gray-300">
                    {milestoneProgress}%
                  </p>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-gray-100 p-5 rounded-3xl space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 shrink-0 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Sparkles size={15} className="text-amber-500" />
                  </div>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">
                    <strong className="font-black text-gray-800">
                      Daily requirement:
                    </strong>{" "}
                    Log at least 1 meal before midnight to keep your flame
                    blazing.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 shrink-0 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <AlertCircle size={15} className="text-orange-500" />
                  </div>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">
                    <strong className="font-black text-gray-800">
                      Missed day rule:
                    </strong>{" "}
                    If no meal is logged for the full day, your streak resets
                    to zero the next day.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pt-4 pb-6 bg-white border-t border-gray-100 space-y-1">
              <button
                onClick={handleLogMeal}
                className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs flex items-center justify-center space-x-3 cursor-pointer"
              >
                <Camera size={18} />
                <span>
                  {streakInfo.isPending || streakInfo.streak === 0
                    ? "Log a meal to keep streak"
                    : "Log another meal"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StreakModal;