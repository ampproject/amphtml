function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function MediaQueryProps(win, callback) {_classCallCheck(this, MediaQueryProps);
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
   */_createClass(MediaQueryProps, [{ key: "start", value:
    function start() {
      this.prevExprMap_ = this.exprMap_;
      this.exprMap_ = {};
    }

    /**
     * @param {string} queryString
     * @return {boolean} value
     */ }, { key: "resolveMatchQuery", value:
    function resolveMatchQuery(queryString) {
      // This will create a list query like this:
      // `[{query: matchMedia(queryString), value: true}, {query: null, value: false}]`
      return (
      this.resolve_(queryString, parseMediaQueryMatchExpr, TRUE_VALUE) ===
      TRUE_VALUE);

    }

    /**
     * @param {string} exprString
     * @return {string} value
     */ }, { key: "resolveListQuery", value:
    function resolveListQuery(exprString) {
      return this.resolve_(exprString, parseMediaQueryListExpr, '');
    }

    /**
     * Completes the resolution pass. The new queries are tracked for changes
     * and the old queries are untracked.
     */ }, { key: "complete", value:
    function complete() {
      for (var k in this.prevExprMap_) {
        if (!(k in this.exprMap_)) {
          toggleOnChange(this.prevExprMap_[k], this.callback_, false);
        }
      }
      this.prevExprMap_ = null;
    }

    /**
     * Stops tracking of all queries.
     */ }, { key: "dispose", value:
    function dispose() {
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
     */ }, { key: "resolve_", value:
    function resolve_(exprString, parser, emptyExprValue) {
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
    } }]);return MediaQueryProps;}();


/**
 * @param {!Window} win
 * @param {string} queryString
 * @return {!ExprDef}
 */
function parseMediaQueryMatchExpr(win, queryString) {
  var query = win.matchMedia(queryString);
  return [
  { query: query, value: TRUE_VALUE },
  { query: null, value: '' }];

}

/**
 * @param {!Window} win
 * @param {string} exprString
 * @return {!ExprDef}
 */
function parseMediaQueryListExpr(win, exprString) {
  return (
  exprString.
  split(',').
  map(function (part) {
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
          if (
          !(
          _c == '%' ||
          _c == '-' ||
          _c == '_' || (
          _c >= 'a' && _c <= 'z') || (
          _c >= 'A' && _c <= 'Z') || (
          _c >= '0' && _c <= '9')))

          {
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
        if (
        !(
        _c2 == '%' ||
        _c2 == '.' || (
        _c2 >= 'a' && _c2 <= 'z') || (
        _c2 >= 'A' && _c2 <= 'Z') || (
        _c2 >= '0' && _c2 <= '9')))

        {
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
    return { query: query, value: value };
  })
  // Remove any items that did not match the regex above and are
  // undefined as a result.
  .filter(Boolean));

}

/**
 * @param {!ExprDef} expr
 * @return {string} value
 */
function resolveMediaQueryListExpr(expr) {
  for (var i = 0; i < expr.length; i++) {
    var _expr$i = expr[i],query = _expr$i.query,value = _expr$i.value;
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
export function prefersReducedMotion(win) {var _win$matchMedia;
  return !!(((_win$matchMedia = win.matchMedia('(prefers-reduced-motion: reduce)')) !== null && _win$matchMedia !== void 0) && _win$matchMedia.matches);
}
// /Users/mszylkowski/src/amphtml/src/core/dom/media-query-props.js