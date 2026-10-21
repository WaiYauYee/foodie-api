
import React from 'react';
import { ChevronLeft, FileText, Scale, Globe, ShieldAlert, CheckCircle } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: CheckCircle,
      content: "By accessing and using MakanFit, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application. These terms are governed by the laws of Malaysia."
    },
    {
      title: "2. Health & Medical Disclaimer",
      icon: ShieldAlert,
      content: "MakanFit is a nutritional tracking tool and NOT a medical device. The information provided, including AI-generated nutritional estimates, is for educational purposes only. Always consult a qualified healthcare professional before starting any new diet or exercise program, especially if you have underlying conditions like diabetes or hypertension."
    },
    {
      title: "3. User Accounts",
      icon: Globe,
      content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and keep your profile data up to date for the most accurate nutritional calculations."
    },
    {
      title: "4. Accuracy of AI Content",
      icon: FileText,
      content: "Our AI analysis of Malaysian food images provides estimates based on visual recognition. Portions and ingredients may vary from actual consumption. MakanFit does not guarantee 100% accuracy of nutritional data for local stall foods or home-cooked meals."
    }
  ];

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-4 py-6 flex items-center border-b border-gray-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="flex-1 text-center text-xl font-semibold text-gray-700 pr-10">
          Terms of Service
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-4">
            <Scale className="w-10 h-10 text-sky-500" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Last Updated: February 2024</p>
        </div>

        <div className="space-y-10 pb-10">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{section.title}</h3>
              </div>
              <p className="text-gray-500 leading-relaxed text-sm pl-11">
                {section.content}
              </p>
            </div>
          ))}

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h4 className="font-bold text-emerald-700 mb-2">Malaysian Consumer Law</h4>
            <p className="text-sm text-emerald-600">
              These terms are intended to comply with the Consumer Protection Act 1999 and the Personal Data Protection Act (PDPA) 2010 of Malaysia.
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-50">
        <button 
          onClick={onBack}
          className="w-full bg-[#1A2A33] text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-xl"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default TermsOfService;
