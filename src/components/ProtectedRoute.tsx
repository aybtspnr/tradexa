import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireEmailConfirmed?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, requireEmailConfirmed = false }: ProtectedRouteProps) {
  const { profile, loading, emailConfirmed } = useAuth();
  const location = useLocation();

  if (loading) {
    // Apenas renderiza os filhos sem indicador visual — loading é silencioso
    return <>{children}</>;
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && profile.role !== "admin") {
    return <Navigate to="/ai-search" replace />;
  }

  // Email confirmation check for paid features
  if (requireEmailConfirmed && !emailConfirmed) {
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
      {/* Session expiry warning modal removido — timeout silencioso */}
      {children}
    </>
  );
}
