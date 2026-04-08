
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import MakanFitAvatar from './MakanFitAvatar';
import { login, requestPasswordReset, resetPassword } from '../services/authService';
import OTPInput from './OTPInput';
import { FaCheck } from 'react-icons/fa';

interface LoginProps {
  onLogin: () => void;
  onNavigateToSignUp: () => void;
}

type LoginView = 'login' | 'forgot' | 'otp' | 'reset';

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignUp }) => {
  const [view, setView] = useState<LoginView>('login')
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   // Simulate a network delay
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     onLogin();
  //   }, 1500);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(email, password);

      if (result.success && result.token) {
        // Login successful → user and token are stored in localStorage
        onLogin(); // probably navigates to onboarding
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleResetPassword = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (newPassword !== confirmPassword) {
  //     alert("Passwords do not match!");
  //     return;
  //   }
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setIsSuccess(true);
  //     setTimeout(() => {
  //       setIsSuccess(false);
  //       setView('login');
  //     }, 2000);
  //   }, 1500);
  // };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: Passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Validation: Password length
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(resetToken, newPassword);

      if (result.success) {
        // Password reset successful
        setIsSuccess(true);
        
        // Clear form
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        setResetEmail('');
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setView('login');
        }, 3000);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error("Reset password failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: Token provided
    if (!resetToken.trim()) {
      setError("Reset token is required. Please check your email for the reset code.");
      return;
    }
    setView('reset');
    setError(null);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(resetEmail);

      if (result.success) {
        // Email sent successfully
        setResetEmailSent(true);
        
        // Auto-transition to reset view after 2 seconds
        setTimeout(() => {
          setView('otp');
          setResetEmailSent(false);
        }, 2000);
      } else {
        setError(result.message || 'Failed to request password reset');
      }
    } catch (error) {
      console.error("Request reset failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Left Pane - Brand / Marketing (Visible on md and up) bg-[#F8FAFC] */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#064E3B] p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements for the brand pane */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="relative">
              <div className="w-16 h-16 bg-emerald-50 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group">
                <MakanFitAvatar size={42} className="group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">MAKANFIT</h1>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Eat smarter, <br />
              <span className="text-emerald-200">live better.</span>
            </h2>
            <p className="text-emerald-50/80 text-lg font-medium leading-relaxed">
              Machine learning model trained exclusively on Malaysian dishes. 
            Snap, recognize, and track your nutrition with MakanFit.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
            <div className="space-y-3">
                <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                    <span className="text-xs font-black text-emerald-900">✓</span>
                </div>
                <p className="text-white/80 font-bold">AI-powered Malaysian food recognition</p>
                </div>
                <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                    <span className="text-xs font-black text-emerald-900">✓</span>
                </div>
                <p className="text-white/80 font-bold">Adjust ingredients & portions manually</p>
                </div>
                <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                    <span className="text-xs font-black text-emerald-900">✓</span>
                </div>
                <p className="text-white/80 font-bold">Nutrition tailored for Malaysian cuisine</p>
                </div>
            </div>
        </div>
      </div>

      {/* Right Pane - Form (Mobile gets the full green background here) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-[#10B981] md:from-transparent via-[#059669] md:via-transparent to-[#064E3B] md:to-transparent">
        <div className="w-full max-w-md bg-white rounded-[40px] md:rounded-none shadow-2xl md:shadow-none p-8 md:p-0 overflow-hidden relative">
          
          <div className="md:hidden flex flex-col items-center mb-10">
             <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter">MAKANFIT</h1>
          </div>

          {/* error check */}
            {error && (
              <div className="fixed top-4 right-4 max-w-sm z-50 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

          {/* VIEW 1: LOGIN */}
          {view === 'login' ? (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="space-y-2 mb-8 text-center md:text-left">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back</h3>
                <p className="text-gray-400 font-medium">Please enter your details to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="fixed top-4 right-4 max-w-sm z-50 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

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
                      type={showPassword ? 'text' : 'password'}
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
                  {/* <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm font-bold text-gray-400">Remember me</span>
                  </label> */}
                  <button type="button"
                  onClick={() => {
                      setView('forgot');
                      setError(null);
                      setResetEmail('');
                      setResetEmailSent(false);
                    }}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot Password?</button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ChevronRight size={22} strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>
              <p className="mt-10 text-center text-gray-400 font-medium">
            Don't have an account? <button onClick={onNavigateToSignUp} className="text-emerald-600 font-black hover:underline">Sign Up</button>
          </p>
        </div>
          ) : view === 'forgot' ? (
            <div className="animate-in fade-in slide-in-from-left duration-500">
              {!resetEmailSent && (
                <>
                <div className="space-y-2 mb-8 text-center md:text-left">
                  <button 
                    onClick={() => {
                      setView('login');
                      setError(null);
                      setResetEmail('');
                    }}
                    className="flex items-center space-x-2 text-emerald-600 font-bold mb-4 hover:text-emerald-700 transition-colors"
                  >
                    <ChevronLeft size={20} />
                    <span>Back</span>
                  </button>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Forgot Password?</h3>
                  <p className="text-gray-400 font-medium">Enter your email and we'll send a code.</p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
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
                      <>
                        <span>Send Code</span>
                        <ChevronRight size={22} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </form>
                </>
              )}

              {resetEmailSent && (
                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
                    <Mail size={32} />
                  </div>
                  <h4 className="text-xl font-black text-emerald-800">Email Sent!</h4>
                  <p className="text-emerald-600 font-medium">
                    Check your email at <span className="font-bold">{resetEmail}</span> for the reset code. 
                    Redirecting shortly...
                  </p>
                </div>
              )}
              </div>
            ): view === 'otp' ? (
                <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="space-y-2 mb-8 text-center md:text-left">
                <button 
                  onClick={() => {
                    setView('forgot');
                    setError(null);
                    setResetEmail('');
                  }}
                  className="flex items-center space-x-2 text-emerald-600 font-bold mb-4 hover:text-emerald-700 transition-colors"
                >
                  <ChevronLeft size={20} />
                  <span>Back</span>
                </button>
                
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Verify Code</h3>
                <p className="text-gray-400 font-medium leading-relaxed">We sent a reset code to <span className="text-gray-900 font-bold">{resetEmail}</span></p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="py-4">
                  <OTPInput value={resetToken} onChange={setResetToken} length={6} />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Verify Code
                </button>
                <p className="text-center text-sm text-gray-400">Didn't get a code? <button type="button" onClick={handleRequestReset} className="text-emerald-600 font-bold hover:underline">Resend</button></p>
              </form>
            </div>
            ): (
              <div className="animate-in fade-in slide-in-from-left duration-500">
                <button 
                  onClick={() => {
                      setView('otp');
                      setResetToken('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError(null);
                    }}
                  className="flex items-center space-x-2 text-emerald-600 font-bold mb-4 hover:text-emerald-700 transition-colors"
                >
                  <ChevronLeft size={20} />
                  <span>Back</span>
                </button>
              <div className="space-y-2 mb-8 text-center md:text-left">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Create New Password</h3>
                <p className="text-gray-400 font-medium">Create a strong password for your account</p>
              </div>

              {isSuccess ? (
                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
                    <Sparkles size={32} />
                  </div>
                  <h4 className="text-xl font-black text-emerald-800">Password Changed!</h4>
                  <p className="text-emerald-600 font-medium">Your password has been reset successfully. Redirecting to login...</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-4">
                    {/* Reset Token Input */}
                    {/* <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter reset code from email"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div> */}

                    {/* New Password Input */}
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-14 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-14 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {/* Strength Meter (matching SignUp) */}
                    {newPassword.length > 0 && (
                      <div className="px-1 text-xs text-gray-400 leading-relaxed font-medium">
                        <span>
                          {requirements.length && requirements.uppercase && requirements.number && (
                            <FaCheck className="text-emerald-500 inline mr-1" />
                          )}
                          Password must be at least{' '}
                          <span className={requirements.length ? 'text-emerald-500 font-bold' : ''}>
                            8+ characters
                          </span>
                          , include{' '}
                          <span className={requirements.uppercase ? 'text-emerald-500 font-bold' : ''}>
                            one uppercase letter
                          </span>
                          , and{' '}
                          <span className={requirements.number ? 'text-emerald-500 font-bold' : ''}>
                            one number
                          </span>
                          .
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reset Password Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1A2A33] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Save Password</span>
                        <ChevronRight size={22} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            )}
          </div>

          {/* <div className="mt-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-300">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-0 gap-4">
              <button className="flex items-center justify-center space-x-3 py-4 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors font-bold text-gray-700">
                <Chrome size={20} className="text-red-500" />
                <span>Google</span>
              </button>
            </div>
          </div> */}
      </div>
    </div>
  );
};

export default Login;