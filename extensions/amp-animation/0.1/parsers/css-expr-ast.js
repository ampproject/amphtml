const FINAL_URL_RE = /^(data|https)\:/i;
const DEG_TO_RAD = (2 * Math.PI) / 360;
const GRAD_TO_RAD = Math.PI / 200;
const VAR_CSS_RE =
  /\b(calc|min|max|clamp|var|url|rand|index|width|height|num|length|x|y)\(/i;
const NORM_CSS_RE = /\d(%|em|rem|vw|vh|vmin|vmax|s|deg|grad)/i;
const INFINITY_RE = /^(infinity|infinite)$/i;
const BOX_DIMENSIONS = ['h', 'w', 'h', 'w'];
const TUPLE_DIMENSIONS = ['w', 'h'];

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
   * Returns the current element's rectangle.
   * @return {!../../../../src/layout-rect.LayoutRectDef}
   */
  getCurrentElementRect() {}

  /**
   * Returns the specified element's rectangle.
   * @param {string} unusedSelector
   * @param {?string} unusedSelectionMethod
   * @return {!../../../../src/layout-rect.LayoutRectDef}
   */
  getElementRect(unusedSelector, unusedSelectionMethod) {}

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
  /**
   * @param {(!Array<!CssNode>|!CssNode)=} opt_array
   * @param {?Array<string>=} opt_dimensions
   */
  constructor(opt_array, opt_dimensions) {
    super();

    /** @private {!Array<!CssNode>} */
    this.array_ =
      opt_array instanceof CssConcatNode
        ? opt_array.array_
        : Array.isArray(opt_array)
          ? opt_array
          : opt_array
            ? [opt_array]
            : [];
    /** @const @private {?Array<string>} */
    this.dimensions_ = opt_dimensions || null;
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
    return this.array_.map((node) => node.css()).join(' ');
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
    const resolvedArray = resolveArray(
      context,
      normalize,
      this.array_,
      this.dimensions_
    );
    return resolvedArray ? new CssConcatNode(resolvedArray) : null;
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
    const size = context.getCurrentElementRect();
    const side = getRectField(dim, size);
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
    const args = this.args_.map((node) => node.css()).join(',');
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
    const resolvedArgs = resolveArray(
      context,
      normalize,
      this.args_,
      this.dimensions_
    );
    return resolvedArgs ? new CssFuncNode(this.name_, resolvedArgs) : null;
  }
}

/**
 * A space separated box declaration (https://developer.mozilla.org/en-US/docs/Web/CSS/margin).
 *
 * Typical forms are:
 * - `<top> <right> <bottom> <left>` (e.g. `10% 20em 30px var(--x)`)
 * - `<top> <horizontal> <bottom>` (e.g. `10% 20em 30vw`)
 * - `<vertical> <horizontal>` (e.g. `10% 20em`)
 * - `<all>` (e.g. `10%`)
 *
 * @param {!CssNode} value
 * @param {?Array<string>=} opt_dimensions
 * @return {!CssNode}
 */
export function createBoxNode(value, opt_dimensions) {
  const dims = opt_dimensions || BOX_DIMENSIONS;

  const args = value instanceof CssConcatNode ? value.array_ : [value];
  if (args.length < 1 || args.length > 4) {
    throw new Error('box must have between 1 and 4 components');
  }

  if (dims.length > 0) {
    // We have to always turn all forms into the full form at least two
    // `<vertical> <horizontal>`, because we cannot otherwise apply
    // the correct dimensions to a single argument.
    return new CssConcatNode(
      args.length == 1 ? [args[0], args[0]] : args,
      dims
    );
  }
  return new CssConcatNode(args);
}

/**
 * A CSS `border-radius()` expression: `box` or `box1 / box2`.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
 *
 * @param {!CssNode} box1
 * @param {!CssNode=} opt_box2
 * @return {!CssNode}
 */
export function createBorderRadiusNode(box1, opt_box2) {
  const box1Node = createBoxNode(box1, []);
  if (opt_box2) {
    return new CssConcatNode([
      box1Node,
      new CssPassthroughNode('/'),
      createBoxNode(opt_box2, []),
    ]);
  }
  return box1Node;
}

/**
 * A CSS `position` expression.
 *
 * See See https://developer.mozilla.org/en-US/docs/Web/CSS/position_value
 *
 * Variants:
 * - `10%` - X percentage.
 * - `10% 10%` - X and Y percentages.
 * - `left 10%` - X keyword and Y percentage.
 * - `left 10% top 20%` - X keyword and Y percentage.
 *
 * @param {!CssNode} value
 * @return {!CssNode}
 */
export function createPositionNode(value) {
  const args = value instanceof CssConcatNode ? value.array_ : [value];
  if (args.length != 1 && args.length != 2 && args.length != 4) {
    throw new Error('position is either 1, 2, or 4 components');
  }

  let dims = null;
  if (args.length == 1) {
    dims = ['w'];
  } else if (args.length == 2) {
    dims = ['w', 'h'];
  } else {
    // [ left | center | right ] || [ top | center | bottom ]
    dims = ['', '', '', ''];
    for (let i = 0; i < args.length; i += 2) {
      const kw = args[i].css().toLowerCase();
      const dim =
        kw == 'left' || kw == 'right'
          ? 'w'
          : kw == 'top' || kw == 'bottom'
            ? 'h'
            : '';
      dims[i] = dims[i + 1] = dim;
    }
  }
  return new CssConcatNode(args, dims);
}

/**
 * A CSS `inset()` expression:
 * `inset( <length-percentage>{1,4} [ round <'border-radius'> ]? )`.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#inset().
 *
 * @param {!CssNode} box
 * @param {!CssNode=} opt_round
 * @return {!CssNode}
 */
export function createInsetNode(box, opt_round) {
  const boxNode = createBoxNode(box);
  if (opt_round) {
    return new CssFuncNode('inset', [
      new CssConcatNode([boxNode, new CssPassthroughNode('round'), opt_round]),
    ]);
  }
  return new CssFuncNode('inset', [boxNode]);
}

/**
 * A CSS `circle()` expression:
 * `<circle()> = circle( [ <shape-radius> ]? [ at <position> ]? )`.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#circle()
 *
 * @param {?CssNode} radius
 * @param {!CssNode=} opt_position
 * @return {!CssNode}
 */
export function createCircleNode(radius, opt_position) {
  return createEllipseNode(radius, opt_position, 'circle');
}

/**
 * A CSS `ellipse()` expression:
 * `<ellipse()> = ellipse( [ <shape-radius>{2} ]? [ at <position> ]? )`.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#ellipse()
 *
 * @param {?CssNode} radii
 * @param {!CssNode=} opt_position
 * @param {string=} opt_name
 * @return {!CssNode}
 */
export function createEllipseNode(radii, opt_position, opt_name) {
  const name = opt_name || 'ellipse';
  const position = opt_position ? createPositionNode(opt_position) : null;
  if (!radii && !position) {
    return new CssFuncNode(name, []);
  }
  if (radii && position) {
    return new CssFuncNode(name, [
      new CssConcatNode([radii, new CssPassthroughNode('at'), position]),
    ]);
  }
  if (position) {
    return new CssFuncNode(name, [
      new CssConcatNode([new CssPassthroughNode('at'), position]),
    ]);
  }
  return new CssFuncNode(name, [radii]);
}

/**
 * A CSS `polygon()` expression:
 * `<polygon()> = polygon( [ <length-percentage> <length-percentage> ]# )`.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#polygon()
 *
 * @param {!Array<!CssNode>} tuples
 * @return {!CssNode}
 */
export function createPolygonNode(tuples) {
  const tuplesWithDims = tuples.map(
    (tuple) => new CssConcatNode(tuple, TUPLE_DIMENSIONS)
  );
  return new CssFuncNode('polygon', tuplesWithDims);
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
    /** @const @protected {string} */
    this.suffix_ = suffix;
  }
}

/**
 * AMP-specific `width()` and `height()` functions.
 */
export class CssRectNode extends CssNode {
  /**
   * @param {string} field x, y, width or height
   * @param {?string=} opt_selector
   * @param {?string=} opt_selectionMethod Either `undefined` or "closest".
   */
  constructor(field, opt_selector, opt_selectionMethod) {
    super();
    /** @const @private */
    this.field_ = field;
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
    const rect = this.selector_
      ? context.getElementRect(this.selector_, this.selectionMethod_)
      : context.getCurrentElementRect();
    return new CssLengthNode(getRectField(this.field_, rect), 'px');
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
 * CSS `min()` and `max()`.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/min
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/max
 */
export class CssMinMaxNode extends CssFuncNode {
  /**
   * @param {string} name
   * @param {!Array<!CssNode>} args
   */
  constructor(name, args) {
    super(name, args);
  }

  /** @override */
  isConst() {
    return false;
  }

  /** @override */
  calc(context, normalize) {
    let resolvedArgs = resolveArray(context, normalize, this.args_, null);
    if (!resolvedArgs) {
      return null;
    }

    let firstNonPercent = null;
    let hasPercent = false;
    let hasDifferentUnits = false;
    resolvedArgs.forEach((arg) => {
      if (!(arg instanceof CssNumericNode)) {
        throw new Error('arguments must be numerical');
      }
      if (arg instanceof CssPercentNode) {
        hasPercent = true;
      } else if (firstNonPercent) {
        if (arg.type_ != firstNonPercent.type_) {
          throw new Error('arguments must be the same type');
        }
        if (arg.units_ != firstNonPercent.units_) {
          hasDifferentUnits = true;
        }
      } else {
        firstNonPercent = arg;
      }
    });
    if (firstNonPercent && hasPercent) {
      hasDifferentUnits = true;
    }

    if (firstNonPercent) {
      // Recalculate percent values and normalize units.
      if (hasDifferentUnits) {
        firstNonPercent = firstNonPercent.norm(context);
      }
      resolvedArgs = resolvedArgs.map((arg) => {
        if (arg == firstNonPercent) {
          return arg;
        }

        // Percent values.
        if (arg instanceof CssPercentNode) {
          return firstNonPercent.calcPercent(arg.num_, context);
        }

        // Units are the same, the math is simple: numerals are summed.
        // Otherwise, the units neeed to be normalized first.
        if (hasDifferentUnits) {
          return /** @type {!CssNumericNode} */ (arg).norm(context);
        }
        return arg;
      });
    }

    // Calculate.
    const nums = resolvedArgs.map((arg) => arg.num_);
    let value;
    if (this.name_ == 'min') {
      // min(...)
      value = Math.min.apply(null, nums);
    } else if (this.name_ == 'max') {
      // max(...)
      value = Math.max.apply(null, nums);
    } else {
      // clamp(min, preferred, max)
      const min = nums[0];
      const preferred = nums[1];
      const max = nums[2];
      value = Math.max(min, Math.min(max, preferred));
    }
    return resolvedArgs[0].createSameUnits(value);
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
 * @param {?string} field
 * @param {!../../../../src/layout-rect.LayoutRectDef} rect
 * @return {number}
 */
function getRectField(field, rect) {
  if (field == 'w') {
    return rect.width;
  }
  if (field == 'h') {
    return rect.height;
  }
  return rect[field] ?? 0;
}

/**
 * @param {!CssContext} context
 * @param {boolean} normalize
 * @param {!Array<!CssNode>} array
 * @param {?Array<string>} dimensions
 * @return {?Array<!CssNode>}
 */
function resolveArray(context, normalize, array, dimensions) {
  const resolvedArray = [];
  for (let i = 0; i < array.length; i++) {
    const node = array[i];
    let resolved;
    if (dimensions && i < dimensions.length) {
      resolved = context.withDimension(dimensions[i], () =>
        node.resolve(context, normalize)
      );
    } else {
      resolved = node.resolve(context, normalize);
    }
    if (resolved) {
      resolvedArray.push(resolved);
    } else {
      // One argument is null - the function's result is null.
      return null;
    }
  }
  return resolvedArray;
}
