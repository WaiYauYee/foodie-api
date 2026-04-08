
import React, { useState } from 'react';
import { User as Users } from '../types/types';
import { User, Target, Shield, ChevronRight, LogOut, Lock, X, Settings } from 'lucide-react';
import MakanFitAvatar from './MakanFitAvatar';

interface ProfileProps {
  user: Users;
  onNavigateToAccount: () => void;
  onNavigateToSetting: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToGoal: () => void;
  onNavigateToPrivacy: () => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  onNavigateToAccount,
  onNavigateToSetting,
  onNavigateToSecurity, 
  onNavigateToGoal,
  onNavigateToPrivacy,
  onLogout
}) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="p-4 pb-24 space-y-6 bg-[#F8FAFC]">
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <div className="w-20 h-20 bg-emerald-50 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group">
             <MakanFitAvatar size={54} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-400 font-bold">{user.email}</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Weight</p>
          <p className="text-xl font-black text-gray-900">{user.currentWeight} <span className="text-sm font-normal text-gray-400">kg</span></p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Goal</p>
          <p className="text-xl font-black text-gray-900 capitalize">{user.dietaryGoal}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Account & Security</h3>
        <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-50">
          {[
            { icon: User, label: 'Profile', color: 'text-blue-500', bg: 'bg-blue-50', action: onNavigateToAccount },
            { icon: Settings, label: 'Account', color: 'text-indigo-500', bg: 'bg-indigo-50', action: onNavigateToSetting },
            { icon: Lock, label: 'Security', color: 'text-cyan-500', bg: 'bg-cyan-50', action: onNavigateToSecurity },
            { icon: Target, label: 'Goals', color: 'text-emerald-500', bg: 'bg-emerald-50', action: onNavigateToGoal },
            { icon: Shield, label: 'Privacy Policy', color: 'text-purple-500', bg: 'bg-purple-50', action: onNavigateToPrivacy },
          ].map((item, idx) => (
            <button 
              key={item.label} 
              onClick={item.action}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${idx !== 3 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`${item.bg} w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-bold text-gray-700">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200" />
            </button>
          ))}
        </div>
      </div>

      <button
      onClick={() => setIsLogoutModalOpen(true)}
      className="w-full bg-red-50 text-red-600 font-black py-5 rounded-3xl flex items-center justify-center space-x-3 border border-red-100 shadow-sm active:scale-[0.98] transition-all uppercase tracking-widest text-xs">
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsLogoutModalOpen(false)} 
          />
          <div className="relative bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <LogOut size={25} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Log out?</h3>
                <p className="text-gray-400 font-bold leading-relaxed">
                  Are you sure you want to log out? Your tracking data will be saved.
                </p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <button 
                  onClick={onLogout}
                  className="w-full bg-red-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-red-100 active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Yes, Log Out
                </button>
                <button 
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="w-full bg-gray-50 text-gray-400 font-black py-5 rounded-3xl active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] py-8">
        MakanFit v1.
      </div>
    </div>
  );
};

export default Profile;
