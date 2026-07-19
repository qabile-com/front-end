'use client';
import { createContext, useEffect, useState } from 'react';
import { tryDevAutoLogin } from '@/core/auth/dev-bypass';
import { getAccessToken } from '@/core/auth/token';

interface AuthContextType {
  isLoggedIn: boolean;
}
export const AuthContext = createContext<AuthContextType>({ isLoggedIn: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (await tryDevAutoLogin()) {
        setIsLoggedIn(true);
        return;
      }
      if (getAccessToken()) setIsLoggedIn(true);
    };
    init();
  }, []);

  return <AuthContext.Provider value={{ isLoggedIn }}>{children}</AuthContext.Provider>;
}
