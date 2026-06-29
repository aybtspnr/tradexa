"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale: string }) => {
      bricks: () => {
        create: (
          type: "wallet",
          container: string | HTMLElement,
          config: {
            initialization: { preference_id: string };
            customization?: {
              texts?: { action?: "pay"; valueProp?: "security_details" };
              visual?: { buttonHeight?: number };
            };
          }
        ) => Promise<{ error?: string }>;
      };
    };
  }
}

interface MercadoPagoBrickProps {
  preferenceId: string;
  publicKey: string;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export default function MercadoPagoBrick({
  preferenceId,
  publicKey: publicKeyProp,
  onReady,
  onError,
}: MercadoPagoBrickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initializedRef = useRef(false);

  // Fallback public key — stored here so Wallet Brick works without Supabase env var
  const publicKey = publicKeyProp || "APP_USR-6206c74c-7b08-4c80-9207-7134c3fc641f";

  // Load MercadoPago.js V2 SDK
  useEffect(() => {
    if (document.getElementById("mp-sdk-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "mp-sdk-script";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      setError("Falha ao carregar SDK de pagamento. Tente novamente.");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup only if we added it
      const existing = document.getElementById("mp-sdk-script");
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, []);

  // Initialize Wallet Brick
  useEffect(() => {
    if (!scriptLoaded || !preferenceId || !publicKey || !containerRef.current) {
      return;
    }

    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    let cleanup = false;

    const initBrick = async () => {
      try {
        const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });

        if (cleanup) return;

        const brickContainer = containerRef.current;
        if (!brickContainer) return;

        const brickSettings: Record<string, any> = {
          initialization: {
            preference_id: preferenceId,
          },
        };

        await mp.bricks().create("wallet", brickContainer, brickSettings);

        if (!cleanup) {
          setLoading(false);
          onReady?.();
        }
      } catch (err: any) {
        console.error("[MP Brick] Error:", err);
        if (!cleanup) {
          const msg = err?.message || "Erro ao inicializar pagamento";
          setError(msg);
          setLoading(false);
          onError?.(msg);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initBrick, 100);

    return () => {
      cleanup = true;
      clearTimeout(timer);
      initializedRef.current = false;
    };
  }, [scriptLoaded, preferenceId, publicKey]);

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">
            Erro no pagamento
          </p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[120px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin [animation-duration:2.5s]" />
            <p className="text-xs text-slate-500">
              Carregando opções de pagamento...
            </p>
          </div>
        </div>
      )}
      <div ref={containerRef} id="walletBrick_container" className="w-full" />
    </div>
  );
}
