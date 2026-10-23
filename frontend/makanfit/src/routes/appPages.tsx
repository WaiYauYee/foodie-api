// Thin adapters for logged-in pages. Components keep their current props.
import React, { lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const NotificationSettings = lazy(() => import("../pages/NotificationSettings"));

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