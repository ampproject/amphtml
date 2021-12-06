import {useCallback, useState} from '#preact';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const value = localStorage.getItem(key);
    return value === undefined ? defaultValue : value;
  });

  const storeValue = useCallback((newValue) => {
    localStorage.setItem(key, newValue);
    setValue(newValue);
  }, []);

  return [value, storeValue];
}
