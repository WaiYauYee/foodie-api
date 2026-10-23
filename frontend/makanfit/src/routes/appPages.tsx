// Thin adapters for logged-in pages. Components keep their current props.
import React, { lazy } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { WeightEntry } from "../types/types";
import { useAuth } from "../contexts/AuthContext";
import { useMeals } from "../contexts/MealsContext";
import { useWeights } from "../contexts/WeightContext";
import type { LayoutContext } from "../layouts/AppLayout";

const Diary = lazy(() => import("../pages/Diary"));
const Pal = lazy(() => import("../pages/Pal"));
const Profile = lazy(() => import("../pages/Profile"));
const AccountSetting = lazy(() => import("../pages/AccountSetting"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const NotificationSettings = lazy(() => import("../pages/NotificationSettings"));
const AddWeight = lazy(() => import("../pages/AddWeight"));

export const AddWeightRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addWeight } = useWeights();
  const editingEntry = (location.state?.entry as WeightEntry | undefined) ?? null;
  return (
    <AddWeight
      currentWeight={user.currentWeight}
      editingEntry={editingEntry}
      onBack={() => navigate("/")}
      onAdd={addWeight}
    />
  );
};

export const DiaryRoute: React.FC = () => {
  const { meals, addMeal, deleteMeal, updateMeal } = useMeals();
  return (
    <Diary
      meals={meals}
      onAddMeal={addMeal}
      onDeleteMeal={deleteMeal}
      onUpdateMeal={updateMeal}
    />
  );
};

export const PalRoute: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { meals } = useMeals();
  const { openStreakModal } = useOutletContext<LayoutContext>();
  return (
    <Pal
      meals={meals}
      user={user}
      onNavigateToLogMeal={() => navigate("/diary")}
      onOpenStreakModal={openStreakModal}
    />
  );
};

export const ProfileRoute: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  return (
    <Profile
      user={user}
      onNavigateToAccount={() => navigate("/profile/personal-info")}
      onNavigateToSetting={() => navigate("/profile/account")}
      onNavigateToSecurity={() => navigate("/profile/password")}
      onNavigateToGoal={() => navigate("/profile/goal")}
      onNavigateToPrivacy={() => navigate("/profile/privacy")}
      onNavigateToNotifications={() => navigate("/profile/notifications")}
      onLogout={() => {
        logout();
        navigate("/login", { replace: true });
      }}
    />
  );
};

export const AccountSettingRoute: React.FC = () => {
  const navigate = useNavigate();
  const { user, changeEmail, deleteAccount } = useAuth();
  return (
    <AccountSetting
      user={user}
      onBack={() => navigate("/profile")}
      onChangeEmail={changeEmail}
      onDeleteAccount={async () => {
        const res = await deleteAccount();
        if (res.success) navigate("/welcome", { replace: true });
        return res;
      }}
    />
  );
};

export const ChangePasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return <ChangePassword userId={user.userId} onBack={() => navigate("/profile")} />;
};

export const PrivacyRoute: React.FC = () => {
  const navigate = useNavigate();
  return <PrivacyPolicy onBack={() => navigate("/profile")} />;
};

export const NotificationsRoute: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <NotificationSettings userId={user.userId} onBack={() => navigate("/profile")} />
  );
};