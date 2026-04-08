import React from 'react';
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText, Smartphone } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: Eye,
      content: "MakanFit collects personal health data including weight, height, age, gender, and dietary preferences to calculate nutritional targets. We also process images of food provided by you for AI analysis."
    },
    {
      title: "2. AI Processing",
      icon: Smartphone,
      content: "We use Google's Gemini AI to analyze your food photos. These images are transmitted securely to provide nutritional estimates. We do not store these images longer than necessary for processing."
    },
    {
      title: "3. How We Use Data",
      icon: FileText,
      content: "Your data is used solely to provide personalized health tracking, nutritional insights, and progress reports. We do not sell your personal information to third parties."
    },
    {
      title: "4. Data Security",
      icon: Lock,
      content: "We implement industry-standard security measures to protect your information. Your account is secured via your password, and sensitive data is encrypted during transmission."
    }
  ];

  return (
    <div className="fixed inset-0 bg-white z-[250] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-6 flex items-center border-b border-gray-50 sticky top-0 bg-white z-10">
        <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="flex-1 text-center text-xl font-extrabold text-slate-900 pr-8">
          Privacy Policy
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Last Updated: March 2024</p>
        </div>

        <div className="space-y-12 pb-10">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100/50">
                  <section.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-black text-gray-900 text-lg tracking-tight">{section.title}</h3>
              </div>
              <p className="text-gray-500 font-bold leading-relaxed text-sm pl-14">
                {section.content}
              </p>
            </div>
          ))}

          <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
            <h4 className="font-black text-gray-900 mb-2 tracking-tight">Contact Us</h4>
            <p className="text-sm text-gray-500 font-bold">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <span className="text-emerald-600 font-black mt-2 inline-block">privacy@makanfit.my</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;