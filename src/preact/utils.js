import {useLayoutEffect} from '#preact';

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
 * Combines multiple refs to pass into `ref` prop.
 * @param {...any} refs
 * @return {function(!Element)}
 */
export function refs(...refs) {
  return (element) =>
    refs.forEach((ref) =>
      typeof ref == 'function' ? ref(element) : (ref.current = element)
    );
}
