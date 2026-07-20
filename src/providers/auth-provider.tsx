'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  type StoredAuthSession,
  type StoredAuthUser,
} from '@/core/auth/token';
import { createDevAuthSession } from '@/core/auth/dev-bypass';

interface AuthContextType {
  isReady: boolean;
  isLoggedIn: boolean;
  token: string | null;
  user: StoredAuthUser | null;
  role: string | null;
  login: (session: {
    accessToken: string;
    user: StoredAuthUser;
    tokenType?: string;
    expiresInSeconds?: number;
  }) => void;
  logout: () => void;
  refreshFromStorage: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshFromStorage = useCallback(() => {
    setSession(getStoredAuthSession());
  }, []);

  useEffect(() => {
    createDevAuthSession();
    queueMicrotask(() => {
      refreshFromStorage();
      setIsReady(true);
    });

    const handleChange = () => refreshFromStorage();
    window.addEventListener(AUTH_SESSION_EVENT, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [refreshFromStorage]);

  const login: AuthContextType['login'] = useCallback((nextSession) => {
    saveAuthSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      isReady,
      isLoggedIn: Boolean(session?.accessToken),
      token: session?.accessToken ?? null,
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      login,
      logout,
      refreshFromStorage,
    }),
    [isReady, login, logout, refreshFromStorage, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuthSession must be used within AuthProvider');
  return value;
}
