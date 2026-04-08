
import React, { useState } from 'react';
import { User } from '../types/types';
import { ChevronLeft, Check } from 'lucide-react';

interface PersonalInfoProps {
  user: User;
  onBack: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ user, onBack, onSave }) => {
  const [gender, setGender] = useState<'male' | 'female'>(user.gender);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  // const [email, setEmail] = useState(user.email);
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [heightCm, setHeightCm] = useState(user.heightCm);

  const handleSave = () => {
    onSave({
      gender,
      firstName,
      lastName,
      heightCm,
      // email,
      birthDate,
    });
    onBack();
  };

  const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
    <div className="relative w-full group">
      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-2 mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-6 text-gray-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-gray-300 appearance-none"
        />
        {Icon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-4 py-6 flex items-center border-b border-transparent">
        <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="flex-1 text-center text-xl font-extrabold text-slate-900 pr-8">
          Personal Information
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-0 space-y-6">
        <div className="space-y-2 pb-1">
          <p className="text-gray-400 font-semibold">Keep your physical information updated for accurate tracking.</p>
        </div>
        {/* Gender Radio Buttons */}
        {/* Gender Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-2">Gender</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setGender('male')}
              className={`py-5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all flex items-center justify-center space-x-3 ${
                gender === 'male' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-100 bg-gray-50 text-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 ${gender === 'male' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'}`}>
                 {gender === 'male' && <div className="w-full h-full flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={5} /></div>}
              </div>
              <span>Male</span>
            </button>
            <button 
              onClick={() => setGender('female')}
              className={`py-5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all flex items-center justify-center space-x-3 ${
                gender === 'female' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-100 bg-gray-50 text-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 ${gender === 'female' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'}`}>
                 {gender === 'female' && <div className="w-full h-full flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={5} /></div>}
              </div>
              <span>Female</span>
            </button>
          </div>
        </div>

        {/* Input Grid */}
        <div className="space-y-6 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="First Name" />
            <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Last Name" />
          </div>
          
          {/* <InputField label="Email Address" value={email} onChange={setEmail} placeholder="email@example.com" type="email" /> */}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField label="Height (cm)" value={heightCm} onChange={setHeightCm} placeholder="170" type="number"/>
            {/* Native Date Picker */}
            <InputField label="Date of Birth" value={birthDate} onChange={setBirthDate} type="date"/>
          </div>
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="p-6 pb-10">
        <button 
          onClick={handleSave}
          className="w-full bg-[#1A2A33] text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;
