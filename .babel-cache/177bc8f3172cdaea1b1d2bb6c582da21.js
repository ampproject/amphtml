function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { map } from "../types/object";

/**
 * @template T
 */
export var LruCache = /*#__PURE__*/function () {
  /**
   * @param {number} capacity
   */
  function LruCache(capacity) {
    _classCallCheck(this, LruCache);

    /** @private @const {number} */
    this.capacity_ = capacity;

    /** @private {number} */
    this.size_ = 0;

    /**
     * An incrementing counter to define the last access.
     * @private {number}
     */
    this.access_ = 0;

    /** @private {!Object<(number|string), {payload: T, access: number}>} */
    this.cache_ = map();
  }

  /**
   * Returns whether key is cached.
   *
   * @param {number|string} key
   * @return {boolean}
   */
  _createClass(LruCache, [{
    key: "has",
    value: function has(key) {
      return !!this.cache_[key];
    }
    /**
     * @param {number|string} key
     * @return {T} The cached payload.
     */

  }, {
    key: "get",
    value: function get(key) {
      var cacheable = this.cache_[key];

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

  }, {
    key: "put",
    value: function put(key, payload) {
      if (!this.has(key)) {
        this.size_++;
      }

      this.cache_[key] = {
        payload: payload,
        access: this.access_
      };
      this.evict_();
    }
    /**
     * Evicts the oldest cache entry, if we've exceeded capacity.
     */

  }, {
    key: "evict_",
    value: function evict_() {
      if (this.size_ <= this.capacity_) {
        return;
      }

      var cache = this.cache_;
      var oldest = this.access_ + 1;
      var oldestKey;

      for (var key in cache) {
        var access = cache[key].access;

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
  }]);

  return LruCache;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxydS1jYWNoZS5qcyJdLCJuYW1lcyI6WyJtYXAiLCJMcnVDYWNoZSIsImNhcGFjaXR5IiwiY2FwYWNpdHlfIiwic2l6ZV8iLCJhY2Nlc3NfIiwiY2FjaGVfIiwia2V5IiwiY2FjaGVhYmxlIiwiYWNjZXNzIiwicGF5bG9hZCIsInVuZGVmaW5lZCIsImhhcyIsImV2aWN0XyIsImNhY2hlIiwib2xkZXN0Iiwib2xkZXN0S2V5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxHQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLFFBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSxvQkFBWUMsUUFBWixFQUFzQjtBQUFBOztBQUNwQjtBQUNBLFNBQUtDLFNBQUwsR0FBaUJELFFBQWpCOztBQUVBO0FBQ0EsU0FBS0UsS0FBTCxHQUFhLENBQWI7O0FBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDSSxTQUFLQyxPQUFMLEdBQWUsQ0FBZjs7QUFFQTtBQUNBLFNBQUtDLE1BQUwsR0FBY04sR0FBRyxFQUFqQjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTFCQTtBQUFBO0FBQUEsV0EyQkUsYUFBSU8sR0FBSixFQUFTO0FBQ1AsYUFBTyxDQUFDLENBQUMsS0FBS0QsTUFBTCxDQUFZQyxHQUFaLENBQVQ7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQWxDQTtBQUFBO0FBQUEsV0FtQ0UsYUFBSUEsR0FBSixFQUFTO0FBQ1AsVUFBTUMsU0FBUyxHQUFHLEtBQUtGLE1BQUwsQ0FBWUMsR0FBWixDQUFsQjs7QUFDQSxVQUFJQyxTQUFKLEVBQWU7QUFDYkEsUUFBQUEsU0FBUyxDQUFDQyxNQUFWLEdBQW1CLEVBQUUsS0FBS0osT0FBMUI7QUFDQSxlQUFPRyxTQUFTLENBQUNFLE9BQWpCO0FBQ0Q7O0FBQ0QsYUFBT0MsU0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBL0NBO0FBQUE7QUFBQSxXQWdERSxhQUFJSixHQUFKLEVBQVNHLE9BQVQsRUFBa0I7QUFDaEIsVUFBSSxDQUFDLEtBQUtFLEdBQUwsQ0FBU0wsR0FBVCxDQUFMLEVBQW9CO0FBQ2xCLGFBQUtILEtBQUw7QUFDRDs7QUFDRCxXQUFLRSxNQUFMLENBQVlDLEdBQVosSUFBbUI7QUFBQ0csUUFBQUEsT0FBTyxFQUFQQSxPQUFEO0FBQVVELFFBQUFBLE1BQU0sRUFBRSxLQUFLSjtBQUF2QixPQUFuQjtBQUNBLFdBQUtRLE1BQUw7QUFDRDtBQUVEO0FBQ0Y7QUFDQTs7QUExREE7QUFBQTtBQUFBLFdBMkRFLGtCQUFTO0FBQ1AsVUFBSSxLQUFLVCxLQUFMLElBQWMsS0FBS0QsU0FBdkIsRUFBa0M7QUFDaEM7QUFDRDs7QUFFRCxVQUFNVyxLQUFLLEdBQUcsS0FBS1IsTUFBbkI7QUFDQSxVQUFJUyxNQUFNLEdBQUcsS0FBS1YsT0FBTCxHQUFlLENBQTVCO0FBQ0EsVUFBSVcsU0FBSjs7QUFDQSxXQUFLLElBQU1ULEdBQVgsSUFBa0JPLEtBQWxCLEVBQXlCO0FBQ3ZCLFlBQU9MLE1BQVAsR0FBaUJLLEtBQUssQ0FBQ1AsR0FBRCxDQUF0QixDQUFPRSxNQUFQOztBQUNBLFlBQUlBLE1BQU0sR0FBR00sTUFBYixFQUFxQjtBQUNuQkEsVUFBQUEsTUFBTSxHQUFHTixNQUFUO0FBQ0FPLFVBQUFBLFNBQVMsR0FBR1QsR0FBWjtBQUNEO0FBQ0Y7O0FBRUQsVUFBSVMsU0FBUyxLQUFLTCxTQUFsQixFQUE2QjtBQUMzQixlQUFPRyxLQUFLLENBQUNFLFNBQUQsQ0FBWjtBQUNBLGFBQUtaLEtBQUw7QUFDRDtBQUNGO0FBL0VIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHttYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqL1xuZXhwb3J0IGNsYXNzIExydUNhY2hlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjYXBhY2l0eVxuICAgKi9cbiAgY29uc3RydWN0b3IoY2FwYWNpdHkpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtudW1iZXJ9ICovXG4gICAgdGhpcy5jYXBhY2l0eV8gPSBjYXBhY2l0eTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc2l6ZV8gPSAwO1xuXG4gICAgLyoqXG4gICAgICogQW4gaW5jcmVtZW50aW5nIGNvdW50ZXIgdG8gZGVmaW5lIHRoZSBsYXN0IGFjY2Vzcy5cbiAgICAgKiBAcHJpdmF0ZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuYWNjZXNzXyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8KG51bWJlcnxzdHJpbmcpLCB7cGF5bG9hZDogVCwgYWNjZXNzOiBudW1iZXJ9Pn0gKi9cbiAgICB0aGlzLmNhY2hlXyA9IG1hcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBrZXkgaXMgY2FjaGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcnxzdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzKGtleSkge1xuICAgIHJldHVybiAhIXRoaXMuY2FjaGVfW2tleV07XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7VH0gVGhlIGNhY2hlZCBwYXlsb2FkLlxuICAgKi9cbiAgZ2V0KGtleSkge1xuICAgIGNvbnN0IGNhY2hlYWJsZSA9IHRoaXMuY2FjaGVfW2tleV07XG4gICAgaWYgKGNhY2hlYWJsZSkge1xuICAgICAgY2FjaGVhYmxlLmFjY2VzcyA9ICsrdGhpcy5hY2Nlc3NfO1xuICAgICAgcmV0dXJuIGNhY2hlYWJsZS5wYXlsb2FkO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7VH0gcGF5bG9hZCBUaGUgcGF5bG9hZCB0byBjYWNoZS5cbiAgICovXG4gIHB1dChrZXksIHBheWxvYWQpIHtcbiAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMuc2l6ZV8rKztcbiAgICB9XG4gICAgdGhpcy5jYWNoZV9ba2V5XSA9IHtwYXlsb2FkLCBhY2Nlc3M6IHRoaXMuYWNjZXNzX307XG4gICAgdGhpcy5ldmljdF8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmljdHMgdGhlIG9sZGVzdCBjYWNoZSBlbnRyeSwgaWYgd2UndmUgZXhjZWVkZWQgY2FwYWNpdHkuXG4gICAqL1xuICBldmljdF8oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZV8gPD0gdGhpcy5jYXBhY2l0eV8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuY2FjaGVfO1xuICAgIGxldCBvbGRlc3QgPSB0aGlzLmFjY2Vzc18gKyAxO1xuICAgIGxldCBvbGRlc3RLZXk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gY2FjaGUpIHtcbiAgICAgIGNvbnN0IHthY2Nlc3N9ID0gY2FjaGVba2V5XTtcbiAgICAgIGlmIChhY2Nlc3MgPCBvbGRlc3QpIHtcbiAgICAgICAgb2xkZXN0ID0gYWNjZXNzO1xuICAgICAgICBvbGRlc3RLZXkgPSBrZXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9sZGVzdEtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZWxldGUgY2FjaGVbb2xkZXN0S2V5XTtcbiAgICAgIHRoaXMuc2l6ZV8tLTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/data-structures/lru-cache.js