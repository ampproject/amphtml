import {useEffect, useMemo} from '#preact';
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
  const onMutationHandler = useEvent(onMutation);
  const mo = useMemo(() => {
    return new MutationObserver((records) => {
      records.forEach((record) => {
        onMutationHandler(record);
      });
    });
  }, [onMutationHandler]);

  useEffect(() => {
    if (elementRef.current) {
      mo.observe(elementRef.current, config);
      return () => mo.disconnect();
    }
  }, [config, /** These are stable: */ elementRef, mo]);
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
  return useMutationObserver(elementRef, config, (record) => {
    if (record.type === 'attributes') {
      const newValue = elementRef.current!.getAttribute(attributeName);
      onChange(newValue);
    }
  });
}
