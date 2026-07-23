import { ViewTransition } from "react";
import type { ReactNode } from "react";

// Uses the browser's native View Transitions API (via React's ViewTransition
// component) for a fast crossfade between routes. This animates via the
// compositor without unmounting/remounting the page subtree — an earlier
// remount-based approach (keying this wrapper by pathname) is what caused
// perceived lag on every navigation.
export function PageTransition({ children }: { children: ReactNode }) {
  return <ViewTransition>{children}</ViewTransition>;
}
