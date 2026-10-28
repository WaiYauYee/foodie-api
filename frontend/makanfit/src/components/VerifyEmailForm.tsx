import React, { useEffect, useState } from "react";
import OTPInput from "./otp/OTPInput";
import { verifyEmail, resendVerification } from "../services/authService";

interface Props {
  email: string;
  onVerified: () => void;
  onBack: () => void;          // "Wrong email?"
  initialCooldown?: number;    // a code was just sent, so start the timer
}

const VerifyEmailForm: React.FC<Props> = ({
  email,
  onVerified,
  onBack,
  initialCooldown = 60,
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(initialCooldown);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const res = await verifyEmail(email, code);
    setIsLoading(false);
    if (!res.success) return setError(res.message || "Verification failed");
    onVerified();
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setCode("");
    await resendVerification(email);
    setCooldown(60);
  };

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">
          Verify your email
        </h3>
        <p className="text-gray-400 font-medium">
          If this needs verification, we've sent a 6-digit code to the entered email
        </p>
      </div>

      <OTPInput
        length={6}
        value={code}
        onChange={(v) => {
          setCode(v);
          if (error) setError(null);
        }}
      />

      {error && (
        <p className="text-center text-sm font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Verify Email"
        )}
      </button>

      <div className="flex justify-center items-center gap-1 text-sm text-gray-400">
        <button type="button" onClick={onBack} className="hover:underline">
          Wrong email?{" "}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-emerald-600 font-bold hover:underline disabled:text-gray-300 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
        </button>
      </div>
    </form>
  );
};

export default VerifyEmailForm;