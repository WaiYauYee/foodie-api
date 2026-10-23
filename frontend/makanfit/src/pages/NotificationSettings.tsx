import React, { useEffect, useState } from "react";
import {
  Utensils,
  Droplet,
  Scale,
  Clock,
  X,
  Check,
  ChevronLeft,
} from "lucide-react";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "../services/notificationService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full relative transition-colors duration-300 flex-shrink-0 ${
      checked ? "bg-emerald-500" : "bg-gray-200"
    }`}
  >
    <div
      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
        checked ? "translate-x-[22px]" : "translate-x-1"
      }`}
    />
  </button>
);

// Formats 24hr "HH:MM" into "7:45 AM" style for display
const formatTime = (time24: string) => {
  const [hStr, m] = time24.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
};

interface MealTime {
  id: string;
  label: string;
  time: string; // 24hr "HH:MM" — native <input type="time"> works in this format
}

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user.userId;
  const onBack = () => navigate("/profile");

  const [loading, setLoading] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [waterReminder, setWaterReminder] = useState(false);
  const [weightReminders, setWeightReminders] = useState(true);
  const [mealTimes, setMealTimes] = useState<MealTime[]>([]);

  // Which meal's time picker is open (null = closed)
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [draftTime, setDraftTime] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      setLoading(true);

      try {
        const res = await getNotificationSettings(userId);

        if (cancelled) return;

        if (res.success) {
          setMealReminders(res.settings.mealRemindersEnabled);
          setWaterReminder(res.settings.waterReminderEnabled);
          setWeightReminders(res.settings.weightRemindersEnabled);

          setMealTimes(
            res.settings.mealTimes.map((t) => ({
              id: t.mealType,
              label: LABELS[t.mealType] ?? t.mealType,
              time: t.time,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const openTimeEditor = (meal: MealTime) => {
    setEditingMealId(meal.id);
    setDraftTime(meal.time);
  };

  const closeTimeEditor = () => {
    setEditingMealId(null);
    setDraftTime("");
  };

  const toggle = async (
    key:
      | "mealRemindersEnabled"
      | "waterReminderEnabled"
      | "weightRemindersEnabled",
    current: boolean,
    set: (value: boolean) => void,
  ) => {
    const nextValue = !current;

    // Update the UI immediately.
    set(nextValue);

    try {
      const res = await saveNotificationSettings(userId, {
        [key]: nextValue,
      });

      // Roll back if the backend rejects the update.
      if (!res.success) {
        set(current);
      }
    } catch (error) {
      console.error("Failed to save notification setting:", error);
      set(current);
    }
  };

  const saveTime = async () => {
    if (!editingMealId || !draftTime) return;

    try {
      const res = await saveNotificationSettings(userId, {
        mealTimes: [
          {
            mealType: editingMealId as "breakfast" | "lunch" | "dinner",
            time: draftTime,
          },
        ],
      });

      if (res.success) {
        setMealTimes((prev) =>
          prev.map((meal) =>
            meal.id === editingMealId ? { ...meal, time: draftTime } : meal,
          ),
        );

        closeTimeEditor();
      }
    } catch (error) {
      console.error("Failed to save meal reminder time:", error);
    }
  };

  const editingMeal = mealTimes.find((m) => m.id === editingMealId);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] md:bg-slate-100 flex justify-center animate-in slide-in-from-right duration-300">
    <div className="flex flex-col w-full max-w-3xl bg-[#F8FAFC] md:my-8 md:rounded-[32px] md:shadow-xl md:border md:border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center bg-white">
        <button
          onClick={onBack}
          className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="flex-1 text-center text-lg font-extrabold text-slate-900 pr-8">
          Manage My Notifications
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm font-semibold text-slate-400">
            Loading notification settings...
          </p>
        </div>
      ) : (
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
              <ToggleSwitch
                checked={mealReminders}
                onChange={() =>
                  toggle(
                    "mealRemindersEnabled",
                    mealReminders,
                    setMealReminders,
                  )
                }
              />
            </div>

            {mealReminders && (
              <div className="divide-y divide-gray-50 border-t border-gray-50">
                {mealTimes.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => openTimeEditor(meal)}
                    className="w-full flex items-center justify-between px-5 py-4 pl-[4.75rem] hover:bg-gray-50 transition-colors active:scale-[0.99]"
                  >
                    <span className="text-sm font-bold text-gray-600">
                      {meal.label}
                    </span>
                    <div className="flex items-center space-x-1.5 text-emerald-600">
                      <Clock size={14} />
                      <span className="text-sm font-bold">
                        {formatTime(meal.time)}
                      </span>
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
            <ToggleSwitch
              checked={waterReminder}
              onChange={() =>
                toggle("waterReminderEnabled", waterReminder, setWaterReminder)
              }
            />
          </div>

          {/* Weight Reminders Card */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-50 w-10 h-10 rounded-2xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-teal-500" />
              </div>
              <span className="font-bold text-gray-800">Weight reminders</span>
            </div>
            <ToggleSwitch
              checked={weightReminders}
              onChange={() =>
                toggle(
                  "weightRemindersEnabled",
                  weightReminders,
                  setWeightReminders,
                )
              }
            />
          </div>
        </div>
      )}

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
     </div>
  );
};

export default NotificationSettings;
