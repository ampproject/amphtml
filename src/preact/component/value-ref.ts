import {useRef} from '#preact';

/**
 * @param {T} current
 * @return {{current: T}}
 * @template T
 */
export function useValueRef<T>(current: T): {current: T} {
  const valueRef = useRef<T>(current);
  valueRef.current = current;
  return valueRef;
}
