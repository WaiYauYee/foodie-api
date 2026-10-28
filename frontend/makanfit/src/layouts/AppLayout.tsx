import React, { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Flame, Heart, LayoutDashboard, User as UserIcon, Utensils } from "lucide-react";
import StreakModal from "../components/modals/StreakModal";
import { useMeals } from "../contexts/MealsContext";
import { calculateStreak } from "../utils/streak";
import { useAuth } from "../contexts/AuthContext";

/** Passed to child routes via <Outlet context>; read with useOutletContext. */
export interface LayoutContext {
  openStreakModal: () => void;
}

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard,
    match: (p: string) => p === "/" || p.startsWith("/add-weight") },
  { to: "/diary", label: "Diary", icon: Utensils,
    match: (p: string) => p.startsWith("/diary") },
  { to: "/pal", label: "Pal", icon: Heart, fillWhenActive: true,
    match: (p: string) => p.startsWith("/pal") },
  { to: "/profile", label: "Me", icon: UserIcon,
    match: (p: string) => p.startsWith("/profile") },
];

const NavItems: React.FC<{ variant: "sidebar" | "bottom" }> = ({ variant }) => {
  const { pathname } = useLocation();
  const sidebar = variant === "sidebar";

  return (
    <>
      {NAV.map(({ to, label, icon: Icon, match, fillWhenActive }) => {
        const active = match(pathname);
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center px-4 py-3 rounded-xl transition-all ${
              sidebar ? "flex-row space-x-4" : "flex-col space-y-1"
            } ${
              active
                ? `text-emerald-600 ${sidebar ? "bg-emerald-50" : ""}`
                : "text-gray-300 hover:text-emerald-600 hover:bg-gray-50"
            }`}
          >
            <Icon
              className={`${sidebar ? "w-7 h-7" : "w-6 h-6"} ${
                active && fillWhenActive ? "fill-emerald-600" : ""
              }`}
            />
            <span
              className={
                sidebar
                  ? "text-base font-bold"
                  : "text-[10px] font-black uppercase tracking-widest"
              }
            >
              {label}
            </span>
          </Link>
        );
      })}
    </>
  );
};

const StreakButton: React.FC<{
  streakInfo: ReturnType<typeof calculateStreak>;
  size: number;
  onClick: () => void;
}> = ({ streakInfo, size, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border transition-all text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 ${
      streakInfo.hasLoggedToday
        ? "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200/80"
        : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/80"
    }`}
    title={`${streakInfo.streak}-Day Streak (${streakInfo.statusBadge}) - Tap to view streak calendar`}
  >
    <Flame
      size={size}
      className={
        streakInfo.hasLoggedToday
          ? "fill-orange-500 text-orange-500"
          : "fill-amber-400 text-amber-500"
      }
    />
    <span>{streakInfo.streak}d</span>
    {streakInfo.isPending && (
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
    )}
  </button>
);

const Logo: React.FC<{ className: string }> = ({ className }) => (
  <h1 className={`font-black text-slate-900 tracking-tight ${className}`}>
    makan<span className="text-emerald-600">fit</span>
  </h1>
);

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { meals, streakInfo } = useMeals();
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const openStreakModal = () => setIsStreakModalOpen(true);

  const { setPendingOnboardingData } = useAuth();
  useEffect(() => {
    setPendingOnboardingData(null);
  }, [setPendingOnboardingData]);

  return (
    <div className="min-h-screen md:flex-row mx-auto bg-gray-50 relative overflow-x-hidden shadow-2xl">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 p-6 z-50">
        <div className="mb-10 px-4 flex items-center justify-between">
          <Logo className="text-2xl" />
          <StreakButton streakInfo={streakInfo} size={14} onClick={openStreakModal} />
        </div>
        <nav className="flex-1 space-y-2">
          <NavItems variant="sidebar" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col md:ml-72 min-h-screen">
        {/* Header (mobile) */}
        <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <Logo className="text-xl" />
          <StreakButton streakInfo={streakInfo} size={15} onClick={openStreakModal} />
        </header>

        <main className="flex-1 pb-24 md:pb-8 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            <Suspense fallback={<div className="p-8">Loading…</div>}>
              <Outlet context={{ openStreakModal } satisfies LayoutContext} />
            </Suspense>
          </div>
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-6 safe-area-bottom z-50">
          <NavItems variant="bottom" />
        </nav>
      </div>

      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        meals={meals}
        onLogMeal={() => {
          setIsStreakModalOpen(false);
          navigate("/diary");
        }}
      />
    </div>
  );
};

export default AppLayout;