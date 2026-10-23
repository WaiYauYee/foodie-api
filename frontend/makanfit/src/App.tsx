// Composition root: providers + route table. No state, no business logic.
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MealsProvider } from "./contexts/MealsContext";
import { WeightProvider } from "./contexts/WeightContext";
import { GuestRoute, ProtectedRoute } from "./routes/guards";
import AppLayout from "./layouts/AppLayout";
import {
  LoginRoute,
  SignUpRoute,
  PublicTermsRoute,
} from "./routes/authPages";

const PersonalInfoPage = lazy(() => import("./pages/PersonalInfo"));
const GoalPage = lazy(() => import("./pages/Goal"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const DiaryPage = lazy(() => import("./pages/Diary"));
const PalPage = lazy(() => import("./pages/Pal"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AccountSettingPage = lazy(() => import("./pages/AccountSetting"));
const AddWeightPage = lazy(() => import("./pages/AddWeight"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePassword"));
const NotificationsPage = lazy(() => import("./pages/NotificationSettings"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPolicy"));
const WelcomePage = lazy(() => import("./pages/WelcomeStoryboard"));
const OnboardingPage = lazy(() => import("./pages/Onboarding"));
const PlanBuilderPage = lazy(() => import("./pages/PlanBuilder"));

const App: React.FC = () => (
  <AuthProvider>
    <MealsProvider>
      <WeightProvider>
        <Suspense fallback={<div className="p-8">Loading…</div>}>
          <Routes>
            {/* Logged-out only */}
            <Route element={<GuestRoute />}>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/signup" element={<SignUpRoute />} />
            </Route>

            {/* Public */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<PublicTermsRoute />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/plan" element={<PlanBuilderPage />} />

            {/* Logged in + onboarded */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/add-weight" element={<AddWeightPage />} />
                <Route path="/diary" element={<DiaryPage />} />
                <Route path="/pal" element={<PalPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/personal-info" element={<PersonalInfoPage />} />
                <Route path="/profile/account" element={<AccountSettingPage />} />
                <Route path="/profile/password" element={<ChangePasswordPage />} />
                <Route path="/profile/goal" element={<GoalPage />} />
                <Route path="/profile/privacy" element={<PrivacyPage />} />
                <Route path="/profile/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </WeightProvider>
    </MealsProvider>
  </AuthProvider>
);

export default App;