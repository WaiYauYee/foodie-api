// Composition root: providers + route table. No state, no business logic.
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MealsProvider } from "./contexts/MealsContext";
import { WeightProvider } from "./contexts/WeightContext";
import { GuestRoute, ProtectedRoute } from "./routes/guards";
import AppLayout from "./layouts/AppLayout";
import {
  WelcomeRoute,
  OnboardingRoute,
  PlanBuilderRoute,
  LoginRoute,
  SignUpRoute,
  PublicPrivacyRoute,
  PublicTermsRoute,
} from "./routes/authPages";
import {
  DiaryRoute,
  PalRoute,
  ProfileRoute,
  AccountSettingRoute,
  ChangePasswordRoute,
  PrivacyRoute,
  NotificationsRoute,
  AddWeightRoute,
} from "./routes/appPages";
const PersonalInfoPage = lazy(() => import("./pages/PersonalInfo"));
const GoalPage = lazy(() => import("./pages/Goal"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));

const App: React.FC = () => (
  <AuthProvider>
    <MealsProvider>
      <WeightProvider>
        <Suspense fallback={<div className="p-8">Loading…</div>}>
          <Routes>
            {/* Logged-out only */}
            <Route element={<GuestRoute />}>
              <Route path="/welcome" element={<WelcomeRoute />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/signup" element={<SignUpRoute />} />
            </Route>

            {/* Public */}
            <Route path="/privacy" element={<PublicPrivacyRoute />} />
            <Route path="/terms" element={<PublicTermsRoute />} />
            <Route path="/onboarding" element={<OnboardingRoute />} />
            <Route path="/plan" element={<PlanBuilderRoute />} />

            {/* Logged in + onboarded */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/add-weight" element={<AddWeightRoute />} />
                <Route path="/diary" element={<DiaryRoute />} />
                <Route path="/pal" element={<PalRoute />} />
                <Route path="/profile" element={<ProfileRoute />} />
                <Route path="/profile/personal-info" element={<PersonalInfoPage />} />
                <Route path="/profile/account" element={<AccountSettingRoute />} />
                <Route path="/profile/password" element={<ChangePasswordRoute />} />
                <Route path="/profile/goal" element={<GoalPage />} />
                <Route path="/profile/privacy" element={<PrivacyRoute />} />
                <Route path="/profile/notifications" element={<NotificationsRoute />} />
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