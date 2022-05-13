import {useEffect, useMemo} from '#preact';
import useEvent from '#preact/hooks/useEvent';
import {RefObject} from '#preact/types';

export function useMutationObserver(
  elementRef: RefObject<HTMLElement>,
  config: MutationObserverInit,
  onChange: (name: string, value: string | null) => void
) {
  const onChangeCallback = useEvent(onChange);
  const mo = useMemo(() => {
    return new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === 'attributes') {
          const attrName = record.attributeName!;
          const newValue = (record.target as HTMLElement).getAttribute(
            attrName
          );
          onChangeCallback(attrName, newValue);
        }
      });
    });
  }, [onChangeCallback]);

  useEffect(() => {
    if (elementRef.current) {
      mo.observe(elementRef.current, config);
      return () => mo.disconnect();
    }
  }, [config, /** These are stable: */ elementRef, mo]);
}

export function useAttributeObserver(
  elementRef: RefObject<HTMLElement>,
  attributeName: string,
  onChange: (name: string, value: string | null) => void
) {
  const config = useMemo<MutationObserverInit>(
    () => ({
      attributes: true,
      attributeFilter: [attributeName],
    }),
    [attributeName]
  );
  return useMutationObserver(elementRef, config, onChange);
}
