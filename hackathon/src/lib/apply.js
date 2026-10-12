import { useEffect, useState } from "react";
import { applicationsOpen } from "./event";

/**
 * Whether applications are still open, for components.
 *
 * FIRST RENDER SAYS OPEN. The pages are prerendered, and hydration needs the
 * client's first render to match the server's, so the real answer replaces
 * it after mount. It is asked again every minute, so a page left open across
 * the deadline closes itself rather than taking a form the server will
 * refuse.
 */
export function useApplicationsOpen() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const check = () => setOpen(applicationsOpen());
    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return open;
}
