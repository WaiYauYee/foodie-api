import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Droplet,
  Plus,
  Minus,
  Pencil,
} from 'lucide-react';
import { MealType, Food, VoiceDetectionResult } from '../types/types';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { detectVoiceKeywords } from '../services/voiceKeywordDetector';
import { SEARCHABLE_FOODS } from '../data/foodDatabase';
import MealCategoryIcon from './MealCategoryIcon';
import confetti from 'canvas-confetti';

interface VoiceInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: MealType;
  onAddMeal: (food: Food, mealType: MealType) => void;
  onAddWater: (amountMl: number) => void;
  onOpenManualEdit?: (food: Food, category: MealType) => void;
  resumeSession?: boolean;
}

interface EditableItem {
  id: string;
  food: Food;
  quantity: number;
  unit: string;
  category: MealType;
}

const QUICK_VOICE_SUGGESTIONS = [
  { text: 'Ate Nasi Lemak for breakfast', label: 'Nasi Lemak' },
  { text: 'Had 2 roti canai for lunch', label: '2 Roti Canai' },
  { text: 'Drank 2 glasses of water', label: '2 Glasses Water' },
  { text: 'Had Bak Kut Teh for dinner', label: 'Bak Kut Teh' },
  { text: 'Ate 1 apple for snack', label: '1 Apple' },
];

export const VoiceInputDialog: React.FC<VoiceInputDialogProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'breakfast',
  onAddMeal,
  onAddWater,
  onOpenManualEdit,
  resumeSession = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<'en-MY' | 'ms-MY'>('en-MY');
  // const [autoLogCountdown, setAutoLogCountdown] = useState<number | null>(null);
  const [lastLoggedMessage, setLastLoggedMessage] = useState<string | null>(null);

  // Editable lists allowing user to amend recognized foods & hydration
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [editableWaterMl, setEditableWaterMl] = useState<number | null>(null);

  const {
    isListening,
    transcript,
    audioLevel,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
  } = useVoiceRecognition();

  // Instant in-browser keyword extraction
  const detectionResult: VoiceDetectionResult = useMemo(() => {
    return detectVoiceKeywords(transcript, defaultCategory, SEARCHABLE_FOODS);
  }, [transcript, defaultCategory]);

  // Synchronize detection results into editable items whenever new speech is parsed
  useEffect(() => {
    if (detectionResult.items && detectionResult.items.length > 0) {
      setEditableItems(
        detectionResult.items.map((it, idx) => ({
          id: `${it.food.id}-${idx}`,
          food: it.food,
          quantity: it.quantity || 1,
          unit: it.unit || 'serving',
          category: it.category || detectionResult.category || defaultCategory,
        }))
      );
    } else if (detectionResult.matchedFood) {
      setEditableItems([
        {
          id: `${detectionResult.matchedFood.id}-0`,
          food: detectionResult.matchedFood,
          quantity: detectionResult.quantity || 1,
          unit: detectionResult.unit || 'serving',
          category: detectionResult.category || defaultCategory,
        },
      ]);
    } else {
      setEditableItems([]);
    }

    if (detectionResult.waterAmountMl && detectionResult.waterAmountMl > 0) {
      setEditableWaterMl(detectionResult.waterAmountMl);
    } else {
      setEditableWaterMl(null);
    }
  }, [detectionResult, defaultCategory]);

  useEffect(() => {
    if (isOpen) {
      if (!resumeSession) {
        resetTranscript();
        setLastLoggedMessage(null);
        setEditableItems([]);
        setEditableWaterMl(null);
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

  // --- AMENDMENT HANDLERS ---
  const handleQuantityChange = (id: string, delta: number) => {
    setEditableItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const step = item.unit === 'g' ? 25 : 0.5;
          const nextQty = Math.max(step, Math.round((item.quantity + delta * step) * 10) / 10);
          return { ...item, quantity: nextQty };
        }
        return item;
      })
    );
  };

  const handleCategoryChange = (id: string, newCategory: MealType) => {
    setEditableItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category: newCategory } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setEditableItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleWaterChange = (deltaMl: number) => {
    setEditableWaterMl((prev) => {
      const current = prev || 250;
      const nextVal = current + deltaMl;
      return nextVal > 0 ? nextVal : null;
    });
  };

  // --- EXECUTE / CONFIRM LOGGING ---
  const handleExecuteCommand = () => {
    const loggedSummaries: string[] = [];

    // Log water if present
    if (editableWaterMl && editableWaterMl > 0) {
      onAddWater(editableWaterMl);
      loggedSummaries.push(`${editableWaterMl} ml water`);
    }

    // Log all amended food items
    for (const item of editableItems) {
      const food = item.food;
      const factor = item.quantity || 1;

      const finalFood: Food = {
        ...food,
        servingSize: item.unit === 'g' ? factor : Math.round(food.servingSize * factor),
        nutrients: {
          ...food.nutrients,
          calories:
            item.unit === 'g'
              ? Math.round((food.nutrients.calories * factor) / (food.servingSize || 100))
              : Math.round(food.nutrients.calories * factor),
          protein:
            item.unit === 'g'
              ? Math.round((food.nutrients.protein * factor) / (food.servingSize || 100))
              : Math.round(food.nutrients.protein * factor),
          carbs:
            item.unit === 'g'
              ? Math.round((food.nutrients.carbs * factor) / (food.servingSize || 100))
              : Math.round(food.nutrients.carbs * factor),
          fat:
            item.unit === 'g'
              ? Math.round((food.nutrients.fat * factor) / (food.servingSize || 100))
              : Math.round(food.nutrients.fat * factor),
          fiber:
            item.unit === 'g'
              ? Math.round((food.nutrients.fiber * factor) / (food.servingSize || 100))
              : Math.round(food.nutrients.fiber * factor),
        },
      };

      onAddMeal(finalFood, item.category);
      loggedSummaries.push(finalFood.name);
    }

    if (loggedSummaries.length > 0) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#059669', '#38bdf8'],
      });

      const catName =
        (detectionResult.category || defaultCategory) === 'snack'
          ? 'Snacks'
          : (detectionResult.category || defaultCategory).charAt(0).toUpperCase() +
            (detectionResult.category || defaultCategory).slice(1);

      setLastLoggedMessage(`Logged ${loggedSummaries.join(' & ')} to ${catName}!`);
      setTimeout(() => {
        onClose();
      }, 1100);
    }
  };

  // Calculate live total calories
  const totalCalories = editableItems.reduce((acc, item) => {
    const factor = item.quantity || 1;
    const cals =
      item.unit === 'g'
        ? Math.round((item.food.nutrients.calories * factor) / (item.food.servingSize || 100))
        : Math.round(item.food.nutrients.calories * factor);
    return acc + cals;
  }, 0);

  const hasLoggableContent = editableItems.length > 0 || (editableWaterMl !== null && editableWaterMl > 0);
  const targetCategory = detectionResult.category || defaultCategory;
  const categoryDisplayName =
    targetCategory === 'snack' ? 'Snacks' : targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[120] backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Clean Bottom Sheet matching MakanFit style */}
      <div className="fixed inset-x-0 bottom-0 bg-white z-[130] rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-md mx-auto max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Voice Log</h3>
            <p className="text-xs text-slate-400 font-medium">Auto-detects food(s), portion & meal(s)</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Minimal Language Switcher */}
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5 text-[11px] font-bold">
              <button
                onClick={() => {
                  setSelectedLang('en-MY');
                  if (isListening) {
                    stopListening();
                    setTimeout(() => startListening('en-MY'), 150);
                  }
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  selectedLang === 'en-MY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setSelectedLang('ms-MY');
                  if (isListening) {
                    stopListening();
                    setTimeout(() => startListening('ms-MY'), 150);
                  }
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  selectedLang === 'ms-MY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
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
            <p className="font-extrabold text-slate-900 text-base">{lastLoggedMessage}</p>
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
                    isListening ? 'bg-[#1E293B] ring-4 ring-emerald-400/40' : 'bg-[#1E293B] hover:bg-slate-900'
                  }`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
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
                  {isListening ? 'Listening... speak now' : 'Tap mic to speak'}
                </p>
                <p className="text-[11px] text-slate-400">
                  e.g. <em>"Ate Nasi Lemak and Apple for breakfast"</em> or <em>"Drank 2 glasses of water"</em>
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
                {transcript ? `"${transcript}"` : <span className="text-slate-400 italic">Waiting for voice...</span>}
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

            {/* Detected Food(s) / Water Card with Multi-Food & Amendment Support */}
            {hasLoggableContent && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-3 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                
                {/* Header info when multiple items or single item */}
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">
                    {editableItems.length > 1
                      ? `Recognized Foods (${editableItems.length})`
                      : editableItems.length === 1
                        ? editableItems[0].category || categoryDisplayName
                        : 'Hydration'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Amend manually below
                  </span>
                </div>

                {/* Multiple or Single Food Items List */}
                <div className="space-y-3">
                  {editableItems.map((item) => {
                    const factor = item.quantity || 1;
                    const itemCalories =
                      item.unit === 'g'
                        ? Math.round((item.food.nutrients.calories * factor) / (item.food.servingSize || 100))
                        : Math.round(item.food.nutrients.calories * factor);

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-gray-50/90 border border-gray-100 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0">
                            <MealCategoryIcon type={item.category} size={44} />
                            <div className="truncate">
                              <h4 className="font-black text-slate-900 text-sm truncate leading-tight">
                                {item.food.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                {item.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <p className="text-sm font-black text-emerald-600 leading-tight">
                                {itemCalories} Cal
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">
                                {item.quantity} {item.unit}
                              </p>
                            </div>

                            {/* Amend word/button linking directly to onOpenManualEdit */}
                            {onOpenManualEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  stopListening();
                                  const factor = item.quantity || 1;
                                  const scaledFood: Food = {
                                    ...item.food,
                                    servingSize: item.unit === 'g' ? factor : Math.round(item.food.servingSize * factor),
                                    nutrients: {
                                      ...item.food.nutrients,
                                      calories:
                                        item.unit === 'g'
                                          ? Math.round((item.food.nutrients.calories * factor) / (item.food.servingSize || 100))
                                          : Math.round(item.food.nutrients.calories * factor),
                                      protein:
                                        item.unit === 'g'
                                          ? Math.round((item.food.nutrients.protein * factor) / (item.food.servingSize || 100))
                                          : Math.round(item.food.nutrients.protein * factor),
                                      carbs:
                                        item.unit === 'g'
                                          ? Math.round((item.food.nutrients.carbs * factor) / (item.food.servingSize || 100))
                                          : Math.round(item.food.nutrients.carbs * factor),
                                      fat:
                                        item.unit === 'g'
                                          ? Math.round((item.food.nutrients.fat * factor) / (item.food.servingSize || 100))
                                          : Math.round(item.food.nutrients.fat * factor),
                                      fiber:
                                        item.unit === 'g'
                                          ? Math.round((item.food.nutrients.fiber * factor) / (item.food.servingSize || 100))
                                          : Math.round(item.food.nutrients.fiber * factor),
                                    },
                                  };
                                  onOpenManualEdit(scaledFood, item.category);
                                  onClose();
                                }}
                                className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center space-x-1 shrink-0"
                                title={`Amend ${item.food.name}`}
                              >
                                <Pencil size={11} className="stroke-[2.5]" />
                                <span>Amend</span>
                              </button>
                            )}

                            {editableItems.length > 1 && (
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded-lg ml-0.5 cursor-pointer"
                                title="Remove"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Amendment Stepper & Meal Switcher */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                          {/* Stepper */}
                          <div className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-xl border border-gray-200">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-slate-700 font-bold"
                              title="Decrease"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-bold text-slate-800 text-xs min-w-[50px] text-center">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-slate-700 font-bold"
                              title="Increase"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          {/* Category Changer */}
                          <select
                            value={item.category}
                            onChange={(e) => handleCategoryChange(item.id, e.target.value as MealType)}
                            className="bg-white border border-gray-200 text-slate-700 text-[11px] font-bold rounded-xl px-2 py-1 outline-none cursor-pointer"
                          >
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((cat) => (
                              <option key={cat} value={cat}>
                                {cat === 'snack' ? 'Snacks' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {/* Water Item Card */}
                  {editableWaterMl !== null && editableWaterMl > 0 && (
                    <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center font-bold">
                          <Droplet className="w-5 h-5 text-sky-400 fill-sky-200" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-sky-600 tracking-widest block">
                            Hydration
                          </span>
                          <h4 className="font-black text-slate-900 text-sm leading-tight">Water</h4>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-xl border border-sky-200">
                          <button
                            onClick={() => handleWaterChange(-10)}
                            className="w-5 h-5 rounded-md bg-sky-50 hover:bg-sky-100 flex items-center justify-center text-sky-700 font-bold"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-black text-sky-600 text-xs min-w-[55px] text-center">
                            +{editableWaterMl} ml
                          </span>
                          <button
                            onClick={() => handleWaterChange(10)}
                            className="w-5 h-5 rounded-md bg-sky-50 hover:bg-sky-100 flex items-center justify-center text-sky-700 font-bold"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {editableItems.length > 0 && (
                          <button
                            onClick={() => setEditableWaterMl(null)}
                            className="p-1 text-sky-400 hover:text-red-500 rounded-lg ml-1"
                            title="Remove water"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Combined Total Summary for Multiple Foods */}
                {editableItems.length > 1 && (
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                    <span className="font-bold text-slate-500">
                      Total ({editableItems.length} foods{editableWaterMl ? ` + ${editableWaterMl}ml` : ''}):
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {totalCalories} Cal
                    </span>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={handleExecuteCommand}
                  className="w-full bg-[#1A2A33] hover:bg-black text-white font-black py-4 rounded-3xl shadow-md active:scale-[0.98] transition-all uppercase tracking-widest text-xs cursor-pointer flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {editableItems.length > 1
                      ? `Log All ${editableItems.length} Foods (${totalCalories} Cal)`
                      : editableItems.length === 1
                        ? `Log to ${editableItems[0].category.toUpperCase()}`
                        : `Log +${editableWaterMl} ml Water`}
                  </span>
                </button>
              </div>
            )}

            {/* Quick Test Suggestion Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block text-center">
                Quick Prompts
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {QUICK_VOICE_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      stopListening();
                      setManualTranscript(item.text);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-slate-600 hover:text-slate-900 border border-gray-100 text-xs font-semibold transition-all active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VoiceInputDialog;
