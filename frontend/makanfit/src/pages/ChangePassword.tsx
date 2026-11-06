import React, { useState } from "react";
import { AlertCircle, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../services/authService";
import { validatePassword, validateConfirmPassword } from "../utils/validators";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type FieldErrors = {
  current?: string;
  new?: string;
  confirm?: string;
  general?: string;
};

const PasswordField = ({
  label,
  placeholder,
  value,
  onChange,
  show,
  setShow,
  error,
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
        aria-invalid={!!error}
        className={`w-full bg-slate-100 border-2 rounded-2xl py-5 px-6 text-gray-900 font-bold focus:outline-none focus:bg-white transition-all placeholder:text-gray-300 appearance-none
          ${
            error
              ? "border-rose-300 focus:border-rose-500"
              : "border-gray-100 focus:border-emerald-500"
          }`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
      >
        {show ? <EyeOff size={22} /> : <Eye size={22} />}
      </button>
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

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user.userId;
  const onBack = () => navigate("/profile");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  // Clear only the error of the field being edited
  const clearError = (key: keyof FieldErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const handleSave = async () => {
    const newErrors: FieldErrors = {};

    if (!currentPassword) {
      newErrors.current = "Please enter your current password";
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      newErrors.new = passwordValidation.error;
    }

    const confirmValidation = validateConfirmPassword(
      newPassword,
      confirmPassword,
    );
    if (!confirmValidation.isValid) {
      newErrors.confirm = confirmValidation.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const res = await changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword,
      );

      if (!res.success) {
        // Most server failures here are "current password incorrect".
        // Change the target field if your API returns a field/code.
        setErrors({ current: res.message });
        return;
      }

      onBack();
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  };

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
            Change Password
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-0 space-y-6 mt-3">
          <div className="space-y-2 pb-1">
            <p className="text-gray-400 font-semibold">
              Choose a strong new password to keep your account secure.
            </p>
          </div>

          <PasswordField
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(v: string) => {
              setCurrentPassword(v);
              clearError("current");
            }}
            show={showCurrent}
            setShow={setShowCurrent}
            error={errors.current}
          />
          <PasswordField
            label="New Password"
            placeholder="New Password"
            value={newPassword}
            onChange={(v: string) => {
              setNewPassword(v);
              clearError("new");
            }}
            show={showNew}
            setShow={setShowNew}
            error={errors.new}
          />
          <PasswordField
            label="Confirm Password"
            placeholder="New Password Confirmation"
            value={confirmPassword}
            onChange={(v: string) => {
              setConfirmPassword(v);
              clearError("confirm");
            }}
            show={showConfirm}
            setShow={setShowConfirm}
            error={errors.confirm}
          />
        </div>

        {/* Footer Save Button */}
        <div className="p-6">
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
            className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
