
import React, { useState } from 'react';
import { OnboardingData } from '../types/types';
import { 
  ChevronRight, ChevronLeft, User,
  Sparkles,
  Heart,
  Zap,
  Smartphone,
  Check,
  CalendarCheck
} from 'lucide-react';
import { completeOnboarding, getCurrentUser } from '../services/authService';
import MakanFitAvatar from './MakanFitAvatar';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingData>({
  birthDate: '',
  gender: 'female',
  heightCm: 165,
  startWeight: 60,
  goalWeight: 55,
  dietaryGoal: 'Maintain Weight',
  activityLevel: 'Moderately Active',
  triedOtherApps: false,
  dietType: 'Classic',
  primaryGoal: 'healthier',
});

  const totalSteps = 3;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // const handleFinish = () => {
  //   onComplete(formData);
  // };

    const handleInputChange = (field: keyof typeof formData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (error) setError(null);
    };

    const handleFinish = async () => {
    try {
      setIsLoading(true);
      const userId = getCurrentUser()?.userId; // Get from auth context or localStorage

      if (!userId) {
        setError('User not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Call backend API
      const response = await completeOnboarding(userId, formData);

      if (!response.success) {
        setError(response.message);
        setIsLoading(false);
        return;
      }

      // Mark onboarding as complete
      localStorage.setItem('makanfit_onboarding_done', 'true');
      setIsSuccess(true);
      onComplete(formData);
    } catch (error) {
      console.error('Onboarding error:', error);
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const renderProgress = () => (
    <div className="flex items-center justify-center md:justify-start space-x-2 mb-10">
      {[1, 2, 3].map((s) => (
        <div 
          key={s}
          className={`h-2 rounded-full transition-all duration-500 ${
            s <= step ? 'w-12 bg-emerald-500' : 'w-4 bg-gray-200'
          }`}
        />
      ))}
      <span className="ml-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Step {step} of 3</span>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Left Pane - Brand & Context (Visible on md and up) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#064E3B] p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group">
                <MakanFitAvatar size={42} className="group-hover:scale-110 transition-transform duration-500" />
              </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">MAKANFIT</h1>
          </div>
          
          <div className="space-y-8 max-w-lg">
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Personalizing your <br />
              <span className="text-emerald-200">makan journey.</span>
            </h2>
            <p className="text-emerald-50/80 text-lg font-medium leading-relaxed">
              We analyze your lifestyle and dietary habits to create a precise Malaysian nutritional blueprint tailored just for you.
            </p>
            
            {/* <div className="space-y-6 pt-6">
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="w-12 h-12 bg-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-200">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Scientific Calculation</h4>
                  <p className="text-emerald-100/60 text-sm">Calculated using verified MOH guidelines.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="w-12 h-12 bg-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-200">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Custom Dashboard</h4>
                  <p className="text-emerald-100/60 text-sm">Adaptive interface based on your goals.</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* <div className="relative z-10">
           <p className="text-emerald-200/50 text-xs font-black uppercase tracking-[0.2em]">Malaysian Standard • Precision AI</p>
        </div> */}
      </div>

      {/* Right Pane - Form (Mobile gets the emerald gradient background) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-gradient-to-br from-[#10B981] md:from-transparent via-[#059669] md:via-transparent to-[#064E3B] md:to-transparent">
        <div className="w-full max-w-lg bg-white rounded-[40px] md:rounded-none shadow-2xl md:shadow-none p-8 md:p-0">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-10">
             <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter">MAKANFIT</h1>
          </div>

          {renderProgress()}

          {/* Error Toast */}
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

          {isSuccess ? (
            <div className="animate-in zoom-in fade-in duration-500 flex flex-col items-center text-center space-y-6 py-10">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-emerald-50 rounded-[48px] flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
                   <MakanFitAvatar size={100} className="animate-bounce-slow" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-3xl font-black text-gray-900 tracking-tight">Perfect!</h4>
                <p className="text-gray-500 font-bold leading-relaxed max-w-[280px] mx-auto">
                  Your profile is all set. Let's start tracking your makan!
                </p>
              </div>

              <div className="w-full max-w-[200px] pt-6">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 animate-progress-fast" />
                </div>
              </div>
            </div>
          ) : (
          <div className="relative z-10">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Let's get to know you</h2>
                  <p className="text-gray-400 font-medium">Tell us about your health habits.</p>
                </div>

                {/* <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                      <input 
                        type="text" 
                        placeholder="Aminah"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Yusof"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                      <input 
                        type="date" 
                        value={formData.birthDate}
                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-transparent rounded-2xl p-4 pl-12 font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div> */}

                {/* Experience Question */}
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">Have you used tracking apps before?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Yes', val: true },
                      { label: 'No', val: false }
                    ].map(opt => (
                      <button 
                        key={opt.label}
                        onClick={() => handleInputChange('triedOtherApps', opt.val)}
                        className={`py-4 rounded-2xl border-2 font-black transition-all ${formData.triedOtherApps === opt.val ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diet Type */}
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">Do you follow a specific diet?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Classic', 'Pescatarian', 'Vegetarian', 'Vegan'].map(diet => (
                      <button 
                        key={diet}
                        onClick={() => handleInputChange('dietType', diet)}
                        className={`py-4 rounded-2xl border-2 font-black transition-all flex items-center justify-center space-x-2 ${formData.dietType === diet ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                      >
                        {formData.dietType === diet && <Check size={14} />}
                        <span>{diet}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal Motivation */}
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">What is your primary focus?</label>
                  <div className="space-y-3">
                    {[
                      { id: 'healthier', label: 'Eat and live healthier', icon: Heart },
                      { id: 'energy', label: 'Boost my energy and mood', icon: Zap },
                      { id: 'consistency', label: 'Stay motivated and consistent', icon: Smartphone },
                      { id: 'body', label: 'Feel better about my body', icon: User }
                    ].map(goal => (
                      <button 
                        key={goal.id}
                        onClick={() => handleInputChange('primaryGoal', goal.id)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center space-x-4 ${formData.primaryGoal === goal.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 bg-gray-50'}`}
                      >
                        <div className={`p-2 rounded-xl ${formData.primaryGoal === goal.id ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300'}`}>
                          <goal.icon size={18} />
                        </div>
                        <span className={`font-bold ${formData.primaryGoal === goal.id ? 'text-slate-900' : 'text-slate-500'}`}>{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Body Metrics</h2>
                  <p className="text-gray-400 font-medium">How would you describe your physique?</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Gender</label>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button 
                      onClick={() => handleInputChange('gender', 'male')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-2 ${formData.gender === 'male' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 bg-gray-50'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.gender === 'male' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300'}`}>
                        <User size={24} />
                      </div>
                      <span className={`font-black uppercase tracking-widest text-[10px] ${formData.gender === 'male' ? 'text-emerald-700' : 'text-gray-400'}`}>Male</span>
                    </button>
                    <button 
                      onClick={() => handleInputChange('gender', 'female')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-2 ${formData.gender === 'female' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 bg-gray-50'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.gender === 'female' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300'}`}>
                        <User size={24} />
                      </div>
                      <span className={`font-black uppercase tracking-widest text-[10px] ${formData.gender === 'female' ? 'text-emerald-700' : 'text-gray-400'}`}>Female</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    {/* <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} /> */}
                    <CalendarCheck
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"
                      size={20}
                    />
                    <input 
                      type="date" 
                      value={formData.birthDate}
                      onChange={e => handleInputChange('birthDate', e.target.value)}
                      className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-transparent rounded-2xl p-4 pl-12 font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Height</label>
                      <span className="text-emerald-600 font-black text-lg">{formData.heightCm} cm</span>
                    </div>
                    <input 
                      type="range" min="120" max="220" 
                      value={formData.heightCm}
                      onChange={e => handleInputChange('heightCm', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Current Weight</label>
                      <span className="text-emerald-600 font-black text-lg">{formData.startWeight} kg</span>
                    </div>
                    <input 
                      type="range" min="30" max="200" 
                      value={formData.startWeight}
                      onChange={e => handleInputChange('startWeight', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Lifestyle</h2>
                  <p className="text-gray-400 font-medium">We're almost there! One final step.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">Activity Level</label>
                    <div className="relative">
                       <select 
                        value={formData.activityLevel}
                        onChange={e => handleInputChange('activityLevel', e.target.value)}
                        className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option>Sedentary</option>
                        <option>Lightly Active</option>
                        <option>Moderately Active</option>
                        <option>Very Active</option>
                        <option>Extra Active</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Dietary Goal
                    </label>

                    <div className="relative">
                      <select
                        value={formData.dietaryGoal}
                        onChange={e => handleInputChange('dietaryGoal', e.target.value)}
                        className="
                          w-full bg-gray-50 md:bg-gray-100/50
                          border-2 border-transparent
                          rounded-2xl p-4
                          font-bold text-gray-800
                          focus:border-emerald-500 focus:bg-white
                          transition-all outline-none
                          appearance-none cursor-pointer
                        "
                      >
                        <option value="Maintain Weight">Maintain Weight</option>
                        <option value="Gradual Gain Weight">Gradual Gain Weight</option>
                        <option value="Rapid Gain Weight">Rapid Gain Weight</option>
                        <option value="Gradual Lose Weight">Gradual Lose Weight</option>
                        <option value="Rapid Lose Weight">Rapid Lose Weight</option>
                      </select>

                      {/* Chevron icon */}
                      <ChevronRight
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                        size={20}
                      />
                    </div>

                    {/* Helper text */}
                    <p className="text-xs text-gray-400 font-medium ml-1">
                      This helps us fine-tune your calorie and macro targets
                    </p>
                  </div>

                  {/* <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">Goal Weight (kg)</label>
                    <input 
                      type="number" 
                      value={formData.goalWeight}
                      onChange={e => setFormData({...formData, goalWeight: parseInt(e.target.value)})}
                      className="w-full bg-gray-50 md:bg-gray-100/50 border-2 border-transparent rounded-2xl p-4 font-bold text-gray-800 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                    />
                  </div> */}

                  <div className="space-y-3 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="flex justify-between items-center px-1 mb-2">
                      <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1">Goal Weight (kg)</label>
                      <span className="text-emerald-600 font-black text-2xl">{formData.goalWeight} <span className="text-xs text-slate-400">kg</span></span>
                    </div>
                    <input 
                      type="range" min="30" max="150" 
                      value={formData.goalWeight}
                      onChange={e => handleInputChange('goalWeight', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-white border border-slate-200 rounded-lg appearance-none cursor-pointer shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 flex space-x-4">
              {step > 1 && (
                <button 
                  onClick={prevStep}
                  disabled={isLoading}
                  className="w-16 bg-gray-100 md:bg-gray-50 text-gray-400 hover:text-emerald-500 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center border-2 border-transparent hover:border-emerald-100"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              <button 
                onClick={step === totalSteps ? handleFinish : nextStep}
                disabled={isLoading}
                className="flex-1 bg-[#1A2A33] text-white font-black py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-3 hover:bg-black"
              >
                {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                  <>
                    <span>{step === totalSteps ? 'Complete Setup' : 'Next Step'}</span>
                    <ChevronRight size={22} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </div>
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

export default Onboarding;
