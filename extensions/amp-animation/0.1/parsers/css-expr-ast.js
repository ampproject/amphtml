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

const FINAL_URL_RE = /^(data|https)\:/i;
const DEG_TO_RAD = (2 * Math.PI) / 360;
const GRAD_TO_RAD = Math.PI / 200;
const VAR_CSS_RE = /(calc|var|url|rand|index|width|height|num|length)\(/i;
const NORM_CSS_RE = /\d(%|em|rem|vw|vh|vmin|vmax|s|deg|grad)/i;
const INFINITY_RE = /^(infinity|infinite)$/i;

/**
 * Returns `true` if the CSS expression contains variable components. The CSS
 * parsing and evaluation is heavy, but used relatively rarely. This method
 * can be used to avoid heavy parse/evaluate tasks.
 * @param {string} css
 * @param {boolean} normalize
 * @return {boolean}
 */
export function isVarCss(css, normalize) {
  return VAR_CSS_RE.test(css) || (normalize && NORM_CSS_RE.test(css));
}

/**
 * An interface that assists in CSS evaluation.
 * @interface
 */
export class CssContext {
  /**
   * Returns a resolved URL. The result must be an allowed URL for execution,
   * with HTTPS restrictions.
   * @param {string} unusedUrl
   * @return {string}
   */
  resolveUrl(unusedUrl) {}

  /**
   * Returns the value of a CSS variable or `null` if not available.
   * @param {string} unusedVarName
   * @return {?CssNode}
   */
  getVar(unusedVarName) {}

  /**
   * Returns the current target's index in the context of other selected
   * targets.
   * @return {number}
   */
  getCurrentIndex() {}

  /**
   * Returns the number of selected targets.
   * @return {number}
   */
  getTargetLength() {}

  /**
   * Returns the current font size.
   * @return {number}
   */
  getCurrentFontSize() {}

  /**
   * Returns the root font size.
   * @return {number}
   */
  getRootFontSize() {}

  /**
   * Returns the viewport size.
   * @return {!{width: number, height: number}}
   */
  getViewportSize() {}

  /**
   * Returns the current element's size.
   * @return {!{width: number, height: number}}
   */
  getCurrentElementSize() {}

  /**
   * Returns the specified element's size.
   * @param {string} unusedSelector
   * @param {?string} unusedSelectionMethod
   * @return {!{width: number, height: number}}
   */
  getElementSize(unusedSelector, unusedSelectionMethod) {}

  /**
   * Returns the dimension: "w" for width or "h" for height.
   * @return {?string}
   */
  getDimension() {}

  /**
   * Pushes the dimension: "w" for width or "h" for height.
   * @param {?string} unusedDim
   * @param {function():T} unusedCallback
   * @return {T}
   * @template T
   */
  withDimension(unusedDim, unusedCallback) {}
}

/**
 * A base class for all CSS node components defined in the
 * `css-expr-impl.jison`.
 * @abstract
 */
export class CssNode {
  /**
   * Creates an instance of CssNode.
   */
  constructor() {}

  /**
   * Returns a string CSS representation.
   * @return {string}
   * @abstract
   */
  css() {}

  /**
   * Resolves the value of all variable components. Only performs any work if
   * variable components exist. As an optimization, this node is returned
   * for a non-variable nodes (`isConst() == true`). Otherwise, `calc()` method
   * is used to calculate the new value.
   * @param {!CssContext} context
   * @param {boolean} normalize
   * @return {?CssNode}
   * @final
   */
  resolve(context, normalize) {
    if (this.isConst(normalize)) {
      return this;
    }
    return this.calc(context, normalize);
  }

  /**
   * Whether the CSS node is a constant or includes variable components.
   * @param {boolean} unusedNormalize
   * @return {boolean}
   * @protected
   */
  isConst(unusedNormalize) {
    return true;
  }

  /**
   * Calculates the value of all variable components.
   * @param {!CssContext} unusedContext
   * @param {boolean} unusedNormalize
   * @return {?CssNode}
   * @protected
   */
  calc(unusedContext, unusedNormalize) {
    return this;
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

  /** @override */
  css() {
    return this.css_;
  }
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

  /** @override */
  css() {
    return this.array_.map(node => node.css()).join(' ');
  }

  /** @override */
  isConst(normalize) {
    return this.array_.reduce(
      (acc, node) => acc && node.isConst(normalize),
      true
    );
  }

  /** @override */
  calc(context, normalize) {
    const resolvedArray = [];
    for (let i = 0; i < this.array_.length; i++) {
      const resolved = this.array_[i].resolve(context, normalize);
      if (resolved) {
        resolvedArray.push(resolved);
      } else {
        // One element is null - the result is null.
        return null;
      }
    }
    return new CssConcatNode(resolvedArray);
  }
}

/**
 * Verifies that URL is an HTTPS URL.
 */
export class CssUrlNode extends CssNode {
  /** @param {string} url */
  constructor(url) {
    super();
    /** @const @private {string} */
    this.url_ = url;
  }

  /** @override */
  css() {
    if (!this.url_) {
      return '';
    }
    return `url("${this.url_}")`;
  }

  /** @override */
  isConst() {
    return !this.url_ || FINAL_URL_RE.test(this.url_);
  }

  /** @override */
  calc(context) {
    const url = context.resolveUrl(this.url_);
    // Return a passthrough CSS to avoid recursive `url()` evaluation.
    return new CssPassthroughNode(`url("${url}")`);
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

  /** @override */
  css() {
    return `${this.num_}${this.units_}`;
  }

  /**
   * @param {number} unusedNum
   * @return {!CssNumericNode}
   * @abstract
   */
  createSameUnits(unusedNum) {}

  /** @override */
  isConst(normalize) {
    return normalize ? this.isNorm() : true;
  }

  /**
   * @return {boolean}
   */
  isNorm() {
    return true;
  }

  /**
   * @param {!CssContext} unusedContext
   * @return {!CssNumericNode}
   */
  norm(unusedContext) {
    return this;
  }

  /** @override */
  calc(context, normalize) {
    return normalize ? this.norm(context) : this;
  }

  /**
   * @param {number} unusedPercent
   * @param {!CssContext} unusedContext
   * @return {!CssNumericNode}
   */
  calcPercent(unusedPercent, unusedContext) {
    throw new Error('cannot calculate percent for ' + this.type_);
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

  /** @override */
  createSameUnits(num) {
    return new CssNumberNode(num);
  }

  /**
   * Returns a numerical value of the node if possible. `Infinity` is one of
   * possible return values.
   * @param {!CssNode} node
   * @return {number|undefined}
   */
  static num(node) {
    if (node instanceof CssNumberNode) {
      return node.num_;
    }
    const css = node.css();
    if (INFINITY_RE.test(css)) {
      return Infinity;
    }
    return undefined;
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

  /** @override */
  createSameUnits(num) {
    return new CssPercentNode(num);
  }

  /** @override */
  isNorm() {
    return false;
  }

  /** @override */
  norm(context) {
    if (context.getDimension()) {
      return new CssLengthNode(0, 'px').calcPercent(this.num_, context);
    }
    return this;
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

  /** @override */
  createSameUnits(num) {
    return new CssLengthNode(num, this.units_);
  }

  /** @override */
  isNorm() {
    return this.units_ == 'px';
  }

  /** @override */
  norm(context) {
    if (this.isNorm()) {
      return this;
    }

    // Font-based: em/rem.
    if (this.units_ == 'em' || this.units_ == 'rem') {
      const fontSize =
        this.units_ == 'em'
          ? context.getCurrentFontSize()
          : context.getRootFontSize();
      return new CssLengthNode(this.num_ * fontSize, 'px');
    }

    // Viewport based: vw, vh, vmin, vmax.
    if (
      this.units_ == 'vw' ||
      this.units_ == 'vh' ||
      this.units_ == 'vmin' ||
      this.units_ == 'vmax'
    ) {
      const vp = context.getViewportSize();
      const vw = (vp.width * this.num_) / 100;
      const vh = (vp.height * this.num_) / 100;
      let num = 0;
      if (this.units_ == 'vw') {
        num = vw;
      } else if (this.units_ == 'vh') {
        num = vh;
      } else if (this.units_ == 'vmin') {
        num = Math.min(vw, vh);
      } else if (this.units_ == 'vmax') {
        num = Math.max(vw, vh);
      }
      return new CssLengthNode(num, 'px');
    }

    // Can't convert cm/in/etc to px at this time.
    throw unknownUnits(this.units_);
  }

  /** @override */
  calcPercent(percent, context) {
    const dim = context.getDimension();
    const size = context.getCurrentElementSize();
    const side = getDimSide(dim, size);
    return new CssLengthNode((side * percent) / 100, 'px');
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

  /** @override */
  createSameUnits(num) {
    return new CssAngleNode(num, this.units_);
  }

  /** @override */
  isNorm() {
    return this.units_ == 'rad';
  }

  /** @override */
  norm() {
    if (this.isNorm()) {
      return this;
    }
    if (this.units_ == 'deg') {
      return new CssAngleNode(this.num_ * DEG_TO_RAD, 'rad');
    }
    if (this.units_ == 'grad') {
      return new CssAngleNode(this.num_ * GRAD_TO_RAD, 'rad');
    }
    throw unknownUnits(this.units_);
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

  /** @override */
  createSameUnits(num) {
    return new CssTimeNode(num, this.units_);
  }

  /** @override */
  isNorm() {
    return this.units_ == 'ms';
  }

  /** @override */
  norm() {
    if (this.isNorm()) {
      return this;
    }
    return new CssTimeNode(this.millis_(), 'ms');
  }

  /**
   * @return {number}
   * @private
   */
  millis_() {
    if (this.units_ == 'ms') {
      return this.num_;
    }
    if (this.units_ == 's') {
      return this.num_ * 1000;
    }
    throw unknownUnits(this.units_);
  }

  /**
   * @param {!CssNode} node
   * @return {number|undefined}
   */
  static millis(node) {
    if (node instanceof CssTimeNode) {
      return node.millis_();
    }
    if (node instanceof CssNumberNode) {
      return node.num_;
    }
    return undefined;
  }
}

/**
 * A CSS generic function: `rgb(1, 1, 1)`, `translateX(300px)`, etc.
 */
export class CssFuncNode extends CssNode {
  /**
   * @param {string} name
   * @param {!Array<!CssNode>} args
   * @param {?Array<string>=} opt_dimensions
   */
  constructor(name, args, opt_dimensions) {
    super();
    /** @const @private {string} */
    this.name_ = name.toLowerCase();
    /** @const @private {!Array<!CssNode>} */
    this.args_ = args;
    /** @const @private {?Array<string>} */
    this.dimensions_ = opt_dimensions || null;
  }

  /** @override */
  css() {
    const args = this.args_.map(node => node.css()).join(',');
    return `${this.name_}(${args})`;
  }

  /** @override */
  isConst(normalize) {
    return this.args_.reduce(
      (acc, node) => acc && node.isConst(normalize),
      true
    );
  }

  /** @override */
  calc(context, normalize) {
    const resolvedArgs = [];
    for (let i = 0; i < this.args_.length; i++) {
      const node = this.args_[i];
      let resolved;
      if (this.dimensions_ && i < this.dimensions_.length) {
        resolved = context.withDimension(this.dimensions_[i], () =>
          node.resolve(context, normalize)
        );
      } else {
        resolved = node.resolve(context, normalize);
      }
      if (resolved) {
        resolvedArgs.push(resolved);
      } else {
        // One argument is null - the function's result is null.
        return null;
      }
    }
    return new CssFuncNode(this.name_, resolvedArgs);
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
    super(
      `translate${suffix.toUpperCase()}`,
      args,
      suffix == ''
        ? ['w', 'h']
        : suffix == 'x'
        ? ['w']
        : suffix == 'y'
        ? ['h']
        : suffix == 'z'
        ? ['z']
        : suffix == '3d'
        ? ['w', 'h', 'z']
        : null
    );
    /** @const @private {string} */
    this.suffix_ = suffix;
  }
}

/**
 * AMP-specific `width()` and `height()` functions.
 */
export class CssDimSizeNode extends CssNode {
  /**
   * @param {string} dim
   * @param {?string=} opt_selector
   * @param {?string=} opt_selectionMethod Either `undefined` or "closest".
   */
  constructor(dim, opt_selector, opt_selectionMethod) {
    super();
    /** @const @private */
    this.dim_ = dim;
    /** @const @private */
    this.selector_ = opt_selector || null;
    /** @const @private */
    this.selectionMethod_ = opt_selectionMethod || null;
  }

  /** @override */
  css() {
    throw noCss();
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context) {
    const size = this.selector_
      ? context.getElementSize(this.selector_, this.selectionMethod_)
      : context.getCurrentElementSize();
    return new CssLengthNode(getDimSide(this.dim_, size), 'px');
  }
}

/**
 * AMP-specific `num()` function. Format is `num(value)`. Returns a numeric
 * representation of the value. E.g. `11px` -> 11, `12em` -> 12, `10s` -> 10.
 */
export class CssNumConvertNode extends CssNode {
  /**
   * @param {!CssNode} value
   */
  constructor(value) {
    super();
    /** @const @private */
    this.value_ = value;
  }

  /** @override */
  css() {
    throw noCss();
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context, normalize) {
    const value = this.value_.resolve(context, normalize);
    if (value == null) {
      return null;
    }
    let num;
    if (value instanceof CssNumericNode) {
      num = value.num_;
    } else {
      num = parseFloat(value.css());
    }
    if (num == null || isNaN(num)) {
      return null;
    }
    return new CssNumberNode(num);
  }
}

/**
 * AMP-specific `rand()` function. Has two forms:
 * - `rand()` - returns a random number value between 0 and 1.
 * - `rand(left, right)` - returns a random value between `left` and
 *   `right`. The `left` and `right` are any number-based values in this
 *   case, such as a length (`10px`), a time (`1s`), an angle (`1rad`), etc.
 *   The returned value is the same type - a length, time angle, etc. Thus,
 *   `rand(1s, 5s)` may return a value of `rand(2.1s)`.
 */
export class CssRandNode extends CssNode {
  /**
   * @param {?CssNode=} left
   * @param {?CssNode=} right
   */
  constructor(left = null, right = null) {
    super();
    /** @const @private */
    this.left_ = left;
    /** @const @private */
    this.right_ = right;
  }

  /** @override */
  css() {
    throw noCss();
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context, normalize) {
    // No arguments: return a random node between 0 and 1.
    if (this.left_ == null || this.right_ == null) {
      return new CssNumberNode(Math.random());
    }

    // Arguments: do a min/max random math.
    let left = this.left_.resolve(context, normalize);
    let right = this.right_.resolve(context, normalize);
    if (left == null || right == null) {
      return null;
    }
    if (
      !(left instanceof CssNumericNode) ||
      !(right instanceof CssNumericNode)
    ) {
      throw new Error('left and right must be both numerical');
    }
    if (left.type_ != right.type_) {
      throw new Error('left and right must be the same type');
    }

    // Units are the same, the math is simple: numerals are summed. Otherwise,
    // the units neeed to be normalized first.
    if (left.units_ != right.units_) {
      left = left.norm(context);
      right = right.norm(context);
    }
    const min = Math.min(left.num_, right.num_);
    const max = Math.max(left.num_, right.num_);
    const rand = Math.random();
    // Formula: rand(A, B) = A * (1 - R) + B * R
    const num = min * (1 - rand) + max * rand;
    return left.createSameUnits(num);
  }
}

/**
 * AMP-specific `index()` function. Returns 0-based index of the current
 * target in a list of all selected targets.
 */
export class CssIndexNode extends CssNode {
  /**
   * Creates an instance of CssIndexNode.
   */
  constructor() {
    super();
  }

  /** @override */
  css() {
    throw noCss();
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context) {
    return new CssNumberNode(context.getCurrentIndex());
  }
}

/**
 * AMP-specific `length()` function. Returns number of targets selected.
 */
export class CssLengthFuncNode extends CssNode {
  /**
   * Creates an instance of CssLengthFuncNode.
   */
  constructor() {
    super();
  }

  /** @override */
  css() {
    throw noCss();
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context) {
    return new CssNumberNode(context.getTargetLength());
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

  /** @override */
  css() {
    return `var(${this.varName_}${this.def_ ? ',' + this.def_.css() : ''})`;
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context, normalize) {
    const varNode = context.getVar(this.varName_);
    if (varNode) {
      return varNode.resolve(context, normalize);
    }
    if (this.def_) {
      return this.def_.resolve(context, normalize);
    }
    return null;
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

  /** @override */
  css() {
    return `calc(${this.expr_.css()})`;
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context, normalize) {
    return this.expr_.resolve(context, normalize);
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

  /** @override */
  css() {
    return `${this.left_.css()} ${this.op_} ${this.right_.css()}`;
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context, normalize) {
    /*
     * From spec:
     * At + or -, check that both sides have the same type, or that one side is
     * a <number> and the other is an <integer>. If both sides are the same
     * type, resolve to that type. If one side is a <number> and the other is
     * an <integer>, resolve to <number>.
     */
    let left = this.left_.resolve(context, normalize);
    let right = this.right_.resolve(context, normalize);
    if (left == null || right == null) {
      return null;
    }
    if (
      !(left instanceof CssNumericNode) ||
      !(right instanceof CssNumericNode)
    ) {
      throw new Error('left and right must be both numerical');
    }
    if (left.type_ != right.type_) {
      // Percent values are special: they need to be resolved in the context
      // of the other dimension.
      if (left instanceof CssPercentNode) {
        left = right.calcPercent(left.num_, context);
      } else if (right instanceof CssPercentNode) {
        right = left.calcPercent(right.num_, context);
      } else {
        throw new Error('left and right must be the same type');
      }
    }

    // Units are the same, the math is simple: numerals are summed. Otherwise,
    // the units neeed to be normalized first.
    if (left.units_ != right.units_) {
      left = left.norm(context);
      right = right.norm(context);
    }
    const sign = this.op_ == '+' ? 1 : -1;
    return left.createSameUnits(left.num_ + sign * right.num_);
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

  /** @override */
  css() {
    return `${this.left_.css()} ${this.op_} ${this.right_.css()}`;
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context, normalize) {
    const left = this.left_.resolve(context, normalize);
    const right = this.right_.resolve(context, normalize);
    if (left == null || right == null) {
      return null;
    }
    if (
      !(left instanceof CssNumericNode) ||
      !(right instanceof CssNumericNode)
    ) {
      throw new Error('left and right must be both numerical');
    }

    /*
     * From spec:
     * At *, check that at least one side is <number>. If both sides are
     * <integer>, resolve to <integer>. Otherwise, resolve to the type of the
     * other side.
     * At /, check that the right side is <number>. If the left side is
     * <integer>, resolve to <number>. Otherwise, resolve to the type of the
     * left side.
     */
    let base;
    let multi;
    if (this.op_ == '*') {
      if (left instanceof CssNumberNode) {
        multi = left.num_;
        base = right;
      } else {
        if (!(right instanceof CssNumberNode)) {
          throw new Error('one of sides in multiplication must be a number');
        }
        multi = right.num_;
        base = left;
      }
    } else {
      if (!(right instanceof CssNumberNode)) {
        throw new Error('denominator must be a number');
      }
      base = left;
      multi = 1 / right.num_;
    }

    const num = base.num_ * multi;
    if (!isFinite(num)) {
      return null;
    }
    return base.createSameUnits(num);
  }
}

/**
 * @param {string} units
 * @return {!Error}
 */
function unknownUnits(units) {
  return new Error('unknown units: ' + units);
}

/**
 * @return {!Error}
 */
function noCss() {
  return new Error('no css');
}

/**
 * @param {?string} dim
 * @param {!{width: number, height: number}} size
 * @return {number}
 */
function getDimSide(dim, size) {
  return dim == 'w' ? size.width : dim == 'h' ? size.height : 0;
}
