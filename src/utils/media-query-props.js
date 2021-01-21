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
let ExprDef;

const MEDIA_QUERY_VALUE_RE = /[A-Za-z0-9.%]+$/;
const TRUE_VALUE = '1';

export class MediaQueryProps {
  /**
   * @param {!Window} win
   * @param {function()} callback
   */
  constructor(win, callback) {
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
  start() {
    this.prevExprMap_ = this.exprMap_;
    this.exprMap_ = {};
  }

  /**
   * @param {string} queryString
   * @return {boolean} value
   */
  resolveMatchQuery(queryString) {
    // This will create a list query like this:
    // `[{query: matchMedia(queryString), value: true}, {query: null, value: false}]`
    return (
      this.resolve_(queryString, parseMediaQueryMatchExpr, TRUE_VALUE) ===
      TRUE_VALUE
    );
  }

  /**
   * @param {string} exprString
   * @return {string} value
   */
  resolveListQuery(exprString) {
    return this.resolve_(exprString, parseMediaQueryListExpr, '');
  }

  /**
   * Completes the resolution pass. The new queries are tracked for changes
   * and the old queries are untracked.
   */
  complete() {
    for (const k in this.prevExprMap_) {
      if (!(k in this.exprMap_)) {
        toggleOnChange(this.prevExprMap_[k], this.callback_, false);
      }
    }
    this.prevExprMap_ = null;
  }

  /**
   * Stops tracking of all queries.
   */
  dispose() {
    for (const k in this.exprMap_) {
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
  resolve_(exprString, parser, emptyExprValue) {
    if (!exprString || !exprString.trim()) {
      return emptyExprValue;
    }
    let expr = this.exprMap_[exprString] || this.prevExprMap_[exprString];
    if (!expr) {
      expr = parser(this.win_, exprString);
      toggleOnChange(expr, this.callback_, true);
    }
    this.exprMap_[exprString] = expr;
    return resolveMediaQueryListExpr(expr);
  }
}

/**
 * @param {!Window} win
 * @param {string} queryString
 * @return {!ExprDef}
 */
function parseMediaQueryMatchExpr(win, queryString) {
  const query = win.matchMedia(queryString);
  return [
    {query, value: TRUE_VALUE},
    {query: null, value: ''},
  ];
}

/**
 * @param {!Window} win
 * @param {string} exprString
 * @return {!ExprDef}
 */
function parseMediaQueryListExpr(win, exprString) {
  return (
    exprString
      .split(',')
      .map((part) => {
        // Find the value portion by looking at the end.
        const result = MEDIA_QUERY_VALUE_RE.exec(part);
        if (!result) {
          return null;
        }

        const {index} = result;
        const value = part.slice(index);
        // The media query is everything before the value.
        const queryString = part.slice(0, index).trim();
        const query = queryString ? win.matchMedia(queryString) : null;

        return {query, value};
      })
      // Remove any items that did not match the regex above and are
      // undefined as a result.
      .filter((item) => item)
  );
}

/**
 * @param {!ExprDef} expr
 * @return {string} value
 */
function resolveMediaQueryListExpr(expr) {
  for (let i = 0; i < expr.length; i++) {
    const {query, value} = expr[i];
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
  for (let i = 0; i < expr.length; i++) {
    const {query} = expr[i];
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
