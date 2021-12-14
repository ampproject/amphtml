import {useCallback, useRef, useState} from '#preact';

/**
 * @param {string} key
 * @param {any} [defaultValue]
 * @return {{ "0": any, "1": function(any): void }}
 */
export function useLocalStorage(key, defaultValue) {
  // Keep track of the state locally:
  const [value, setValue] = useState(() => {
    try {
      // eslint-disable-next-line local/no-forbidden-terms
      const json = self.localStorage?.getItem(key);
      return json === undefined ? defaultValue : JSON.parse(json);
    } catch (err) {
      // warning: could not read from local storage
      return defaultValue;
    }
  });

  // Use a keyRef to ensure that `storeValue` maintains referential integrity
  const keyRef = useRef(key);
  keyRef.current = key;

  const storeValue = useCallback((newValue) => {
    try {
      const json = JSON.stringify(newValue);
      // eslint-disable-next-line local/no-forbidden-terms
      self.localStorage?.setItem(keyRef.current, json);
    } catch (err) {
      // warning: could not write to local storage
    }
    setValue(newValue);
  }, []);

  return [value, storeValue];
}
