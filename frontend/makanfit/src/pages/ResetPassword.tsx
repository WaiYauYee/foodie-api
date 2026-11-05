import React, { useEffect, useState } from "react";
import { ChevronLeft, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { usePasswordReset } from "../contexts/PasswordResetContext";
import ErrorToast from "../components/modals/ErrorToast";

const inputClass =
  "w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-14 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { email, code, clear } = usePasswordReset();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const requirements = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  // Success screen, then back to login
  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => navigate("/login", { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [isSuccess, navigate]);

  // Guard: needs a verified email + code (lost on refresh by design)
  if (!isSuccess) {
    if (!email) return <Navigate to="/request-password-reset" replace />;
    if (code.length !== 6) return <Navigate to="/verify-reset-code" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email, code, newPassword);
      if (result.success) {
        setIsSuccess(true);
        clear(); // isSuccess keeps the guard above from redirecting
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left duration-500">
      <ErrorToast message={error} onClose={() => setError(null)} />

      {!isSuccess && (
        <button
          type="button"
          onClick={() => navigate("/verify-reset-code")}
          className="flex items-center space-x-2 text-emerald-600 font-bold mb-4 hover:text-emerald-700 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      )}

      <div className="space-y-2 mb-8 text-center md:text-left">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">
          Create New Password
        </h3>
        <p className="text-gray-400 font-medium">
          Create a strong password for your account
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center space-y-4 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
            <Sparkles size={32} />
          </div>
          <h4 className="text-xl font-black text-emerald-800">Password Changed!</h4>
          <p className="text-emerald-600 font-medium">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showNew ? "text" : "password"}
                required
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="px-1 text-xs text-gray-400 leading-relaxed font-medium">
                <span>
                  {requirements.length &&
                    requirements.uppercase &&
                    requirements.number && (
                      <FaCheck className="text-emerald-500 inline mr-1" />
                    )}
                  Password must be at least{" "}
                  <span className={requirements.length ? "text-emerald-500 font-bold" : ""}>
                    8+ characters
                  </span>
                  , include{" "}
                  <span className={requirements.uppercase ? "text-emerald-500 font-bold" : ""}>
                    one uppercase letter
                  </span>
                  , and{" "}
                  <span className={requirements.number ? "text-emerald-500 font-bold" : ""}>
                    one number
                  </span>
                  .
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Reset</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;