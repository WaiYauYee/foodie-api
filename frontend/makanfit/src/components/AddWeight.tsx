import React, { useMemo, useState } from "react";
import { X, CalendarIcon, Minus, Plus } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/calendar-custom.css";

interface AddWeightProps {
  currentWeight: number;
  onBack: () => void;
  onAdd: (weight: number, recordedAt?: number) => void;
}

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const AddWeight: React.FC<AddWeightProps> = ({
  currentWeight,
  onBack,
  onAdd,
}) => {
  const initialVal =
    Number.isFinite(currentWeight) && currentWeight > 0 ? currentWeight : 65;
  const [weightValue, setWeightValue] = useState<number>(
    Math.round(initialVal * 10) / 10,
  );
  const [weightInput, setWeightInput] = useState<string>(
    (Math.round(initialVal * 10) / 10).toFixed(1),
  );

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

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

  const handleAdd = () => {
    const numericWeight = parseFloat(weightInput);
    const finalWeight =
      !isNaN(numericWeight) && numericWeight > 0 ? numericWeight : weightValue;
    if (finalWeight > 0) {
      onAdd(Math.round(finalWeight * 10) / 10, selectedDate.getTime());
      onBack();
    }
  };

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
    <div className="fixed inset-0 bg-[#F5F5F5] z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="px-4 py-5 flex items-center bg-[#E6F4F1] border-b border-gray-100">
        <button onClick={onBack} className="p-1 text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-xl font-black text-gray-900 tracking-tight pl-4 tracking-wide text-sm">
          Log a weight entry
        </h2>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Date Selector Row */}
      <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-50">
        <div className="relative z-10 w-full flex items-center justify-between bg-gray-50 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Check-In Date
            </span>
            <span className="text-sm font-black text-[#2D3E50]">
              {formattedDateLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-extrabold text-[#2D3E50] transition-all active:scale-95 cursor-pointer"
            aria-label="Choose date"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
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
      <div className="flex-1 flex flex-col items-center justify-start pt-5 bg-white overflow-y-auto">
        {/* Scale Icon Placeholder (Simplified SVG) */}
        <div className="w-20 h-20 bg-[#BEE3F8] rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/80 rounded-sm" />
          <div className="w-14 h-10 bg-white/40 rounded-full mt-4" />
        </div>

        <div className="flex items-center">
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 py-2">
            <button
              type="button"
              onClick={() => handleStep(-0.1)}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center active:scale-90 transition-all cursor-pointer border border-slate-200/60"
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
                className="w-28 text-4xl font-bold text-[#2D3E50] bg-transparent text-center focus:outline-none"
              />
              <span className="text-xl font-bold text-gray-400 ml-1">kg</span>
            </div>

            <button
              type="button"
              onClick={() => handleStep(0.1)}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center active:scale-90 transition-all cursor-pointer border border-emerald-200/60"
              aria-label="Increase weight by 0.1 kg"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Interactive Scale Ruler & Slider */}
        <div className="w-full space-y-3 pt-10 p-6">
          {/* Visual Ruler Marks */}
          <div className="relative h-14 w-full bg-slate-50 rounded-2xl border border-slate-200/70 overflow-hidden flex items-end justify-center pb-2 select-none">
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-emerald-500 rounded-full z-10 shadow-xs" />

            {rulerTicks.map((t) =>
              t.inRange ? (
                <button
                  key={t.tenths}
                  type="button"
                  onClick={() => clampWeight(t.val)}
                  className="w-3 shrink-0 flex flex-col items-center justify-end h-full group cursor-pointer focus:outline-none"
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
                    className={`w-0.5 rounded-full ${
                      t.offset === 0
                        ? "h-6 bg-emerald-500"
                        : t.isWhole
                          ? "h-5 bg-slate-400"
                          : t.isHalf
                            ? "h-3.5 bg-slate-300"
                            : "h-2 bg-slate-200"
                    }`}
                  />
                </button>
              ) : (
                <div key={t.tenths} className="w-3 shrink-0" />
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1">
              <span>Slide to adjust</span>
              <span>Tap +/- for 0.1 kg precision</span>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="mt-2 w-full px-12">
          <button
            onClick={handleAdd}
            className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWeight;
