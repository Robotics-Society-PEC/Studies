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

  const login = async () => {
    try {
      const redirectUri = "https://jukbfghyvachwjvwqpxz.supabase.co/functions/v1/callback"; // Supabase deployed function URL
      window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23li0s63G562CpnPqH&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to initiate login",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('github_user');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('github_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};