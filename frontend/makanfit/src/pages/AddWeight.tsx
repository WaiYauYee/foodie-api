import React, { useCallback, useEffect, useMemo, useState } from "react";
import { X, CalendarIcon, Minus, Plus } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/calendar-custom.css";
import { WeightEntry } from "../types/types";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useWeights } from "../contexts/WeightContext";

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const AddWeight: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addWeight: onAdd } = useWeights();

  const currentWeight = user.currentWeight;
  const editingEntry =
    (location.state?.entry as WeightEntry | undefined) ?? null;
  const onBack = useCallback(() => navigate("/"), [navigate]);

  const initialVal =
    Number.isFinite(currentWeight) && currentWeight > 0 ? currentWeight : 65;

  const initialWeight = editingEntry?.weight ?? initialVal;

  const [weightValue, setWeightValue] = useState<number>(
    Math.round(initialWeight * 10) / 10,
  );

  const [weightInput, setWeightInput] = useState<string>(
    (Math.round(initialWeight * 10) / 10).toFixed(1),
  );

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    editingEntry ? new Date(editingEntry.recordedAt) : new Date(),
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Close on Escape (calendar first, then the whole screen) - handy on laptop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isCalendarOpen) setIsCalendarOpen(false);
      else onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCalendarOpen, onBack]);

  const clampWeight = (val: number) => {
    const clamped = Math.min(250, Math.max(25, Math.round(val * 10) / 10));
    setWeightValue(clamped);
    setWeightInput(clamped.toFixed(1));
  };

  const handleStep = (delta: number) => {
    clampWeight(weightValue + delta);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setWeightInput(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed >= 25 && parsed <= 250) {
      setWeightValue(Math.round(parsed * 10) / 10);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(weightInput);
    if (isNaN(parsed) || parsed < 25) {
      clampWeight(initialVal);
    } else {
      clampWeight(parsed);
    }
  };

  const formattedDateLabel = useMemo(() => {
    const now = new Date();
    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();

    if (isToday) {
      return `Today, ${selectedDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })}`;
    }

    return selectedDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [selectedDate]);

  const handleAdd = async () => {
    const numericWeight = parseFloat(weightInput);
    const finalWeight =
      !isNaN(numericWeight) && numericWeight > 0 ? numericWeight : weightValue;
    if (finalWeight > 0) {
      const ok = await onAdd(Math.round(finalWeight * 10) / 10);
      if (ok) onBack();
    }
  };

  // Difference from the last logged weight
  const delta = Math.round((weightValue - initialVal) * 10) / 10;
  const deltaLabel =
    delta === 0
      ? "Same as last entry"
      : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg from last entry`;

  // Generate ruler ticks around current weightValue
  const rulerTicks = useMemo(() => {
    const centerTenths = Math.round(weightValue * 10);
    const ticks = [];
    for (let i = -15; i <= 15; i++) {
      const tenthVal = centerTenths + i;
      ticks.push({
        tenths: tenthVal,
        val: tenthVal / 10,
        offset: i,
        inRange: tenthVal >= 250 && tenthVal <= 2500,
        isWhole: tenthVal % 10 === 0,
        isHalf: tenthVal % 5 === 0 && tenthVal % 10 !== 0,
      });
    }
    return ticks;
  }, [weightValue]);

  return (
    // Mobile: full screen. Laptop: dimmed backdrop with a centered panel.
    <div
      className="fixed inset-0 z-[100] bg-white lg:bg-slate-900/50 lg:backdrop-blur-sm lg:flex lg:items-center lg:justify-center lg:p-8 animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 lg:fade-in duration-300"
      onClick={onBack}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log a weight entry"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col h-full w-full bg-white overflow-hidden lg:h-auto lg:max-h-[92vh] lg:max-w-xl lg:rounded-[32px] lg:shadow-2xl"
      >
        {/* Header */}
        <div className="px-4 py-5 lg:px-6 flex items-center bg-[#E6F4F1] border-b border-gray-100 shrink-0">
          <button
            onClick={onBack}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center text-lg lg:text-xl font-extrabold text-slate-900 pl-3">
            {editingEntry ? "Edit Weight Entry" : "Log a Weight Entry"}
          </h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Date Selector Row */}
        <div className="bg-white px-6 py-5 border-b border-gray-50 shrink-0">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            aria-label="Choose date"
            className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-2xl border border-gray-100 transition-colors text-left cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Check-In Date
              </span>
              <span className="text-sm font-black text-[#2D3E50]">
                {formattedDateLabel}
              </span>
            </div>
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
            </span>
          </button>
        </div>

        {/* Calendar Modal */}
        {isCalendarOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-6 animate-in fade-in duration-200"
            onClick={() => setIsCalendarOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Select check-in date"
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-extrabold text-slate-700">
                  Select Check-In Date
                </span>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                  aria-label="Close calendar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <Calendar
                  value={selectedDate}
                  maxDate={getToday()}
                  locale="en-GB"
                  onChange={(value) => {
                    const picked = Array.isArray(value) ? value[0] : value;
                    if (picked instanceof Date) {
                      setSelectedDate(picked);
                      setIsCalendarOpen(false);
                    }
                  }}
                  className="makanfit-calendar"
                  maxDetail="month"
                  minDetail="year"
                  next2Label={null}
                  prev2Label={null}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setIsCalendarOpen(false);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Reset to Today
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Entry Area */}
        <div className="flex-1 flex flex-col items-center justify-start pt-6 lg:pt-8 bg-white overflow-y-auto">
          {/* Scale Icon Placeholder (Simplified SVG) */}
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#BEE3F8] rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden shrink-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/80 rounded-sm" />
            <div className="w-14 h-10 lg:w-16 lg:h-12 bg-white/40 rounded-full mt-4" />
          </div>

          <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8 pt-4 pb-1">
            <button
              type="button"
              onClick={() => handleStep(-0.1)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center active:scale-90 transition-all cursor-pointer border border-slate-200/60"
              aria-label="Decrease weight by 0.1 kg"
            >
              <Minus className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <div className="flex items-baseline border-b-2 border-[#2D3E50] pb-1">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weightInput}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                aria-label="Weight in kilograms"
                className="w-28 lg:w-36 text-4xl lg:text-5xl font-bold text-[#2D3E50] bg-transparent text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xl lg:text-2xl font-bold text-gray-400 ml-1">
                kg
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStep(0.1)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center active:scale-90 transition-all cursor-pointer border border-slate-200/60"
              aria-label="Increase weight by 0.1 kg"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          <p className="text-xs font-bold text-slate-400 pt-2">{deltaLabel}</p>

          {/* Interactive Scale Ruler & Slider */}
          <div className="w-full space-y-3 pt-8 lg:pt-10 px-6 pb-6 lg:px-10">
            {/* Visual Ruler Marks */}
            <div className="relative h-14 lg:h-16 w-full bg-slate-50 rounded-2xl border border-slate-200/70 overflow-hidden flex items-end justify-center pb-2 select-none">
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-emerald-500 rounded-full z-10 shadow-xs" />

              {rulerTicks.map((t) =>
                t.inRange ? (
                  <button
                    key={t.tenths}
                    type="button"
                    onClick={() => clampWeight(t.val)}
                    aria-label={`Set weight to ${t.val.toFixed(1)} kg`}
                    className="w-3 lg:w-4 shrink-0 flex flex-col items-center justify-end h-full group cursor-pointer focus:outline-none"
                  >
                    {t.isWhole && (
                      <span
                        className={`text-[10px] font-bold mb-1.5 tabular-nums whitespace-nowrap ${
                          t.offset === 0
                            ? "text-emerald-600 font-black"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      >
                        {t.val}
                      </span>
                    )}
                    <div
                      className={`w-0.5 rounded-full transition-colors ${
                        t.offset === 0
                          ? "h-6 bg-emerald-500"
                          : t.isWhole
                            ? "h-5 bg-slate-400"
                            : t.isHalf
                              ? "h-3.5 bg-slate-300"
                              : "h-2 bg-slate-200 group-hover:bg-slate-400"
                      }`}
                    />
                  </button>
                ) : (
                  <div key={t.tenths} className="w-3 lg:w-4 shrink-0" />
                ),
              )}
            </div>

            {/* Smooth Range Scrubber for Quick Dragging */}
            <div className="px-1">
              <input
                type="range"
                min={25}
                max={250}
                step="0.1"
                value={weightValue}
                onChange={(e) => clampWeight(parseFloat(e.target.value))}
                aria-label="Weight slider"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1">
                <span>Slide to adjust</span>
                <span>Tap +/- for 0.1 kg precision</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions (pinned) */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4 lg:px-10 lg:py-5 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="hidden lg:block flex-1 py-4 rounded-3xl border-2 border-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 lg:flex-[2] bg-[#1A2A33] text-white font-black py-4 lg:py-4 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
          >
            {editingEntry ? "Save Changes" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWeight;
