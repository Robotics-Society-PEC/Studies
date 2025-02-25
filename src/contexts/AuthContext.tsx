import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

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

  const getAccessToken = () => {
    const hash = window.location.hash; // Get the full hash fragment
    const queryString = hash.split("?")[1]; // Extract query string after "?"

    if (!queryString) return null; // Return null if no query params exist

    const params = new URLSearchParams(queryString);
    return params.get("access_token"); // Get the access_token value
  };


  const fetchGitHubUser = async (accessToken: string) => {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      return {
        access_token: accessToken,
        username: userData.login,
        avatar: userData.avatar_url, // GitHub profile picture
      };
    } catch (error) {
      console.error("GitHub API Error:", error);
      return null;
    }
  };

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      fetchGitHubUser(accessToken).then((userData) => {
        if (userData) {
          setUser(userData);
          Cookies.set("github_user", JSON.stringify(userData), { expires: 7, secure: true, sameSite: "Strict" });
        }
      });

      window.history.replaceState(null, "", window.location.pathname);
    } else {
      const savedUser = Cookies.get("github_user");
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
    Cookies.remove("github_user");
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
