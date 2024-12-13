import {objectsEqualDeep} from '#core/types/object';

import {useRef} from '#preact';

export type Comparer<T> = (a: T, b: T) => boolean;

/**
 * Deep-compares the value against the previous value.
 * If they're the same, the previous value is returned.
 * Especially useful for dependency arrays.
 *
 * @param value - Any object, array, or value, which will be deep-compared
 * @param [compare] - Should return `true` if the values are the same
 */
export function useDeepValue<TObj>(
  value: TObj,
  compare: Comparer<TObj> = objectsEqualDeep
): TObj {
  const previousValue = useRef(value);
  if (!compare(previousValue.current, value)) {
    previousValue.current = value;
  }
  return previousValue.current;
}
