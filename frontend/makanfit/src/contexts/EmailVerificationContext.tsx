import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Outlet } from "react-router-dom";

const KEY = "makanfit_pending_verification";

export interface PendingVerification {
  email: string;
  firstName?: string;
  lastName?: string;
  /** Where the user came from, which decides "Wrong email?" and whether to send a code on arrival */
  source: "signup" | "login";
}

interface EmailVerificationValue {
  pending: PendingVerification | null;
  start: (p: PendingVerification) => void;
  clear: () => void;
}

const EmailVerificationContext = createContext<EmailVerificationValue | null>(null);

export const useEmailVerification = () => {
  const ctx = useContext(EmailVerificationContext);
  if (!ctx)
    throw new Error("useEmailVerification must be used inside <EmailVerificationProvider>");
  return ctx;
};

const readPending = (): PendingVerification | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingVerification) : null;
  } catch {
    return null;
  }
};

/** Layout route: wraps signup, login and verify-email so they share the pending state. */
export const EmailVerificationProvider: React.FC = () => {
  const [pending, setPending] = useState<PendingVerification | null>(readPending);

  const start = useCallback((p: PendingVerification) => {
    setPending(p);
    sessionStorage.setItem(KEY, JSON.stringify(p));
  }, []);

  const clear = useCallback(() => {
    setPending(null);
    sessionStorage.removeItem(KEY);
  }, []);

  const value = useMemo(() => ({ pending, start, clear }), [pending, start, clear]);

  return (
    <EmailVerificationContext.Provider value={value}>
      <Outlet />
    </EmailVerificationContext.Provider>
  );
};