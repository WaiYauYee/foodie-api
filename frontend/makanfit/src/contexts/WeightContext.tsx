import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { WeightEntry } from "../types/types";
import { addWeight as addWeightRequest } from "../services/dashboardService";
import { useAuth } from "./AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface WeightContextValue {
  weightHistory: WeightEntry[];
  /** Logs a weight on the backend, updates history and user.currentWeight. */
  addWeight: (weight: number) => Promise<boolean>;
}

const WeightContext = createContext<WeightContextValue | null>(null);

export const useWeights = () => {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeights must be used inside <WeightProvider>");
  return ctx;
};

export const WeightProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated, patchUser } = useAuth();
  const [weightHistory, setWeightHistory] = useLocalStorage<WeightEntry[]>(
    "makanfit_weights",
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) setWeightHistory([]);
  }, [isAuthenticated, setWeightHistory]);

  const addWeight = useCallback(
    async (weight: number) => {
      const res = await addWeightRequest(user.userId, weight);
      if (!res.success) {
        console.error(res.message);
        return false;
      }
      setWeightHistory((prev) => [res.entry, ...prev]);
      patchUser({ currentWeight: res.currentWeight });
      return true;
    },
    [user.userId, setWeightHistory, patchUser],
  );

  const value = useMemo(
    () => ({ weightHistory, addWeight }),
    [weightHistory, addWeight],
  );

  return <WeightContext.Provider value={value}>{children}</WeightContext.Provider>;
};