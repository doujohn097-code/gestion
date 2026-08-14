import React, { createContext, useContext, useState } from 'react';

const DUMMY_USER = {
  id: 'u1',
  username: 'friendgram',
  full_name: 'Friendgram',
  profile_picture_url: null,
  has_story: false,
  story_viewed: true,
  is_verified: true,
  is_online: true,
};

type AuthContextType = {
  userId: string | null;
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: any) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  userId: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => ({ ok: true }),
  register: async () => ({ ok: true }),
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId] = useState<string | null>('u1');
  const [user] = useState<any | null>(DUMMY_USER);
  const [isLoading] = useState(false);

  const login = async () => ({ ok: true });
  const register = async () => ({ ok: true });
  const logout = async () => {};
  const refresh = async () => {};

  return (
    <AuthContext.Provider
      value={{
        userId,
        user,
        isLoading,
        isAuthenticated: true,
        login,
        register,
        logout,
        refresh,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
