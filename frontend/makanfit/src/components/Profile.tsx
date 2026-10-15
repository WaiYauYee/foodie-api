import React, { useEffect, useState } from "react";
import { User as Users } from "../types/types";
import {
  User,
  Target,
  Shield,
  ChevronRight,
  LogOut,
  Lock,
  X,
  Settings,
  Bell,
} from "lucide-react";
import logoAvatarSmileFace from "../assets/logoAvatarSmileFace.jpeg";

interface ProfileProps {
  user: Users;
  onNavigateToAccount: () => void;
  onNavigateToSetting: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToGoal: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToNotifications: () => void;
  onLogout: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  action: () => void;
}

const MenuGroup: React.FC<{ title: string; items: MenuItem[] }> = ({
  title,
  items,
}) => (
  <div className="space-y-2">
    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
      {title}
    </h3>
    <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-lg divide-y divide-gray-50">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className="group w-full flex items-center justify-between p-4 lg:px-6 lg:py-5 hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
        >
          <div className="flex items-center space-x-4">
            <div
              className={`${item.bg} w-10 h-10 lg:w-11 lg:h-11 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <span className="font-bold text-gray-700 lg:text-base">
              {item.label}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
        </button>
      ))}
    </div>
  </div>
);

const Profile: React.FC<ProfileProps> = ({
  user,
  onNavigateToAccount,
  onNavigateToSetting,
  onNavigateToSecurity,
  onNavigateToGoal,
  onNavigateToPrivacy,
  onNavigateToNotifications,
  onLogout,
}) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Close the logout modal with Escape (laptop keyboard)
  useEffect(() => {
    if (!isLogoutModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLogoutModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLogoutModalOpen]);

  const accountItems: MenuItem[] = [
    {
      icon: User,
      label: "Profile",
      color: "text-blue-500",
      bg: "bg-blue-50",
      action: onNavigateToAccount,
    },
    {
      icon: Settings,
      label: "Account",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      action: onNavigateToSetting,
    },
    {
      icon: Lock,
      label: "Security",
      color: "text-cyan-500",
      bg: "bg-cyan-50",
      action: onNavigateToSecurity,
    },
  ];

  const preferenceItems: MenuItem[] = [
    {
      icon: Target,
      label: "Goals",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      action: onNavigateToGoal,
    },
    {
      icon: Bell,
      label: "Notifications",
      color: "text-orange-500",
      bg: "bg-orange-50",
      action: onNavigateToNotifications,
    },
    {
      icon: Shield,
      label: "Privacy Policy",
      color: "text-purple-500",
      bg: "bg-purple-50",
      action: onNavigateToPrivacy,
    },
  ];

  const renderLogoutButton = (className = "") => (
    <button
      onClick={() => setIsLogoutModalOpen(true)}
      className={`w-full bg-red-50 text-red-600 font-black py-5 rounded-3xl flex items-center justify-center space-x-3 border border-red-100 shadow-lg hover:bg-red-100 active:scale-[0.98] transition-all uppercase tracking-widest text-xs ${className}`}
    >
      <LogOut className="w-5 h-5" />
      <span>Log Out</span>
    </button>
  );

  const capitalizeName = (name?: string) => {
    if (!name) return "";

    return name
      .trim()
      .toLowerCase()
      .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="bg-[#F8FAFC] min-h-full">
      <div className="mx-auto w-full max-w-5xl p-4 md:p-6 lg:p-8 pb-24 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left column (laptop): identity card, sticky while the menus scroll */}
          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            <div className="space-y-6 lg:bg-white lg:rounded-[32px] lg:border lg:border-gray-100 lg:shadow-lg lg:p-8">
              {/* Avatar + name */}
              <div className="flex items-center space-x-4 lg:flex-col lg:space-x-0 lg:space-y-5 lg:text-center">
                <div className="w-20 h-20 lg:w-24 lg:h-24 shrink-0 bg-emerald-50 rounded-[40px] lg:rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                  <img
                    src={logoAvatarSmileFace}
                    alt="MakanFit Logo"
                    className="w-full h-full object-cover bg-white"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight break-words">
                    {capitalizeName(user.firstName)}{" "}
                    {capitalizeName(user.lastName)}
                  </h2>
                  <p className="text-gray-400 font-bold truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[25px] border border-gray-100 shadow-lg flex flex-col items-center text-center lg:bg-slate-50 lg:border-slate-100 lg:shadow-none lg:p-5">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    Current Weight
                  </p>
                  <p className="text-xl font-black text-gray-900">
                    {user.currentWeight}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      kg
                    </span>
                  </p>
                </div>
                <div className="bg-white p-6 rounded-[25px] border border-gray-100 shadow-lg flex flex-col items-center text-center lg:bg-slate-50 lg:border-slate-100 lg:shadow-none lg:p-5">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    Goal
                  </p>
                  <p className="text-xl font-black text-gray-900 capitalize">
                    {user.dietaryGoal}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout button: shown here on laptop only */}
            <div className="hidden lg:block">{renderLogoutButton()}</div>
          </aside>

          {/* Right column (laptop): menus */}
          <div className="lg:col-span-7 space-y-6">
            <MenuGroup title="Account & Security" items={accountItems} />
            <MenuGroup title="Preferences & Legal" items={preferenceItems} />

            {/* Logout button: shown here on mobile only */}
            <div className="lg:hidden">{renderLogoutButton()}</div>
          </div>
        </div>

        <div className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] pt-10 lg:pt-14">
          MakanFit v1.
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Log out confirmation"
            className="relative bg-white w-full max-w-sm lg:max-w-md rounded-[40px] p-8 lg:p-10 shadow-2xl animate-in zoom-in duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <LogOut size={25} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Log out?
                </h3>
                <p className="text-gray-400 font-bold leading-relaxed">
                  Are you sure you want to log out? Your tracking data will be
                  saved.
                </p>
              </div>

              {/* Stacked on mobile, side by side on laptop */}
              <div className="w-full space-y-3 lg:space-y-0 lg:flex lg:flex-row-reverse lg:gap-3 pt-4">
                <button
                  onClick={onLogout}
                  className="w-full bg-red-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-red-100 hover:bg-red-600 active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Yes, Log Out
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="w-full bg-gray-50 text-gray-400 font-black py-5 rounded-3xl hover:bg-gray-100 hover:text-gray-500 active:scale-[0.95] transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(false)}
              aria-label="Close"
              className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
