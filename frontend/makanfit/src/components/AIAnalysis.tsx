
import React, { useState, useEffect } from 'react';
import { Food } from '../types/types';
import { 
  Check, ArrowLeft, RefreshCw, AlertCircle, 
  Smile, ThumbsUp, Flame, UtensilsCrossed 
} from 'lucide-react';
import MakanFitAvatar from './MakanFitAvatar';

interface AnalysisResult {
  dishName: string;
  estimatedNutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  ingredients: { name: string; calories: number }[];
  error?: string;
}

interface Props {
  image: string;
  isLoading: boolean;
  result: AnalysisResult | null;
  category: string;
  onConfirm: (food: Food) => void;
  onCancel: () => void;
  onRetry: () => void;
}

const SCAN_MESSAGES = [
  "Looking closely at your meal...",
  "Identifying Malaysian flavors...",
  "Counting the spices...",
  "Calculating nutritional data...",
  "Almost there, MakanFit is thinking..."
];

const getSentiment = (calories: number) => {
  if (calories < 200) return { text: "Light", color: "text-emerald-500", bg: "bg-emerald-50", Icon: Smile };
  if (calories < 400) return { text: "Moderate", color: "text-blue-500", bg: "bg-blue-50", Icon: ThumbsUp };
  if (calories < 600) return { text: "Substantial", color: "text-orange-500", bg: "bg-orange-50", Icon: Flame };
  return { text: "Heavy", color: "text-red-500", bg: "bg-red-50", Icon: AlertCircle };
};

const AIAnalysis: React.FC<Props> = ({ 
  image, isLoading, result, category, onConfirm, onCancel, onRetry 
}) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => setMsgIdx(p => (p + 1) % SCAN_MESSAGES.length), 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[110] flex flex-col items-center justify-center p-8 animate-in fade-in">
        <div className="relative w-56 h-56 mb-12">
          <div className="absolute inset-0 bg-emerald-50 rounded-[48px] animate-pulse" />
          <div className="absolute inset-4 overflow-hidden rounded-[36px] border-4 border-white shadow-2xl bg-slate-50 flex items-center justify-center">
            <img src={image} className="w-full h-full object-cover scale-110" alt="Scanning" />
            <div className="absolute inset-x-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scanning-bar z-10" />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
            <MakanFitAvatar size={48} />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Vision Active</h3>
          <p className="text-emerald-500 font-bold min-h-[1.5rem]">{SCAN_MESSAGES[msgIdx]}</p>
        </div>
        <style>{`
          @keyframes scanning { 
            0% { top: 0%; opacity: 0; } 
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; } 
          }
          .animate-scanning-bar {
            animation: scanning 2s infinite linear;
          }
        `}</style>
      </div>
    );
  }

  // Error State (Not Food)
  if (result?.error) {
    return (
      <div className="fixed inset-0 bg-white z-[110] flex flex-col p-8 animate-in fade-in">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mb-4">
            <UtensilsCrossed size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 px-4 leading-tight">Oops!</h2>
            <p className="text-slate-500 font-bold text-lg max-w-xs mx-auto">
              {result.error}
            </p>
          </div>
          <div className="w-full max-w-[200px] aspect-square rounded-[32px] overflow-hidden border-4 border-red-50 shadow-sm opacity-50 grayscale">
            <img src={image} className="w-full h-full object-cover" alt="Not food" />
          </div>
        </div>
        <div className="space-y-4 pb-10">
          <button 
            onClick={onRetry}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <RefreshCw size={20} />
            <span className="uppercase text-xs tracking-widest">Try Another Photo</span>
          </button>
          <button 
            onClick={onCancel}
            className="w-full bg-white text-slate-400 font-black py-4 rounded-3xl uppercase text-[10px] tracking-widest text-center"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    );
  }

  // Success State (Food detected)
  const sentiment = result ? getSentiment(result.estimatedNutrients.calories) : null;

  return (
    <div className="fixed inset-0 bg-white z-[110] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
      <div className="relative h-[35vh] w-full">
        <img src={image} className="w-full h-full object-cover" alt="Captured food" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
          <button onClick={onCancel} className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20">
            <ArrowLeft size={24} />
          </button>
          <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/20">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{category}</span>
          </div>
        </div>
        <div className="absolute bottom-10 left-0 w-full px-8 z-20">
          <h2 className="text-4xl font-black text-white leading-tight mb-2">{result?.dishName}</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest">MakanFit Analysis Verified</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[48px] -mt-10 relative z-30 overflow-y-auto pb-32 p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            {sentiment && (
              <div className={`p-4 ${sentiment.bg} rounded-[24px] flex items-center justify-center`}>
                <sentiment.Icon className={sentiment.color} size={32} />
              </div>
            )}
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Feeling</p>
              <span className="text-xl font-black text-slate-900">{sentiment?.text}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estimation</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black text-slate-900">{result?.estimatedNutrients.calories}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">kcal</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Macro Breakdown</h3>
            <div className="h-[1px] flex-1 bg-slate-100 mx-4" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Protein', value: result?.estimatedNutrients.protein, color: 'bg-red-400', suffix: 'g' },
              { label: 'Carbs', value: result?.estimatedNutrients.carbs, color: 'bg-sky-400', suffix: 'g' },
              { label: 'Fat', value: result?.estimatedNutrients.fat, color: 'bg-amber-400', suffix: 'g' }
            ].map(macro => (
              <div key={macro.label} className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className={`w-1.5 h-1.5 rounded-full ${macro.color} mb-2`} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{macro.label}</p>
                <p className="text-lg font-black text-slate-900">{macro.value}{macro.suffix}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ingredients Detected</h3>
            <div className="h-[1px] flex-1 bg-slate-100 mx-4" />
          </div>
          <div className="space-y-3">
            {result?.ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50/50 p-5 rounded-3xl border border-slate-50 transition-all hover:bg-white hover:shadow-md group">
                <span className="font-bold text-slate-700">{ing.name}</span>
                <span className="text-sm font-black text-slate-300 group-hover:text-emerald-500 transition-colors">{ing.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40">
        <button 
          onClick={() => {
            if (result) {
              const food: Food = {
              id: Math.random().toString(36).substr(2, 9), // food id
              name: result.dishName,
              group: 'Vege',
              servingSize: 350,
              servingUnit: 'g', // adjust as needed
              createdAt: Date.now(),
              updatedAt: Date.now(),
              nutrients: {
                foodId: Math.random().toString(36).substr(2, 9), // or food.id
                calories: result.estimatedNutrients.calories,
                protein: result.estimatedNutrients.protein,
                carbs: result.estimatedNutrients.carbs,
                fat: result.estimatedNutrients.fat,
                fiber: result.estimatedNutrients.fiber,
                updatedAt: Date.now(),
              },
              ingredients: result.ingredients.map((ing, i) => ({
                id: `ing-${i}`,
                name: ing.name,
                group: 'Ingredient',
                servingSize: 100, // placeholder
                servingUnit: 'g',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nutrients: {
                  foodId: `ing-${i}`,
                  calories: ing.calories,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                  fiber: 0,
                  updatedAt: Date.now(),
                },
              })),
            };
              onConfirm(food);
            }
          }} 
          className="w-full bg-emerald-500 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-emerald-200 uppercase tracking-widest text-xs flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
        >
          <Check size={20} />
          <span>Confirm & Log Meal</span>
        </button>
      </div>
    </div>
  );
};

export default AIAnalysis;
