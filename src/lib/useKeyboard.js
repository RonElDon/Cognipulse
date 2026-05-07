import { useEffect } from 'react';

/**
 * Registers keydown listeners. handlers is an object: { key: callback }
 * Keys are matched case-insensitively. Special keys: ' ' (space), 'Enter', 'ArrowUp', etc.
 * Skips events when an input/textarea is focused (unless `allowInInput` is true).
 */
export function useKeyboard(handlers, deps = [], allowInInput = false) {
  useEffect(() => {
    const handle = (e) => {
      if (!allowInInput) {
        const tag = e.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      }
      const fn = handlers[e.key] ?? handlers[e.key.toLowerCase()];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}