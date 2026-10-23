// Thin adapters for logged-in pages. Components keep their current props.
import React, { lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WeightEntry } from "../types/types";
import { useAuth } from "../contexts/AuthContext";
import { useWeights } from "../contexts/WeightContext";

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