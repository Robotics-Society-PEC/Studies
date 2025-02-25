import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // 1. Extract access_token from URL
    const urlParams = new URLSearchParams(window.location.hash.substring(1)); // Use hash params
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      const userData = { access_token: accessToken };
      setUser(userData);
      localStorage.setItem("github_user", JSON.stringify(userData));

      // 2. Remove token from URL for security
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      // 3. Load user from localStorage if available
      const savedUser = localStorage.getItem("github_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }

    setLoading(false);
  }, []);

  const login = () => {
    const redirectUri = "https://jukbfghyvachwjvwqpxz.supabase.co/functions/v1/callback";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23li0s63G562CpnPqH&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("github_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
