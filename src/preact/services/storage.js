class StorageService {
  /** */
  constructor() {
    // eslint-disable-next-line local/no-forbidden-terms
    this.storage_ = window.localStorage;
  }

  /**
   * @param {string} key
   * @return {Promise<any|undefined>}
   */
  async get(key) {
    const json = this.storage_.getItem(key);
    return json ? JSON.parse(json) : undefined;
  }

  /**
   * @param {string} key
   * @param {any|undefined} value
   * @return {Promise<void>}
   */
  async set(key, value) {
    if (value === undefined) {
      this.storage_.removeItem(key);
    } else {
      const json = JSON.stringify(value);
      this.storage_.setItem(key, json);
    }
  }
}

// eslint-disable-next-line local/no-export-side-effect
export const storageService = new StorageService();
