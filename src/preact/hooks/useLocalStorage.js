import {useCallback, useState} from '#preact';

/**
 * @param {string} key
 * @param {any} [defaultValue]
 * @return {{ "0": any, "1": function(any): void }}
 */
export function useLocalStorage(key, defaultValue = null) {
  // Keep track of the state locally:
  const [value, setValue] = useState(() => {
    try {
      // eslint-disable-next-line local/no-forbidden-terms
      const json = self.localStorage?.getItem(key);
      return !json ? defaultValue : JSON.parse(json);
    } catch (err) {
      // warning: could not read from local storage
      return defaultValue;
    }
  });

  const storeValue = useCallback(
    (newValue) => {
      try {
        const json = JSON.stringify(newValue);
        // eslint-disable-next-line local/no-forbidden-terms
        self.localStorage?.setItem(key, json);
      } catch (err) {
        // warning: could not write to local storage
      }
      setValue(newValue);
    },
    [key]
  );

  return [value, storeValue];
}
