import React, { useState } from "react";
import { AlertCircle, ChevronLeft, Eye, EyeOff, X } from "lucide-react";
import { changePassword } from "../services/authService";
import { validatePassword } from "../utils/validators";

interface ChangePasswordProps {
  onBack: () => void;
  userId: string;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onBack, userId }) => {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError("");

    if (!currentPassword) {
      return setError("Please enter your current password");
    }

    const passwordValidation = validatePassword(newPassword);

    if (!passwordValidation.valid) {
      return setError(passwordValidation.message!);
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setSaving(true);

    try {
      const res = await changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword,
      );

      if (!res.success) {
        setError(res.message);
        return;
      }

      onBack();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({
    label,
    placeholder,
    value,
    onChange,
    show,
    setShow,
  }: any) => (
    <div className="relative w-full">
      {label && (
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-2 mb-2 block">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-100 border-2 border-gray-100 rounded-2xl py-5 px-6 text-gray-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-gray-300 appearance-none"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
        >
          {show ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-4 py-3 flex items-center bg-white">
        <button
          onClick={onBack}
          className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="flex-1 text-center text-lg font-extrabold text-slate-900 pr-8">
          Change Password
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-0 space-y-6 mt-3">
        <div className="space-y-2 pb-1">
          <p className="text-gray-400 font-semibold">
            Your new password must be at least 8 characters long.
          </p>
        </div>
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-3 rounded-2xl border border-rose-200/80 bg-rose-50 p-4 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertCircle size={20} strokeWidth={2.2} />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-extrabold text-rose-900">
                Unable to update password
              </p>
              <p className="mt-1 text-sm leading-relaxed text-rose-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 rounded-lg p-1 text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-700"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <PasswordField
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          setShow={setShowCurrent}
        />
        <PasswordField
          label="New Password"
          placeholder="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          setShow={setShowNew}
        />
        <PasswordField
          label="Confirm Password"
          placeholder="New Password Confirmation"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
        />
      </div>

      {/* Footer Save Button */}
      <div className="p-6">
        <button
          onClick={handleSave}
          className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
        >
          {saving ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
