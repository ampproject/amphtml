import {useCallback, useState} from '#preact';

// eslint-disable-next-line local/no-forbidden-terms, local/no-global
const storage = window.localStorage;

/**
 * @param {string} key
 * @param {any} [defaultValue]
 * @return {{ "0": any, "1": function(any): void }}
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const value = storage.getItem(key);
    return value === undefined ? defaultValue : value;
  });

  const storeValue = useCallback(
    (newValue) => {
      storage.setItem(key, newValue);
      setValue(newValue);
    },
    [key]
  );

  return [value, storeValue];
}
