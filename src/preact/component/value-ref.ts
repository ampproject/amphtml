import {useRef} from '#preact';

/**
 * Returns a ref that always references the latest value
 */
export function useValueRef<T>(latest: T): {current: T} {
  const valueRef = useRef<T>(latest);
  valueRef.current = latest;
  return valueRef;
}
