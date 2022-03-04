import {useCallback, useState} from '#preact';
import {logger} from '#preact/logger';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): readonly [T, (newValue: T) => void] {
  // Keep track of the state locally:
  const [value, setValue] = useState(() => {
    try {
      const json = self.localStorage?.getItem(key);
      return json ? JSON.parse(json) : defaultValue;
    } catch (err) {
      // warning: could not read from local storage
      return defaultValue;
    }
  });

  const storeValue = useCallback(
    (newValue: T) => {
      try {
        const json = JSON.stringify(newValue);
        self.localStorage?.setItem(key, json);
      } catch (err) {
        logger.warn(
          'useLocalStorage',
          'Could not write value to local storage',
          key,
          err
        );
      }
      setValue(newValue);
    },
    [key]
  );

  return [value, storeValue] as const;
}
