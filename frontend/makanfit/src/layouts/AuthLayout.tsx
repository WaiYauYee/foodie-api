import React from "react";
import { Outlet } from "react-router-dom";

const FEATURES = [
  "AI-powered Malaysian food recognition",
  "Adjust ingredients & portions manually",
  "Nutrition tailored for Malaysian cuisine",
];

const AuthLayout: React.FC = () => (
  <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
    {/* Left pane: brand / marketing (md and up) */}
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#064E3B] p-16 flex-col justify-between relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-10">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/15 text-emerald-50 text-xs font-black tracking-wider">
            MALAYSIAN FOOD • AI • WELLNESS
          </span>
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

      <div className="relative z-10 space-y-3">
        {FEATURES.map((text) => (
          <div key={text} className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
              <span className="text-xs font-black text-emerald-900">✓</span>
            </div>
            <p className="text-white/80 font-bold">{text}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Right pane: form (mobile gets the full green background) */}
    <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-[#10B981] md:from-transparent via-[#059669] md:via-transparent to-[#064E3B] md:to-transparent">
      <div className="w-full max-w-md bg-white rounded-[40px] md:rounded-none shadow-2xl md:shadow-none p-8 md:p-0 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;