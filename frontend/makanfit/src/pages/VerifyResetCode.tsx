import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { requestPasswordReset, verifyResetCode } from "../services/authService";
import { usePasswordReset } from "../contexts/PasswordResetContext";
import OTPInput from "../components/otp/OTPInput";
import ErrorToast from "../components/modals/ErrorToast";

const VerifyResetCode: React.FC = () => {
  const navigate = useNavigate();
  const { email, setCode: saveCode } = usePasswordReset();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60); // a code was just sent

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Nothing to verify without an email (direct visit / expired session)
  if (!email) return <Navigate to="/request-password-reset" replace />;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyResetCode(email, code);
      if (result.success) {
        saveCode(code);
        navigate("/reset-password");
      } else {
        setError(result.message || "Invalid or expired reset code");
        setCode(""); // clears the boxes so they can retype
      }
    } catch (err) {
      console.error("Verify code failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    setError(null);
    setInfo(null);
    setCode("");
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setInfo("A new code has been sent to your email.");
        setCooldown(60);
      } else {
        setError(result.message || "Failed to resend code");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-500">
      <ErrorToast message={error} onClose={() => setError(null)} />

      <div className="space-y-2 mb-8 text-center md:text-left">
        <button
          type="button"
          onClick={() => navigate("/request-password-reset")}
          className="flex items-center space-x-2 text-emerald-600 font-bold mb-4 hover:text-emerald-700 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">
          OTP Verification
        </h3>
        <p className="text-gray-400 font-medium leading-relaxed">
          Please enter the verification reset code sent to your email
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="py-4">
          <OTPInput value={code} onChange={setCode} length={6} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Verify"
          )}
        </button>

        {info && (
          <p className="text-center text-sm text-emerald-600 font-medium">{info}</p>
        )}

        <p className="text-center text-sm text-gray-400">
          Didn't get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isLoading}
            className="text-emerald-600 font-bold hover:underline disabled:text-gray-300 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default VerifyResetCode;