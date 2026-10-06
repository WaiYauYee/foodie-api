import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import logoAvatar from "../assets/logoAvatar.jpeg";
import StoryCategoryIcon from "./StoryCategoryIcon";

interface WelcomeStoryboardProps {
  onStartOnboarding: () => void;
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
}

interface StorySlide {
  id: number;
  title: string;
  highlight: string;
  description: string;
  accentColor: string;
  badgeIcon: "camera" | "food" | "plan" | "onboarding";
  features: string[];
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: 1,
    title: "Snap your food,",
    highlight: "know every calorie.",
    description:
      "Snap your Malaysian meal and let MakanFit identify the dishes, estimate calories from portions, and break down what is on your plate.",
    accentColor: "text-emerald-600",
    badgeIcon: "camera",
    features: [
      "Recognizes 120 authentic Malaysian dishes",
      "Estimates calories tailored to Malaysian foods",
      "Voice logging in English & Bahasa Melayu",
    ],
  },
  {
    id: 2,
    title: "Smart nutrition goals",
    highlight: "built for your lifestyle.",
    description:
      "No extreme dieting or giving up local favourites. We calculate your daily calories, protein, carbs, and hydration targets around Malaysian eating habits.",
    accentColor: "text-teal-600",
    badgeIcon: "food",
    features: [
      "Personalized calorie & macronutrient blueprint",
      "Daily water glass tracker & BMI insights",
      "Flexible weight loss, maintenance, or diet goals",
    ],
  },
  {
    id: 3,
    title: "Stay consistent with",
    highlight: "your Nasi Lemak Pal.",
    description:
      "Build daily logging streaks, complete healthy missions, and unlock traditional Malaysian outfits and sceneries for Lemmy as you hit your goals.",
    accentColor: "text-amber-600",
    badgeIcon: "plan",
    features: [
      "Interactive Nasi Lemak companion that reacts to meals",
      "Daily & weekly missions with MakanCoins rewards",
      "Unlock unique Malaysian style outfits and sceneries",
    ],
  },
];

const WelcomeStoryboard: React.FC<WelcomeStoryboardProps> = ({
  onStartOnboarding,
  onNavigateToLogin,
}) => {
  const [mode, setMode] = useState<"splash" | "storyboard">("splash");
  const [slideIndex, setSlideIndex] = useState(0);

  const currentSlide = STORY_SLIDES[slideIndex];

  const handleNextSlide = () => {
    if (slideIndex < STORY_SLIDES.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      onStartOnboarding();
    }
  };

  const handlePrevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
    } else {
      setMode("splash");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] select-none overflow-hidden">
      {/* Left Desktop Showcase Pane */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#064E3B] p-14 lg:p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Small Brand Label */}
          <div className="mb-10">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/15 text-emerald-50 text-xs font-bold tracking-wider">
              MALAYSIAN FOOD • AI • WELLNESS
            </span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Malaysian nutrition, <br />
              <span className="text-emerald-200">made joyful.</span>
            </h2>
            <p className="text-emerald-50/80 text-lg font-medium leading-relaxed">
              Track your favourite Nasi Lemak, Roti Canai, and Teh Tarik with AI
              vision and your personal Nasi Lemak companion, Lemmy.
            </p>
          </div>

          {/* Bottom Trust Strip */}
          {/* <div className="relative z-10 flex items-center justify-between text-emerald-100/80 text-xs font-bold border-t border-white/15 pt-6">
          <span>120 Local Dishes</span>
          <span>·</span>
          <span>Malaysian Calories</span>
          <span>·</span>
          <span>Customized plan</span>
        </div> */}
        </div>
      </div>

      {/* Right Interactive Splash / Storyboard Pane */}
      <div className="flex-1 flex flex-col justify-between min-h-screen bg-white relative">
        <AnimatePresence mode="wait">
          {mode === "splash" ? (
            <motion.div
              key="splash-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-14 max-w-lg mx-auto w-full"
            >
              {/* Center Splash Content: Nasi Lemak Mascot + Brand Title */}
              <div className="my-auto py-6 flex flex-col items-center text-center">
                <div className="relative my-2 flex items-center justify-center">
                  <img
                    src={logoAvatar}
                    alt="MakanFit Logo"
                    className="w-[150px] h-[150px] object-contain rounded-full bg-white shadow-md border border-emerald-100"
                  />
                </div>

                {/* App Name & Headline */}
                <div className="mt-6 space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    makan<span className="text-emerald-600">fit</span>
                  </h1>
                  <p className="text-slate-500 font-semibold text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                    Your smart Malaysian food diary & AI nutrition companion.
                    Track Nasi Lemak, Roti Canai, and daily goals effortlessly.
                  </p>
                </div>
              </div>

              {/* Bottom Actions: Start Button + Already have an account? Log in */}
              <div className="space-y-4 pb-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSlideIndex(0);
                    setMode("storyboard");
                  }}
                  className="w-[130px] h-[55px] bg-[#1A2A33] hover:bg-black text-white py-5 px-6 rounded-full font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-3 cursor-pointer"
                >
                  <span>Start</span>
                </button>

                <div className="flex flex-row sm:flex-row items-center justify-center gap-1 sm:gap-2 pt-1 text-center">
                  <span className="text-sm md:text-base font-medium text-slate-400">
                    Already have an account?
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="text-sm md:text-base font-black text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`storyboard-slide-${currentSlide.id}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-14 max-w-lg mx-auto w-full"
            >
              {/* Top Storyboard Navigation & Progress */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Storyboard Progress Bars */}
                  <div className="flex items-center space-x-2">
                    {STORY_SLIDES.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSlideIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === slideIndex
                            ? "w-10 bg-emerald-500"
                            : idx < slideIndex
                              ? "w-5 bg-emerald-200"
                              : "w-3 bg-slate-200"
                        }`}
                        aria-label={`Go to story ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={onStartOnboarding}
                    className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-emerald-600 transition-colors px-2 py-1 cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Center Storyboard Visual & Copy */}
              <div className="my-auto py-4 flex flex-col items-center text-center">
                <div className="relative my-5 flex items-center justify-center">
                <StoryCategoryIcon
                    type={currentSlide.badgeIcon}
                    size={120}
                    className="!w-28 !h-28 !rounded-3xl bg-white shadow-md border border-emerald-100"
                />
                </div>

                {/* Story Kicker & Headline */}
                <div className="mt-4 space-y-2 text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {currentSlide.title}{" "}
                    <span className={currentSlide.accentColor}>
                      {currentSlide.highlight}
                    </span>
                  </h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto pt-1">
                    {currentSlide.description}
                  </p>
                </div>

                {/* Key Highlights */}
                <div className="mt-5 w-full bg-slate-50 rounded-3xl p-4 border border-slate-100 space-y-2.5 text-left">
                  {currentSlide.features.map((feat, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Storyboard CTA */}
              <div className="space-y-3 pb-4">
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="w-full bg-[#1A2A33] hover:bg-black text-white py-5 px-6 rounded-3xl font-black text-sm uppercase tracking-wider shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>
                    {slideIndex < STORY_SLIDES.length - 1
                      ? "Next"
                      : "Personalize My Plan"}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WelcomeStoryboard;
