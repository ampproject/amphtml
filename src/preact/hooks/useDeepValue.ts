import {useRef} from '#preact';

export type Comparer<T> = (a: T, b: T) => boolean;

/**
 * Deep-compares the value against the previous value.
 * If they're the same, the previous value is returned.
 * Especially useful for dependency arrays.
 *
 * @param value - Any object, array, or value, which will be deep-compared
 * @param compare - Should return `true` if the values are the same
 */
export function useDeepValue<TObj>(
  value: TObj,
  compare: Comparer<TObj> = fastDeepEqual
): TObj {
  const previousValue = useRef(value);
  if (!compare(previousValue.current, value)) {
    previousValue.current = value;
  }
  return previousValue.current;
}

// Modified from https://github.com/epoberezkin/fast-deep-equal/blob/master/src/index.jst
function fastDeepEqual(a: any, b: any) {
  if (a === b) {
    return true;
  }

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    // Deep-compare arrays:
    if (Array.isArray(a)) {
      const {length} = a;
      if (length != b.length) {
        return false;
      }
      for (let i = length; i-- !== 0; ) {
        if (!fastDeepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    // Deep-compare objects:
    const keys = Object.keys(a);
    const {length} = keys;
    if (length !== Object.keys(b).length) {
      return false;
    }
    for (let i = length; i-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }
    for (let i = length; i-- !== 0; ) {
      const key = keys[i];
      if (!fastDeepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b; // eslint-disable-line no-self-compare
}
