import {useCallback, useRef, useState} from '#preact';

// eslint-disable-next-line local/no-forbidden-terms, local/no-global
const storage = window.localStorage;

/**
 * @param {string} key
 * @param {any} [defaultValue]
 * @return {{ "0": any, "1": function(any): void }}
 */
export function useLocalStorage(key, defaultValue) {
  // Keep track of the state locally:
  const [value, setValue] = useState(() => {
    const json = storage.getItem(key);
    return json === undefined ? defaultValue : JSON.parse(json);
  });

  // Use a keyRef to ensure that `storeValue` maintains referential integrity
  const keyRef = useRef(key);
  keyRef.current = key;

  const storeValue = useCallback((newValue) => {
    const json = JSON.stringify(newValue);
    storage.setItem(keyRef.current, json);
    setValue(newValue);
  }, []);

  return [value, storeValue];
}
