import {devAssert} from '#core/assert';

/** @typedef {Array<{query: ?MediaQueryList, value: string}>} ExprDef */

const TRUE_VALUE = '1';

export class MediaQueryProps {
  /**
   * @param {Window} win
   * @param {function():void} callback
   */
  constructor(win, callback) {
    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.callback_ = callback;

    /**
     * @type {{[key: string]: ExprDef}}
     * @private
     */
    this.exprMap_ = {};

    /**
     * @type {?{[key: string]: ExprDef}}
     * @private
     */
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
    // `[{query: matchMedia(queryHeadString), value: true}, {query: null, value: false}]`
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
   * @param {function(Window, string):ExprDef} parser
   * @param {string} emptyExprValue
   * @return {string} value
   */
  resolve_(exprString, parser, emptyExprValue) {
    if (!exprString.trim()) {
      return emptyExprValue;
    }
    let expr = this.exprMap_[exprString];
    if (!expr) {
      devAssert(this.prevExprMap_);
      expr = this.prevExprMap_[exprString];
    }
    if (!expr) {
      expr = parser(this.win_, exprString);
      toggleOnChange(expr, this.callback_, true);
    }
    this.exprMap_[exprString] = expr;
    return resolveMediaQueryListExpr(expr);
  }
}

/**
 * @param {Window} win
 * @param {string} queryString
 * @return {ExprDef}
 */
function parseMediaQueryMatchExpr(win, queryString) {
  const query = win.matchMedia(queryString);
  return [
    {query, value: TRUE_VALUE},
    {query: null, value: ''},
  ];
}

/**
 * @param {Window} win
 * @param {string} exprString
 * @return {ExprDef}
 */
function parseMediaQueryListExpr(win, exprString) {
  return /** @type {ExprDef} */ (
    exprString
      .split(',')
      .map((part) => {
        part = part.replace(/\s+/g, ' ').trim();
        if (part.length == 0) {
          return;
        }

        let queryString;
        let value;

        // Process the expression from the end.
        const lastChar = part.charAt(part.length - 1);
        let div;
        if (lastChar == ')') {
          // Value is the CSS function, e.g. `calc(50vw + 10px)`.

          // First, skip to the opening paren.
          let parens = 1;
          div = part.length - 2;
          for (; div >= 0; div--) {
            const c = part.charAt(div);
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
          const funcEnd = div - 1;
          if (div > 0) {
            div--;
            for (; div >= 0; div--) {
              const c = part.charAt(div);
              if (
                !(
                  c == '%' ||
                  c == '-' ||
                  c == '_' ||
                  (c >= 'a' && c <= 'z') ||
                  (c >= 'A' && c <= 'Z') ||
                  (c >= '0' && c <= '9')
                )
              ) {
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
            const c = part.charAt(div);
            if (
              !(
                c == '%' ||
                c == '.' ||
                (c >= 'a' && c <= 'z') ||
                (c >= 'A' && c <= 'Z') ||
                (c >= '0' && c <= '9')
              )
            ) {
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

        const query = queryString ? win.matchMedia(queryString) : null;
        return {query, value};
      })
      // Remove any items that did not match the regex above and are
      // undefined as a result.
      .filter(Boolean)
  );
}

/**
 * @param {ExprDef} expr
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
 * @param {ExprDef} expr
 * @param {function():void} callback
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

/**
 * Detect prefers-reduced-motion.
 * Native animations will not run when a device is set up to reduced motion.
 * In that case, we need to disable all animation treatment, and whatever
 * setup changes that depend on an animation running later on.
 * @param {Window} win
 * @return {boolean}
 */
export function prefersReducedMotion(win) {
  return !!win.matchMedia('(prefers-reduced-motion: reduce)')?.matches;
}
