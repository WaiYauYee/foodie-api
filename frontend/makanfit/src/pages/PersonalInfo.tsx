import React, { useState } from "react";
import { User } from "../types/types";
import { ChevronLeft, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CalorieGoalReminderModal from "../components/modals/CalorieGoalReminderModal";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  height?: string;
  birthDate?: string;
  general?: string;
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  error,
}: any) => (
  <div className="relative w-full group">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-2 mb-2 block">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full bg-slate-100 shadow-sm border-2 rounded-2xl py-5 px-6 text-gray-900 font-bold focus:outline-none transition-all placeholder:text-gray-300 appearance-none ${
          error
            ? "border-rose-300 focus:border-rose-500"
            : "border-slate-100 focus:border-emerald-500"
        }`}
      />
      {Icon && (
        <div
          className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
            error
              ? "text-rose-300"
              : "text-gray-300 group-focus-within:text-emerald-500"
          }`}
        >
          <Icon size={20} />
        </div>
      )}
    </div>
    {error && (
      <p
        role="alert"
        aria-live="polite"
        className="mt-2 px-2 flex items-start gap-1.5 text-sm font-semibold text-rose-600 animate-in fade-in slide-in-from-top-1 duration-200"
      >
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </p>
    )}
  </div>
);

const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const onBack = () => navigate("/profile");

  const [gender, setGender] = useState<"male" | "female">(user.gender);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  // const [email, setEmail] = useState(user.email);
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [heightCm, setHeightCm] = useState(user.heightCm);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const [goalType, setGoalType] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<Partial<User> | null>(
    null,
  );

  // Clear only the error of the field being edited
  const clearError = (key: keyof FieldErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};

    if (!String(firstName ?? "").trim()) {
      e.firstName = "Please enter your first name";
    }

    if (!String(lastName ?? "").trim()) {
      e.lastName = "Please enter your last name";
    }

    const h = Number(heightCm);
    if (heightCm == null || !Number.isFinite(h)) {
      e.height = "Please enter your height";
    } else if (h < 50 || h > 250) {
      e.height = "Height must be between 50 and 250 cm";
    }

    if (!birthDate) {
      e.birthDate = "Please select your date of birth";
    } else {
      const d = new Date(birthDate as any);
      const now = new Date();
      const oldest = new Date();
      oldest.setFullYear(now.getFullYear() - 120);

      if (isNaN(d.getTime())) {
        e.birthDate = "Please enter a valid date";
      } else if (d > now) {
        e.birthDate = "Date of birth can't be in the future";
      } else if (d < oldest) {
        e.birthDate = "Please enter a valid date of birth";
      }
    }

    return e;
  };

  const saveUpdates = async (updates: Partial<User>) => {
    setSaving(true);
    try {
      const ok = await updateUser(updates);
      if (ok) {
        onBack();
      } else {
        setErrors({
          general: "We couldn't save your changes. Please try again.",
        });
      }
    } catch {
      setErrors({
        general: "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const updates: Partial<User> = {
      gender,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      heightCm: Number(heightCm),
      birthDate,
    };

    const changedFields: string[] = [];

    if (gender !== user.gender) {
      changedFields.push("gender");
    }

    if (Number(heightCm) !== Number(user.heightCm)) {
      changedFields.push("height");
    }

    const originalBirthDate = user.birthDate
      ? String(user.birthDate).slice(0, 10)
      : "";

    const editedBirthDate = birthDate ? String(birthDate).slice(0, 10) : "";

    if (editedBirthDate !== originalBirthDate) {
      changedFields.push("birth date");
    }

    // No calorie-related changes: save normally.
    if (changedFields.length === 0) {
      await saveUpdates(updates);
      return;
    }

    // Show the reminder before saving.
    setPendingUpdate(updates);
    setGoalType(changedFields.join(", "));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] md:bg-slate-100 flex justify-center animate-in slide-in-from-right duration-300">
      <div className="flex flex-col w-full max-w-3xl bg-[#F8FAFC] md:my-8 md:rounded-[32px] md:shadow-xl md:border md:border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex items-center border-b border-transparent bg-white">
          <button
            onClick={onBack}
            className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h2 className="flex-1 text-center text-lg font-extrabold text-slate-900 pr-8">
            Personal Information
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-0 space-y-6 mt-3">
          <div className="space-y-2 pb-1">
            <p className="text-gray-400 font-semibold">
              Keep your physical information updated for accurate tracking.
            </p>
          </div>
          {/* Gender Radio Buttons */}
          {/* Gender Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-2">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setGender("male")}
                className={`py-5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all flex items-center justify-center space-x-3 shadow-sm ${
                  gender === "male"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${gender === "male" ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`}
                >
                  {gender === "male" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={5} />
                    </div>
                  )}
                </div>
                <span>Male</span>
              </button>
              <button
                onClick={() => setGender("female")}
                className={`py-5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all flex items-center justify-center space-x-3 shadow-sm ${
                  gender === "female"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${gender === "female" ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`}
                >
                  {gender === "female" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={5} />
                    </div>
                  )}
                </div>
                <span>Female</span>
              </button>
            </div>
          </div>

          {/* Input Grid */}
          <div className="space-y-6 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                value={firstName}
                onChange={(v: string) => {
                  setFirstName(v);
                  clearError("firstName");
                }}
                placeholder="First Name"
                error={errors.firstName}
              />
              <InputField
                label="Last Name"
                value={lastName}
                onChange={(v: string) => {
                  setLastName(v);
                  clearError("lastName");
                }}
                placeholder="Last Name"
                error={errors.lastName}
              />
            </div>

            {/* <InputField label="Email Address" value={email} onChange={setEmail} placeholder="email@example.com" type="email" /> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Height (cm)"
                value={heightCm}
                onChange={(v: string) => {
                  setHeightCm(v as any);
                  clearError("height");
                }}
                placeholder="170"
                type="number"
                error={errors.height}
              />
              {/* Native Date Picker */}
              <InputField
                label="Date of Birth"
                value={birthDate}
                onChange={(v: string) => {
                  setBirthDate(v as any);
                  clearError("birthDate");
                }}
                type="date"
                error={errors.birthDate}
              />
            </div>
          </div>
        </div>

        {/* Footer Save Button */}
        <div className="p-6 pb-10">
          {errors.general && (
            <p
              role="alert"
              className="mb-3 flex items-start gap-1.5 text-sm font-semibold text-rose-600"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errors.general}</span>
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Calorie Goal Update Modal */}
        <CalorieGoalReminderModal
          open={!!pendingUpdate}
          changedFields={goalType ?? ""}
          isLoading={saving}
          onConfirm={async () => {
            if (!pendingUpdate) return;
            await saveUpdates(pendingUpdate); // saves, navigates back, or shows the error
            setPendingUpdate(null);
          }}
          onCancel={() => setPendingUpdate(null)}
        />
      </div>
    </div>
  );
};

export default PersonalInfo;
