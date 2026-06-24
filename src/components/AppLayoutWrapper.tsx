import { lazy, Suspense } from "react";
import type { ReactNode } from "react";

// Lazy-load AppLayout — keeps heavy dashboard layout out of main bundle
// Only loads when a protected route is accessed (post-login)
const AppLayoutInner = lazy(() =>
  import("./AppLayout").then((m) => ({ default: m.AppLayout }))
);

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D80E16] border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">Carregando...</p>
          </div>
        </div>
      }
    >
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}
