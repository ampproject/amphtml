import { useCallback, useState } from "#preact";

class StorageService {
  async get(key) {
    const json = window.localStorage.getItem(key);
    return json ? JSON.parse(json) : undefined;
  }
  async set(key, value) {
    if (value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      const json = JSON.stringify(value);
      window.localStorage.setItem(key, json);
    }
  }
}

export const storageService = new StorageService();

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
