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
 * @param {import('preact').Ref<T>} ref
 * @param {T} value
 * @template T
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
 * @param {import('preact').Ref<*>[]} refs
 * @return {import('preact').Ref<*>}
 */
export function useMergeRefs(refs) {
  return useCallback(
    /** @param {Element} element */
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

/**
 * Required to use `props` whose name would be usually be mapped in
 * Preact-to-React style.
 * This passes through the value during development, because we render on Preact.
 * It's an annotation so that we can convert these values when we transform the
 * React build.
 *
 * @param {T} name
 * @return {T}
 * @template {string} T
 */
export function propName(name) {
  return name;
}

/**
 * Required to consume `tabindex` from props.
 * We support taking both `tabIndex` and `tabindex` for backwards compatibility,
 * so this takes either form.
 * @param {{tabindex: string|number, tabIndex: string|number}} props
 * @param {number=} fallback
 * @return {string|number}
 */
export function tabindexFromProps(props, fallback = 0) {
  // This tabindex property access is okay. Tabindex property access elsewhere
  //  must use this function.
  // eslint-disable-next-line local/preact-preferred-props
  return props.tabindex ?? props.tabIndex ?? fallback;
}
