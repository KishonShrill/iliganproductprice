import { useRef } from 'react';

export function useDebouncedCallback(callback, delay) {
  const timerRef = useRef(null);

  return (...args) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export function useThrottleCallback(callback, delay) {
  const timerRef = useRef(null);
  const hasCalledRef = useRef(false);

  return (...args) => {
    if (!hasCalledRef.current) {
      callback(...args);          // call immediately
      hasCalledRef.current = true;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current); // reset timer on re-call
    }

    timerRef.current = setTimeout(() => {
      hasCalledRef.current = false;   // allow future calls
    }, delay);
  };
}
