import { useEffect, useRef, useState } from "react";

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (el: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export function TurnstileWidget({ siteKey, onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    // Load Turnstile script once
    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;

      window.onloadTurnstileCallback = () => {
        setLoaded(true);
      };

      script.onerror = () => setErrored(true);
      document.head.appendChild(script);
    } else if (window.turnstile) {
      setLoaded(true);
    } else {
      // Script exists but not loaded yet — wait for callback
      const check = setInterval(() => {
        if (window.turnstile) {
          setLoaded(true);
          clearInterval(check);
        }
      }, 200);
      return () => clearInterval(check);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !ref.current) return;

    // Clean up previous widget
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current);
    }

    try {
      widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        "error-callback": () => onError?.(),
        "expired-callback": () => {
          onExpire?.();
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
        },
        theme: "dark",
        size: "normal",
      });
    } catch {
      setErrored(true);
    }
  }, [loaded, siteKey]);

  if (errored) {
    return (
      <div className="text-center py-2 text-xs text-amber-500">
        Erro ao carregar verificação. Recarregue a página.
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-[65px]">
      <div ref={ref} className="turnstile-widget" />
    </div>
  );
}
