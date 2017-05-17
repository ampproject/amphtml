/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {assertHttpsUrl} from '../../../src/url';

const EXTRACT_URL_RE = /url\(\s*['"]?([^()'"]*)['"]?\s*\)/i;
const DATA_URL_RE = /^data\:/i;


/**
 * A base class for all CSS node components defined in the
 * `css-expr-impl.jison`.
 * @abstract
 */
export class CssNode {
  constructor() {}
}


/**
 * A concatenation of CSS expressions: `translateX(...) rotate(...)`,
 * `1s normal`, etc.
 */
export class CssConcatNode extends CssNode {
  /** @param {!Array<!CssNode>=} opt_array */
  constructor(opt_array) {
    super();
    /** @private {!Array<!CssNode>} */
    this.array_ = opt_array || [];
  }

  /**
   * Concatenates two sets of expressions.
   * @param {!CssNode} nodeOrSet
   * @param {!CssNode} otherNodeOrSet
   * @return {!CssConcatNode}
   */
  static concat(nodeOrSet, otherNodeOrSet) {
    let set;
    if (nodeOrSet instanceof CssConcatNode) {
      set = nodeOrSet;
    } else {
      set = new CssConcatNode([nodeOrSet]);
    }
    if (otherNodeOrSet instanceof CssConcatNode) {
      set.array_ = set.array_.concat(otherNodeOrSet.array_);
    } else {
      set.array_.push(otherNodeOrSet);
    }
    return set;
  }
}


/**
 * A CSS expression that's simply passed through from the original expression.
 * Used for `url()`, colors, etc.
 */
export class CssPassthroughNode extends CssNode {
  /** @param {string} css */
  constructor(css) {
    super();
    /** @const @private {string} */
    this.css_ = css;
  }
}


/**
 * Verifies that URL is an HTTPS URL.
 */
export class CssUrlNode extends CssPassthroughNode {
  /** @param {string} css */
  constructor(css) {
    super(css);
    const matches = css.match(EXTRACT_URL_RE);
    if (matches || matches.length > 1) {
      const url = (matches[1] || '').trim();
      if (!url.match(DATA_URL_RE)) {
        assertHttpsUrl(url);
      }
    }
  }
}


/**
 * @abstract
 */
export class CssNumericNode extends CssNode {
  /**
   * @param {string} type
   * @param {number} num
   * @param {string} units
   */
  constructor(type, num, units) {
    super();
    /** @const @private {string} */
    this.type_ = type;
    /** @const @private {number} */
    this.num_ = num;
    /** @const @private {string} */
    this.units_ = units.toLowerCase();
  }
}


/**
 * A CSS number: `100`, `1e2`, `1e-2`, `0.5`, etc.
 */
export class CssNumberNode extends CssNumericNode {
  /** @param {number} num */
  constructor(num) {
    super('NUM', num, '');
  }
}


/**
 * A CSS percent value: `100%`, `0.5%`, etc.
 */
export class CssPercentNode extends CssNumericNode {
  /** @param {number} num */
  constructor(num) {
    super('PRC', num, '%');
  }
}


/**
 * A CSS length value: `100px`, `80vw`, etc.
 */
export class CssLengthNode extends CssNumericNode {
  /**
   * @param {number} num
   * @param {string} units
   */
  constructor(num, units) {
    super('LEN', num, units);
  }
}


/**
 * A CSS angle value: `45deg`, `0.5rad`, etc.
 */
export class CssAngleNode extends CssNumericNode {
  /**
   * @param {number} num
   * @param {string} units
   */
  constructor(num, units) {
    super('ANG', num, units);
  }
}


/**
 * A CSS time value: `1s`, `600ms`.
 */
export class CssTimeNode extends CssNumericNode {
  /**
   * @param {number} num
   * @param {string} units
   */
  constructor(num, units) {
    super('TME', num, units);
  }
}


/**
 * A CSS generic function: `rgb(1, 1, 1)`, `translateX(300px)`, etc.
 */
export class CssFuncNode extends CssNode {
  /**
   * @param {string} name
   * @param {!Array<!CssNode>} args
   */
  constructor(name, args) {
    super();
    /** @const @private {string} */
    this.name_ = name.toLowerCase();
    /** @const @private {!Array<!CssNode>} */
    this.args_ = args;
  }
}


/**
 * A CSS translate family of functions:
 * - `translate(x, y)`
 * - `translateX(x)`
 * - `translateY(y)`
 * - `translateZ(z)`
 * - `translate3d(x, y, z)`
 */
export class CssTranslateNode extends CssFuncNode {
  /**
   * @param {string} suffix
   * @param {!Array<!CssNode>} args
   */
  constructor(suffix, args) {
    super(`translate${suffix}`, args);
    /** @const @private {string} */
    this.suffix_ = suffix;
  }
}


/**
 * A CSS `var()` expression: `var(--name)`, `var(--name, 100px)`, etc.
 * See https://www.w3.org/TR/css-variables/.
 */
export class CssVarNode extends CssNode {
  /**
   * @param {string} varName
   * @param {!CssNode=} opt_def
   */
  constructor(varName, opt_def) {
    super();
    /** @const @private {string} */
    this.varName_ = varName;
    /** @const @private {?CssNode} */
    this.def_ = opt_def || null;
  }
}


/**
 * A CSS `calc()` expression: `calc(100px)`, `calc(80vw - 30em)`, etc.
 * See https://drafts.csswg.org/css-values-3/#calc-notation.
 */
export class CssCalcNode extends CssNode {
  /** @param {!CssNode} expr */
  constructor(expr) {
    super();
    /** @const @private {!CssNode} */
    this.expr_ = expr;
  }
}


/**
 * A CSS `calc()` sum expression: `100px + 20em`, `80vw - 30em`, etc.
 */
export class CssCalcSumNode extends CssNode {
  /**
   * @param {!CssNode} left
   * @param {!CssNode} right
   * @param {string} op Either "+" or "-".
   */
  constructor(left, right, op) {
    super();
    /** @const @private {!CssNode} */
    this.left_ = left;
    /** @const @private {!CssNode} */
    this.right_ = right;
    /** @const @private {string} */
    this.op_ = op;
  }
}


/**
 * A CSS `calc()` product expression: `100px * 2`, `80vw / 2`, etc.
 */
export class CssCalcProductNode extends CssNode {
  /**
   * @param {!CssNode} left
   * @param {!CssNode} right
   * @param {string} op Either "*" or "/".
   */
  constructor(left, right, op) {
    super();
    /** @const @private {!CssNode} */
    this.left_ = left;
    /** @const @private {!CssNode} */
    this.right_ = right;
    /** @const @private {string} */
    this.op_ = op;
  }
}
