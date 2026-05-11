"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type User, getMe, logout as apiLogout } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refetch: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevent duplicate fetches (React Strict Mode double-invokes effects in dev)
  const fetchingRef = useRef(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getMe();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Guard: skip if a fetch is already in flight (Strict Mode safety)
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    refetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await apiLogout();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.replace("/auth/login");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
