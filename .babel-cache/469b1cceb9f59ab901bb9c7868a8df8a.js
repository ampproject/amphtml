function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/** @typedef {!Array<{query: ?MediaQueryList, value: string}>} */
var ExprDef;
var TRUE_VALUE = '1';
export var MediaQueryProps = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {function()} callback
   */
  function MediaQueryProps(win, callback) {
    _classCallCheck(this, MediaQueryProps);

    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.callback_ = callback;

    /** @private {!Object<string, !ExprDef>} */
    this.exprMap_ = {};

    /** @private {?Object<string, !ExprDef>} */
    this.prevExprMap_ = null;
  }

  /**
   * Starts the resolution pass. After the pass is complete the new queries
   * will be tracked and the old queries will be untracked.
   */
  _createClass(MediaQueryProps, [{
    key: "start",
    value: function start() {
      this.prevExprMap_ = this.exprMap_;
      this.exprMap_ = {};
    }
    /**
     * @param {string} queryString
     * @return {boolean} value
     */

  }, {
    key: "resolveMatchQuery",
    value: function resolveMatchQuery(queryString) {
      // This will create a list query like this:
      // `[{query: matchMedia(queryString), value: true}, {query: null, value: false}]`
      return this.resolve_(queryString, parseMediaQueryMatchExpr, TRUE_VALUE) === TRUE_VALUE;
    }
    /**
     * @param {string} exprString
     * @return {string} value
     */

  }, {
    key: "resolveListQuery",
    value: function resolveListQuery(exprString) {
      return this.resolve_(exprString, parseMediaQueryListExpr, '');
    }
    /**
     * Completes the resolution pass. The new queries are tracked for changes
     * and the old queries are untracked.
     */

  }, {
    key: "complete",
    value: function complete() {
      for (var k in this.prevExprMap_) {
        if (!(k in this.exprMap_)) {
          toggleOnChange(this.prevExprMap_[k], this.callback_, false);
        }
      }

      this.prevExprMap_ = null;
    }
    /**
     * Stops tracking of all queries.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      for (var k in this.exprMap_) {
        toggleOnChange(this.exprMap_[k], this.callback_, false);
      }

      this.exprMap_ = {};
    }
    /**
     * @param {string} exprString
     * @param {function(!Window, string):!ExprDef} parser
     * @param {string} emptyExprValue
     * @return {string} value
     */

  }, {
    key: "resolve_",
    value: function resolve_(exprString, parser, emptyExprValue) {
      if (!exprString.trim()) {
        return emptyExprValue;
      }

      var expr = this.exprMap_[exprString] || this.prevExprMap_[exprString];

      if (!expr) {
        expr = parser(this.win_, exprString);
        toggleOnChange(expr, this.callback_, true);
      }

      this.exprMap_[exprString] = expr;
      return resolveMediaQueryListExpr(expr);
    }
  }]);

  return MediaQueryProps;
}();

/**
 * @param {!Window} win
 * @param {string} queryString
 * @return {!ExprDef}
 */
function parseMediaQueryMatchExpr(win, queryString) {
  var query = win.matchMedia(queryString);
  return [{
    query: query,
    value: TRUE_VALUE
  }, {
    query: null,
    value: ''
  }];
}

/**
 * @param {!Window} win
 * @param {string} exprString
 * @return {!ExprDef}
 */
function parseMediaQueryListExpr(win, exprString) {
  return exprString.split(',').map(function (part) {
    part = part.replace(/\s+/g, ' ').trim();

    if (part.length == 0) {
      return;
    }

    var queryString;
    var value;
    // Process the expression from the end.
    var lastChar = part.charAt(part.length - 1);
    var div;

    if (lastChar == ')') {
      // Value is the CSS function, e.g. `calc(50vw + 10px)`.
      // First, skip to the opening paren.
      var parens = 1;
      div = part.length - 2;

      for (; div >= 0; div--) {
        var c = part.charAt(div);

        if (c == '(') {
          parens--;
        } else if (c == ')') {
          parens++;
        }

        if (parens == 0) {
          break;
        }
      }

      // Then, skip to the begining to the function's name.
      var funcEnd = div - 1;

      if (div > 0) {
        div--;

        for (; div >= 0; div--) {
          var _c = part.charAt(div);

          if (!(_c == '%' || _c == '-' || _c == '_' || _c >= 'a' && _c <= 'z' || _c >= 'A' && _c <= 'Z' || _c >= '0' && _c <= '9')) {
            break;
          }
        }
      }

      if (div >= funcEnd) {
        // Invalid condition.
        return null;
      }
    } else {
      // Value is the length or a percent: accept a wide range of values,
      // including invalid values - they will be later asserted to conform
      // to exact CSS length or percent value.
      div = part.length - 2;

      for (; div >= 0; div--) {
        var _c2 = part.charAt(div);

        if (!(_c2 == '%' || _c2 == '.' || _c2 >= 'a' && _c2 <= 'z' || _c2 >= 'A' && _c2 <= 'Z' || _c2 >= '0' && _c2 <= '9')) {
          break;
        }
      }
    }

    if (div >= 0) {
      queryString = part.substring(0, div + 1).trim();
      value = part.substring(div + 1).trim();
    } else {
      value = part;
      queryString = undefined;
    }

    if (!value) {
      return null;
    }

    var query = queryString ? win.matchMedia(queryString) : null;
    return {
      query: query,
      value: value
    };
  }) // Remove any items that did not match the regex above and are
  // undefined as a result.
  .filter(Boolean);
}

/**
 * @param {!ExprDef} expr
 * @return {string} value
 */
function resolveMediaQueryListExpr(expr) {
  for (var i = 0; i < expr.length; i++) {
    var _expr$i = expr[i],
        query = _expr$i.query,
        value = _expr$i.value;

    if (!query || query.matches) {
      return value;
    }
  }

  return '';
}

/**
 * @param {!ExprDef} expr
 * @param {function()} callback
 * @param {boolean} on
 */
function toggleOnChange(expr, callback, on) {
  for (var i = 0; i < expr.length; i++) {
    var query = expr[i].query;

    if (query) {
      // The `onchange` API is preferred, but the IE only supports
      // the `addListener/removeListener` APIs.
      if (query.onchange !== undefined) {
        query.onchange = on ? callback : null;
      } else {
        if (on) {
          query.addListener(callback);
        } else {
          query.removeListener(callback);
        }
      }
    }
  }
}

/**
 * Detect prefers-reduced-motion.
 * Native animations will not run when a device is set up to reduced motion.
 * In that case, we need to disable all animation treatment, and whatever
 * setup changes that depend on an animation running later on.
 * @param {!Window} win
 * @return {boolean}
 */
export function prefersReducedMotion(win) {
  var _win$matchMedia;

  return !!((_win$matchMedia = win.matchMedia('(prefers-reduced-motion: reduce)')) != null && _win$matchMedia.matches);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lZGlhLXF1ZXJ5LXByb3BzLmpzIl0sIm5hbWVzIjpbIkV4cHJEZWYiLCJUUlVFX1ZBTFVFIiwiTWVkaWFRdWVyeVByb3BzIiwid2luIiwiY2FsbGJhY2siLCJ3aW5fIiwiY2FsbGJhY2tfIiwiZXhwck1hcF8iLCJwcmV2RXhwck1hcF8iLCJxdWVyeVN0cmluZyIsInJlc29sdmVfIiwicGFyc2VNZWRpYVF1ZXJ5TWF0Y2hFeHByIiwiZXhwclN0cmluZyIsInBhcnNlTWVkaWFRdWVyeUxpc3RFeHByIiwiayIsInRvZ2dsZU9uQ2hhbmdlIiwicGFyc2VyIiwiZW1wdHlFeHByVmFsdWUiLCJ0cmltIiwiZXhwciIsInJlc29sdmVNZWRpYVF1ZXJ5TGlzdEV4cHIiLCJxdWVyeSIsIm1hdGNoTWVkaWEiLCJ2YWx1ZSIsInNwbGl0IiwibWFwIiwicGFydCIsInJlcGxhY2UiLCJsZW5ndGgiLCJsYXN0Q2hhciIsImNoYXJBdCIsImRpdiIsInBhcmVucyIsImMiLCJmdW5jRW5kIiwic3Vic3RyaW5nIiwidW5kZWZpbmVkIiwiZmlsdGVyIiwiQm9vbGVhbiIsImkiLCJtYXRjaGVzIiwib24iLCJvbmNoYW5nZSIsImFkZExpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJwcmVmZXJzUmVkdWNlZE1vdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSUEsT0FBSjtBQUVBLElBQU1DLFVBQVUsR0FBRyxHQUFuQjtBQUVBLFdBQWFDLGVBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNFLDJCQUFZQyxHQUFaLEVBQWlCQyxRQUFqQixFQUEyQjtBQUFBOztBQUN6QjtBQUNBLFNBQUtDLElBQUwsR0FBWUYsR0FBWjs7QUFFQTtBQUNBLFNBQUtHLFNBQUwsR0FBaUJGLFFBQWpCOztBQUVBO0FBQ0EsU0FBS0csUUFBTCxHQUFn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LENBQUNvQixDQUFELENBQXBCLENBQU9sQixLQUFQOztBQUNBLFFBQUlBLEtBQUosRUFBVztBQUNUO0FBQ0E7QUFDQSxVQUFJQSxLQUFLLENBQUNxQixRQUFOLEtBQW1CTixTQUF2QixFQUFrQztBQUNoQ2YsUUFBQUEsS0FBSyxDQUFDcUIsUUFBTixHQUFpQkQsRUFBRSxHQUFHckMsUUFBSCxHQUFjLElBQWpDO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSXFDLEVBQUosRUFBUTtBQUNOcEIsVUFBQUEsS0FBSyxDQUFDc0IsV0FBTixDQUFrQnZDLFFBQWxCO0FBQ0QsU0FGRCxNQUVPO0FBQ0xpQixVQUFBQSxLQUFLLENBQUN1QixjQUFOLENBQXFCeEMsUUFBckI7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNGOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVN5QyxvQkFBVCxDQUE4QjFDLEdBQTlCLEVBQW1DO0FBQUE7O0FBQ3hDLFNBQU8sQ0FBQyxxQkFBQ0EsR0FBRyxDQUFDbUIsVUFBSixDQUFlLGtDQUFmLENBQUQsYUFBQyxnQkFBb0RrQixPQUFyRCxDQUFSO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqIEB0eXBlZGVmIHshQXJyYXk8e3F1ZXJ5OiA/TWVkaWFRdWVyeUxpc3QsIHZhbHVlOiBzdHJpbmd9Pn0gKi9cbmxldCBFeHByRGVmO1xuXG5jb25zdCBUUlVFX1ZBTFVFID0gJzEnO1xuXG5leHBvcnQgY2xhc3MgTWVkaWFRdWVyeVByb3BzIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gY2FsbGJhY2tcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgY2FsbGJhY2spIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMuY2FsbGJhY2tfID0gY2FsbGJhY2s7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAhRXhwckRlZj59ICovXG4gICAgdGhpcy5leHByTWFwXyA9IHt9O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/T2JqZWN0PHN0cmluZywgIUV4cHJEZWY+fSAqL1xuICAgIHRoaXMucHJldkV4cHJNYXBfID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHJlc29sdXRpb24gcGFzcy4gQWZ0ZXIgdGhlIHBhc3MgaXMgY29tcGxldGUgdGhlIG5ldyBxdWVyaWVzXG4gICAqIHdpbGwgYmUgdHJhY2tlZCBhbmQgdGhlIG9sZCBxdWVyaWVzIHdpbGwgYmUgdW50cmFja2VkLlxuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5wcmV2RXhwck1hcF8gPSB0aGlzLmV4cHJNYXBfO1xuICAgIHRoaXMuZXhwck1hcF8gPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlTdHJpbmdcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdmFsdWVcbiAgICovXG4gIHJlc29sdmVNYXRjaFF1ZXJ5KHF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gVGhpcyB3aWxsIGNyZWF0ZSBhIGxpc3QgcXVlcnkgbGlrZSB0aGlzOlxuICAgIC8vIGBbe3F1ZXJ5OiBtYXRjaE1lZGlhKHF1ZXJ5U3RyaW5nKSwgdmFsdWU6IHRydWV9LCB7cXVlcnk6IG51bGwsIHZhbHVlOiBmYWxzZX1dYFxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnJlc29sdmVfKHF1ZXJ5U3RyaW5nLCBwYXJzZU1lZGlhUXVlcnlNYXRjaEV4cHIsIFRSVUVfVkFMVUUpID09PVxuICAgICAgVFJVRV9WQUxVRVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJTdHJpbmdcbiAgICogQHJldHVybiB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgcmVzb2x2ZUxpc3RRdWVyeShleHByU3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZV8oZXhwclN0cmluZywgcGFyc2VNZWRpYVF1ZXJ5TGlzdEV4cHIsICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV0ZXMgdGhlIHJlc29sdXRpb24gcGFzcy4gVGhlIG5ldyBxdWVyaWVzIGFyZSB0cmFja2VkIGZvciBjaGFuZ2VzXG4gICAqIGFuZCB0aGUgb2xkIHF1ZXJpZXMgYXJlIHVudHJhY2tlZC5cbiAgICovXG4gIGNvbXBsZXRlKCkge1xuICAgIGZvciAoY29uc3QgayBpbiB0aGlzLnByZXZFeHByTWFwXykge1xuICAgICAgaWYgKCEoayBpbiB0aGlzLmV4cHJNYXBfKSkge1xuICAgICAgICB0b2dnbGVPbkNoYW5nZSh0aGlzLnByZXZFeHByTWFwX1trXSwgdGhpcy5jYWxsYmFja18sIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wcmV2RXhwck1hcF8gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHRyYWNraW5nIG9mIGFsbCBxdWVyaWVzLlxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBmb3IgKGNvbnN0IGsgaW4gdGhpcy5leHByTWFwXykge1xuICAgICAgdG9nZ2xlT25DaGFuZ2UodGhpcy5leHByTWFwX1trXSwgdGhpcy5jYWxsYmFja18sIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5leHByTWFwXyA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHByU3RyaW5nXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVdpbmRvdywgc3RyaW5nKTohRXhwckRlZn0gcGFyc2VyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlbXB0eUV4cHJWYWx1ZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHZhbHVlXG4gICAqL1xuICByZXNvbHZlXyhleHByU3RyaW5nLCBwYXJzZXIsIGVtcHR5RXhwclZhbHVlKSB7XG4gICAgaWYgKCFleHByU3RyaW5nLnRyaW0oKSkge1xuICAgICAgcmV0dXJuIGVtcHR5RXhwclZhbHVlO1xuICAgIH1cbiAgICBsZXQgZXhwciA9IHRoaXMuZXhwck1hcF9bZXhwclN0cmluZ10gfHwgdGhpcy5wcmV2RXhwck1hcF9bZXhwclN0cmluZ107XG4gICAgaWYgKCFleHByKSB7XG4gICAgICBleHByID0gcGFyc2VyKHRoaXMud2luXywgZXhwclN0cmluZyk7XG4gICAgICB0b2dnbGVPbkNoYW5nZShleHByLCB0aGlzLmNhbGxiYWNrXywgdHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMuZXhwck1hcF9bZXhwclN0cmluZ10gPSBleHByO1xuICAgIHJldHVybiByZXNvbHZlTWVkaWFRdWVyeUxpc3RFeHByKGV4cHIpO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVN0cmluZ1xuICogQHJldHVybiB7IUV4cHJEZWZ9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlTWVkaWFRdWVyeU1hdGNoRXhwcih3aW4sIHF1ZXJ5U3RyaW5nKSB7XG4gIGNvbnN0IHF1ZXJ5ID0gd2luLm1hdGNoTWVkaWEocXVlcnlTdHJpbmcpO1xuICByZXR1cm4gW1xuICAgIHtxdWVyeSwgdmFsdWU6IFRSVUVfVkFMVUV9LFxuICAgIHtxdWVyeTogbnVsbCwgdmFsdWU6ICcnfSxcbiAgXTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmd9IGV4cHJTdHJpbmdcbiAqIEByZXR1cm4geyFFeHByRGVmfVxuICovXG5mdW5jdGlvbiBwYXJzZU1lZGlhUXVlcnlMaXN0RXhwcih3aW4sIGV4cHJTdHJpbmcpIHtcbiAgcmV0dXJuIChcbiAgICBleHByU3RyaW5nXG4gICAgICAuc3BsaXQoJywnKVxuICAgICAgLm1hcCgocGFydCkgPT4ge1xuICAgICAgICBwYXJ0ID0gcGFydC5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xuICAgICAgICBpZiAocGFydC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBxdWVyeVN0cmluZztcbiAgICAgICAgbGV0IHZhbHVlO1xuXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIGV4cHJlc3Npb24gZnJvbSB0aGUgZW5kLlxuICAgICAgICBjb25zdCBsYXN0Q2hhciA9IHBhcnQuY2hhckF0KHBhcnQubGVuZ3RoIC0gMSk7XG4gICAgICAgIGxldCBkaXY7XG4gICAgICAgIGlmIChsYXN0Q2hhciA9PSAnKScpIHtcbiAgICAgICAgICAvLyBWYWx1ZSBpcyB0aGUgQ1NTIGZ1bmN0aW9uLCBlLmcuIGBjYWxjKDUwdncgKyAxMHB4KWAuXG5cbiAgICAgICAgICAvLyBGaXJzdCwgc2tpcCB0byB0aGUgb3BlbmluZyBwYXJlbi5cbiAgICAgICAgICBsZXQgcGFyZW5zID0gMTtcbiAgICAgICAgICBkaXYgPSBwYXJ0Lmxlbmd0aCAtIDI7XG4gICAgICAgICAgZm9yICg7IGRpdiA+PSAwOyBkaXYtLSkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHBhcnQuY2hhckF0KGRpdik7XG4gICAgICAgICAgICBpZiAoYyA9PSAnKCcpIHtcbiAgICAgICAgICAgICAgcGFyZW5zLS07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT0gJyknKSB7XG4gICAgICAgICAgICAgIHBhcmVucysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmVucyA9PSAwKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRoZW4sIHNraXAgdG8gdGhlIGJlZ2luaW5nIHRvIHRoZSBmdW5jdGlvbidzIG5hbWUuXG4gICAgICAgICAgY29uc3QgZnVuY0VuZCA9IGRpdiAtIDE7XG4gICAgICAgICAgaWYgKGRpdiA+IDApIHtcbiAgICAgICAgICAgIGRpdi0tO1xuICAgICAgICAgICAgZm9yICg7IGRpdiA+PSAwOyBkaXYtLSkge1xuICAgICAgICAgICAgICBjb25zdCBjID0gcGFydC5jaGFyQXQoZGl2KTtcbiAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICEoXG4gICAgICAgICAgICAgICAgICBjID09ICclJyB8fFxuICAgICAgICAgICAgICAgICAgYyA9PSAnLScgfHxcbiAgICAgICAgICAgICAgICAgIGMgPT0gJ18nIHx8XG4gICAgICAgICAgICAgICAgICAoYyA+PSAnYScgJiYgYyA8PSAneicpIHx8XG4gICAgICAgICAgICAgICAgICAoYyA+PSAnQScgJiYgYyA8PSAnWicpIHx8XG4gICAgICAgICAgICAgICAgICAoYyA+PSAnMCcgJiYgYyA8PSAnOScpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZGl2ID49IGZ1bmNFbmQpIHtcbiAgICAgICAgICAgIC8vIEludmFsaWQgY29uZGl0aW9uLlxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFZhbHVlIGlzIHRoZSBsZW5ndGggb3IgYSBwZXJjZW50OiBhY2NlcHQgYSB3aWRlIHJhbmdlIG9mIHZhbHVlcyxcbiAgICAgICAgICAvLyBpbmNsdWRpbmcgaW52YWxpZCB2YWx1ZXMgLSB0aGV5IHdpbGwgYmUgbGF0ZXIgYXNzZXJ0ZWQgdG8gY29uZm9ybVxuICAgICAgICAgIC8vIHRvIGV4YWN0IENTUyBsZW5ndGggb3IgcGVyY2VudCB2YWx1ZS5cbiAgICAgICAgICBkaXYgPSBwYXJ0Lmxlbmd0aCAtIDI7XG4gICAgICAgICAgZm9yICg7IGRpdiA+PSAwOyBkaXYtLSkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHBhcnQuY2hhckF0KGRpdik7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICEoXG4gICAgICAgICAgICAgICAgYyA9PSAnJScgfHxcbiAgICAgICAgICAgICAgICBjID09ICcuJyB8fFxuICAgICAgICAgICAgICAgIChjID49ICdhJyAmJiBjIDw9ICd6JykgfHxcbiAgICAgICAgICAgICAgICAoYyA+PSAnQScgJiYgYyA8PSAnWicpIHx8XG4gICAgICAgICAgICAgICAgKGMgPj0gJzAnICYmIGMgPD0gJzknKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkaXYgPj0gMCkge1xuICAgICAgICAgIHF1ZXJ5U3RyaW5nID0gcGFydC5zdWJzdHJpbmcoMCwgZGl2ICsgMSkudHJpbSgpO1xuICAgICAgICAgIHZhbHVlID0gcGFydC5zdWJzdHJpbmcoZGl2ICsgMSkudHJpbSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gcGFydDtcbiAgICAgICAgICBxdWVyeVN0cmluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gcXVlcnlTdHJpbmcgPyB3aW4ubWF0Y2hNZWRpYShxdWVyeVN0cmluZykgOiBudWxsO1xuICAgICAgICByZXR1cm4ge3F1ZXJ5LCB2YWx1ZX07XG4gICAgICB9KVxuICAgICAgLy8gUmVtb3ZlIGFueSBpdGVtcyB0aGF0IGRpZCBub3QgbWF0Y2ggdGhlIHJlZ2V4IGFib3ZlIGFuZCBhcmVcbiAgICAgIC8vIHVuZGVmaW5lZCBhcyBhIHJlc3VsdC5cbiAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFeHByRGVmfSBleHByXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVNZWRpYVF1ZXJ5TGlzdEV4cHIoZXhwcikge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHIubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB7cXVlcnksIHZhbHVlfSA9IGV4cHJbaV07XG4gICAgaWYgKCFxdWVyeSB8fCBxdWVyeS5tYXRjaGVzKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiAnJztcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFeHByRGVmfSBleHByXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGNhbGxiYWNrXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9uXG4gKi9cbmZ1bmN0aW9uIHRvZ2dsZU9uQ2hhbmdlKGV4cHIsIGNhbGxiYWNrLCBvbikge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cHIubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB7cXVlcnl9ID0gZXhwcltpXTtcbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIC8vIFRoZSBgb25jaGFuZ2VgIEFQSSBpcyBwcmVmZXJyZWQsIGJ1dCB0aGUgSUUgb25seSBzdXBwb3J0c1xuICAgICAgLy8gdGhlIGBhZGRMaXN0ZW5lci9yZW1vdmVMaXN0ZW5lcmAgQVBJcy5cbiAgICAgIGlmIChxdWVyeS5vbmNoYW5nZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHF1ZXJ5Lm9uY2hhbmdlID0gb24gPyBjYWxsYmFjayA6IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob24pIHtcbiAgICAgICAgICBxdWVyeS5hZGRMaXN0ZW5lcihjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcXVlcnkucmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGV0ZWN0IHByZWZlcnMtcmVkdWNlZC1tb3Rpb24uXG4gKiBOYXRpdmUgYW5pbWF0aW9ucyB3aWxsIG5vdCBydW4gd2hlbiBhIGRldmljZSBpcyBzZXQgdXAgdG8gcmVkdWNlZCBtb3Rpb24uXG4gKiBJbiB0aGF0IGNhc2UsIHdlIG5lZWQgdG8gZGlzYWJsZSBhbGwgYW5pbWF0aW9uIHRyZWF0bWVudCwgYW5kIHdoYXRldmVyXG4gKiBzZXR1cCBjaGFuZ2VzIHRoYXQgZGVwZW5kIG9uIGFuIGFuaW1hdGlvbiBydW5uaW5nIGxhdGVyIG9uLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVmZXJzUmVkdWNlZE1vdGlvbih3aW4pIHtcbiAgcmV0dXJuICEhd2luLm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJyk/Lm1hdGNoZXM7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/dom/media-query-props.js