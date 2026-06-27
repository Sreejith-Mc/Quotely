import { useEffect, useState } from 'react';

// Inline styles can't hold media queries, so we branch on width in JS instead.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(m.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export function useIsMobile(bp = 820) {
  return useMediaQuery(`(max-width: ${bp}px)`);
}
