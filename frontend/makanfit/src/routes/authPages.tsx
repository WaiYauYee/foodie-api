// Thin adapters: pull data from contexts, pass the props your existing
// logged-out components already expect.
import React, { lazy } from "react";
import { useNavigate } from "react-router-dom";

const TermOfService = lazy(() => import("../pages/TermOfService"));

export const PublicTermsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <TermOfService onBack={() => navigate(-1)} />;
};