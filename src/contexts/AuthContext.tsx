import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === "https://placeholder.supabase.co";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nickname: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: "demo-user-id",
  email: "player@gamevault.com",
  app_metadata: {},
  user_metadata: { nickname: "Player1" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  role: "",
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

const DEMO_PROFILE: Profile = {
  id: "demo-user-id",
  nickname: "Player1",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

const DEMO_STORAGE_KEY = "gamevault_demo_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (IS_DEMO) {
      // Demo mode: check localStorage for "logged in" state
      const savedAuth = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth) as { nickname: string; email: string };
        setUser({ ...DEMO_USER, email: parsed.email, user_metadata: { nickname: parsed.nickname } });
        setProfile({ ...DEMO_PROFILE, nickname: parsed.nickname });
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (IS_DEMO) {
      // Demo: accept any credentials but validate format
      if (!email || !password) return { error: new Error("Email e senha são obrigatórios") };
      const nickname = email.split("@")[0];
      const demoAuth = { email, nickname, password };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoAuth));
      setUser({ ...DEMO_USER, email, user_metadata: { nickname } });
      setProfile({ ...DEMO_PROFILE, nickname });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, nickname: string) => {
    if (IS_DEMO) {
      const demoAuth = { email, nickname, password };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoAuth));
      // Don't auto-login in demo signup - simulate email verification
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        nickname,
        created_at: new Date().toISOString(),
      });
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (IS_DEMO) {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem("gamevault_demo_jogos");
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (IS_DEMO) {
      if (!email) return { error: new Error("Email é obrigatório") };
      // Simulate successful email send
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    return { error: error as Error | null };
  };

  const refreshProfile = async () => {
    if (IS_DEMO) return;
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isDemo: IS_DEMO, signIn, signUp, signOut, resetPassword, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
