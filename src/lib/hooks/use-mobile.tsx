import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Guard for SSR / Next.js
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    // Set initial value
    handleChange(mql);

    // Subscribe to changes (modern + fallback)
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    } else {
      // Safari < 14 fallback
      (mql as any).addListener(handleChange);
      return () => {
        (mql as any).removeListener(handleChange);
      };
    }
  }, []);

  return isMobile;
}
