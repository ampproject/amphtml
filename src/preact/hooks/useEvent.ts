// Copied from react-use-event-hook
import {useLayoutEffect, useRef} from '#preact';

type AnyFunction = (...args: any[]) => any;

/**
 * Similar to useCallback, with a few subtle differences:
 * - The returned function is a stable reference, and will always be the same between renders
 * - No dependency lists required
 * - Properties or state accessed within the callback will always be "current"
 */
export function useEvent<TCallback extends AnyFunction>(
  callback: TCallback
): TCallback {
  // Keep track of the latest callback:
  const latestRef = useRef<TCallback>(
    useEventResultShouldNotBeCalledDuringRender as TCallback
  );
  useLayoutEffect(() => {
    latestRef.current = callback;
  }, [callback]);

  // Create a stable callback that always calls the latest callback:
  const stableRef = useRef<TCallback>(null as any);
  if (!stableRef.current) {
    stableRef.current = function (this: any) {
      return latestRef.current.apply(this, arguments as any);
    } as TCallback;
  }

  return stableRef.current;
}

/**
 * Render methods should be pure, especially when concurrency is used,
 * so we will throw this error if the callback is called while rendering.
 */
function useEventResultShouldNotBeCalledDuringRender() {
  throw new Error(
    'The callback from useEvent cannot be called while rendering; it should be wrapped in `useEffect` or `useLayoutEffect`.'
  );
}

export default useEvent;
