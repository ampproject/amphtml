import {useLayoutEffect, useMemo} from '#preact';

import {useAmpContext} from './context';

/**
 * Notifies Resources (if present) of a rerender in the component.
 * Every functional component **must** use this helper.
 */
export function useResourcesNotify() {
  const {notify} = useAmpContext();
  useLayoutEffect(() => {
    if (notify) {
      notify();
    }
  });
}

/**
 * @param {any} ref
 * @param {!Element} value
 */
function setRef(ref, value) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/**
 * Combines refs to pass into `ref` prop.
 * @param {any} refOne
 * @param {any} refTwo
 * @return {function()}
 */
export function useMergeRefs(refOne, refTwo) {
  return useMemo(() => {
    if (refOne === null && refTwo === null) {
      return null;
    }
    return (element) => {
      setRef(refOne, element);
      setRef(refTwo, element);
    };
  }, [refOne, refTwo]);
}
