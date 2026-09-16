import React, { useState } from 'react';
import { ArrowLeft, Utensils, Droplet, Scale, Clock, X, Check } from 'lucide-react';

interface NotificationSettingsProps {
  onBack: () => void;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full relative transition-colors duration-300 flex-shrink-0 ${
      checked ? 'bg-emerald-500' : 'bg-gray-200'
    }`}
  >
    <div
      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
        checked ? 'translate-x-[22px]' : 'translate-x-1'
      }`}
    />
  </button>
);

// Formats 24hr "HH:MM" into "7:45 AM" style for display
const formatTime = (time24: string) => {
  const [hStr, m] = time24.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
};

interface MealTime {
  id: string;
  label: string;
  time: string; // 24hr "HH:MM" — native <input type="time"> works in this format
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const [mealReminders, setMealReminders] = useState(true);
  const [waterReminder, setWaterReminder] = useState(false);
  const [weightReminders, setWeightReminders] = useState(true);

  const [mealTimes, setMealTimes] = useState<MealTime[]>([
    { id: 'breakfast', label: 'Breakfast', time: '07:45' },
    { id: 'lunch', label: 'Lunch', time: '12:30' },
    { id: 'dinner', label: 'Dinner', time: '19:00' },
  ]);

  // Which meal's time picker is open (null = closed)
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [draftTime, setDraftTime] = useState('');

  const openTimeEditor = (meal: MealTime) => {
    setEditingMealId(meal.id);
    setDraftTime(meal.time);
  };

  const closeTimeEditor = () => {
    setEditingMealId(null);
    setDraftTime('');
  };

  const saveTime = () => {
    if (!editingMealId || !draftTime) return;
    setMealTimes(prev =>
      prev.map(m => (m.id === editingMealId ? { ...m, time: draftTime } : m))
    );
    closeTimeEditor();
  };

  const editingMeal = mealTimes.find(m => m.id === editingMealId);

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center space-x-4 shadow-sm sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">
          Manage My Notifications
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Meal Reminders Card */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 w-10 h-10 rounded-2xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-500" />
              </div>
              <span className="font-bold text-gray-800">Meal reminders</span>
            </div>
            <ToggleSwitch checked={mealReminders} onChange={() => setMealReminders(!mealReminders)} />
          </div>

          {mealReminders && (
            <div className="divide-y divide-gray-50 border-t border-gray-50">
              {mealTimes.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => openTimeEditor(meal)}
                  className="w-full flex items-center justify-between px-5 py-4 pl-[4.75rem] hover:bg-gray-50 transition-colors active:scale-[0.99]"
                >
                  <span className="text-sm font-bold text-gray-600">{meal.label}</span>
                  <div className="flex items-center space-x-1.5 text-emerald-600">
                    <Clock size={14} />
                    <span className="text-sm font-bold">{formatTime(meal.time)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Water Reminder Card */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-sky-50 w-10 h-10 rounded-2xl flex items-center justify-center">
              <Droplet className="w-5 h-5 text-sky-400" />
            </div>
            <span className="font-bold text-gray-800">Water reminder</span>
          </div>
          <ToggleSwitch checked={waterReminder} onChange={() => setWaterReminder(!waterReminder)} />
        </div>

        {/* Weight Reminders Card */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-teal-50 w-10 h-10 rounded-2xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-teal-500" />
            </div>
            <span className="font-bold text-gray-800">Weight reminders</span>
          </div>
          <ToggleSwitch checked={weightReminders} onChange={() => setWeightReminders(!weightReminders)} />
        </div>
      </div>

      {/* TIME PICKER BOTTOM SHEET */}
      {editingMeal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-sm"
            onClick={closeTimeEditor}
          />
          <div className="fixed inset-x-0 bottom-0 bg-white z-[120] rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-md mx-auto">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                {editingMeal.label} reminder
              </h3>
              <button
                onClick={closeTimeEditor}
                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Remind me at
            </p>

            {/* Native time input, styled to match the app's rounded input fields */}
            <input
              type="time"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-2xl font-black text-gray-900 text-center outline-none focus:border-emerald-400 focus:bg-white transition-colors"
            />

            <button
              onClick={saveTime}
              className="w-full mt-6 bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs flex items-center justify-center space-x-2"
            >
              <Check size={16} />
              <span>Save time</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;