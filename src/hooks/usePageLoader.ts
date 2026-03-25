import { useState, useCallback, useRef } from "react";

/**
 * usePageLoader
 * Controls a fullscreen loader with an optional minimum display duration
 * so it never flashes too briefly.
 *
 * @param {number} minMs  minimum time (ms) to show the loader (default 400)
 *
 * Usage:
 *   const { isLoading, startLoading, stopLoading, withLoader } = usePageLoader()
 *
 *   // Manual
 *   startLoading('Saving…')
 *   await doSomething()
 *   stopLoading()
 *
 *   // Automatic wrapper
 *   await withLoader(asyncFn, 'Deleting record…')
 */
export default function usePageLoader(minMs = 400) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading…");
  const startTimeRef = useRef<number | null>(null);

  const startLoading = useCallback((text = "Loading…") => {
    setLoadingText(text);
    setIsLoading(true);
    startTimeRef.current = Date.now();
  }, []);

  const stopLoading = useCallback(() => {
    const elapsed = Date.now() - (startTimeRef.current || 0);
    const remaining = Math.max(0, minMs - elapsed);
    setTimeout(() => setIsLoading(false), remaining);
  }, [minMs]);

  /**
   * Wraps an async function with start/stop loading automatically.
   * Returns the function's return value.
   */
  const withLoader = useCallback(
    async (asyncFn, text = "Loading…") => {
      startLoading(text);
      try {
        return await asyncFn();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  return { isLoading, loadingText, startLoading, stopLoading, withLoader };
}
