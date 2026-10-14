import React, { useState } from "react";
import { User } from "../types/types";
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X,
  ChevronLeft,
} from "lucide-react";

interface AccountSettingProps {
  user: User;
  onBack: () => void;
  onChangeEmail: (
    email: string,
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  onDeleteAccount: () => Promise<{
    success: boolean;
    message: string;
  }>;
}

const ErrorAlert = ({
  title,
  message,
  onDismiss,
}: {
  title: string;
  message: string;
  onDismiss: () => void;
}) => (
  <div
    role="alert"
    className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
      <AlertTriangle size={20} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-sm font-extrabold text-rose-900">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-rose-700">{message}</p>
    </div>

    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss error"
      className="rounded-lg p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-700"
    >
      <X size={18} />
    </button>
  </div>
);

const AccountSetting: React.FC<AccountSettingProps> = ({
  user,
  onBack,
  onChangeEmail,
  onDeleteAccount,
}) => {
  const [emailValue, setEmailValue] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveEmail = async () => {
    setEmailError("");

    if (!emailValue.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }

    if (emailValue.trim().toLowerCase() === user.email.toLowerCase()) {
      setEmailError("Your new email is the same as your current email.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await onChangeEmail(emailValue.trim());

      if (!res.success) {
        setEmailError(res.message);
        return;
      }

      onBack();
    } catch {
      setEmailError("We couldn't update your email. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError("");
    setIsDeleting(true);

    try {
      const res = await onDeleteAccount();

      if (!res.success) {
        setDeleteError(res.message);
      }
      // On success, App.tsx handles logout.
    } catch {
      setDeleteError("We couldn't delete your account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-4 py-3 flex items-center bg-white">
        <button
          onClick={onBack}
          className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="flex-1 text-center text-lg font-extrabold text-slate-900 pr-8">
          Account Settings
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6 m-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none transition-all text-sm"
              placeholder="Enter your email"
            />
            <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          </div>
        </div>

        {emailError && (
          <ErrorAlert
            title="Unable to update email"
            message={emailError}
            onDismiss={() => setEmailError("")}
          />
        )}

        <button
          onClick={handleSaveEmail}
          disabled={isSaving}
          className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-100 active:scale-[0.98] transition-all uppercase tracking-widest text-xs flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            "Updating..."
          ) : (
            <>
              <span>Save Changes</span>
              <CheckCircle2 size={16} />
            </>
          )}
        </button>
      </div>

      <div className="bg-red-50 rounded-[32px] p-8 border border-red-100 space-y-4 m-5">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertTriangle size={20} />
          <h3 className="font-black uppercase tracking-wider text-xs">
            Danger Zone
          </h3>
        </div>
        <p className="text-sm font-bold text-red-800 leading-relaxed">
          Deleting your account is permanent and will remove all your food logs,
          weight history, and custom settings.
        </p>
        <button
          onClick={() => {
            setDeleteError("");
            setIsDeleteModalOpen(true);
          }}
          className="w-full bg-white text-red-600 font-black py-4 rounded-2xl border border-red-200 active:scale-[0.98] transition-all uppercase tracking-widest text-[10px]"
        >
          Delete My Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300 border-2 border-red-50">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  Delete Account?
                </h3>
                <p className="text-slate-400 font-bold leading-relaxed">
                  This action is irreversible. All your Malaysian food logs and
                  fitness progress will be lost forever.
                </p>
              </div>
              <div className="w-full space-y-3">
                {deleteError && (
                  <ErrorAlert
                    title="Unable to delete account"
                    message={deleteError}
                    onDismiss={() => setDeleteError("")}
                  />
                )}
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full bg-red-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-red-200 active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  {isDeleting ? "Deleting..." : "Delete Forever"}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full bg-slate-100 text-slate-600 font-black py-5 rounded-3xl active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Keep My Account
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSetting;
