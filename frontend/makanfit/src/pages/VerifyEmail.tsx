import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import Mascot from "../components/mascot/Mascot";
import VerifyEmailForm from "../components/auth/VerifyEmailForm";
import { resendVerification } from "../services/authService";
import {
  PendingVerification,
  useEmailVerification,
} from "../contexts/EmailVerificationContext";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { pending, clear } = useEmailVerification();
  const [done, setDone] = useState<PendingVerification | null>(null);
  const sentRef = useRef(false);

  // Coming from login: no code has been sent yet, so request one on arrival
  useEffect(() => {
    if (!pending || pending.source !== "login" || sentRef.current) return;
    sentRef.current = true;
    void resendVerification(pending.email);
  }, [pending]);

  if (done) {
    const hasName = !!done.firstName;
    return (
      <div className="animate-in zoom-in fade-in duration-500 flex flex-col items-center text-center py-6">
        <div className="relative mb-8">
          <div className="absolute inset-x-2 top-8 bottom-4 rounded-full bg-emerald-100/60 animate-pulse" />
          <div className="absolute -inset-x-2 top-4 -bottom-2 rounded-full bg-emerald-50/60" />
          <Mascot animationState="idle" className="relative w-32 h-40" />
        </div>

        <div className="space-y-3 mb-8">
          <h4 className="text-3xl font-black text-gray-900 tracking-tight">
            {hasName ? `Welcome, ${done.firstName}!` : "Email verified!"}
          </h4>
          <p className="text-gray-500 font-medium leading-relaxed max-w-[350px] mx-auto">
            Your account has been created successfully. You're all set to start
            tracking your makan.
          </p>
        </div>

        {hasName && (
          <div className="w-full bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-center space-x-4 text-left">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {done.firstName?.charAt(0).toUpperCase()}
              {done.lastName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 truncate">
                {done.firstName} {done.lastName}
              </p>
              <p className="text-sm text-gray-500 font-medium truncate">{done.email}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 ml-auto" />
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center"
        >
          Get Started
        </button>
      </div>
    );
  }

  // Direct visit / expired session: nothing to verify
  if (!pending) return <Navigate to="/signup" replace />;

  return (
    <div className="animate-in fade-in slide-in-from-right duration-500">
      <VerifyEmailForm
        email={pending.email}
        onVerified={() => {
          setDone(pending); // snapshot so the success card survives clear()
          clear();
        }}
        onBack={() => navigate(pending.source === "login" ? "/login" : "/signup")}
      />
    </div>
  );
};

export default VerifyEmail;