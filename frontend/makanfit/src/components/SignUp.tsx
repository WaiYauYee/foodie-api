import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Sparkles, User, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import MakanFitAvatar from './MakanFitAvatar';
import { signUp } from '../services/authService';
import { FaCheck } from 'react-icons/fa';

interface SignUpProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToTerms: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onNavigateToLogin, onNavigateToTerms, onNavigateToPrivacy }) => {
  // const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   // Simulate signup process
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setIsSuccess(true);
  //     // Wait for 2 seconds to show success before redirecting to login
  //     setTimeout(() => {
  //       onSignUp();
  //     }, 3000);
  //   }, 1500);
  // };

  // ============================================
  // HANDLE INPUT CHANGE
  // ============================================
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // ============================================
  // HANDLE FORM SUBMISSION
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Check if signup was successful
      if (!response.success) {
        // Determine which field has the error
      let field = 'general';
      if (response.message?.includes('email') || response.message?.includes('Email')) {
        field = 'email';
      } else if (response.message?.includes('Password') || response.message?.includes('password')) {
        field = 'password';
      } else if (response.message?.includes('match')) {
        field = 'confirmPassword';
      } else if (response.message?.includes('First name')) {
        field = 'firstName';
      } else if (response.message?.includes('Last name')) {
        field = 'lastName';
      }

        setError(response.message || 'Failed to create account');
        // Show error for 5 seconds then clear
        // setTimeout(() => setError(null), 5000);
        setFieldError(field);
        setIsLoading(false);
        return;
      }

      // Success! Show success screen
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        onNavigateToLogin();
      }, 3000);

    } catch (err) {
      console.error('SignUp error:', err);
      setError('An unexpected error occurred. Please try again.');
      setFieldError('general');
      setIsLoading(false);
    }
  };

  // Password validation logic
  const requirements = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Left Pane - Brand & Value Prop (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#064E3B] p-16 flex-col justify-between relative overflow-hidden">
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
          
          <div className="space-y-10 max-w-lg">
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Start your <br />
              <span className="text-emerald-200">health journey.</span>
            </h2>
            
            <div className="space-y-6">
              {[
                "AI Photo Recognition for Malaysian Food",
                "Personalized weight & nutrition tracking",
                "Smart nutrition insights for your meals"
              ].map((text, i) => (
                <div key={i} className="flex items-center space-x-4 text-emerald-50">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />
                  <span className="text-lg font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-4">
          {!isSuccess && (
          <button 
            onClick={onNavigateToLogin}
            className="flex items-center space-x-2 text-white/80 hover:text-white font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Already have an account? Log In</span>
          </button>
          )}
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-[#10B981] md:from-transparent via-[#059669] md:via-transparent to-[#064E3B] md:to-transparent">
        <div className="w-full max-w-md bg-white rounded-[40px] md:rounded-none shadow-2xl md:shadow-none p-8 md:p-0">
          
          <div className="md:hidden flex flex-col items-center mb-8">
             <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter">MAKANFIT</h1>
          </div>

          <div className="space-y-2 mb-8 text-center md:text-left">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h3>
            <p className="text-gray-400 font-medium">Join us and start tracking your makan today!</p>
          </div>

          {isSuccess ? (
            <div className="animate-in zoom-in fade-in duration-500 flex flex-col items-center text-center space-y-6 py-10">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-emerald-50 rounded-[48px] flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
                   <MakanFitAvatar size={100} className="animate-bounce-slow" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-3xl font-black text-gray-900 tracking-tight">Success!</h4>
                <p className="text-gray-500 font-bold leading-relaxed max-w-[280px] mx-auto">
                  Account created for <span className="text-emerald-600">{formData.firstName} {formData.lastName}</span>. Redirecting you to login...
                </p>
              </div>

              <div className="w-full max-w-[200px] pt-6">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-progress-fast" />
                </div>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* error check */}
            {/* {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )} */}
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

            {/* Name Fields - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all ${error && fieldError === 'email' ? 'border-red-500' : 'border-gray-100'}`}
              />
            </div>

            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-14 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all ${error && fieldError === 'password' ? 'border-red-500' : 'border-gray-100'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            {/* Password Requirement Checklist */}
              {formData.password && !(requirements.length && requirements.uppercase && requirements.number) && (
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

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full bg-gray-50 md:bg-gray-100/50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-14 text-gray-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all ${error && fieldError === 'confirmPassword' ? 'border-red-500' : 'border-gray-100'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="px-1 text-xs text-gray-400 leading-relaxed font-medium">
              By signing up, you agree to our <button type="button" onClick={onNavigateToTerms} className="text-emerald-600 font-bold hover:underline">Terms of Service</button> and <button type="button" onClick={onNavigateToPrivacy} className="text-emerald-600 font-bold hover:underline">Privacy Policy</button>.
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
                  <span>Create Account</span>
                  <ChevronRight size={22} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
          )}

          {!isSuccess && (
          <p className="mt-10 text-center text-gray-400 font-medium">
            Already have an account? <button onClick={onNavigateToLogin} className="text-emerald-600 font-black hover:underline">Log In</button>
          </p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 2s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default SignUp;