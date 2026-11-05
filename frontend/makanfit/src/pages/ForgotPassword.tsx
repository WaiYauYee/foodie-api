import React, { useEffect, useState } from "react";
import { ChevronLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import { usePasswordReset } from "../contexts/PasswordResetContext";
import ErrorToast from "../components/modals/ErrorToast";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { email: savedEmail, setEmail: saveEmail } = usePasswordReset();

  const [email, setEmail] = useState(savedEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // After the "Email Sent!" card, move on to the OTP page
  useEffect(() => {
    if (!emailSent) return;
    const t = setTimeout(
      () => navigate("/verify-reset-code", { replace: true }),
      2000,
    );
    return () => clearTimeout(t);
  }, [emailSent, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        saveEmail(email);
        setEmailSent(true);
      } else {
        setError(result.message || "Failed to request password reset");
      }
    } catch (err) {
      console.error("Request reset failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left duration-500">
      <ErrorToast message={error} onClose={() => setError(null)} />

      {emailSent ? (
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center space-y-4 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
            <Mail size={32} />
          </div>
          <h4 className="text-xl font-black text-emerald-800">Email Sent!</h4>
          <p className="text-emerald-600 font-medium">
            Check your email at <span className="font-bold">{email}</span> for
            the reset code. Redirecting shortly...
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-8 text-center md:text-left">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 text-emerald-600 font-bold mb-4 hover:text-emerald-700 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              Forgot Password?
            </h3>
            <p className="text-gray-400 font-medium">
              Please enter the email address linked to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <p className="text-xs text-gray-400 text-center">
              We'll send a password reset code to your email address
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Send Code</span>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
