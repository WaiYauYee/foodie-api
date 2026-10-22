import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/** Must be logged in AND onboarded. */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
};

/** Login / signup / welcome: bounce logged-in users to the app. */
export const GuestRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};