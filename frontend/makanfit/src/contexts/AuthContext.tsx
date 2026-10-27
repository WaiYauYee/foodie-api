import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { User, CompleteOnboardingData } from "../types/types";
import {
  completeOnboarding,
  updateUserProfile,
  updateUserProfileGoals,
  changeEmail as changeEmailRequest,
  deleteAccount as deleteAccountRequest,
} from "../services/authService";
import { INITIAL_USER } from "../constants/initialUser";
import { readJSON } from "../hooks/useLocalStorage";
import { buildOnboardingPayload } from "../utils/onboarding";
import { logOut as logOutRequest } from "../services/authService";

const KEYS = {
  user: "makanfit_user",
  auth: "makanfit_auth",
  onboardingDone: "makanfit_onboarding_done",
  pending: "makanfit_pending_onboarding",
} as const;

const USER_DATA_KEYS = [
  "makanfit_coins",
  "makanfit_daily_challenges",
  "makanfit_daily_date",
  "makanfit_weekly_challenges",
  "makanfit_equipped_ids",
  "makanfit_shop_items",
  "makanfit_meals",
  "makanfit_weights",
  "makanfit_pending_onboarding",
];

const SESSION_KEYS = [
  KEYS.user,
  "makanfit_userId",
  "makanfit_token",
  KEYS.auth,
  KEYS.onboardingDone,
  ...USER_DATA_KEYS,
];

const PROFILE_KEYS = [
  "firstName",
  "lastName",
  "gender",
  "birthDate",
  "heightCm",
] as const;

// frontend field -> backend goal field
const GOAL_MAP: Record<string, string> = {
  startWeight: "startWeightKg",
  goalWeight: "goalWeightKg",
  activityLevel: "activityLevel",
  dietaryGoal: "dietaryGoal",
  targetCalories: "targetCalories",
  targetProtein: "targetProteinG",
  targetCarbs: "targetCarbsG",
  targetFat: "targetFatG",
  targetFiber: "targetFiberG",
  targetWater: "targetWaterMl",
  goalOrigin: "goalOrigin",
  macroGoalOrigin: "macroGoalOrigin",
};

type ChangeEmailResult = Awaited<ReturnType<typeof changeEmailRequest>>;
type DeleteAccountResult = Awaited<ReturnType<typeof deleteAccountRequest>>;
export type ConfirmPlanResult = "completed" | "needs_signup" | "error";

interface AuthContextValue {
  user: User;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  pendingOnboardingData: CompleteOnboardingData | null;
  setPendingOnboardingData: (data: CompleteOnboardingData | null) => void;

  login: () => Promise<void>;
  logout: () => void;
  confirmPlan: (planValues: Partial<User>) => Promise<ConfirmPlanResult>;

  /** Saves profile + goal fields to the backend. Returns false on failure. */
  updateUser: (fields: Partial<User>) => Promise<boolean>;
  /** Local-only merge (used by other contexts, e.g. after logging weight). */
  patchUser: (fields: Partial<User>) => void;
  changeEmail: (email: string) => Promise<ChangeEmailResult>;
  deleteAccount: () => Promise<DeleteAccountResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Lazy init from storage => correct on the very first render (no flash).
  const [user, setUser] = useState<User>(() =>
    readJSON<User>(KEYS.user, INITIAL_USER),
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(KEYS.auth) === "true",
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    const saved = readJSON<User | null>(KEYS.user, null);
    return saved
      ? saved.onboardingComplete === true
      : localStorage.getItem(KEYS.onboardingDone) === "true";
  });
  const [pendingOnboardingData, setPendingOnboardingData] =
    useState<CompleteOnboardingData | null>(null);

  const persistUser = useCallback((next: User) => {
    setUser(next);
    localStorage.setItem(KEYS.user, JSON.stringify(next));
  }, []);

  const patchUser = useCallback((fields: Partial<User>) => {
    setUser((prev) => {
      const next = { ...prev, ...fields };
      localStorage.setItem(KEYS.user, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSession = useCallback(() => {
    SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setPendingOnboardingData(null);
  }, []);

  // ---- onboarding -------------------------------------------------------

  /** Guest answers saved before signup are submitted right after login. */
  const submitPendingOnboarding = async (userId: string): Promise<User | null> => {
    const raw = localStorage.getItem(KEYS.pending);
    if (!raw) return null;
    try {
      const res = await completeOnboarding(
        userId,
        buildOnboardingPayload(JSON.parse(raw)),
      );
      if (res.success && res.user) {
        localStorage.removeItem(KEYS.pending);
        return res.user;
      }
    } catch (error) {
      console.error("Submit pending onboarding failed:", error);
    }
    return null;
  };

  const confirmPlan = useCallback(
    async (planValues: Partial<User>): Promise<ConfirmPlanResult> => {
      const merged = { ...(pendingOnboardingData || {}), ...planValues };

      // Not logged in yet: stash answers, user must sign up first.
      if (!isAuthenticated || !user.userId) {
        localStorage.setItem(KEYS.pending, JSON.stringify(merged));
        return "needs_signup";
      }

      try {
        const res = await completeOnboarding(
          user.userId,
          buildOnboardingPayload(merged),
        );
        if (!res.success) {
          console.error("Complete onboarding failed:", res.message);
          return "error";
        }
        if (res.user) persistUser(res.user);
        localStorage.setItem(KEYS.onboardingDone, "true");
        setHasCompletedOnboarding(true);
        setPendingOnboardingData(null);
        return "completed";
      } catch (error) {
        console.error("Complete onboarding error:", error);
        return "error";
      }
    },
    [pendingOnboardingData, isAuthenticated, user.userId, persistUser],
  );

  // ---- session ----------------------------------------------------------

  const login = useCallback(async () => {
    let userData = readJSON<User | null>(KEYS.user, null);

    if (userData) {
      if (userData.onboardingComplete !== true) {
        const updated = await submitPendingOnboarding(userData.userId);
        if (updated) {
          userData = updated;
          localStorage.setItem(KEYS.user, JSON.stringify(updated));
        }
      }
      setUser(userData);
      const done = userData.onboardingComplete === true;
      setHasCompletedOnboarding(done);
      if (done) {
        setPendingOnboardingData(null);
        localStorage.removeItem(KEYS.pending);
      }
    }

    localStorage.setItem(KEYS.auth, "true");
    setIsAuthenticated(true); // last, so guards never see a half-updated state
  }, []);

  const logout = useCallback(() => {
    void logOutRequest(); // fire-and-forget; token is read synchronously before clearSession
    clearSession();
  }, [clearSession]);

  // ---- account ----------------------------------------------------------

  const updateUser = useCallback(
    async (fields: Partial<User>): Promise<boolean> => {
      let latest: User = user;

      const profilePatch: Record<string, unknown> = {};
      PROFILE_KEYS.forEach((k) => {
        if (fields[k] !== undefined) profilePatch[k] = fields[k];
      });
      if (profilePatch.heightCm !== undefined) {
        profilePatch.heightCm = Number(profilePatch.heightCm);
      }
      if (Object.keys(profilePatch).length) {
        const res = await updateUserProfile(user.userId, profilePatch);
        if (!res.success) {
          alert(res.message);
          return false;
        }
        if (res.user) latest = { ...latest, ...res.user };
      }

      const goalPatch: Record<string, unknown> = {};
      Object.entries(GOAL_MAP).forEach(([front, back]) => {
        const v = (fields as any)[front];
        if (v !== undefined) goalPatch[back] = v;
      });
      if (Object.keys(goalPatch).length) {
        const res = await updateUserProfileGoals(user.userId, goalPatch);
        if (!res.success) {
          persistUser(latest); // keep the profile change that did succeed
          alert(res.message);
          return false;
        }
        if (res.user) latest = { ...latest, ...res.user };
      }

      persistUser(latest);
      return true;
    },
    [user, persistUser],
  );

  const changeEmail = useCallback(
    async (email: string) => {
      const res = await changeEmailRequest(user.userId, email);
      if (res.success && res.user) patchUser(res.user);
      return res;
    },
    [user.userId, patchUser],
  );

  const deleteAccount = useCallback(async () => {
    const res = await deleteAccountRequest(user.userId);
    if (res.success) clearSession();
    return res;
  }, [user.userId, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      hasCompletedOnboarding,
      pendingOnboardingData,
      setPendingOnboardingData,
      login,
      logout,
      confirmPlan,
      updateUser,
      patchUser,
      changeEmail,
      deleteAccount,
    }),
    [
      user,
      isAuthenticated,
      hasCompletedOnboarding,
      pendingOnboardingData,
      login,
      logout,
      confirmPlan,
      updateUser,
      patchUser,
      changeEmail,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};