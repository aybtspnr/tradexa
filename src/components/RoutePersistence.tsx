"use client";

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const LAST_ROUTE_KEY = "tradexa_last_route";

/**
 * RoutePersistence — salva a última rota do dashboard no localStorage
 * e redireciona para ela quando a página recarrega (tab discard).
 *
 * Deve ser usado dentro do Router e ProtectedRoute.
 */
export function RoutePersistence() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  // Salva a rota atual no pagehide (tab sendo descartada) e no
  // visibilitychange (tab indo pra background — defesa extra contra
  // Chrome memory saver que pode descartar sem pagehide)
  useEffect(() => {
    const saveRoute = () => {
      const path = location.pathname + location.search;
      if (path.startsWith("/") && !["/login", "/register", "/"].includes(path)) {
        localStorage.setItem(LAST_ROUTE_KEY, path);
      }
    };
    window.addEventListener("pagehide", saveRoute);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveRoute();
    });
    return () => {
      window.removeEventListener("pagehide", saveRoute);
      document.removeEventListener("visibilitychange", saveRoute);
    };
  }, [location]);

  // Na primeira montagem com perfil carregado, redireciona pra última rota
  useEffect(() => {
    if (loading || !profile) return;

    const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
    const currentPath = location.pathname + location.search;

    if (lastRoute && lastRoute !== currentPath && lastRoute !== "/") {
      // Limpa o cache pra não redirecionar de novo
      localStorage.removeItem(LAST_ROUTE_KEY);
      navigate(lastRoute, { replace: true });
    }
  }, [loading, profile, location, navigate]);

  return null;
}
