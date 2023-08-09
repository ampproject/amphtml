import {map} from '#core/types/object';

/**
 * @template T
 */
export class LruCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    /** @private @const {number} */
    this.capacity_ = capacity;

    /** @private {number} */
    this.size_ = 0;

    /**
     * An incrementing counter to define the last access.
     * @private {number}
     */
    this.access_ = 0;

    /** @private {{[key: (number|string)]: {payload: T, access: number}}} */
    this.cache_ = map();
  }

  /**
   * Returns whether key is cached.
   *
   * @param {number|string} key
   * @return {boolean}
   */
  has(key) {
    return !!this.cache_[key];
  }

  /**
   * @param {number|string} key
   * @return {T|undefined} The cached payload.
   */
  get(key) {
    const cacheable = this.cache_[key];
    if (cacheable) {
      cacheable.access = ++this.access_;
      return cacheable.payload;
    }
    return undefined;
  }

  /**
   * @param {number|string} key
   * @param {T} payload The payload to cache.
   */
  put(key, payload) {
    if (!this.has(key)) {
      this.size_++;
    }
    this.cache_[key] = {payload, access: this.access_};
    this.evict_();
  }

  /**
   * Evicts the oldest cache entry, if we've exceeded capacity.
   */
  evict_() {
    if (this.size_ <= this.capacity_) {
      return;
    }

    const cache = this.cache_;
    let oldest = this.access_ + 1;
    let oldestKey;
    for (const key in cache) {
      const {access} = cache[key];
      if (access < oldest) {
        oldest = access;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      delete cache[oldestKey];
      this.size_--;
    }
  }
}
