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
 * @param {{current: ?}|function()} ref
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
 * @return {function(Element):function()}
 */
export function useMergeRefs(refs) {
  return useCallback(
    (element) => {
      for (let i = 0; i < refs.length; i++) {
        setRef(refs[i], element);
      }
    },
    // refs is an array, but ESLint cannot statically verify it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
