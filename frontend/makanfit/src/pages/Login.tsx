import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import StoryCategoryIcon from "../components/icons/StoryCategoryIcon";
import ErrorToast from "../components/modals/ErrorToast";
import { useEmailVerification } from "../contexts/EmailVerificationContext";
import { validateTerms } from "../utils/validators";
import TermsCheckbox from "../components/auth/TermsCheckbox";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: startSession } = useAuth();
  const { start: startVerification } = useEmailVerification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const terms = validateTerms(acceptedTerms);
    if (!terms.isValid) {
      setTermsError(terms.error!);
      return;
    }
    setTermsError(null);

    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success && result.token) {
        // authService stored user + token in localStorage; sync the context, then enter the app
        await startSession();
        navigate("/", { replace: true });
      } else if (result.code === "EMAIL_NOT_VERIFIED" && result.email) {
        startVerification({ email: result.email, source: "login" });
        navigate("/verify-email");
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-500">
      <ErrorToast message={error} onClose={() => setError(null)} />

      <button
        type="button"
        onClick={() => navigate("/welcome")}
        className="flex items-center space-x-1.5 text-sm font-bold text-slate-400 hover:text-emerald-600 mb-6 transition-colors cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5 mb-8 text-center md:text-left">
        <div className="flex justify-center md:justify-start shrink-0">
          <StoryCategoryIcon
            type="companion"
            size={80}
            className="!w-16 !h-16 !rounded-full shadow-md"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome back!
          </h3>
          <p className="text-gray-400 font-medium">
            Please enter your details to continue
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Mail size={20} />
            </div>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-14 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end px-1">
          <button
            type="button"
            onClick={() => navigate("/request-password-reset")}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <TermsCheckbox
          checked={acceptedTerms}
          onChange={(v) => {
            setAcceptedTerms(v);
            if (v) setTermsError(null);
          }}
          error={termsError}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <p className="mt-10 text-center text-gray-400 font-medium">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="text-emerald-600 font-black hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
