import {useRef} from '#preact';

/**
 * @param {T} current
 * @return {{current: T}}
 * @template T
 */
export function useValueRef(current) {
  const valueRef = useRef(null);
  valueRef.current = current;
  return valueRef;
}
