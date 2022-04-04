import type {RefObject} from 'preact';

import {useRef} from '#preact';

/**
 * @param {T} current
 * @return {{current: T}}
 * @template T
 */
export function useValueRef<T>(current: T): RefObject<T> {
  const valueRef = useRef<T>(null);
  valueRef.current = current;
  return valueRef;
}
