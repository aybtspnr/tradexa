import { ReactNode } from "react";
import type { ReactNode } from "react";

// Statically import AppLayout to avoid Suspense fallback on every page reload
import { AppLayout as AppLayoutInner } from "./AppLayout";

export function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
