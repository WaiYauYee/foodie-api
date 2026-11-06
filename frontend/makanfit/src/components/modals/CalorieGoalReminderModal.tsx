import React from "react";
import { X, Zap } from "lucide-react";

interface Props {
  open: boolean;
  /** What the user changed, shown in the message, e.g. "weight" or "gender, height" */
  changedFields: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CalorieGoalReminderModal: React.FC<Props> = ({
  open,
  changedFields,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-[#1A2A33]/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calorie-goal-title"
        className="relative bg-white w-full max-w-[340px] rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-300"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close reminder"
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <Zap className="text-emerald-500" size={40} />
        </div>

        <h3
          id="calorie-goal-title"
          className="text-xl font-black text-[#1A2A33] tracking-tight mb-4"
        >
          Calorie Goal Update
        </h3>

        <p className="text-gray-400 font-bold leading-relaxed mb-8 text-sm">
          Modifying your{" "}
          <span className="text-emerald-600 font-black">{changedFields}</span>{" "}
          may affect your target calories. Would you like to update them?
        </p>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-[24px] shadow-xl active:scale-[0.95] transition-all uppercase text-xs tracking-[0.2em] disabled:opacity-70"
        >
          {isLoading ? "Updating..." : "Update"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="mt-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600"
        >
          Keep Existing Target
        </button>
      </div>
    </div>
  );
};

export default CalorieGoalReminderModal;