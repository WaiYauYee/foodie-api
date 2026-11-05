import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Outlet } from "react-router-dom";

const EMAIL_KEY = "makanfit_reset_email";

interface PasswordResetValue {
  email: string;
  code: string;
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
  clear: () => void;
}

const PasswordResetContext = createContext<PasswordResetValue | null>(null);

export const usePasswordReset = () => {
  const ctx = useContext(PasswordResetContext);
  if (!ctx)
    throw new Error("usePasswordReset must be used inside <PasswordResetProvider>");
  return ctx;
};

/** Use as a layout route element: renders the matched child route via <Outlet />. */
export const PasswordResetProvider: React.FC = () => {
  const [email, setEmailState] = useState<string>(
    () => sessionStorage.getItem(EMAIL_KEY) ?? "",
  );
  const [code, setCode] = useState("");

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    if (value) sessionStorage.setItem(EMAIL_KEY, value);
    else sessionStorage.removeItem(EMAIL_KEY);
  }, []);

  const clear = useCallback(() => {
    setEmailState("");
    setCode("");
    sessionStorage.removeItem(EMAIL_KEY);
  }, []);

  const value = useMemo(
    () => ({ email, code, setEmail, setCode, clear }),
    [email, code, setEmail, clear],
  );

  return (
    <PasswordResetContext.Provider value={value}>
      <Outlet />
    </PasswordResetContext.Provider>
  );
};