// Thin adapters: pull data from contexts, pass the props your existing
// logged-out components already expect.
import React, { lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/SignUp"));
const TermOfService = lazy(() => import("../pages/TermOfService"));

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

export const PublicTermsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <TermOfService onBack={() => navigate(-1)} />;
};