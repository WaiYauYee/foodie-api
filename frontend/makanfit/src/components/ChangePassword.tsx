
import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordProps {
  onBack: () => void;
  onSave: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onBack, onSave }) => {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    // In a real app, logic for validation and API calls would go here
    onSave();
    onBack();
  };

  const PasswordField = ({ label, placeholder, value, onChange, show, setShow }: any) => (
    <div className="relative w-full">
      {label && (
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-2 mb-2 block">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-6 text-gray-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-gray-300 appearance-none"
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
        >
          {show ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-4 py-6 flex items-center">
        <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="flex-1 text-center text-xl font-extrabold text-slate-900 pr-8">
          Change Password
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-0 space-y-6">
        <div className="space-y-2 pb-1">
          <p className="text-gray-400 font-semibold">Your new password must be at least 8 characters long.</p>
        </div>
        <PasswordField
          label="New Password"
          placeholder="New Password" 
          value={newPassword} 
          onChange={setNewPassword} 
          show={showNew}
          setShow={setShowNew}
        />
        <PasswordField
          label="Confirm Password"
          placeholder="New Password Confirmation" 
          value={confirmPassword} 
          onChange={setConfirmPassword} 
          show={showConfirm}
          setShow={setShowConfirm}
        />
      </div>

      {/* Footer Save Button */}
      <div className="p-6">
        <button 
          onClick={handleSave}
          className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
