import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/shipping";

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  emailConfirmed: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  emailConfirmed: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

const MIN_LOADING_MS = 900;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
const WARNING_BEFORE_MS = 60 * 1000; // aviso 1 min antes

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const loadingStartedAtRef = useRef(Date.now());
  const loadingTimeoutRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);

  const beginLoading = () => {
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    loadingStartedAtRef.current = Date.now();
    setLoading(true);
  };

  const finishLoading = () => {
    const elapsed = Date.now() - loadingStartedAtRef.current;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      loadingTimeoutRef.current = null;
    }, remaining);
  };

  const fetchProfile = async (userId: string, userMetadata?: any) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        // Também buscar plan_type da tabela user_usage (fonte de verdade)
        const { data: usageData } = await supabase
          .from("user_usage")
          .select("plan_type")
          .eq("user_id", userId)
          .single();

        const mergedProfile = {
          ...data,
          plan_type: usageData?.plan_type || data?.plan_type || "essential",
          role: data?.role || "client",
        } as Profile;

        setProfile(mergedProfile);
      } else if (userMetadata && error?.code === "PGRST116") {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            email: userMetadata.email,
            role: userMetadata.role || "client",
            company_name: userMetadata.company_name || "Empresa não identificada",
            cnpj: userMetadata.cnpj || "00.000.000/0000-00",
            status: userMetadata.role === "partner" || userMetadata.role === "trucker" ? "pending" : "approved",
            partner_type: userMetadata.partner_type,
            coverage_type: userMetadata.coverage_type,
            modals: userMetadata.modals || [],
            regions: userMetadata.regions || [],
          })
          .select()
          .single();

        if (!insertError && newProfile) {
          setProfile({ ...newProfile, plan_type: "essential" } as Profile);
        }
      }
    } catch (err) {
      console.error("[Auth] Erro ao carregar perfil:", err);
    } finally {
      finishLoading();
    }
  };

  useEffect(() => {
    beginLoading();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmailConfirmed(!!session.user.email_confirmed_at || !!session.user.confirmed_at);
        fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        setProfile(null);
        setEmailConfirmed(false);
        finishLoading();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESHED é um refresh silencioso — não mostra loading
      // Isso evita que a página inteira desmonte quando a aba volta a ficar visível
      if (event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setEmailConfirmed(!!session.user.email_confirmed_at || !!session.user.confirmed_at);
        }
        return;
      }

      beginLoading();

      if (session?.user) {
        setEmailConfirmed(!!session.user.email_confirmed_at || !!session.user.confirmed_at);
        fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        setProfile(null);
        setEmailConfirmed(false);
        finishLoading();
      }
    });

    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Limpa timers de inatividade
    if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    await supabase.auth.signOut();
    setProfile(null);
    setEmailConfirmed(false);
  };

  // ── Inactivity timeout ──
  const resetInactivityTimer = () => {
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    
    if (!profile) return; // só monitora se logado
    
    // Aviso removido — timeout é silencioso
    /* warningTimerRef.current = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("session-expiring"));
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS); */
    
    // Timeout real
    inactivityTimerRef.current = window.setTimeout(() => {
      signOut();
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!profile) return;
    
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handler = () => resetInactivityTimer();
    
    resetInactivityTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    
    return () => {
      if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
      events.forEach(e => window.removeEventListener(e, handler));
    };
  }, [profile]);

  // ── Pause inactivity timer when tab is hidden (tab switch) ──
  useEffect(() => {
    if (!profile) return;
    
    const handleVisibility = () => {
      if (document.hidden) {
        // Tab oculta — limpa timers, não faz logout
        if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
        if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
      } else {
        // Tab visível novamente — reinicia timer
        resetInactivityTimer();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [profile]);

  const refreshProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        const { data: usageData } = await supabase
          .from("user_usage")
          .select("plan_type")
          .eq("user_id", user.id)
          .single();

        setProfile({
          ...data,
          plan_type: usageData?.plan_type || data?.plan_type || "essential",
          role: data?.role || "client",
        } as Profile);
      }
    }
  };

  return <AuthContext.Provider value={{ profile, loading, emailConfirmed, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
