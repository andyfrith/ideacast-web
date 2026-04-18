"use client";

import * as React from "react";

/**
 * Returns true only after the component has mounted in the browser.
 * Use this to defer UI that depends on client-only state (e.g. `next-themes`
 * reading `localStorage`) so the first client paint matches SSR HTML.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate mount gate for hydration parity with SSR
    setMounted(true);
  }, []);

  return mounted;
}
