import {useEffect, useMemo} from '#preact';
import {useDeepValue} from '#preact/hooks/useDeepValue';
import useEvent from '#preact/hooks/useEvent';
import {RefObject} from '#preact/types';

/**
 * Subscribes to an element's DOM mutations
 */
export function useMutationObserver(
  elementRef: RefObject<HTMLElement>,
  config: MutationObserverInit,
  onMutation: (record: MutationRecord) => void
) {
  const configValues = useDeepValue(config);

  const onMutationHandler = useEvent(onMutation);
  useEffect(() => {
    if (elementRef.current) {
      const mo = new MutationObserver((records) => {
        records.forEach((record) => {
          onMutationHandler(record);
        });
      });
      mo.observe(elementRef.current, configValues);
      return () => mo.disconnect();
    }
  }, [configValues, /** These are stable: */ elementRef, onMutationHandler]);
}

/**
 * Watches a DOM element's attribute for changes
 */
export function useAttributeObserver(
  elementRef: RefObject<HTMLElement>,
  attributeName: string,
  onChange: (value: string | null) => void
) {
  const config = useMemo<MutationObserverInit>(
    () => ({
      attributes: true,
      attributeFilter: [attributeName],
    }),
    [attributeName]
  );
  return useMutationObserver(elementRef, config, () => {
    const newValue = elementRef.current!.getAttribute(attributeName);
    onChange(newValue);
  });
}
