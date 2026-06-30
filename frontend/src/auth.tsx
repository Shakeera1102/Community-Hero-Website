import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

type User = { id: number; name: string; email: string; role: string; ward?: string; points: number };
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const t = localStorage.getItem("token");
    if (!t) { setUser(null); setLoading(false); return; }
    try { setUser(await api.get("/api/auth/me")); }
    catch { localStorage.removeItem("token"); setUser(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const login = async (email: string, password: string) => {
    const r = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", r.access_token);
    setUser(r.user);
  };

  const signup = async (data: any) => {
    const r = await api.post("/api/auth/signup", data);
    localStorage.setItem("token", r.access_token);
    setUser(r.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}
