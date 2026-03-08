import { useState } from "react";
import type { backendInterface } from "../backend.d";

const TOKEN_KEY = "perf_session_token";
const EMAIL_KEY = "perf_session_email";

export interface EmailAuthState {
  isAuthenticated: boolean;
  userEmail: string;
  sessionToken: string;
  isLoggingIn: boolean;
  loginError: string | null;
  login: (
    email: string,
    password: string,
    actorInstance: backendInterface,
  ) => Promise<void>;
  logout: (actorInstance: backendInterface | null) => Promise<void>;
}

export function useEmailAuth(): EmailAuthState {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem(TOKEN_KEY);
  });
  const [sessionToken, setSessionToken] = useState<string>(() => {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = async (
    email: string,
    password: string,
    actorInstance: backendInterface,
  ) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const result = await actorInstance.loginWithEmail(email, password);
      if (result.ok) {
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(EMAIL_KEY, email);
        setSessionToken(result.token);
        setUserEmail(email);
        setIsAuthenticated(true);
      } else {
        setLoginError(result.message || "Invalid email or password");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async (actorInstance: backendInterface | null) => {
    if (actorInstance && sessionToken) {
      try {
        await actorInstance.logoutSession(sessionToken);
      } catch {
        // Ignore logout errors — always clear local state
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setSessionToken("");
    setUserEmail("");
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    userEmail,
    sessionToken,
    isLoggingIn,
    loginError,
    login,
    logout,
  };
}
