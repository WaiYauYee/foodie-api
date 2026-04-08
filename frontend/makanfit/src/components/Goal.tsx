
import React, { useEffect, useState } from 'react';
import { User as Users } from '../types/types';
import { 
  ChevronLeft, Flag, Target, User, Dumbbell, 
  X, Check, MoveRight, TrendingUp, TrendingDown, Zap, Timer, Activity,
  PieChart,
  Scale
} from 'lucide-react';

interface GoalProps {
  user: Users;
  onBack: () => void;
  onSave: (updatedUser: Partial<Users>) => void;
}

interface SelectionOption {
  id: string;
  label: string;
  subLabel?: string;
  icon: any;
}

const Goal: React.FC<GoalProps> = ({ user, onBack, onSave }) => {
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [tempCalorie, setTempCalorie] = useState(user.targetCalories.toString());
  const [tempWeight, setTempWeight] = useState(user.currentWeight.toString());
  const [tempGoalWeight, setTempGoalWeight] = useState(user.goalWeight?.toString());
  const [showGoalReminder, setShowGoalReminder] = useState(false);
  const [reminderConfirmHandler, setReminderConfirmHandler] = useState<(() => void) | null>(null);
  const [goalType, setGoalType] = useState<string | null>(null);

  const handleGoalChangeWithReminder = (update: Partial<Users>, type: string) => {
    setGoalType(type);
    setShowGoalReminder(true);
    const handleConfirmReminder = () => {
      onSave(update);
      setShowGoalReminder(false);
    };
    setReminderConfirmHandler(() => handleConfirmReminder);
  };


  // States for macro inputs
  const [tempMacros, setTempMacros] = useState({
    carbs: (user.targetCarbs || 150).toString(),
    protein: (user.targetProtein || 60).toString(),
    fat: (user.targetFat || 50).toString(),
    fiber: (user.targetFiber || 25).toString()
  });

  const DIETARY_GOALS: SelectionOption[] = [
    { id: 'Maintain Weight', label: 'Maintain Weight', subLabel: 'Maintain your current weight', icon: MoveRight },
    { id: 'Gradual Gain Weight', label: 'Gradual Gain Weight', subLabel: 'Gradually gain weight over time', icon: TrendingUp },
    { id: 'Rapid Gain Weight', label: 'Rapid Gain Weight', subLabel: 'Quickly gain weight', icon: TrendingUp },
    { id: 'Gradual Lose Weight', label: 'Gradual Lose Weight', subLabel: 'Gradually lose weight over time', icon: TrendingDown },
    { id: 'Rapid Lose Weight', label: 'Rapid Lose Weight', subLabel: 'Quickly lose weight', icon: TrendingDown },
  ];

  const GENDERS: SelectionOption[] = [
    { id: 'male', label: 'Male', icon: User },
    { id: 'female', label: 'Female', icon: User },
  ];

  const GOAL_ORIGINS: SelectionOption[] = [
    { id: 'Standard', label: 'Standard', subLabel: 'Based on global health guidelines', icon: Flag },
    { id: 'Custom', label: 'Custom', subLabel: 'Set by you or your professional', icon: Target },
  ];

  const MACRO_ORIGINS: SelectionOption[] = [
    { id: 'Standard', label: 'Standard', subLabel: 'Calculated based on calories', icon: PieChart },
    { id: 'Custom', label: 'Custom', subLabel: 'Set specific gram targets', icon: Target },
  ];

  const ACTIVITY_LEVELS: SelectionOption[] = [
    { id: 'Sedentary', label: 'Sedentary', subLabel: 'Little or no exercise', icon: Timer },
    { id: 'Lightly Active', label: 'Lightly Active', subLabel: 'Light exercise 1-3 days/week', icon: Activity },
    { id: 'Moderately Active', label: 'Moderately Active', subLabel: 'Moderate exercise 3-5 days/week', icon: Zap },
    { id: 'Very Active', label: 'Very Active', subLabel: 'Hard exercise 6-7 days/week', icon: Dumbbell },
    { id: 'Extra Active', label: 'Extra Active', subLabel: 'Very hard exercise & physical job', icon: TrendingUp },
  ];

  const handleSelectOrigin = (val: string) => {
    if (val === user.goalOrigin) {
      setActiveOverlay(null);
      return;
    }
    if (val === 'Custom') {
      setActiveOverlay('customCalorieInput');
    } else {
      onSave({ goalOrigin: 'standard', targetCalories: 1279 });
      setTempCalorie("1279");
      setActiveOverlay(null);
    }
  };

  const handleSelectMacroOrigin = (val: string) => {
    if (val === user.macroGoalOrigin) {
      setActiveOverlay(null);
      return;
    }
    if (val === 'Custom') {
      setActiveOverlay('customMacroInput');
    } else {
      onSave({ 
        macroGoalOrigin: 'standard', 
        targetCarbs: 150, 
        targetProtein: 60, 
        targetFat: 50, 
        targetFiber: 25 
      });
      setActiveOverlay(null);
    }
  };

  const handleConfirmCustomCalorie = () => {
    const val = parseInt(tempCalorie);
    if (!isNaN(val) && val > 0) {
      onSave({ goalOrigin: 'custom', targetCalories: val });
      setActiveOverlay(null);
    }
  };

  const handleConfirmWeights = () => {
    const currentVal = parseFloat(tempWeight);
    const goalVal = parseFloat(tempGoalWeight);
    if (isNaN(currentVal) || currentVal <= 0 || isNaN(goalVal) || goalVal <= 0) return;
    
    // Save weight if it changed
    if (currentVal !== user.currentWeight) {
      onSave({ currentWeight: currentVal });
    }
    
    if (goalVal !== user.goalWeight) {
      handleGoalChangeWithReminder({ goalWeight: goalVal }, 'weight');
    } else {
      setActiveOverlay(null);
    }
  };

  const handleConfirmCustomMacros = () => {
    const c = parseInt(tempMacros.carbs);
    const p = parseInt(tempMacros.protein);
    const f = parseInt(tempMacros.fat);
    const fb = parseInt(tempMacros.fiber);
    
    if (!isNaN(c) && !isNaN(p) && !isNaN(f) && !isNaN(fb)) {
      onSave({ 
        macroGoalOrigin: 'custom', 
        targetCarbs: c, 
        targetProtein: p, 
        targetFat: f, 
        targetFiber: fb 
      });
      setActiveOverlay(null);
    }
  };

 const SelectionOverlay = ({ title, options, selectedValue, onSelect, onClose }: { 
    title: string, 
    options: SelectionOption[], 
    selectedValue: any, 
    onSelect: (val: any) => void,
    onClose: () => void 
  }) => (
    <div className="fixed inset-0 z-[210] flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
      <div className="absolute inset-0 bg-[#1A2A33]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-white rounded-t-[48px] flex flex-col max-h-[90vh] shadow-2xl">
        <div className="flex items-center justify-between p-8 border-b border-gray-50">
          <div className="w-10" />
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto pb-12 pt-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="w-full flex items-center px-8 py-6 hover:bg-emerald-50 active:bg-emerald-100 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedValue === option.id ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-emerald-500'}`}>
                <option.icon size={24} strokeWidth={2.5} />
              </div>
              <div className="ml-6 flex-1 flex flex-col items-start text-left">
                <span className={`text-lg font-black tracking-tight ${selectedValue === option.id ? 'text-gray-900' : 'text-gray-700'}`}>{option.label}</span>
                {option.subLabel && <span className="text-sm font-bold text-gray-400">{option.subLabel}</span>}
              </div>
              {selectedValue === option.id && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check size={20} className="text-emerald-600" strokeWidth={4} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const CustomCalorieOverlay = () => {
    // Local state for animation sync
    const [cursorVisible, setCursorVisible] = useState(true);
    useEffect(() => {
      const interval = setInterval(() => setCursorVisible(v => !v), 500);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="fixed inset-0 z-[220] flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="absolute inset-0 bg-[#1A2A33]/95 backdrop-blur-xl" onClick={() => setActiveOverlay(null)} />
        <div className="relative mt-auto bg-white rounded-t-[48px] w-full flex flex-col overflow-hidden shadow-2xl">
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <div className="w-10" />
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Customize Calorie Goal</span>
            <button onClick={() => setActiveOverlay(null)} className="p-3 bg-gray-50 rounded-2xl text-gray-400">
              <X size={20} />
            </button>
          </div>
          
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 px-10">
            <h3 className="text-gray-400 font-black uppercase tracking-widest text-[11px]">Calorie goal</h3>
            <div className="relative flex items-center justify-center w-full">
              <input 
                type="number"
                autoFocus
                value={tempCalorie}
                onChange={(e) => setTempCalorie(e.target.value)}
                className="text-[100px] font-black text-[#1A2A33] text-center w-full focus:outline-none bg-transparent tracking-tighter caret-transparent"
                placeholder="0"
              />
              {/* Custom Blinking Cursor Effect */}
              <div className="absolute flex justify-center w-full pointer-events-none translate-y-2">
                 <div className="relative flex items-center" style={{ width: `${tempCalorie.length * 54}px`, maxWidth: '100%' }}>
                    <div className="absolute right-0 h-24 w-1 bg-[#1A2A33] rounded-full" style={{ opacity: cursorVisible ? 1 : 0 }} />
                 </div>
              </div>
            </div>
            <p className="text-emerald-500 font-bold uppercase tracking-wider text-xs">kilocalories per day</p>
          </div>

          <div className="p-8 pb-12">
            <button 
              onClick={handleConfirmCustomCalorie}
              className="w-full bg-[#1A2A33] text-white font-black py-6 rounded-[32px] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CustomWeightOverlay = () => {
    return (
      <div className="fixed inset-0 z-[220] flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="absolute inset-0 bg-[#1A2A33]/40 backdrop-blur-sm" onClick={() => setActiveOverlay(null)} />
        <div className="relative mt-auto bg-white rounded-t-[48px] w-full flex flex-col overflow-hidden shadow-2xl">
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <div className="w-10" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight Settings</span>
            <button onClick={() => setActiveOverlay(null)} className="p-3 bg-gray-50 rounded-2xl text-gray-400">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-10 space-y-4 pt-0">
            <MacroInput 
              label="Start Weight (kg)" 
              value={tempWeight} 
              onChange={setTempWeight}
            />
            <MacroInput 
              label="Goal Weight (kg)" 
              value={tempGoalWeight} 
              onChange={setTempGoalWeight}
            />
            <button 
              onClick={handleConfirmWeights}
              className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-[32px] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-sm mt-6"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CustomMacroOverlay = () => {
    return (
      // <div className="fixed inset-0 z-[220] flex flex-col animate-in fade-in zoom-in duration-300">
      //   <div className="absolute inset-0 bg-[#1A2A33]/90 backdrop-blur-md" onClick={() => setActiveOverlay(null)} />
      //   <div className="relative mt-auto bg-white rounded-t-[48px] w-full flex flex-col overflow-hidden shadow-2xl">
      //     <div className="p-8 flex items-center justify-between border-b border-gray-50">
      //       <div className="w-10" />
      //       <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Custom Macronutrients</span>
      //       <button onClick={() => setActiveOverlay(null)} className="p-3 bg-gray-50 rounded-2xl text-gray-400">
      //         <X size={20} />
      //       </button>
      //     </div>
          
      //     <div className="p-8 space-y-8">
      //       <div className="grid grid-cols-2 gap-6">
      //         {[
      //           { label: 'Carbs', key: 'carbs', color: 'text-emerald-500' },
      //           { label: 'Protein', key: 'protein', color: 'text-purple-500' },
      //           { label: 'Fat', key: 'fat', color: 'text-orange-500' },
      //           { label: 'Fiber', key: 'fiber', color: 'text-blue-500' }
      //         ].map((macro) => (
      //           <div key={macro.key} className="space-y-2">
      //             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">{macro.label} (g)</label>
      //             <div className="relative">
      //               <input 
      //                 type="number"
      //                 value={tempMacros[macro.key as keyof typeof tempMacros]}
      //                 onChange={(e) => setTempMacros({ ...tempMacros, [macro.key]: e.target.value })}
      //                 className={`w-full bg-gray-50 border-2 border-gray-100 rounded-[24px] py-6 px-6 text-2xl font-black text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none`}
      //               />
      //             </div>
      //           </div>
      //         ))}
      //       </div>
      //     </div>

      //     <div className="p-8 pb-12">
      //       <button 
      //         onClick={handleConfirmCustomMacros}
      //         className="w-full bg-[#1A2A33] text-white font-black py-6 rounded-[32px] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
      //       >
      //         Confirm
      //       </button>
      //     </div>
      //   </div>
      // </div>

      <div className="fixed inset-0 z-[220] flex flex-col animate-in fade-in zoom-in duration-300 overflow-y-auto">
          <div className="absolute inset-0 bg-[#1A2A33]/95 backdrop-blur-xl" onClick={() => setActiveOverlay(null)} />
          <div className="relative mt-auto bg-white rounded-t-[48px] w-full flex flex-col shadow-2xl">
            <div className="p-8 flex items-center justify-between border-b border-gray-50">
              <div className="w-10" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Macronutrients</span>
              <button onClick={() => setActiveOverlay(null)} className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-4 pt-0">
              <MacroInput label="Carbs (g)" value={tempMacros.carbs} onChange={(v) => setTempMacros({...tempMacros, carbs: v})} />
              <MacroInput label="Protein (g)" value={tempMacros.protein} onChange={(v) => setTempMacros({...tempMacros, protein: v})} />
              <MacroInput label="Fat (g)" value={tempMacros.fat} onChange={(v) => setTempMacros({...tempMacros, fat: v})} />
              <MacroInput label="Fiber (g)" value={tempMacros.fiber} onChange={(v) => setTempMacros({...tempMacros, fiber: v})} />
              <button onClick={handleConfirmCustomMacros} className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-[32px] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-sm">Confirm</button>
            </div>
          </div>
        </div>
    );
  };

  const goalItems = [
    { section: 'Nutritional Settings', items: [
      { id: 'calorieTarget', icon: Flag, label: 'Calorie Goal', value: `${user.targetCalories} kcal (${user.goalOrigin || 'Standard'})`, options: GOAL_ORIGINS, readOnly: false },
      { id: 'macroTarget', icon: PieChart, label: 'Carbs, protein, fat, and fiber goals', value: user.macroGoalOrigin === 'custom' ? `${user.targetCarbs}c ${user.targetProtein}p ${user.targetFat}f ${user.targetFiber}fb` : 'Standard', options: MACRO_ORIGINS, readOnly: false },
    ]},
    // { section: 'Personal Information', items: [
    //   { id: 'gender', icon: User, label: 'Gender', value: user.gender === 'male' ? 'Male' : 'Female', options: GENDERS, readOnly: false },
    //   { id: 'height', icon: ArrowUpDown, label: 'Height', value: `${user.height} cm`, readOnly: true },
    //   { id: 'birthDate', icon: Cake, label: 'Birthday', value: user.birthDate || '1995-05-15', readOnly: true },
    // ]},
    { section: 'Goal & Activity Settings', items: [
      { id: 'customWeightInput', icon: Scale, label: 'Weight', value: `${user.currentWeight} kg`, readOnly: false },
      { id: 'activityLevel', icon: Dumbbell, label: 'Activity Level', value: user.activityLevel || 'Sedentary', options: ACTIVITY_LEVELS, readOnly: false },
      { id: 'dietaryGoal', icon: Target, label: 'Dietary Goal', value: user.dietaryGoal || 'Gradual Lose Weight', options: DIETARY_GOALS, readOnly: false },
    ]}
  ];

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[200] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-6 flex items-center bg-white border-b border-gray-50 sticky top-0 z-10">
        <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="flex-1 text-center text-xl font-extrabold text-slate-900 pr-12">
          Goal
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        <div className="px-8 py-6">
          <p className="text-gray-400 font-semibold max-w-xs">Define your destination. We'll help you find the best path to get there.</p>
        </div>

        {goalItems.map((section, sIdx) => (
          <div key={sIdx} className="mb-8 px-6">
            <h3 className="px-2 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{section.section}</h3>
            <div className="bg-white rounded-[32px] border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
              {section.items.map((item, iIdx) => (
                <button 
                  key={iIdx} 
                  disabled={item.readOnly}
                  onClick={() => setActiveOverlay(item.id)}
                  className={`w-full flex items-center px-6 py-5 hover:bg-gray-50 transition-all ${item.readOnly ? 'opacity-70' : 'active:bg-emerald-50/50'}`}
                >
                  <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 transition-colors">
                    <item.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div className="ml-5 flex-1 flex flex-col items-start text-left">
                    <span className="text-base font-black text-gray-900 leading-none mb-1">{item.label}</span>
                    <span className="text-sm font-bold text-emerald-500 tracking-tight">{item.value}</span>
                  </div>
                  {!item.readOnly && <ChevronRightIcon className="text-gray-200" size={20} />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Save Button */}
      <div className="p-6 pb-12 bg-white border-t border-gray-50">
        <button 
          onClick={onBack}
          className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-[32px] shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs"
        >
          Save
        </button>
      </div>

      {/* Selection Overlays */}
      {activeOverlay === 'dietaryGoal' && (
        <SelectionOverlay 
          title="Dietary Goal"
          options={DIETARY_GOALS}
          selectedValue={user.dietaryGoal}
          onSelect={(val) => {
            if (val !== user.dietaryGoal) {
              handleGoalChangeWithReminder({ dietaryGoal: val }, "dietary");
            }
            setActiveOverlay(null);
          }}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'gender' && (
        <SelectionOverlay 
          title="Gender"
          options={GENDERS}
          selectedValue={user.gender}
          onSelect={(val) => { onSave({ gender: val }); setActiveOverlay(null); }}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'calorieTarget' && (
        <SelectionOverlay 
          title="Calorie Goal"
          options={GOAL_ORIGINS}
          selectedValue={user.goalOrigin}
          onSelect={handleSelectOrigin}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'macroTarget' && (
        <SelectionOverlay 
          title="Macro Goals"
          options={MACRO_ORIGINS}
          selectedValue={user.macroGoalOrigin || 'Standard'}
          onSelect={handleSelectMacroOrigin}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'activityLevel' && (
        <SelectionOverlay 
          title="Activity Level"
          options={ACTIVITY_LEVELS}
          selectedValue={user.activityLevel}
          onSelect={(val) => {
            if (val !== user.activityLevel) {
              handleGoalChangeWithReminder({ activityLevel: val }, 'activity level');
            }
            setActiveOverlay(null);
          }}
          onClose={() => setActiveOverlay(null)}
        />
      )}

      {/* Custom Input Overlay */}
      {activeOverlay === 'customCalorieInput' && <CustomCalorieOverlay />}
      {activeOverlay === 'customWeightInput' && <CustomWeightOverlay />}
      {activeOverlay === 'customMacroInput' && <CustomMacroOverlay />}

      {/* Goal Reminder Modal */}
      {showGoalReminder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#1A2A33]/80 backdrop-blur-sm" onClick={() => setShowGoalReminder(false)} />
          <div className="relative bg-white w-full max-w-[340px] rounded-[48px] p-10 flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <Zap className="text-emerald-500" size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1A2A33] tracking-tight mb-4 text-sm tracking-widest">Calorie Goal Update</h3>
            <p className="text-gray-400 font-bold leading-relaxed mb-8 text-sm">
              Modifying your <span className="text-emerald-600 font-black">{goalType}</span> recalculates your target calories. Would you like us to adjust them for you?
            </p>
            <button 
              onClick={() => reminderConfirmHandler?.()}
              className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-[28px] shadow-xl active:scale-[0.95] transition-all uppercase text-xs tracking-[0.2em]"
            >
              Update
            </button>
            <button 
              onClick={() => setShowGoalReminder(false)}
              className="mt-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600"
            >
              Keep Existing Target
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const ChevronRightIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const MacroInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
    <input 
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-6 font-black text-xl text-gray-900 focus:outline-none focus:border-emerald-500 transition-all"
    />
  </div>
);

export default Goal;
