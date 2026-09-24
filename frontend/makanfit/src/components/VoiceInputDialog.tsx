import React, { useState, useEffect, useMemo } from "react";
import {
  Mic,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Droplet,
  Plus,
  Minus,
} from "lucide-react";
import { MealType, Food, VoiceDetectionResult } from "../types/types";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { detectVoiceKeywords } from "../services/voiceKeywordDetector";
import { SEARCHABLE_FOODS } from "../data/foodDatabase";
import MealCategoryIcon from "./MealCategoryIcon";
import confetti from "canvas-confetti";

interface VoiceInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: MealType;
  onAddMeal: (food: Food, mealType: MealType) => void;
  onAddWater: (amountMl: number) => void;
  onOpenManualEdit?: (food: Food, category: MealType) => void;
  resumeSession?: boolean;
}

// const QUICK_VOICE_SUGGESTIONS = [
//   { text: 'Ate Nasi Lemak for breakfast', label: 'Nasi Lemak' },
//   { text: 'Had 2 roti canai for lunch', label: '2 Roti Canai' },
//   { text: 'Drank 2 glasses of water', label: '2 Glasses Water' },
//   { text: 'Had Bak Kut Teh for dinner', label: 'Bak Kut Teh' },
//   { text: 'Ate 1 apple for snack', label: '1 Apple' },
// ];

// Water amount stepper config
const WATER_STEP_ML = 50;
const WATER_MIN_ML = 50;
const WATER_MAX_ML = 5000;
const clampWater = (v: number) =>
  Math.min(WATER_MAX_ML, Math.max(WATER_MIN_ML, v));

export const VoiceInputDialog: React.FC<VoiceInputDialogProps> = ({
  isOpen,
  onClose,
  defaultCategory = "breakfast",
  onAddMeal,
  onAddWater,
  onOpenManualEdit,
  resumeSession = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<"en-MY" | "ms-MY">("en-MY");
  // const [autoLogCountdown, setAutoLogCountdown] = useState<number | null>(null);
  const [lastLoggedMessage, setLastLoggedMessage] = useState<string | null>(
    null,
  );

  // NEW: user-amended water amount (null = use what voice detected)
  const [waterOverride, setWaterOverride] = useState<number | null>(null);
  // NEW: raw text while typing in the input (null = show the real value)
  const [waterText, setWaterText] = useState<string | null>(null);

  const {
    isListening,
    transcript,
    audioLevel,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    // setManualTranscript,
  } = useVoiceRecognition();

  // Instant in-browser keyword extraction
  const detectionResult: VoiceDetectionResult = useMemo(() => {
    return detectVoiceKeywords(transcript, defaultCategory, SEARCHABLE_FOODS);
  }, [transcript, defaultCategory]);

  // NEW: effective water amount = manual amend, else detected
  const effectiveWaterMl = waterOverride ?? detectionResult.waterAmountMl ?? 0;

  // NEW: a fresh voice transcript discards previous manual amendments
  useEffect(() => {
    setWaterOverride(null);
    setWaterText(null);
  }, [transcript]);

  useEffect(() => {
    if (isOpen) {
      if (!resumeSession) {
        resetTranscript();
        setLastLoggedMessage(null);
        setWaterOverride(null);
        setWaterText(null);
        if (isSupported) {
          startListening(selectedLang);
        }
      }
    } else {
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Hands-free auto log timer
  // useEffect(() => {
  //   let timer: any;
  //   if (autoLogCountdown !== null && autoLogCountdown > 0) {
  //     timer = setTimeout(() => {
  //       setAutoLogCountdown((prev) => (prev !== null ? prev - 1 : null));
  //     }, 1000);
  //   } else if (autoLogCountdown === 0) {
  //     handleExecuteCommand();
  //   }
  //   return () => clearTimeout(timer);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [autoLogCountdown]);

  // useEffect(() => {
  //   if (detectionResult.canExecute && !isListening && autoLogCountdown === null && !lastLoggedMessage) {
  //     setAutoLogCountdown(3);
  //   }
  // }, [detectionResult.canExecute, isListening, autoLogCountdown, lastLoggedMessage]);

  if (!isOpen) return null;

  // NEW: -/+ handler. Stops the mic first so new transcripts don't overwrite the edit.
  const adjustWater = (delta: number) => {
    if (isListening) stopListening();
    setWaterText(null);
    setWaterOverride(clampWater(effectiveWaterMl + delta));
  };

  // NEW: typed amount
  const handleWaterTyping = (raw: string) => {
    if (isListening) stopListening();
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setWaterText(digits);
    if (digits) setWaterOverride(clampWater(parseInt(digits, 10)));
  };

  const commitWaterTyping = () => {
    setWaterText(null); // fall back to showing the clamped override
  };

  const handleExecuteCommand = () => {
    // setAutoLogCountdown(null);

    if (detectionResult.intent === "LOG_WATER" && effectiveWaterMl > 0) {
      onAddWater(effectiveWaterMl);
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#38bdf8", "#0284c7"],
      });
      setLastLoggedMessage(`Added ${effectiveWaterMl} ml water`);
      setTimeout(() => {
        onClose();
      }, 1100);
    } else if (
      detectionResult.intent === "LOG_FOOD" &&
      detectionResult.matchedFood
    ) {
      const food = detectionResult.matchedFood;
      const targetCat = detectionResult.category || defaultCategory;
      const factor = detectionResult.quantity || 1;

      const finalFood: Food = {
        ...food,
        servingSize:
          detectionResult.unit === "g"
            ? factor
            : Math.round(food.servingSize * factor),
        nutrients: {
          ...food.nutrients,
          calories: Math.round(food.nutrients.calories * factor),
          protein: Math.round(food.nutrients.protein * factor),
          carbs: Math.round(food.nutrients.carbs * factor),
          fat: Math.round(food.nutrients.fat * factor),
          fiber: Math.round(food.nutrients.fiber * factor),
        },
      };

      onAddMeal(finalFood, targetCat);
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10b981", "#059669"],
      });

      const catName =
        targetCat === "snack"
          ? "Snacks"
          : targetCat.charAt(0).toUpperCase() + targetCat.slice(1);
      setLastLoggedMessage(`Logged ${finalFood.name} to ${catName}!`);
      setTimeout(() => {
        onClose();
      }, 1100);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Clean Bottom Sheet matching MakanFit style */}
      <div className="fixed inset-x-0 bottom-0 bg-white z-[130] rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-md mx-auto space-y-5">
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Voice Log
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Auto-detects food, portion & meal
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Minimal Language Switcher */}
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5 text-[11px] font-bold">
              <button
                onClick={() => {
                  setSelectedLang("en-MY");
                  if (isListening) {
                    stopListening();
                    setTimeout(() => startListening("en-MY"), 150);
                  }
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  selectedLang === "en-MY"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setSelectedLang("ms-MY");
                  if (isListening) {
                    stopListening();
                    setTimeout(() => startListening("ms-MY"), 150);
                  }
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  selectedLang === "ms-MY"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500"
                }`}
              >
                BM
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Success State */}
        {lastLoggedMessage ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <p className="font-extrabold text-slate-900 text-base">
              {lastLoggedMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Center Mic Area */}
            <div className="flex flex-col items-center justify-center space-y-3 py-1">
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <div
                    className="absolute rounded-full bg-slate-900/10 animate-ping"
                    style={{
                      width: `${64 + audioLevel * 0.5}px`,
                      height: `${64 + audioLevel * 0.5}px`,
                    }}
                  />
                )}

                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening(selectedLang);
                    }
                  }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all cursor-pointer ${
                    isListening
                      ? "bg-[#1E293B] ring-4 ring-emerald-400/40"
                      : "bg-[#1E293B] hover:bg-slate-900"
                  }`}
                  aria-label={
                    isListening ? "Stop listening" : "Start listening"
                  }
                >
                  {isListening ? (
                    <Mic size={26} className="text-emerald-400 animate-pulse" />
                  ) : (
                    <Mic size={26} className="text-white" />
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-slate-700">
                  {isListening ? "Listening... speak now" : "Tap mic to speak"}
                </p>
                <p className="text-[11px] text-slate-400">
                  e.g. <em>"Ate Nasi Lemak for breakfast"</em> or{" "}
                  <em>"Drank 2 glasses of water"</em>
                </p>
              </div>
            </div>

            {/* Error banner if mic denied */}
            {error && (
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-900 text-xs flex items-center space-x-2 border border-amber-200">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <p className="flex-1 leading-tight">{error}</p>
              </div>
            )}

            {/* Transcript Box */}
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 min-h-[46px] flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">
                {transcript ? (
                  `"${transcript}"`
                ) : (
                  <span className="text-slate-400 italic">
                    Waiting for voice...
                  </span>
                )}
              </p>
              {transcript && (
                <button
                  onClick={resetTranscript}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg ml-2"
                  title="Clear transcript"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>

            {/* Detected Food / Water Card */}
            {detectionResult.canExecute && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-3 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {detectionResult.intent === "LOG_FOOD" && (
                      <MealCategoryIcon
                        type={detectionResult.category || defaultCategory}
                        size={48}
                      />
                    )}
                    {detectionResult.intent === "LOG_WATER" && (
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center font-bold">
                        <Droplet className="w-5 h-5 text-sky-400 fill-sky-200" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">
                        {detectionResult.intent === "LOG_WATER"
                          ? "Hydration"
                          : detectionResult.category || defaultCategory}
                      </span>
                      <h4 className="font-black text-slate-900 text-base leading-tight">
                        {detectionResult.intent === "LOG_WATER"
                          ? `Water`
                          : detectionResult.matchedFood?.name}
                      </h4>
                    </div>
                  </div>

                  {detectionResult.intent === "LOG_WATER" ? (
                    /* NEW: editable water amount  (-  [ 500 ] ml  +) */
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => adjustWater(-WATER_STEP_ML)}
                        disabled={effectiveWaterMl <= WATER_MIN_ML}
                        className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Decrease water by ${WATER_STEP_ML} ml`}
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>

                      <div className="flex items-baseline justify-center bg-sky-50/60 rounded-xl px-2 py-1 border border-sky-100 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-200/60 transition-all">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={waterText ?? String(effectiveWaterMl)}
                          onChange={(e) => handleWaterTyping(e.target.value)}
                          onFocus={(e) => e.target.select()}
                          onBlur={commitWaterTyping}
                          className="w-12 bg-transparent text-right text-base font-black text-sky-600 outline-none"
                          aria-label="Water amount in millilitres"
                        />
                        <span className="text-[11px] font-bold text-sky-400 ml-1">
                          ml
                        </span>
                      </div>

                      <button
                        onClick={() => adjustWater(WATER_STEP_ML)}
                        disabled={effectiveWaterMl >= WATER_MAX_ML}
                        className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Increase water by ${WATER_STEP_ML} ml`}
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-600">
                        {`${Math.round(
                          (detectionResult.matchedFood?.nutrients.calories ||
                            0) * (detectionResult.quantity || 1),
                        )} Cal`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {detectionResult.quantity} {detectionResult.unit}
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={handleExecuteCommand}
                  className="w-full bg-[#1A2A33] hover:bg-black text-white font-black py-4 rounded-3xl shadow-md active:scale-[0.98] transition-all uppercase tracking-widest text-xs cursor-pointer flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {`Log ${detectionResult.intent === "LOG_WATER" ? "Water" : "to " + (detectionResult.category || defaultCategory)}`}
                    {/* {autoLogCountdown !== null
                      ? `Confirm (${autoLogCountdown}s)`
                      : `Log ${detectionResult.intent === 'LOG_WATER' ? 'Water' : 'to ' + (detectionResult.category || defaultCategory)}`} */}
                  </span>
                </button>

                {detectionResult.canExecute &&
                  detectionResult.intent === "LOG_FOOD" &&
                  onOpenManualEdit && (
                    <button
                      onClick={() => {
                        stopListening();
                        const targetCat =
                          detectionResult.category || defaultCategory;
                        onOpenManualEdit(
                          detectionResult.matchedFood!,
                          targetCat,
                        );
                        onClose();
                      }}
                      className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-slate-700 py-1"
                    >
                      Adjust portion / ingredients before logging
                    </button>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default VoiceInputDialog;
