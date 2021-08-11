function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import { devAssert } from "../../assert";
export var DetachedDomStream = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {function(!Document):void} onChunk
   * @param {function(!Document):void} onEnd
   */
  function DetachedDomStream(win, onChunk, onEnd) {
    _classCallCheck(this, DetachedDomStream);

    /** @const @private {function(!Document):void} */
    this.onChunk_ = onChunk;

    /** @const @private {function(!Document):void} */
    this.onEnd_ = onEnd;

    /** @const @private {!Document} */
    this.detachedDoc_ = win.document.implementation.createHTMLDocument('');
    this.detachedDoc_.open();

    /** @private {boolean} */
    this.eof_ = false;
  }

  /**
   * Write chunk into detached doc, and call given chunk cb.
   * @public
   * @param {string} chunk
   */
  _createClass(DetachedDomStream, [{
    key: "write",
    value: function write(chunk) {
      devAssert(!this.eof_, 'Detached doc already closed.');

      if (chunk) {
        this.detachedDoc_.write(chunk);
      }

      this.onChunk_(this.detachedDoc_);
    }
    /**
     * Called when stream is finished. Close the detached doc, and call cb.
     * @public
     */

  }, {
    key: "close",
    value: function close() {
      this.eof_ = true;
      this.detachedDoc_.close();
      this.onEnd_(this.detachedDoc_);
    }
  }]);

  return DetachedDomStream;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRldGFjaGVkLmpzIl0sIm5hbWVzIjpbImRldkFzc2VydCIsIkRldGFjaGVkRG9tU3RyZWFtIiwid2luIiwib25DaHVuayIsIm9uRW5kIiwib25DaHVua18iLCJvbkVuZF8iLCJkZXRhY2hlZERvY18iLCJkb2N1bWVudCIsImltcGxlbWVudGF0aW9uIiwiY3JlYXRlSFRNTERvY3VtZW50Iiwib3BlbiIsImVvZl8iLCJjaHVuayIsIndyaXRlIiwiY2xvc2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7QUFFQSxXQUFhQyxpQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDRSw2QkFBWUMsR0FBWixFQUFpQkMsT0FBakIsRUFBMEJDLEtBQTFCLEVBQWlDO0FBQUE7O0FBQy9CO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkYsT0FBaEI7O0FBRUE7QUFDQSxTQUFLRyxNQUFMLEdBQWNGLEtBQWQ7O0FBRUE7QUFDQSxTQUFLRyxZQUFMLEdBQW9CTCxHQUFHLENBQUNNLFFBQUosQ0FBYUMsY0FBYixDQUE0QkMsa0JBQTVCLENBQStDLEVBQS9DLENBQXBCO0FBQ0EsU0FBS0gsWUFBTCxDQUFrQkksSUFBbEI7O0FBRUE7QUFDQSxTQUFLQyxJQUFMLEdBQVksS0FBWjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUF6QkE7QUFBQTtBQUFBLFdBMEJFLGVBQU1DLEtBQU4sRUFBYTtBQUNYYixNQUFBQSxTQUFTLENBQUMsQ0FBQyxLQUFLWSxJQUFQLEVBQWEsOEJBQWIsQ0FBVDs7QUFFQSxVQUFJQyxLQUFKLEVBQVc7QUFDVCxhQUFLTixZQUFMLENBQWtCTyxLQUFsQixDQUF3QkQsS0FBeEI7QUFDRDs7QUFDRCxXQUFLUixRQUFMLENBQWMsS0FBS0UsWUFBbkI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXRDQTtBQUFBO0FBQUEsV0F1Q0UsaUJBQVE7QUFDTixXQUFLSyxJQUFMLEdBQVksSUFBWjtBQUNBLFdBQUtMLFlBQUwsQ0FBa0JRLEtBQWxCO0FBQ0EsV0FBS1QsTUFBTCxDQUFZLEtBQUtDLFlBQWpCO0FBQ0Q7QUEzQ0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2RldkFzc2VydH0gZnJvbSAnI2NvcmUvYXNzZXJ0JztcblxuZXhwb3J0IGNsYXNzIERldGFjaGVkRG9tU3RyZWFtIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIURvY3VtZW50KTp2b2lkfSBvbkNodW5rXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIURvY3VtZW50KTp2b2lkfSBvbkVuZFxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBvbkNodW5rLCBvbkVuZCkge1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge2Z1bmN0aW9uKCFEb2N1bWVudCk6dm9pZH0gKi9cbiAgICB0aGlzLm9uQ2h1bmtfID0gb25DaHVuaztcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge2Z1bmN0aW9uKCFEb2N1bWVudCk6dm9pZH0gKi9cbiAgICB0aGlzLm9uRW5kXyA9IG9uRW5kO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IURvY3VtZW50fSAqL1xuICAgIHRoaXMuZGV0YWNoZWREb2NfID0gd2luLmRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgnJyk7XG4gICAgdGhpcy5kZXRhY2hlZERvY18ub3BlbigpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuZW9mXyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFdyaXRlIGNodW5rIGludG8gZGV0YWNoZWQgZG9jLCBhbmQgY2FsbCBnaXZlbiBjaHVuayBjYi5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge3N0cmluZ30gY2h1bmtcbiAgICovXG4gIHdyaXRlKGNodW5rKSB7XG4gICAgZGV2QXNzZXJ0KCF0aGlzLmVvZl8sICdEZXRhY2hlZCBkb2MgYWxyZWFkeSBjbG9zZWQuJyk7XG5cbiAgICBpZiAoY2h1bmspIHtcbiAgICAgIHRoaXMuZGV0YWNoZWREb2NfLndyaXRlKGNodW5rKTtcbiAgICB9XG4gICAgdGhpcy5vbkNodW5rXyh0aGlzLmRldGFjaGVkRG9jXyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gc3RyZWFtIGlzIGZpbmlzaGVkLiBDbG9zZSB0aGUgZGV0YWNoZWQgZG9jLCBhbmQgY2FsbCBjYi5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5lb2ZfID0gdHJ1ZTtcbiAgICB0aGlzLmRldGFjaGVkRG9jXy5jbG9zZSgpO1xuICAgIHRoaXMub25FbmRfKHRoaXMuZGV0YWNoZWREb2NfKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/dom/stream/detached.js