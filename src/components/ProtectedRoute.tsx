import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Wrench } from "lucide-react";

const MAINTENANCE = import.meta.env.VITE_MAINTENANCE_MODE === "true";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireEmailConfirmed?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, requireEmailConfirmed = false }: ProtectedRouteProps) {
  const { profile, loading, emailConfirmed, signOut } = useAuth();
  const location = useLocation();
  const [sessionExpiring, setSessionExpiring] = useState(false);

  // Persist "had session" across unmounts so tab wake-up doesn't nuke the page
  const [hadSession, setHadSession] = useState(() => {
    return localStorage.getItem("tradexa_had_session") === "true";
  });

  // Persist "email was confirmed" — prevents flicker/unmount during
  // token refresh when email_confirmed_at might be briefly unavailable
  const [hadEmailConfirmed, setHadEmailConfirmed] = useState(() => {
    return localStorage.getItem("tradexa_email_confirmed") === "true";
  });

  // Once we confirm a valid profile, remember it
  useEffect(() => {
    if (profile && !loading && !hadSession) {
      localStorage.setItem("tradexa_had_session", "true");
      setHadSession(true);
    }
  }, [profile, loading, hadSession]);

  // Once email is confirmed, remember it so re-auth doesn't nuke children
  useEffect(() => {
    if (emailConfirmed && !loading && !hadEmailConfirmed) {
      localStorage.setItem("tradexa_email_confirmed", "true");
      setHadEmailConfirmed(true);
    }
  }, [emailConfirmed, loading, hadEmailConfirmed]);

  // Clear hadSession + hadEmailConfirmed on explicit sign-out
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem("tradexa_had_session");
      localStorage.removeItem("tradexa_email_confirmed");
      setHadSession(false);
      setHadEmailConfirmed(false);
    };
    window.addEventListener("session-expiring", handler);
    return () => window.removeEventListener("session-expiring", handler);
  }, []);

  if (loading) {
    // First-ever load (no cached session) — show nothing
    if (!hadSession) return null;
    // Re-authenticating (tab wake-up) — keep children mounted
    return <>{children}</>;
  }

  if (!profile) {
    // ⚠️ NUNCA chame setState durante render — causa React error #301 (loop infinito)
    // Agendamos a limpeza pra depois do render com setTimeout
    if (hadSession || hadEmailConfirmed) {
      setTimeout(() => {
        localStorage.removeItem("tradexa_had_session");
        localStorage.removeItem("tradexa_email_confirmed");
        setHadSession(false);
        setHadEmailConfirmed(false);
      }, 0);
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Maintenance mode — only admins can access
  if (MAINTENANCE && profile.role !== "admin") {
    signOut();
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">
            Plataforma em manutenção
          </h1>
          <p className="text-slate-600 leading-relaxed mb-4">
            Estamos realizando melhorias na plataforma. Apenas administradores podem acessar no momento. 
            Voltamos em breve!
          </p>
          <p className="text-sm text-slate-400">Agradecemos pela compreensão.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && profile.role !== "admin") {
    return <Navigate to="/ai-search" replace />;
  }

  // Email confirmation check for paid features
  // 🔧 Use hadEmailConfirmed as fallback — if user was previously confirmed,
  // keep children mounted during token refresh (prevents page reset on tab switch)
  if (requireEmailConfirmed && !emailConfirmed && !hadEmailConfirmed) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Confirme seu email</h1>
          <p className="text-[#888] mb-6 leading-relaxed">
            Enviamos um link de confirmação para o seu email. 
            Verifique sua caixa de entrada e clique no link para acessar esta funcionalidade.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-[#D80E16] text-white text-sm font-bold hover:bg-[#b80c12] transition-colors"
          >
            Já confirmei
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Session expiry warning banner */}
      {sessionExpiring && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-black px-4 py-3 text-center text-sm font-bold animate-pulse">
          ⚠️ Sua sessão expirará em 1 minuto por inatividade. 
          <button 
            onClick={() => setSessionExpiring(false)} 
            className="ml-3 underline hover:no-underline"
          >
            Continuar
          </button>
        </div>
      )}
      {children}
    </>
  );
}
