import {useCallback, useState} from '#preact';
import {logger} from '#preact/logger';

/**
 * @param {string} key
 * @param {any} [defaultValue]
 * @return {{ "0": any, "1": function(any): void }}
 */
export function useLocalStorage(key, defaultValue = null) {
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
    (newValue) => {
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

  return [value, storeValue];
}
