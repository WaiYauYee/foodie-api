// Thin adapters: pull data from contexts, pass the props your existing
// logged-out components already expect.
import React, { lazy } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const WelcomeStoryboard = lazy(() => import("../pages/WelcomeStoryboard"));
const Onboarding = lazy(() => import("../pages/Onboarding"));
const PlanBuilder = lazy(() => import("../pages/PlanBuilder"));
const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/SignUp"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermOfService = lazy(() => import("../pages/TermOfService"));

export const WelcomeRoute: React.FC = () => {
  const navigate = useNavigate();
  return (
    <WelcomeStoryboard
      onStartOnboarding={() => navigate("/onboarding")}
      onNavigateToSignUp={() => navigate("/signup")}
      onNavigateToLogin={() => navigate("/login")}
    />
  );
};

export const OnboardingRoute: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setPendingOnboardingData } = useAuth();
  return (
    <Onboarding
      onComplete={(data) => {
        setPendingOnboardingData(data);
        navigate("/plan");
      }}
      onBack={isAuthenticated ? undefined : () => navigate("/welcome")}
    />
  );
};

export const PlanBuilderRoute: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, pendingOnboardingData, confirmPlan } = useAuth();

  if (!pendingOnboardingData) return <Navigate to="/onboarding" replace />;

  return (
    <PlanBuilder
      onboardingData={pendingOnboardingData}
      isAuthenticated={isAuthenticated}
      onBackToOnboarding={() => navigate("/onboarding")}
      onConfirmPlan={async (planValues) => {
        const result = await confirmPlan(planValues);
        if (result === "completed") navigate("/", { replace: true });
        if (result === "needs_signup") navigate("/signup");
      }}
    />
  );
};

export const LoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <Login
      onLogin={async () => {
        await login();
        navigate("/", { replace: true });
      }}
      onNavigateToSignUp={() => navigate("/signup")}
      onBackToWelcome={() => navigate("/welcome")}
    />
  );
};

export const SignUpRoute: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <SignUp
      onSignUp={async () => {
        await login();
        navigate("/", { replace: true });
      }}
      onNavigateToLogin={() => navigate("/login")}
      onNavigateToPrivacy={() => navigate("/privacy")}
      onNavigateToTerms={() => navigate("/terms")}
    />
  );
};

export const PublicPrivacyRoute: React.FC = () => {
  const navigate = useNavigate();
  return <PrivacyPolicy onBack={() => navigate(-1)} />;
};

export const PublicTermsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <TermOfService onBack={() => navigate(-1)} />;
};