import {useCallback, useLayoutEffect} from '#preact';

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
 * @param {*} ref
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
 * @param {!Array<*>} refs
 * @return {function():function}
 */
export function useMergeRefs(refs) {
  return useCallback(
    (element) => refs.forEach((ref) => setRef(ref, element)),
    [refs]
  );
}
