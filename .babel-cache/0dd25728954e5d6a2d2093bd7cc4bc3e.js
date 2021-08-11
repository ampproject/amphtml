function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var FINAL_URL_RE = /^(data|https)\:/i;
var DEG_TO_RAD = 2 * Math.PI / 360;
var GRAD_TO_RAD = Math.PI / 200;
var VAR_CSS_RE = /\b(calc|min|max|clamp|var|url|rand|index|width|height|num|length|x|y)\(/i;
var NORM_CSS_RE = /\d(%|em|rem|vw|vh|vmin|vmax|s|deg|grad)/i;
var INFINITY_RE = /^(infinity|infinite)$/i;
var BOX_DIMENSIONS = ['h', 'w', 'h', 'w'];
var TUPLE_DIMENSIONS = ['w', 'h'];

/**
 * Returns `true` if the CSS expression contains variable components. The CSS
 * parsing and evaluation is heavy, but used relatively rarely. This method
 * can be used to avoid heavy parse/evaluate tasks.
 * @param {string} css
 * @param {boolean} normalize
 * @return {boolean}
 */
export function isVarCss(css, normalize) {
  return VAR_CSS_RE.test(css) || normalize && NORM_CSS_RE.test(css);
}

/**
 * An interface that assists in CSS evaluation.
 * @interface
 */
export var CssContext = /*#__PURE__*/function () {
  function CssContext() {
    _classCallCheck(this, CssContext);
  }

  _createClass(CssContext, [{
    key: "resolveUrl",
    value:
    /**
     * Returns a resolved URL. The result must be an allowed URL for execution,
     * with HTTPS restrictions.
     * @param {string} unusedUrl
     * @return {string}
     */
    function resolveUrl(unusedUrl) {}
    /**
     * Returns the value of a CSS variable or `null` if not available.
     * @param {string} unusedVarName
     * @return {?CssNode}
     */

  }, {
    key: "getVar",
    value: function getVar(unusedVarName) {}
    /**
     * Returns the current target's index in the context of other selected
     * targets.
     * @return {number}
     */

  }, {
    key: "getCurrentIndex",
    value: function getCurrentIndex() {}
    /**
     * Returns the number of selected targets.
     * @return {number}
     */

  }, {
    key: "getTargetLength",
    value: function getTargetLength() {}
    /**
     * Returns the current font size.
     * @return {number}
     */

  }, {
    key: "getCurrentFontSize",
    value: function getCurrentFontSize() {}
    /**
     * Returns the root font size.
     * @return {number}
     */

  }, {
    key: "getRootFontSize",
    value: function getRootFontSize() {}
    /**
     * Returns the viewport size.
     * @return {!{width: number, height: number}}
     */

  }, {
    key: "getViewportSize",
    value: function getViewportSize() {}
    /**
     * Returns the current element's rectangle.
     * @return {!../../../../src/layout-rect.LayoutRectDef}
     */

  }, {
    key: "getCurrentElementRect",
    value: function getCurrentElementRect() {}
    /**
     * Returns the specified element's rectangle.
     * @param {string} unusedSelector
     * @param {?string} unusedSelectionMethod
     * @return {!../../../../src/layout-rect.LayoutRectDef}
     */

  }, {
    key: "getElementRect",
    value: function getElementRect(unusedSelector, unusedSelectionMethod) {}
    /**
     * Returns the dimension: "w" for width or "h" for height.
     * @return {?string}
     */

  }, {
    key: "getDimension",
    value: function getDimension() {}
    /**
     * Pushes the dimension: "w" for width or "h" for height.
     * @param {?string} unusedDim
     * @param {function():T} unusedCallback
     * @return {T}
     * @template T
     */

  }, {
    key: "withDimension",
    value: function withDimension(unusedDim, unusedCallback) {}
  }]);

  return CssContext;
}();

/**
 * A base class for all CSS node components defined in the
 * `css-expr-impl.jison`.
 * @abstract
 */
export var CssNode = /*#__PURE__*/function () {
  /**
   * Creates an instance of CssNode.
   */
  function CssNode() {
    _classCallCheck(this, CssNode);
  }

  /**
   * Returns a string CSS representation.
   * @return {string}
   * @abstract
   */
  _createClass(CssNode, [{
    key: "css",
    value: function css() {}
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

  }, {
    key: "resolve",
    value: function resolve(context, normalize) {
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

  }, {
    key: "isConst",
    value: function isConst(unusedNormalize) {
      return true;
    }
    /**
     * Calculates the value of all variable components.
     * @param {!CssContext} unusedContext
     * @param {boolean} unusedNormalize
     * @return {?CssNode}
     * @protected
     */

  }, {
    key: "calc",
    value: function calc(unusedContext, unusedNormalize) {
      return this;
    }
  }]);

  return CssNode;
}();

/**
 * A CSS expression that's simply passed through from the original expression.
 * Used for `url()`, colors, etc.
 */
export var CssPassthroughNode = /*#__PURE__*/function (_CssNode) {
  _inherits(CssPassthroughNode, _CssNode);

  var _super = _createSuper(CssPassthroughNode);

  /** @param {string} css */
  function CssPassthroughNode(css) {
    var _this;

    _classCallCheck(this, CssPassthroughNode);

    _this = _super.call(this);

    /** @const @private {string} */
    _this.css_ = css;
    return _this;
  }

  /** @override */
  _createClass(CssPassthroughNode, [{
    key: "css",
    value: function css() {
      return this.css_;
    }
  }]);

  return CssPassthroughNode;
}(CssNode);

/**
 * A concatenation of CSS expressions: `translateX(...) rotate(...)`,
 * `1s normal`, etc.
 */
export var CssConcatNode = /*#__PURE__*/function (_CssNode2) {
  _inherits(CssConcatNode, _CssNode2);

  var _super2 = _createSuper(CssConcatNode);

  /**
   * @param {(!Array<!CssNode>|!CssNode)=} opt_array
   * @param {?Array<string>=} opt_dimensions
   */
  function CssConcatNode(opt_array, opt_dimensions) {
    var _this2;

    _classCallCheck(this, CssConcatNode);

    _this2 = _super2.call(this);

    /** @private {!Array<!CssNode>} */
    _this2.array_ = opt_array instanceof CssConcatNode ? opt_array.array_ : Array.isArray(opt_array) ? opt_array : opt_array ? [opt_array] : [];

    /** @const @private {?Array<string>} */
    _this2.dimensions_ = opt_dimensions || null;
    return _this2;
  }

  /**
   * Concatenates two sets of expressions.
   * @param {!CssNode} nodeOrSet
   * @param {!CssNode} otherNodeOrSet
   * @return {!CssConcatNode}
   */
  _createClass(CssConcatNode, [{
    key: "css",
    value:
    /** @override */
    function css() {
      return this.array_.map(function (node) {
        return node.css();
      }).join(' ');
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst(normalize) {
      return this.array_.reduce(function (acc, node) {
        return acc && node.isConst(normalize);
      }, true);
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      var resolvedArray = resolveArray(context, normalize, this.array_, this.dimensions_);
      return resolvedArray ? new CssConcatNode(resolvedArray) : null;
    }
  }], [{
    key: "concat",
    value: function concat(nodeOrSet, otherNodeOrSet) {
      var set;

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
  }]);

  return CssConcatNode;
}(CssNode);

/**
 * Verifies that URL is an HTTPS URL.
 */
export var CssUrlNode = /*#__PURE__*/function (_CssNode3) {
  _inherits(CssUrlNode, _CssNode3);

  var _super3 = _createSuper(CssUrlNode);

  /** @param {string} url */
  function CssUrlNode(url) {
    var _this3;

    _classCallCheck(this, CssUrlNode);

    _this3 = _super3.call(this);

    /** @const @private {string} */
    _this3.url_ = url;
    return _this3;
  }

  /** @override */
  _createClass(CssUrlNode, [{
    key: "css",
    value: function css() {
      if (!this.url_) {
        return '';
      }

      return "url(\"" + this.url_ + "\")";
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return !this.url_ || FINAL_URL_RE.test(this.url_);
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context) {
      var url = context.resolveUrl(this.url_);
      // Return a passthrough CSS to avoid recursive `url()` evaluation.
      return new CssPassthroughNode("url(\"" + url + "\")");
    }
  }]);

  return CssUrlNode;
}(CssNode);

/**
 * @abstract
 */
export var CssNumericNode = /*#__PURE__*/function (_CssNode4) {
  _inherits(CssNumericNode, _CssNode4);

  var _super4 = _createSuper(CssNumericNode);

  /**
   * @param {string} type
   * @param {number} num
   * @param {string} units
   */
  function CssNumericNode(type, num, units) {
    var _this4;

    _classCallCheck(this, CssNumericNode);

    _this4 = _super4.call(this);

    /** @const @private {string} */
    _this4.type_ = type;

    /** @const @private {number} */
    _this4.num_ = num;

    /** @const @private {string} */
    _this4.units_ = units.toLowerCase();
    return _this4;
  }

  /** @override */
  _createClass(CssNumericNode, [{
    key: "css",
    value: function css() {
      return "" + this.num_ + this.units_;
    }
    /**
     * @param {number} unusedNum
     * @return {!CssNumericNode}
     * @abstract
     */

  }, {
    key: "createSameUnits",
    value: function createSameUnits(unusedNum) {}
    /** @override */

  }, {
    key: "isConst",
    value: function isConst(normalize) {
      return normalize ? this.isNorm() : true;
    }
    /**
     * @return {boolean}
     */

  }, {
    key: "isNorm",
    value: function isNorm() {
      return true;
    }
    /**
     * @param {!CssContext} unusedContext
     * @return {!CssNumericNode}
     */

  }, {
    key: "norm",
    value: function norm(unusedContext) {
      return this;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      return normalize ? this.norm(context) : this;
    }
    /**
     * @param {number} unusedPercent
     * @param {!CssContext} unusedContext
     * @return {!CssNumericNode}
     */

  }, {
    key: "calcPercent",
    value: function calcPercent(unusedPercent, unusedContext) {
      throw new Error('cannot calculate percent for ' + this.type_);
    }
  }]);

  return CssNumericNode;
}(CssNode);

/**
 * A CSS number: `100`, `1e2`, `1e-2`, `0.5`, etc.
 */
export var CssNumberNode = /*#__PURE__*/function (_CssNumericNode) {
  _inherits(CssNumberNode, _CssNumericNode);

  var _super5 = _createSuper(CssNumberNode);

  /** @param {number} num */
  function CssNumberNode(num) {
    _classCallCheck(this, CssNumberNode);

    return _super5.call(this, 'NUM', num, '');
  }

  /** @override */
  _createClass(CssNumberNode, [{
    key: "createSameUnits",
    value: function createSameUnits(num) {
      return new CssNumberNode(num);
    }
    /**
     * Returns a numerical value of the node if possible. `Infinity` is one of
     * possible return values.
     * @param {!CssNode} node
     * @return {number|undefined}
     */

  }], [{
    key: "num",
    value: function num(node) {
      if (node instanceof CssNumberNode) {
        return node.num_;
      }

      var css = node.css();

      if (INFINITY_RE.test(css)) {
        return Infinity;
      }

      return undefined;
    }
  }]);

  return CssNumberNode;
}(CssNumericNode);

/**
 * A CSS percent value: `100%`, `0.5%`, etc.
 */
export var CssPercentNode = /*#__PURE__*/function (_CssNumericNode2) {
  _inherits(CssPercentNode, _CssNumericNode2);

  var _super6 = _createSuper(CssPercentNode);

  /** @param {number} num */
  function CssPercentNode(num) {
    _classCallCheck(this, CssPercentNode);

    return _super6.call(this, 'PRC', num, '%');
  }

  /** @override */
  _createClass(CssPercentNode, [{
    key: "createSameUnits",
    value: function createSameUnits(num) {
      return new CssPercentNode(num);
    }
    /** @override */

  }, {
    key: "isNorm",
    value: function isNorm() {
      return false;
    }
    /** @override */

  }, {
    key: "norm",
    value: function norm(context) {
      if (context.getDimension()) {
        return new CssLengthNode(0, 'px').calcPercent(this.num_, context);
      }

      return this;
    }
  }]);

  return CssPercentNode;
}(CssNumericNode);

/**
 * A CSS length value: `100px`, `80vw`, etc.
 */
export var CssLengthNode = /*#__PURE__*/function (_CssNumericNode3) {
  _inherits(CssLengthNode, _CssNumericNode3);

  var _super7 = _createSuper(CssLengthNode);

  /**
   * @param {number} num
   * @param {string} units
   */
  function CssLengthNode(num, units) {
    _classCallCheck(this, CssLengthNode);

    return _super7.call(this, 'LEN', num, units);
  }

  /** @override */
  _createClass(CssLengthNode, [{
    key: "createSameUnits",
    value: function createSameUnits(num) {
      return new CssLengthNode(num, this.units_);
    }
    /** @override */

  }, {
    key: "isNorm",
    value: function isNorm() {
      return this.units_ == 'px';
    }
    /** @override */

  }, {
    key: "norm",
    value: function norm(context) {
      if (this.isNorm()) {
        return this;
      }

      // Font-based: em/rem.
      if (this.units_ == 'em' || this.units_ == 'rem') {
        var fontSize = this.units_ == 'em' ? context.getCurrentFontSize() : context.getRootFontSize();
        return new CssLengthNode(this.num_ * fontSize, 'px');
      }

      // Viewport based: vw, vh, vmin, vmax.
      if (this.units_ == 'vw' || this.units_ == 'vh' || this.units_ == 'vmin' || this.units_ == 'vmax') {
        var vp = context.getViewportSize();
        var vw = vp.width * this.num_ / 100;
        var vh = vp.height * this.num_ / 100;
        var num = 0;

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

  }, {
    key: "calcPercent",
    value: function calcPercent(percent, context) {
      var dim = context.getDimension();
      var size = context.getCurrentElementRect();
      var side = getRectField(dim, size);
      return new CssLengthNode(side * percent / 100, 'px');
    }
  }]);

  return CssLengthNode;
}(CssNumericNode);

/**
 * A CSS angle value: `45deg`, `0.5rad`, etc.
 */
export var CssAngleNode = /*#__PURE__*/function (_CssNumericNode4) {
  _inherits(CssAngleNode, _CssNumericNode4);

  var _super8 = _createSuper(CssAngleNode);

  /**
   * @param {number} num
   * @param {string} units
   */
  function CssAngleNode(num, units) {
    _classCallCheck(this, CssAngleNode);

    return _super8.call(this, 'ANG', num, units);
  }

  /** @override */
  _createClass(CssAngleNode, [{
    key: "createSameUnits",
    value: function createSameUnits(num) {
      return new CssAngleNode(num, this.units_);
    }
    /** @override */

  }, {
    key: "isNorm",
    value: function isNorm() {
      return this.units_ == 'rad';
    }
    /** @override */

  }, {
    key: "norm",
    value: function norm() {
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
  }]);

  return CssAngleNode;
}(CssNumericNode);

/**
 * A CSS time value: `1s`, `600ms`.
 */
export var CssTimeNode = /*#__PURE__*/function (_CssNumericNode5) {
  _inherits(CssTimeNode, _CssNumericNode5);

  var _super9 = _createSuper(CssTimeNode);

  /**
   * @param {number} num
   * @param {string} units
   */
  function CssTimeNode(num, units) {
    _classCallCheck(this, CssTimeNode);

    return _super9.call(this, 'TME', num, units);
  }

  /** @override */
  _createClass(CssTimeNode, [{
    key: "createSameUnits",
    value: function createSameUnits(num) {
      return new CssTimeNode(num, this.units_);
    }
    /** @override */

  }, {
    key: "isNorm",
    value: function isNorm() {
      return this.units_ == 'ms';
    }
    /** @override */

  }, {
    key: "norm",
    value: function norm() {
      if (this.isNorm()) {
        return this;
      }

      return new CssTimeNode(this.millis_(), 'ms');
    }
    /**
     * @return {number}
     * @private
     */

  }, {
    key: "millis_",
    value: function millis_() {
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

  }], [{
    key: "millis",
    value: function millis(node) {
      if (node instanceof CssTimeNode) {
        return node.millis_();
      }

      if (node instanceof CssNumberNode) {
        return node.num_;
      }

      return undefined;
    }
  }]);

  return CssTimeNode;
}(CssNumericNode);

/**
 * A CSS generic function: `rgb(1, 1, 1)`, `translateX(300px)`, etc.
 */
export var CssFuncNode = /*#__PURE__*/function (_CssNode5) {
  _inherits(CssFuncNode, _CssNode5);

  var _super10 = _createSuper(CssFuncNode);

  /**
   * @param {string} name
   * @param {!Array<!CssNode>} args
   * @param {?Array<string>=} opt_dimensions
   */
  function CssFuncNode(name, args, opt_dimensions) {
    var _this5;

    _classCallCheck(this, CssFuncNode);

    _this5 = _super10.call(this);

    /** @const @private {string} */
    _this5.name_ = name.toLowerCase();

    /** @const @private {!Array<!CssNode>} */
    _this5.args_ = args;

    /** @const @private {?Array<string>} */
    _this5.dimensions_ = opt_dimensions || null;
    return _this5;
  }

  /** @override */
  _createClass(CssFuncNode, [{
    key: "css",
    value: function css() {
      var args = this.args_.map(function (node) {
        return node.css();
      }).join(',');
      return this.name_ + "(" + args + ")";
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst(normalize) {
      return this.args_.reduce(function (acc, node) {
        return acc && node.isConst(normalize);
      }, true);
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      var resolvedArgs = resolveArray(context, normalize, this.args_, this.dimensions_);
      return resolvedArgs ? new CssFuncNode(this.name_, resolvedArgs) : null;
    }
  }]);

  return CssFuncNode;
}(CssNode);

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
  var dims = opt_dimensions || BOX_DIMENSIONS;
  var args = value instanceof CssConcatNode ? value.array_ : [value];

  if (args.length < 1 || args.length > 4) {
    throw new Error('box must have between 1 and 4 components');
  }

  if (dims.length > 0) {
    // We have to always turn all forms into the full form at least two
    // `<vertical> <horizontal>`, because we cannot otherwise apply
    // the correct dimensions to a single argument.
    return new CssConcatNode(args.length == 1 ? [args[0], args[0]] : args, dims);
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
  var box1Node = createBoxNode(box1, []);

  if (opt_box2) {
    return new CssConcatNode([box1Node, new CssPassthroughNode('/'), createBoxNode(opt_box2, [])]);
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
  var args = value instanceof CssConcatNode ? value.array_ : [value];

  if (args.length != 1 && args.length != 2 && args.length != 4) {
    throw new Error('position is either 1, 2, or 4 components');
  }

  var dims = null;

  if (args.length == 1) {
    dims = ['w'];
  } else if (args.length == 2) {
    dims = ['w', 'h'];
  } else {
    // [ left | center | right ] || [ top | center | bottom ]
    dims = ['', '', '', ''];

    for (var i = 0; i < args.length; i += 2) {
      var kw = args[i].css().toLowerCase();
      var dim = kw == 'left' || kw == 'right' ? 'w' : kw == 'top' || kw == 'bottom' ? 'h' : '';
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
  var boxNode = createBoxNode(box);

  if (opt_round) {
    return new CssFuncNode('inset', [new CssConcatNode([boxNode, new CssPassthroughNode('round'), opt_round])]);
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
  var name = opt_name || 'ellipse';
  var position = opt_position ? createPositionNode(opt_position) : null;

  if (!radii && !position) {
    return new CssFuncNode(name, []);
  }

  if (radii && position) {
    return new CssFuncNode(name, [new CssConcatNode([radii, new CssPassthroughNode('at'), position])]);
  }

  if (position) {
    return new CssFuncNode(name, [new CssConcatNode([new CssPassthroughNode('at'), position])]);
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
  var tuplesWithDims = tuples.map(function (tuple) {
    return new CssConcatNode(tuple, TUPLE_DIMENSIONS);
  });
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
export var CssTranslateNode = /*#__PURE__*/function (_CssFuncNode) {
  _inherits(CssTranslateNode, _CssFuncNode);

  var _super11 = _createSuper(CssTranslateNode);

  /**
   * @param {string} suffix
   * @param {!Array<!CssNode>} args
   */
  function CssTranslateNode(suffix, args) {
    var _this6;

    _classCallCheck(this, CssTranslateNode);

    _this6 = _super11.call(this, "translate" + suffix.toUpperCase(), args, suffix == '' ? ['w', 'h'] : suffix == 'x' ? ['w'] : suffix == 'y' ? ['h'] : suffix == 'z' ? ['z'] : suffix == '3d' ? ['w', 'h', 'z'] : null);

    /** @const @protected {string} */
    _this6.suffix_ = suffix;
    return _this6;
  }

  return CssTranslateNode;
}(CssFuncNode);

/**
 * AMP-specific `width()` and `height()` functions.
 */
export var CssRectNode = /*#__PURE__*/function (_CssNode6) {
  _inherits(CssRectNode, _CssNode6);

  var _super12 = _createSuper(CssRectNode);

  /**
   * @param {string} field x, y, width or height
   * @param {?string=} opt_selector
   * @param {?string=} opt_selectionMethod Either `undefined` or "closest".
   */
  function CssRectNode(field, opt_selector, opt_selectionMethod) {
    var _this7;

    _classCallCheck(this, CssRectNode);

    _this7 = _super12.call(this);

    /** @const @private */
    _this7.field_ = field;

    /** @const @private */
    _this7.selector_ = opt_selector || null;

    /** @const @private */
    _this7.selectionMethod_ = opt_selectionMethod || null;
    return _this7;
  }

  /** @override */
  _createClass(CssRectNode, [{
    key: "css",
    value: function css() {
      throw noCss();
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context) {
      var rect = this.selector_ ? context.getElementRect(this.selector_, this.selectionMethod_) : context.getCurrentElementRect();
      return new CssLengthNode(getRectField(this.field_, rect), 'px');
    }
  }]);

  return CssRectNode;
}(CssNode);

/**
 * AMP-specific `num()` function. Format is `num(value)`. Returns a numeric
 * representation of the value. E.g. `11px` -> 11, `12em` -> 12, `10s` -> 10.
 */
export var CssNumConvertNode = /*#__PURE__*/function (_CssNode7) {
  _inherits(CssNumConvertNode, _CssNode7);

  var _super13 = _createSuper(CssNumConvertNode);

  /**
   * @param {!CssNode} value
   */
  function CssNumConvertNode(value) {
    var _this8;

    _classCallCheck(this, CssNumConvertNode);

    _this8 = _super13.call(this);

    /** @const @private */
    _this8.value_ = value;
    return _this8;
  }

  /** @override */
  _createClass(CssNumConvertNode, [{
    key: "css",
    value: function css() {
      throw noCss();
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      var value = this.value_.resolve(context, normalize);

      if (value == null) {
        return null;
      }

      var num;

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
  }]);

  return CssNumConvertNode;
}(CssNode);

/**
 * AMP-specific `rand()` function. Has two forms:
 * - `rand()` - returns a random number value between 0 and 1.
 * - `rand(left, right)` - returns a random value between `left` and
 *   `right`. The `left` and `right` are any number-based values in this
 *   case, such as a length (`10px`), a time (`1s`), an angle (`1rad`), etc.
 *   The returned value is the same type - a length, time angle, etc. Thus,
 *   `rand(1s, 5s)` may return a value of `rand(2.1s)`.
 */
export var CssRandNode = /*#__PURE__*/function (_CssNode8) {
  _inherits(CssRandNode, _CssNode8);

  var _super14 = _createSuper(CssRandNode);

  /**
   * @param {?CssNode=} left
   * @param {?CssNode=} right
   */
  function CssRandNode(left, right) {
    var _this9;

    if (left === void 0) {
      left = null;
    }

    if (right === void 0) {
      right = null;
    }

    _classCallCheck(this, CssRandNode);

    _this9 = _super14.call(this);

    /** @const @private */
    _this9.left_ = left;

    /** @const @private */
    _this9.right_ = right;
    return _this9;
  }

  /** @override */
  _createClass(CssRandNode, [{
    key: "css",
    value: function css() {
      throw noCss();
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      // No arguments: return a random node between 0 and 1.
      if (this.left_ == null || this.right_ == null) {
        return new CssNumberNode(Math.random());
      }

      // Arguments: do a min/max random math.
      var left = this.left_.resolve(context, normalize);
      var right = this.right_.resolve(context, normalize);

      if (left == null || right == null) {
        return null;
      }

      if (!(left instanceof CssNumericNode) || !(right instanceof CssNumericNode)) {
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

      var min = Math.min(left.num_, right.num_);
      var max = Math.max(left.num_, right.num_);
      var rand = Math.random();
      // Formula: rand(A, B) = A * (1 - R) + B * R
      var num = min * (1 - rand) + max * rand;
      return left.createSameUnits(num);
    }
  }]);

  return CssRandNode;
}(CssNode);

/**
 * AMP-specific `index()` function. Returns 0-based index of the current
 * target in a list of all selected targets.
 */
export var CssIndexNode = /*#__PURE__*/function (_CssNode9) {
  _inherits(CssIndexNode, _CssNode9);

  var _super15 = _createSuper(CssIndexNode);

  /**
   * Creates an instance of CssIndexNode.
   */
  function CssIndexNode() {
    _classCallCheck(this, CssIndexNode);

    return _super15.call(this);
  }

  /** @override */
  _createClass(CssIndexNode, [{
    key: "css",
    value: function css() {
      throw noCss();
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context) {
      return new CssNumberNode(context.getCurrentIndex());
    }
  }]);

  return CssIndexNode;
}(CssNode);

/**
 * AMP-specific `length()` function. Returns number of targets selected.
 */
export var CssLengthFuncNode = /*#__PURE__*/function (_CssNode10) {
  _inherits(CssLengthFuncNode, _CssNode10);

  var _super16 = _createSuper(CssLengthFuncNode);

  /**
   * Creates an instance of CssLengthFuncNode.
   */
  function CssLengthFuncNode() {
    _classCallCheck(this, CssLengthFuncNode);

    return _super16.call(this);
  }

  /** @override */
  _createClass(CssLengthFuncNode, [{
    key: "css",
    value: function css() {
      throw noCss();
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context) {
      return new CssNumberNode(context.getTargetLength());
    }
  }]);

  return CssLengthFuncNode;
}(CssNode);

/**
 * A CSS `var()` expression: `var(--name)`, `var(--name, 100px)`, etc.
 * See https://www.w3.org/TR/css-variables/.
 */
export var CssVarNode = /*#__PURE__*/function (_CssNode11) {
  _inherits(CssVarNode, _CssNode11);

  var _super17 = _createSuper(CssVarNode);

  /**
   * @param {string} varName
   * @param {!CssNode=} opt_def
   */
  function CssVarNode(varName, opt_def) {
    var _this10;

    _classCallCheck(this, CssVarNode);

    _this10 = _super17.call(this);

    /** @const @private {string} */
    _this10.varName_ = varName;

    /** @const @private {?CssNode} */
    _this10.def_ = opt_def || null;
    return _this10;
  }

  /** @override */
  _createClass(CssVarNode, [{
    key: "css",
    value: function css() {
      return "var(" + this.varName_ + (this.def_ ? ',' + this.def_.css() : '') + ")";
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      var varNode = context.getVar(this.varName_);

      if (varNode) {
        return varNode.resolve(context, normalize);
      }

      if (this.def_) {
        return this.def_.resolve(context, normalize);
      }

      return null;
    }
  }]);

  return CssVarNode;
}(CssNode);

/**
 * A CSS `calc()` expression: `calc(100px)`, `calc(80vw - 30em)`, etc.
 * See https://drafts.csswg.org/css-values-3/#calc-notation.
 */
export var CssCalcNode = /*#__PURE__*/function (_CssNode12) {
  _inherits(CssCalcNode, _CssNode12);

  var _super18 = _createSuper(CssCalcNode);

  /** @param {!CssNode} expr */
  function CssCalcNode(expr) {
    var _this11;

    _classCallCheck(this, CssCalcNode);

    _this11 = _super18.call(this);

    /** @const @private {!CssNode} */
    _this11.expr_ = expr;
    return _this11;
  }

  /** @override */
  _createClass(CssCalcNode, [{
    key: "css",
    value: function css() {
      return "calc(" + this.expr_.css() + ")";
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      return this.expr_.resolve(context, normalize);
    }
  }]);

  return CssCalcNode;
}(CssNode);

/**
 * A CSS `calc()` sum expression: `100px + 20em`, `80vw - 30em`, etc.
 */
export var CssCalcSumNode = /*#__PURE__*/function (_CssNode13) {
  _inherits(CssCalcSumNode, _CssNode13);

  var _super19 = _createSuper(CssCalcSumNode);

  /**
   * @param {!CssNode} left
   * @param {!CssNode} right
   * @param {string} op Either "+" or "-".
   */
  function CssCalcSumNode(left, right, op) {
    var _this12;

    _classCallCheck(this, CssCalcSumNode);

    _this12 = _super19.call(this);

    /** @const @private {!CssNode} */
    _this12.left_ = left;

    /** @const @private {!CssNode} */
    _this12.right_ = right;

    /** @const @private {string} */
    _this12.op_ = op;
    return _this12;
  }

  /** @override */
  _createClass(CssCalcSumNode, [{
    key: "css",
    value: function css() {
      return this.left_.css() + " " + this.op_ + " " + this.right_.css();
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      /*
       * From spec:
       * At + or -, check that both sides have the same type, or that one side is
       * a <number> and the other is an <integer>. If both sides are the same
       * type, resolve to that type. If one side is a <number> and the other is
       * an <integer>, resolve to <number>.
       */
      var left = this.left_.resolve(context, normalize);
      var right = this.right_.resolve(context, normalize);

      if (left == null || right == null) {
        return null;
      }

      if (!(left instanceof CssNumericNode) || !(right instanceof CssNumericNode)) {
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

      var sign = this.op_ == '+' ? 1 : -1;
      return left.createSameUnits(left.num_ + sign * right.num_);
    }
  }]);

  return CssCalcSumNode;
}(CssNode);

/**
 * A CSS `calc()` product expression: `100px * 2`, `80vw / 2`, etc.
 */
export var CssCalcProductNode = /*#__PURE__*/function (_CssNode14) {
  _inherits(CssCalcProductNode, _CssNode14);

  var _super20 = _createSuper(CssCalcProductNode);

  /**
   * @param {!CssNode} left
   * @param {!CssNode} right
   * @param {string} op Either "*" or "/".
   */
  function CssCalcProductNode(left, right, op) {
    var _this13;

    _classCallCheck(this, CssCalcProductNode);

    _this13 = _super20.call(this);

    /** @const @private {!CssNode} */
    _this13.left_ = left;

    /** @const @private {!CssNode} */
    _this13.right_ = right;

    /** @const @private {string} */
    _this13.op_ = op;
    return _this13;
  }

  /** @override */
  _createClass(CssCalcProductNode, [{
    key: "css",
    value: function css() {
      return this.left_.css() + " " + this.op_ + " " + this.right_.css();
    }
    /** @override */

  }, {
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      var left = this.left_.resolve(context, normalize);
      var right = this.right_.resolve(context, normalize);

      if (left == null || right == null) {
        return null;
      }

      if (!(left instanceof CssNumericNode) || !(right instanceof CssNumericNode)) {
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
      var base;
      var multi;

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

      var num = base.num_ * multi;

      if (!isFinite(num)) {
        return null;
      }

      return base.createSameUnits(num);
    }
  }]);

  return CssCalcProductNode;
}(CssNode);

/**
 * CSS `min()` and `max()`.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/min
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/max
 */
export var CssMinMaxNode = /*#__PURE__*/function (_CssFuncNode2) {
  _inherits(CssMinMaxNode, _CssFuncNode2);

  var _super21 = _createSuper(CssMinMaxNode);

  /**
   * @param {string} name
   * @param {!Array<!CssNode>} args
   */
  function CssMinMaxNode(name, args) {
    _classCallCheck(this, CssMinMaxNode);

    return _super21.call(this, name, args);
  }

  /** @override */
  _createClass(CssMinMaxNode, [{
    key: "isConst",
    value: function isConst() {
      return false;
    }
    /** @override */

  }, {
    key: "calc",
    value: function calc(context, normalize) {
      var resolvedArgs = resolveArray(context, normalize, this.args_, null);

      if (!resolvedArgs) {
        return null;
      }

      var firstNonPercent = null;
      var hasPercent = false;
      var hasDifferentUnits = false;
      resolvedArgs.forEach(function (arg) {
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

        resolvedArgs = resolvedArgs.map(function (arg) {
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
            return (
              /** @type {!CssNumericNode} */
              arg.norm(context)
            );
          }

          return arg;
        });
      }

      // Calculate.
      var nums = resolvedArgs.map(function (arg) {
        return arg.num_;
      });
      var value;

      if (this.name_ == 'min') {
        // min(...)
        value = Math.min.apply(null, nums);
      } else if (this.name_ == 'max') {
        // max(...)
        value = Math.max.apply(null, nums);
      } else {
        // clamp(min, preferred, max)
        var min = nums[0];
        var preferred = nums[1];
        var max = nums[2];
        value = Math.max(min, Math.min(max, preferred));
      }

      return resolvedArgs[0].createSameUnits(value);
    }
  }]);

  return CssMinMaxNode;
}(CssFuncNode);

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
  var _rect$field;

  if (field == 'w') {
    return rect.width;
  }

  if (field == 'h') {
    return rect.height;
  }

  return (_rect$field = rect[field]) != null ? _rect$field : 0;
}

/**
 * @param {!CssContext} context
 * @param {boolean} normalize
 * @param {!Array<!CssNode>} array
 * @param {?Array<string>} dimensions
 * @return {?Array<!CssNode>}
 */
function resolveArray(context, normalize, array, dimensions) {
  var resolvedArray = [];

  var _loop = function _loop(i) {
    var node = array[i];
    var resolved = void 0;

    if (dimensions && i < dimensions.length) {
      resolved = context.withDimension(dimensions[i], function () {
        return node.resolve(context, normalize);
      });
    } else {
      resolved = node.resolve(context, normalize);
    }

    if (resolved) {
      resolvedArray.push(resolved);
    } else {
      // One argument is null - the function's result is null.
      return {
        v: null
      };
    }
  };

  for (var i = 0; i < array.length; i++) {
    var _ret = _loop(i);

    if (typeof _ret === "object") return _ret.v;
  }

  return resolvedArray;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNzcy1leHByLWFzdC5qcyJdLCJuYW1lcyI6WyJGSU5BTF9VUkxfUkUiLCJERUdfVE9fUkFEIiwiTWF0aCIsIlBJIiwiR1JBRF9UT19SQUQiLCJWQVJfQ1NTX1JFIiwiTk9STV9DU1NfUkUiLCJJTkZJTklUWV9SRSIsIkJPWF9ESU1FTlNJT05TIiwiVFVQTEVfRElNRU5TSU9OUyIsImlzVmFyQ3NzIiwiY3NzIiwibm9ybWFsaXplIiwidGVzdCIsIkNzc0NvbnRleHQiLCJ1bnVzZWRVcmwiLCJ1bnVzZWRWYXJOYW1lIiwidW51c2VkU2VsZWN0b3IiLCJ1bnVzZWRTZWxlY3Rpb25NZXRob2QiLCJ1bnVzZWREaW0iLCJ1bnVzZWRDYWxsYmFjayIsIkNzc05vZGUiLCJjb250ZXh0IiwiaXNDb25zdCIsImNhbGMiLCJ1bnVzZWROb3JtYWxpemUiLCJ1bnVzZWRDb250ZXh0IiwiQ3NzUGFzc3Rocm91Z2hOb2RlIiwiY3NzXyIsIkNzc0NvbmNhdE5vZGUiLCJvcHRfYXJyYXkiLCJvcHRfZGltZW5zaW9ucyIsImFycmF5XyIsIkFycmF5IiwiaXNBcnJheSIsImRpbWVuc2lvbnNfIiwibWFwIiwibm9kZSIsImpvaW4iLCJyZWR1Y2UiLCJhY2MiLCJyZXNvbHZlZEFycmF5IiwicmVzb2x2ZUFycmF5Iiwibm9kZU9yU2V0Iiwib3RoZXJOb2RlT3JTZXQiLCJzZXQiLCJjb25jYXQiLCJwdXNoIiwiQ3NzVXJsTm9kZSIsInVybCIsInVybF8iLCJyZXNvbHZlVXJsIiwiQ3NzTnVtZXJpY05vZGUiLCJ0eXBlIiwibnVtIiwidW5pdHMiLCJ0eXBlXyIsIm51bV8iLCJ1bml0c18iLCJ0b0xvd2VyQ2FzZSIsInVudXNlZE51bSIsImlzTm9ybSIsIm5vcm0iLCJ1bnVzZWRQZXJjZW50IiwiRXJyb3IiLCJDc3NOdW1iZXJOb2RlIiwiSW5maW5pdHkiLCJ1bmRlZmluZWQiLCJDc3NQZXJjZW50Tm9kZSIsImdldERpbWVuc2lvbiIsIkNzc0xlbmd0aE5vZGUiLCJjYWxjUGVyY2VudCIsImZvbnRTaXplIiwiZ2V0Q3VycmVudEZvbnRTaXplIiwiZ2V0Um9vdEZvbnRTaXplIiwidnAiLCJnZXRWaWV3cG9ydFNpemUiLCJ2dyIsIndpZHRoIiwidmgiLCJoZWlnaHQiLCJtaW4iLCJtYXgiLCJ1bmtub3duVW5pdHMiLCJwZXJjZW50IiwiZGltIiwic2l6ZSIsImdldEN1cnJlbnRFbGVtZW50UmVjdCIsInNpZGUiLCJnZXRSZWN0RmllbGQiLCJDc3NBbmdsZU5vZGUiLCJDc3NUaW1lTm9kZSIsIm1pbGxpc18iLCJDc3NGdW5jTm9kZSIsIm5hbWUiLCJhcmdzIiwibmFtZV8iLCJhcmdzXyIsInJlc29sdmVkQXJncyIsImNyZWF0ZUJveE5vZGUiLCJ2YWx1ZSIsImRpbXMiLCJsZW5ndGgiLCJjcmVhdGVCb3JkZXJSYWRpdXNOb2RlIiwiYm94MSIsIm9wdF9ib3gyIiwiYm94MU5vZGUiLCJjcmVhdGVQb3NpdGlvbk5vZGUiLCJpIiwia3ciLCJjcmVhdGVJbnNldE5vZGUiLCJib3giLCJvcHRfcm91bmQiLCJib3hOb2RlIiwiY3JlYXRlQ2lyY2xlTm9kZSIsInJhZGl1cyIsIm9wdF9wb3NpdGlvbiIsImNyZWF0ZUVsbGlwc2VOb2RlIiwicmFkaWkiLCJvcHRfbmFtZSIsInBvc2l0aW9uIiwiY3JlYXRlUG9seWdvbk5vZGUiLCJ0dXBsZXMiLCJ0dXBsZXNXaXRoRGltcyIsInR1cGxlIiwiQ3NzVHJhbnNsYXRlTm9kZSIsInN1ZmZpeCIsInRvVXBwZXJDYXNlIiwic3VmZml4XyIsIkNzc1JlY3ROb2RlIiwiZmllbGQiLCJvcHRfc2VsZWN0b3IiLCJvcHRfc2VsZWN0aW9uTWV0aG9kIiwiZmllbGRfIiwic2VsZWN0b3JfIiwic2VsZWN0aW9uTWV0aG9kXyIsIm5vQ3NzIiwicmVjdCIsImdldEVsZW1lbnRSZWN0IiwiQ3NzTnVtQ29udmVydE5vZGUiLCJ2YWx1ZV8iLCJyZXNvbHZlIiwicGFyc2VGbG9hdCIsImlzTmFOIiwiQ3NzUmFuZE5vZGUiLCJsZWZ0IiwicmlnaHQiLCJsZWZ0XyIsInJpZ2h0XyIsInJhbmRvbSIsInJhbmQiLCJjcmVhdGVTYW1lVW5pdHMiLCJDc3NJbmRleE5vZGUiLCJnZXRDdXJyZW50SW5kZXgiLCJDc3NMZW5ndGhGdW5jTm9kZSIsImdldFRhcmdldExlbmd0aCIsIkNzc1Zhck5vZGUiLCJ2YXJOYW1lIiwib3B0X2RlZiIsInZhck5hbWVfIiwiZGVmXyIsInZhck5vZGUiLCJnZXRWYXIiLCJDc3NDYWxjTm9kZSIsImV4cHIiLCJleHByXyIsIkNzc0NhbGNTdW1Ob2RlIiwib3AiLCJvcF8iLCJzaWduIiwiQ3NzQ2FsY1Byb2R1Y3ROb2RlIiwiYmFzZSIsIm11bHRpIiwiaXNGaW5pdGUiLCJDc3NNaW5NYXhOb2RlIiwiZmlyc3ROb25QZXJjZW50IiwiaGFzUGVyY2VudCIsImhhc0RpZmZlcmVudFVuaXRzIiwiZm9yRWFjaCIsImFyZyIsIm51bXMiLCJhcHBseSIsInByZWZlcnJlZCIsImFycmF5IiwiZGltZW5zaW9ucyIsInJlc29sdmVkIiwid2l0aERpbWVuc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxZQUFZLEdBQUcsa0JBQXJCO0FBQ0EsSUFBTUMsVUFBVSxHQUFJLElBQUlDLElBQUksQ0FBQ0MsRUFBVixHQUFnQixHQUFuQztBQUNBLElBQU1DLFdBQVcsR0FBR0YsSUFBSSxDQUFDQyxFQUFMLEdBQVUsR0FBOUI7QUFDQSxJQUFNRSxVQUFVLEdBQ2QsMEVBREY7QUFFQSxJQUFNQyxXQUFXLEdBQUcsMENBQXBCO0FBQ0EsSUFBTUMsV0FBVyxHQUFHLHdCQUFwQjtBQUNBLElBQU1DLGNBQWMsR0FBRyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixDQUF2QjtBQUNBLElBQU1DLGdCQUFnQixHQUFHLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBekI7O0FBRUE7QUFDQTtBQUNB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O0FBQ0QsUUFBSTZLLFFBQUosRUFBYztBQUNaaEosTUFBQUEsYUFBYSxDQUFDTSxJQUFkLENBQW1CMEksUUFBbkI7QUFDRCxLQUZELE1BRU87QUFDTDtBQUNBO0FBQUEsV0FBTztBQUFQO0FBQ0Q7QUFqQndEOztBQUUzRCxPQUFLLElBQUk3RSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHMkUsS0FBSyxDQUFDakYsTUFBMUIsRUFBa0NNLENBQUMsRUFBbkMsRUFBdUM7QUFBQSxxQkFBOUJBLENBQThCOztBQUFBO0FBZ0J0Qzs7QUFDRCxTQUFPbkUsYUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmNvbnN0IEZJTkFMX1VSTF9SRSA9IC9eKGRhdGF8aHR0cHMpXFw6L2k7XG5jb25zdCBERUdfVE9fUkFEID0gKDIgKiBNYXRoLlBJKSAvIDM2MDtcbmNvbnN0IEdSQURfVE9fUkFEID0gTWF0aC5QSSAvIDIwMDtcbmNvbnN0IFZBUl9DU1NfUkUgPVxuICAvXFxiKGNhbGN8bWlufG1heHxjbGFtcHx2YXJ8dXJsfHJhbmR8aW5kZXh8d2lkdGh8aGVpZ2h0fG51bXxsZW5ndGh8eHx5KVxcKC9pO1xuY29uc3QgTk9STV9DU1NfUkUgPSAvXFxkKCV8ZW18cmVtfHZ3fHZofHZtaW58dm1heHxzfGRlZ3xncmFkKS9pO1xuY29uc3QgSU5GSU5JVFlfUkUgPSAvXihpbmZpbml0eXxpbmZpbml0ZSkkL2k7XG5jb25zdCBCT1hfRElNRU5TSU9OUyA9IFsnaCcsICd3JywgJ2gnLCAndyddO1xuY29uc3QgVFVQTEVfRElNRU5TSU9OUyA9IFsndycsICdoJ107XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIENTUyBleHByZXNzaW9uIGNvbnRhaW5zIHZhcmlhYmxlIGNvbXBvbmVudHMuIFRoZSBDU1NcbiAqIHBhcnNpbmcgYW5kIGV2YWx1YXRpb24gaXMgaGVhdnksIGJ1dCB1c2VkIHJlbGF0aXZlbHkgcmFyZWx5LiBUaGlzIG1ldGhvZFxuICogY2FuIGJlIHVzZWQgdG8gYXZvaWQgaGVhdnkgcGFyc2UvZXZhbHVhdGUgdGFza3MuXG4gKiBAcGFyYW0ge3N0cmluZ30gY3NzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG5vcm1hbGl6ZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFyQ3NzKGNzcywgbm9ybWFsaXplKSB7XG4gIHJldHVybiBWQVJfQ1NTX1JFLnRlc3QoY3NzKSB8fCAobm9ybWFsaXplICYmIE5PUk1fQ1NTX1JFLnRlc3QoY3NzKSk7XG59XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHRoYXQgYXNzaXN0cyBpbiBDU1MgZXZhbHVhdGlvbi5cbiAqIEBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGNsYXNzIENzc0NvbnRleHQge1xuICAvKipcbiAgICogUmV0dXJucyBhIHJlc29sdmVkIFVSTC4gVGhlIHJlc3VsdCBtdXN0IGJlIGFuIGFsbG93ZWQgVVJMIGZvciBleGVjdXRpb24sXG4gICAqIHdpdGggSFRUUFMgcmVzdHJpY3Rpb25zLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkVXJsXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIHJlc29sdmVVcmwodW51c2VkVXJsKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIENTUyB2YXJpYWJsZSBvciBgbnVsbGAgaWYgbm90IGF2YWlsYWJsZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZFZhck5hbWVcbiAgICogQHJldHVybiB7P0Nzc05vZGV9XG4gICAqL1xuICBnZXRWYXIodW51c2VkVmFyTmFtZSkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCB0YXJnZXQncyBpbmRleCBpbiB0aGUgY29udGV4dCBvZiBvdGhlciBzZWxlY3RlZFxuICAgKiB0YXJnZXRzLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRDdXJyZW50SW5kZXgoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2VsZWN0ZWQgdGFyZ2V0cy5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0VGFyZ2V0TGVuZ3RoKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBmb250IHNpemUuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldEN1cnJlbnRGb250U2l6ZSgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJvb3QgZm9udCBzaXplLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRSb290Rm9udFNpemUoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2aWV3cG9ydCBzaXplLlxuICAgKiBAcmV0dXJuIHshe3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICovXG4gIGdldFZpZXdwb3J0U2l6ZSgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgZWxlbWVudCdzIHJlY3RhbmdsZS5cbiAgICogQHJldHVybiB7IS4uLy4uLy4uLy4uL3NyYy9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmfVxuICAgKi9cbiAgZ2V0Q3VycmVudEVsZW1lbnRSZWN0KCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQncyByZWN0YW5nbGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bnVzZWRTZWxlY3RvclxuICAgKiBAcGFyYW0gez9zdHJpbmd9IHVudXNlZFNlbGVjdGlvbk1ldGhvZFxuICAgKiBAcmV0dXJuIHshLi4vLi4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAqL1xuICBnZXRFbGVtZW50UmVjdCh1bnVzZWRTZWxlY3RvciwgdW51c2VkU2VsZWN0aW9uTWV0aG9kKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaW1lbnNpb246IFwid1wiIGZvciB3aWR0aCBvciBcImhcIiBmb3IgaGVpZ2h0LlxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgKi9cbiAgZ2V0RGltZW5zaW9uKCkge31cblxuICAvKipcbiAgICogUHVzaGVzIHRoZSBkaW1lbnNpb246IFwid1wiIGZvciB3aWR0aCBvciBcImhcIiBmb3IgaGVpZ2h0LlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IHVudXNlZERpbVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6VH0gdW51c2VkQ2FsbGJhY2tcbiAgICogQHJldHVybiB7VH1cbiAgICogQHRlbXBsYXRlIFRcbiAgICovXG4gIHdpdGhEaW1lbnNpb24odW51c2VkRGltLCB1bnVzZWRDYWxsYmFjaykge31cbn1cblxuLyoqXG4gKiBBIGJhc2UgY2xhc3MgZm9yIGFsbCBDU1Mgbm9kZSBjb21wb25lbnRzIGRlZmluZWQgaW4gdGhlXG4gKiBgY3NzLWV4cHItaW1wbC5qaXNvbmAuXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIENzc05vZGUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBDc3NOb2RlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIENTUyByZXByZXNlbnRhdGlvbi5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGNzcygpIHt9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHRoZSB2YWx1ZSBvZiBhbGwgdmFyaWFibGUgY29tcG9uZW50cy4gT25seSBwZXJmb3JtcyBhbnkgd29yayBpZlxuICAgKiB2YXJpYWJsZSBjb21wb25lbnRzIGV4aXN0LiBBcyBhbiBvcHRpbWl6YXRpb24sIHRoaXMgbm9kZSBpcyByZXR1cm5lZFxuICAgKiBmb3IgYSBub24tdmFyaWFibGUgbm9kZXMgKGBpc0NvbnN0KCkgPT0gdHJ1ZWApLiBPdGhlcndpc2UsIGBjYWxjKClgIG1ldGhvZFxuICAgKiBpcyB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgbmV3IHZhbHVlLlxuICAgKiBAcGFyYW0geyFDc3NDb250ZXh0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9ybWFsaXplXG4gICAqIEByZXR1cm4gez9Dc3NOb2RlfVxuICAgKiBAZmluYWxcbiAgICovXG4gIHJlc29sdmUoY29udGV4dCwgbm9ybWFsaXplKSB7XG4gICAgaWYgKHRoaXMuaXNDb25zdChub3JtYWxpemUpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsYyhjb250ZXh0LCBub3JtYWxpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIENTUyBub2RlIGlzIGEgY29uc3RhbnQgb3IgaW5jbHVkZXMgdmFyaWFibGUgY29tcG9uZW50cy5cbiAgICogQHBhcmFtIHtib29sZWFufSB1bnVzZWROb3JtYWxpemVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgaXNDb25zdCh1bnVzZWROb3JtYWxpemUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSB2YWx1ZSBvZiBhbGwgdmFyaWFibGUgY29tcG9uZW50cy5cbiAgICogQHBhcmFtIHshQ3NzQ29udGV4dH0gdW51c2VkQ29udGV4dFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVudXNlZE5vcm1hbGl6ZVxuICAgKiBAcmV0dXJuIHs/Q3NzTm9kZX1cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgY2FsYyh1bnVzZWRDb250ZXh0LCB1bnVzZWROb3JtYWxpemUpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIEEgQ1NTIGV4cHJlc3Npb24gdGhhdCdzIHNpbXBseSBwYXNzZWQgdGhyb3VnaCBmcm9tIHRoZSBvcmlnaW5hbCBleHByZXNzaW9uLlxuICogVXNlZCBmb3IgYHVybCgpYCwgY29sb3JzLCBldGMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NQYXNzdGhyb3VnaE5vZGUgZXh0ZW5kcyBDc3NOb2RlIHtcbiAgLyoqIEBwYXJhbSB7c3RyaW5nfSBjc3MgKi9cbiAgY29uc3RydWN0b3IoY3NzKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHtzdHJpbmd9ICovXG4gICAgdGhpcy5jc3NfID0gY3NzO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3NzXztcbiAgfVxufVxuXG4vKipcbiAqIEEgY29uY2F0ZW5hdGlvbiBvZiBDU1MgZXhwcmVzc2lvbnM6IGB0cmFuc2xhdGVYKC4uLikgcm90YXRlKC4uLilgLFxuICogYDFzIG5vcm1hbGAsIGV0Yy5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc0NvbmNhdE5vZGUgZXh0ZW5kcyBDc3NOb2RlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7KCFBcnJheTwhQ3NzTm9kZT58IUNzc05vZGUpPX0gb3B0X2FycmF5XG4gICAqIEBwYXJhbSB7P0FycmF5PHN0cmluZz49fSBvcHRfZGltZW5zaW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0X2FycmF5LCBvcHRfZGltZW5zaW9ucykge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFBcnJheTwhQ3NzTm9kZT59ICovXG4gICAgdGhpcy5hcnJheV8gPVxuICAgICAgb3B0X2FycmF5IGluc3RhbmNlb2YgQ3NzQ29uY2F0Tm9kZVxuICAgICAgICA/IG9wdF9hcnJheS5hcnJheV9cbiAgICAgICAgOiBBcnJheS5pc0FycmF5KG9wdF9hcnJheSlcbiAgICAgICAgPyBvcHRfYXJyYXlcbiAgICAgICAgOiBvcHRfYXJyYXlcbiAgICAgICAgPyBbb3B0X2FycmF5XVxuICAgICAgICA6IFtdO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgez9BcnJheTxzdHJpbmc+fSAqL1xuICAgIHRoaXMuZGltZW5zaW9uc18gPSBvcHRfZGltZW5zaW9ucyB8fCBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmNhdGVuYXRlcyB0d28gc2V0cyBvZiBleHByZXNzaW9ucy5cbiAgICogQHBhcmFtIHshQ3NzTm9kZX0gbm9kZU9yU2V0XG4gICAqIEBwYXJhbSB7IUNzc05vZGV9IG90aGVyTm9kZU9yU2V0XG4gICAqIEByZXR1cm4geyFDc3NDb25jYXROb2RlfVxuICAgKi9cbiAgc3RhdGljIGNvbmNhdChub2RlT3JTZXQsIG90aGVyTm9kZU9yU2V0KSB7XG4gICAgbGV0IHNldDtcbiAgICBpZiAobm9kZU9yU2V0IGluc3RhbmNlb2YgQ3NzQ29uY2F0Tm9kZSkge1xuICAgICAgc2V0ID0gbm9kZU9yU2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXQgPSBuZXcgQ3NzQ29uY2F0Tm9kZShbbm9kZU9yU2V0XSk7XG4gICAgfVxuICAgIGlmIChvdGhlck5vZGVPclNldCBpbnN0YW5jZW9mIENzc0NvbmNhdE5vZGUpIHtcbiAgICAgIHNldC5hcnJheV8gPSBzZXQuYXJyYXlfLmNvbmNhdChvdGhlck5vZGVPclNldC5hcnJheV8pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXQuYXJyYXlfLnB1c2gob3RoZXJOb2RlT3JTZXQpO1xuICAgIH1cbiAgICByZXR1cm4gc2V0O1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXJyYXlfLm1hcCgobm9kZSkgPT4gbm9kZS5jc3MoKSkuam9pbignICcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KG5vcm1hbGl6ZSkge1xuICAgIHJldHVybiB0aGlzLmFycmF5Xy5yZWR1Y2UoXG4gICAgICAoYWNjLCBub2RlKSA9PiBhY2MgJiYgbm9kZS5pc0NvbnN0KG5vcm1hbGl6ZSksXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2FsYyhjb250ZXh0LCBub3JtYWxpemUpIHtcbiAgICBjb25zdCByZXNvbHZlZEFycmF5ID0gcmVzb2x2ZUFycmF5KFxuICAgICAgY29udGV4dCxcbiAgICAgIG5vcm1hbGl6ZSxcbiAgICAgIHRoaXMuYXJyYXlfLFxuICAgICAgdGhpcy5kaW1lbnNpb25zX1xuICAgICk7XG4gICAgcmV0dXJuIHJlc29sdmVkQXJyYXkgPyBuZXcgQ3NzQ29uY2F0Tm9kZShyZXNvbHZlZEFycmF5KSA6IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IFVSTCBpcyBhbiBIVFRQUyBVUkwuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NVcmxOb2RlIGV4dGVuZHMgQ3NzTm9kZSB7XG4gIC8qKiBAcGFyYW0ge3N0cmluZ30gdXJsICovXG4gIGNvbnN0cnVjdG9yKHVybCkge1xuICAgIHN1cGVyKCk7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfSAqL1xuICAgIHRoaXMudXJsXyA9IHVybDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY3NzKCkge1xuICAgIGlmICghdGhpcy51cmxfKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBgdXJsKFwiJHt0aGlzLnVybF99XCIpYDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNDb25zdCgpIHtcbiAgICByZXR1cm4gIXRoaXMudXJsXyB8fCBGSU5BTF9VUkxfUkUudGVzdCh0aGlzLnVybF8pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjYWxjKGNvbnRleHQpIHtcbiAgICBjb25zdCB1cmwgPSBjb250ZXh0LnJlc29sdmVVcmwodGhpcy51cmxfKTtcbiAgICAvLyBSZXR1cm4gYSBwYXNzdGhyb3VnaCBDU1MgdG8gYXZvaWQgcmVjdXJzaXZlIGB1cmwoKWAgZXZhbHVhdGlvbi5cbiAgICByZXR1cm4gbmV3IENzc1Bhc3N0aHJvdWdoTm9kZShgdXJsKFwiJHt1cmx9XCIpYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIENzc051bWVyaWNOb2RlIGV4dGVuZHMgQ3NzTm9kZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bml0c1xuICAgKi9cbiAgY29uc3RydWN0b3IodHlwZSwgbnVtLCB1bml0cykge1xuICAgIHN1cGVyKCk7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfSAqL1xuICAgIHRoaXMudHlwZV8gPSB0eXBlO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge251bWJlcn0gKi9cbiAgICB0aGlzLm51bV8gPSBudW07XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfSAqL1xuICAgIHRoaXMudW5pdHNfID0gdW5pdHMudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY3NzKCkge1xuICAgIHJldHVybiBgJHt0aGlzLm51bV99JHt0aGlzLnVuaXRzX31gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB1bnVzZWROdW1cbiAgICogQHJldHVybiB7IUNzc051bWVyaWNOb2RlfVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGNyZWF0ZVNhbWVVbml0cyh1bnVzZWROdW0pIHt9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KG5vcm1hbGl6ZSkge1xuICAgIHJldHVybiBub3JtYWxpemUgPyB0aGlzLmlzTm9ybSgpIDogdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNOb3JtKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUNzc0NvbnRleHR9IHVudXNlZENvbnRleHRcbiAgICogQHJldHVybiB7IUNzc051bWVyaWNOb2RlfVxuICAgKi9cbiAgbm9ybSh1bnVzZWRDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNhbGMoY29udGV4dCwgbm9ybWFsaXplKSB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZSA/IHRoaXMubm9ybShjb250ZXh0KSA6IHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHVudXNlZFBlcmNlbnRcbiAgICogQHBhcmFtIHshQ3NzQ29udGV4dH0gdW51c2VkQ29udGV4dFxuICAgKiBAcmV0dXJuIHshQ3NzTnVtZXJpY05vZGV9XG4gICAqL1xuICBjYWxjUGVyY2VudCh1bnVzZWRQZXJjZW50LCB1bnVzZWRDb250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgY2FsY3VsYXRlIHBlcmNlbnQgZm9yICcgKyB0aGlzLnR5cGVfKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgQ1NTIG51bWJlcjogYDEwMGAsIGAxZTJgLCBgMWUtMmAsIGAwLjVgLCBldGMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NOdW1iZXJOb2RlIGV4dGVuZHMgQ3NzTnVtZXJpY05vZGUge1xuICAvKiogQHBhcmFtIHtudW1iZXJ9IG51bSAqL1xuICBjb25zdHJ1Y3RvcihudW0pIHtcbiAgICBzdXBlcignTlVNJywgbnVtLCAnJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNyZWF0ZVNhbWVVbml0cyhudW0pIHtcbiAgICByZXR1cm4gbmV3IENzc051bWJlck5vZGUobnVtKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbnVtZXJpY2FsIHZhbHVlIG9mIHRoZSBub2RlIGlmIHBvc3NpYmxlLiBgSW5maW5pdHlgIGlzIG9uZSBvZlxuICAgKiBwb3NzaWJsZSByZXR1cm4gdmFsdWVzLlxuICAgKiBAcGFyYW0geyFDc3NOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge251bWJlcnx1bmRlZmluZWR9XG4gICAqL1xuICBzdGF0aWMgbnVtKG5vZGUpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIENzc051bWJlck5vZGUpIHtcbiAgICAgIHJldHVybiBub2RlLm51bV87XG4gICAgfVxuICAgIGNvbnN0IGNzcyA9IG5vZGUuY3NzKCk7XG4gICAgaWYgKElORklOSVRZX1JFLnRlc3QoY3NzKSkge1xuICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogQSBDU1MgcGVyY2VudCB2YWx1ZTogYDEwMCVgLCBgMC41JWAsIGV0Yy5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc1BlcmNlbnROb2RlIGV4dGVuZHMgQ3NzTnVtZXJpY05vZGUge1xuICAvKiogQHBhcmFtIHtudW1iZXJ9IG51bSAqL1xuICBjb25zdHJ1Y3RvcihudW0pIHtcbiAgICBzdXBlcignUFJDJywgbnVtLCAnJScpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjcmVhdGVTYW1lVW5pdHMobnVtKSB7XG4gICAgcmV0dXJuIG5ldyBDc3NQZXJjZW50Tm9kZShudW0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc05vcm0oKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBub3JtKGNvbnRleHQpIHtcbiAgICBpZiAoY29udGV4dC5nZXREaW1lbnNpb24oKSkge1xuICAgICAgcmV0dXJuIG5ldyBDc3NMZW5ndGhOb2RlKDAsICdweCcpLmNhbGNQZXJjZW50KHRoaXMubnVtXywgY29udGV4dCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbi8qKlxuICogQSBDU1MgbGVuZ3RoIHZhbHVlOiBgMTAwcHhgLCBgODB2d2AsIGV0Yy5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc0xlbmd0aE5vZGUgZXh0ZW5kcyBDc3NOdW1lcmljTm9kZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1bml0c1xuICAgKi9cbiAgY29uc3RydWN0b3IobnVtLCB1bml0cykge1xuICAgIHN1cGVyKCdMRU4nLCBudW0sIHVuaXRzKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY3JlYXRlU2FtZVVuaXRzKG51bSkge1xuICAgIHJldHVybiBuZXcgQ3NzTGVuZ3RoTm9kZShudW0sIHRoaXMudW5pdHNfKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNOb3JtKCkge1xuICAgIHJldHVybiB0aGlzLnVuaXRzXyA9PSAncHgnO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBub3JtKGNvbnRleHQpIHtcbiAgICBpZiAodGhpcy5pc05vcm0oKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gRm9udC1iYXNlZDogZW0vcmVtLlxuICAgIGlmICh0aGlzLnVuaXRzXyA9PSAnZW0nIHx8IHRoaXMudW5pdHNfID09ICdyZW0nKSB7XG4gICAgICBjb25zdCBmb250U2l6ZSA9XG4gICAgICAgIHRoaXMudW5pdHNfID09ICdlbSdcbiAgICAgICAgICA/IGNvbnRleHQuZ2V0Q3VycmVudEZvbnRTaXplKClcbiAgICAgICAgICA6IGNvbnRleHQuZ2V0Um9vdEZvbnRTaXplKCk7XG4gICAgICByZXR1cm4gbmV3IENzc0xlbmd0aE5vZGUodGhpcy5udW1fICogZm9udFNpemUsICdweCcpO1xuICAgIH1cblxuICAgIC8vIFZpZXdwb3J0IGJhc2VkOiB2dywgdmgsIHZtaW4sIHZtYXguXG4gICAgaWYgKFxuICAgICAgdGhpcy51bml0c18gPT0gJ3Z3JyB8fFxuICAgICAgdGhpcy51bml0c18gPT0gJ3ZoJyB8fFxuICAgICAgdGhpcy51bml0c18gPT0gJ3ZtaW4nIHx8XG4gICAgICB0aGlzLnVuaXRzXyA9PSAndm1heCdcbiAgICApIHtcbiAgICAgIGNvbnN0IHZwID0gY29udGV4dC5nZXRWaWV3cG9ydFNpemUoKTtcbiAgICAgIGNvbnN0IHZ3ID0gKHZwLndpZHRoICogdGhpcy5udW1fKSAvIDEwMDtcbiAgICAgIGNvbnN0IHZoID0gKHZwLmhlaWdodCAqIHRoaXMubnVtXykgLyAxMDA7XG4gICAgICBsZXQgbnVtID0gMDtcbiAgICAgIGlmICh0aGlzLnVuaXRzXyA9PSAndncnKSB7XG4gICAgICAgIG51bSA9IHZ3O1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnVuaXRzXyA9PSAndmgnKSB7XG4gICAgICAgIG51bSA9IHZoO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnVuaXRzXyA9PSAndm1pbicpIHtcbiAgICAgICAgbnVtID0gTWF0aC5taW4odncsIHZoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy51bml0c18gPT0gJ3ZtYXgnKSB7XG4gICAgICAgIG51bSA9IE1hdGgubWF4KHZ3LCB2aCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENzc0xlbmd0aE5vZGUobnVtLCAncHgnKTtcbiAgICB9XG5cbiAgICAvLyBDYW4ndCBjb252ZXJ0IGNtL2luL2V0YyB0byBweCBhdCB0aGlzIHRpbWUuXG4gICAgdGhyb3cgdW5rbm93blVuaXRzKHRoaXMudW5pdHNfKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2FsY1BlcmNlbnQocGVyY2VudCwgY29udGV4dCkge1xuICAgIGNvbnN0IGRpbSA9IGNvbnRleHQuZ2V0RGltZW5zaW9uKCk7XG4gICAgY29uc3Qgc2l6ZSA9IGNvbnRleHQuZ2V0Q3VycmVudEVsZW1lbnRSZWN0KCk7XG4gICAgY29uc3Qgc2lkZSA9IGdldFJlY3RGaWVsZChkaW0sIHNpemUpO1xuICAgIHJldHVybiBuZXcgQ3NzTGVuZ3RoTm9kZSgoc2lkZSAqIHBlcmNlbnQpIC8gMTAwLCAncHgnKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgQ1NTIGFuZ2xlIHZhbHVlOiBgNDVkZWdgLCBgMC41cmFkYCwgZXRjLlxuICovXG5leHBvcnQgY2xhc3MgQ3NzQW5nbGVOb2RlIGV4dGVuZHMgQ3NzTnVtZXJpY05vZGUge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW5pdHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKG51bSwgdW5pdHMpIHtcbiAgICBzdXBlcignQU5HJywgbnVtLCB1bml0cyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNyZWF0ZVNhbWVVbml0cyhudW0pIHtcbiAgICByZXR1cm4gbmV3IENzc0FuZ2xlTm9kZShudW0sIHRoaXMudW5pdHNfKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNOb3JtKCkge1xuICAgIHJldHVybiB0aGlzLnVuaXRzXyA9PSAncmFkJztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbm9ybSgpIHtcbiAgICBpZiAodGhpcy5pc05vcm0oKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICh0aGlzLnVuaXRzXyA9PSAnZGVnJykge1xuICAgICAgcmV0dXJuIG5ldyBDc3NBbmdsZU5vZGUodGhpcy5udW1fICogREVHX1RPX1JBRCwgJ3JhZCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy51bml0c18gPT0gJ2dyYWQnKSB7XG4gICAgICByZXR1cm4gbmV3IENzc0FuZ2xlTm9kZSh0aGlzLm51bV8gKiBHUkFEX1RPX1JBRCwgJ3JhZCcpO1xuICAgIH1cbiAgICB0aHJvdyB1bmtub3duVW5pdHModGhpcy51bml0c18pO1xuICB9XG59XG5cbi8qKlxuICogQSBDU1MgdGltZSB2YWx1ZTogYDFzYCwgYDYwMG1zYC5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc1RpbWVOb2RlIGV4dGVuZHMgQ3NzTnVtZXJpY05vZGUge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW5pdHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKG51bSwgdW5pdHMpIHtcbiAgICBzdXBlcignVE1FJywgbnVtLCB1bml0cyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNyZWF0ZVNhbWVVbml0cyhudW0pIHtcbiAgICByZXR1cm4gbmV3IENzc1RpbWVOb2RlKG51bSwgdGhpcy51bml0c18pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc05vcm0oKSB7XG4gICAgcmV0dXJuIHRoaXMudW5pdHNfID09ICdtcyc7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG5vcm0oKSB7XG4gICAgaWYgKHRoaXMuaXNOb3JtKCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENzc1RpbWVOb2RlKHRoaXMubWlsbGlzXygpLCAnbXMnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtaWxsaXNfKCkge1xuICAgIGlmICh0aGlzLnVuaXRzXyA9PSAnbXMnKSB7XG4gICAgICByZXR1cm4gdGhpcy5udW1fO1xuICAgIH1cbiAgICBpZiAodGhpcy51bml0c18gPT0gJ3MnKSB7XG4gICAgICByZXR1cm4gdGhpcy5udW1fICogMTAwMDtcbiAgICB9XG4gICAgdGhyb3cgdW5rbm93blVuaXRzKHRoaXMudW5pdHNfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFDc3NOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge251bWJlcnx1bmRlZmluZWR9XG4gICAqL1xuICBzdGF0aWMgbWlsbGlzKG5vZGUpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIENzc1RpbWVOb2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5taWxsaXNfKCk7XG4gICAgfVxuICAgIGlmIChub2RlIGluc3RhbmNlb2YgQ3NzTnVtYmVyTm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUubnVtXztcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIEEgQ1NTIGdlbmVyaWMgZnVuY3Rpb246IGByZ2IoMSwgMSwgMSlgLCBgdHJhbnNsYXRlWCgzMDBweClgLCBldGMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NGdW5jTm9kZSBleHRlbmRzIENzc05vZGUge1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHshQXJyYXk8IUNzc05vZGU+fSBhcmdzXG4gICAqIEBwYXJhbSB7P0FycmF5PHN0cmluZz49fSBvcHRfZGltZW5zaW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IobmFtZSwgYXJncywgb3B0X2RpbWVuc2lvbnMpIHtcbiAgICBzdXBlcigpO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLm5hbWVfID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFBcnJheTwhQ3NzTm9kZT59ICovXG4gICAgdGhpcy5hcmdzXyA9IGFyZ3M7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7P0FycmF5PHN0cmluZz59ICovXG4gICAgdGhpcy5kaW1lbnNpb25zXyA9IG9wdF9kaW1lbnNpb25zIHx8IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNzcygpIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5hcmdzXy5tYXAoKG5vZGUpID0+IG5vZGUuY3NzKCkpLmpvaW4oJywnKTtcbiAgICByZXR1cm4gYCR7dGhpcy5uYW1lX30oJHthcmdzfSlgO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KG5vcm1hbGl6ZSkge1xuICAgIHJldHVybiB0aGlzLmFyZ3NfLnJlZHVjZShcbiAgICAgIChhY2MsIG5vZGUpID0+IGFjYyAmJiBub2RlLmlzQ29uc3Qobm9ybWFsaXplKSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjYWxjKGNvbnRleHQsIG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHJlc29sdmVkQXJncyA9IHJlc29sdmVBcnJheShcbiAgICAgIGNvbnRleHQsXG4gICAgICBub3JtYWxpemUsXG4gICAgICB0aGlzLmFyZ3NfLFxuICAgICAgdGhpcy5kaW1lbnNpb25zX1xuICAgICk7XG4gICAgcmV0dXJuIHJlc29sdmVkQXJncyA/IG5ldyBDc3NGdW5jTm9kZSh0aGlzLm5hbWVfLCByZXNvbHZlZEFyZ3MpIDogbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEEgc3BhY2Ugc2VwYXJhdGVkIGJveCBkZWNsYXJhdGlvbiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL21hcmdpbikuXG4gKlxuICogVHlwaWNhbCBmb3JtcyBhcmU6XG4gKiAtIGA8dG9wPiA8cmlnaHQ+IDxib3R0b20+IDxsZWZ0PmAgKGUuZy4gYDEwJSAyMGVtIDMwcHggdmFyKC0teClgKVxuICogLSBgPHRvcD4gPGhvcml6b250YWw+IDxib3R0b20+YCAoZS5nLiBgMTAlIDIwZW0gMzB2d2ApXG4gKiAtIGA8dmVydGljYWw+IDxob3Jpem9udGFsPmAgKGUuZy4gYDEwJSAyMGVtYClcbiAqIC0gYDxhbGw+YCAoZS5nLiBgMTAlYClcbiAqXG4gKiBAcGFyYW0geyFDc3NOb2RlfSB2YWx1ZVxuICogQHBhcmFtIHs/QXJyYXk8c3RyaW5nPj19IG9wdF9kaW1lbnNpb25zXG4gKiBAcmV0dXJuIHshQ3NzTm9kZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJveE5vZGUodmFsdWUsIG9wdF9kaW1lbnNpb25zKSB7XG4gIGNvbnN0IGRpbXMgPSBvcHRfZGltZW5zaW9ucyB8fCBCT1hfRElNRU5TSU9OUztcblxuICBjb25zdCBhcmdzID0gdmFsdWUgaW5zdGFuY2VvZiBDc3NDb25jYXROb2RlID8gdmFsdWUuYXJyYXlfIDogW3ZhbHVlXTtcbiAgaWYgKGFyZ3MubGVuZ3RoIDwgMSB8fCBhcmdzLmxlbmd0aCA+IDQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JveCBtdXN0IGhhdmUgYmV0d2VlbiAxIGFuZCA0IGNvbXBvbmVudHMnKTtcbiAgfVxuXG4gIGlmIChkaW1zLmxlbmd0aCA+IDApIHtcbiAgICAvLyBXZSBoYXZlIHRvIGFsd2F5cyB0dXJuIGFsbCBmb3JtcyBpbnRvIHRoZSBmdWxsIGZvcm0gYXQgbGVhc3QgdHdvXG4gICAgLy8gYDx2ZXJ0aWNhbD4gPGhvcml6b250YWw+YCwgYmVjYXVzZSB3ZSBjYW5ub3Qgb3RoZXJ3aXNlIGFwcGx5XG4gICAgLy8gdGhlIGNvcnJlY3QgZGltZW5zaW9ucyB0byBhIHNpbmdsZSBhcmd1bWVudC5cbiAgICByZXR1cm4gbmV3IENzc0NvbmNhdE5vZGUoXG4gICAgICBhcmdzLmxlbmd0aCA9PSAxID8gW2FyZ3NbMF0sIGFyZ3NbMF1dIDogYXJncyxcbiAgICAgIGRpbXNcbiAgICApO1xuICB9XG4gIHJldHVybiBuZXcgQ3NzQ29uY2F0Tm9kZShhcmdzKTtcbn1cblxuLyoqXG4gKiBBIENTUyBgYm9yZGVyLXJhZGl1cygpYCBleHByZXNzaW9uOiBgYm94YCBvciBgYm94MSAvIGJveDJgLlxuICpcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvYm9yZGVyLXJhZGl1c1xuICpcbiAqIEBwYXJhbSB7IUNzc05vZGV9IGJveDFcbiAqIEBwYXJhbSB7IUNzc05vZGU9fSBvcHRfYm94MlxuICogQHJldHVybiB7IUNzc05vZGV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCb3JkZXJSYWRpdXNOb2RlKGJveDEsIG9wdF9ib3gyKSB7XG4gIGNvbnN0IGJveDFOb2RlID0gY3JlYXRlQm94Tm9kZShib3gxLCBbXSk7XG4gIGlmIChvcHRfYm94Mikge1xuICAgIHJldHVybiBuZXcgQ3NzQ29uY2F0Tm9kZShbXG4gICAgICBib3gxTm9kZSxcbiAgICAgIG5ldyBDc3NQYXNzdGhyb3VnaE5vZGUoJy8nKSxcbiAgICAgIGNyZWF0ZUJveE5vZGUob3B0X2JveDIsIFtdKSxcbiAgICBdKTtcbiAgfVxuICByZXR1cm4gYm94MU5vZGU7XG59XG5cbi8qKlxuICogQSBDU1MgYHBvc2l0aW9uYCBleHByZXNzaW9uLlxuICpcbiAqIFNlZSBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL3Bvc2l0aW9uX3ZhbHVlXG4gKlxuICogVmFyaWFudHM6XG4gKiAtIGAxMCVgIC0gWCBwZXJjZW50YWdlLlxuICogLSBgMTAlIDEwJWAgLSBYIGFuZCBZIHBlcmNlbnRhZ2VzLlxuICogLSBgbGVmdCAxMCVgIC0gWCBrZXl3b3JkIGFuZCBZIHBlcmNlbnRhZ2UuXG4gKiAtIGBsZWZ0IDEwJSB0b3AgMjAlYCAtIFgga2V5d29yZCBhbmQgWSBwZXJjZW50YWdlLlxuICpcbiAqIEBwYXJhbSB7IUNzc05vZGV9IHZhbHVlXG4gKiBAcmV0dXJuIHshQ3NzTm9kZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBvc2l0aW9uTm9kZSh2YWx1ZSkge1xuICBjb25zdCBhcmdzID0gdmFsdWUgaW5zdGFuY2VvZiBDc3NDb25jYXROb2RlID8gdmFsdWUuYXJyYXlfIDogW3ZhbHVlXTtcbiAgaWYgKGFyZ3MubGVuZ3RoICE9IDEgJiYgYXJncy5sZW5ndGggIT0gMiAmJiBhcmdzLmxlbmd0aCAhPSA0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwb3NpdGlvbiBpcyBlaXRoZXIgMSwgMiwgb3IgNCBjb21wb25lbnRzJyk7XG4gIH1cblxuICBsZXQgZGltcyA9IG51bGw7XG4gIGlmIChhcmdzLmxlbmd0aCA9PSAxKSB7XG4gICAgZGltcyA9IFsndyddO1xuICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09IDIpIHtcbiAgICBkaW1zID0gWyd3JywgJ2gnXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBbIGxlZnQgfCBjZW50ZXIgfCByaWdodCBdIHx8IFsgdG9wIHwgY2VudGVyIHwgYm90dG9tIF1cbiAgICBkaW1zID0gWycnLCAnJywgJycsICcnXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIGNvbnN0IGt3ID0gYXJnc1tpXS5jc3MoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgZGltID1cbiAgICAgICAga3cgPT0gJ2xlZnQnIHx8IGt3ID09ICdyaWdodCdcbiAgICAgICAgICA/ICd3J1xuICAgICAgICAgIDoga3cgPT0gJ3RvcCcgfHwga3cgPT0gJ2JvdHRvbSdcbiAgICAgICAgICA/ICdoJ1xuICAgICAgICAgIDogJyc7XG4gICAgICBkaW1zW2ldID0gZGltc1tpICsgMV0gPSBkaW07XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXcgQ3NzQ29uY2F0Tm9kZShhcmdzLCBkaW1zKTtcbn1cblxuLyoqXG4gKiBBIENTUyBgaW5zZXQoKWAgZXhwcmVzc2lvbjpcbiAqIGBpbnNldCggPGxlbmd0aC1wZXJjZW50YWdlPnsxLDR9IFsgcm91bmQgPCdib3JkZXItcmFkaXVzJz4gXT8gKWAuXG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9jbGlwLXBhdGgjaW5zZXQoKS5cbiAqXG4gKiBAcGFyYW0geyFDc3NOb2RlfSBib3hcbiAqIEBwYXJhbSB7IUNzc05vZGU9fSBvcHRfcm91bmRcbiAqIEByZXR1cm4geyFDc3NOb2RlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5zZXROb2RlKGJveCwgb3B0X3JvdW5kKSB7XG4gIGNvbnN0IGJveE5vZGUgPSBjcmVhdGVCb3hOb2RlKGJveCk7XG4gIGlmIChvcHRfcm91bmQpIHtcbiAgICByZXR1cm4gbmV3IENzc0Z1bmNOb2RlKCdpbnNldCcsIFtcbiAgICAgIG5ldyBDc3NDb25jYXROb2RlKFtib3hOb2RlLCBuZXcgQ3NzUGFzc3Rocm91Z2hOb2RlKCdyb3VuZCcpLCBvcHRfcm91bmRdKSxcbiAgICBdKTtcbiAgfVxuICByZXR1cm4gbmV3IENzc0Z1bmNOb2RlKCdpbnNldCcsIFtib3hOb2RlXSk7XG59XG5cbi8qKlxuICogQSBDU1MgYGNpcmNsZSgpYCBleHByZXNzaW9uOlxuICogYDxjaXJjbGUoKT4gPSBjaXJjbGUoIFsgPHNoYXBlLXJhZGl1cz4gXT8gWyBhdCA8cG9zaXRpb24+IF0/IClgLlxuICpcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvY2xpcC1wYXRoI2NpcmNsZSgpXG4gKlxuICogQHBhcmFtIHs/Q3NzTm9kZX0gcmFkaXVzXG4gKiBAcGFyYW0geyFDc3NOb2RlPX0gb3B0X3Bvc2l0aW9uXG4gKiBAcmV0dXJuIHshQ3NzTm9kZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNpcmNsZU5vZGUocmFkaXVzLCBvcHRfcG9zaXRpb24pIHtcbiAgcmV0dXJuIGNyZWF0ZUVsbGlwc2VOb2RlKHJhZGl1cywgb3B0X3Bvc2l0aW9uLCAnY2lyY2xlJyk7XG59XG5cbi8qKlxuICogQSBDU1MgYGVsbGlwc2UoKWAgZXhwcmVzc2lvbjpcbiAqIGA8ZWxsaXBzZSgpPiA9IGVsbGlwc2UoIFsgPHNoYXBlLXJhZGl1cz57Mn0gXT8gWyBhdCA8cG9zaXRpb24+IF0/IClgLlxuICpcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvY2xpcC1wYXRoI2VsbGlwc2UoKVxuICpcbiAqIEBwYXJhbSB7P0Nzc05vZGV9IHJhZGlpXG4gKiBAcGFyYW0geyFDc3NOb2RlPX0gb3B0X3Bvc2l0aW9uXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9uYW1lXG4gKiBAcmV0dXJuIHshQ3NzTm9kZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsbGlwc2VOb2RlKHJhZGlpLCBvcHRfcG9zaXRpb24sIG9wdF9uYW1lKSB7XG4gIGNvbnN0IG5hbWUgPSBvcHRfbmFtZSB8fCAnZWxsaXBzZSc7XG4gIGNvbnN0IHBvc2l0aW9uID0gb3B0X3Bvc2l0aW9uID8gY3JlYXRlUG9zaXRpb25Ob2RlKG9wdF9wb3NpdGlvbikgOiBudWxsO1xuICBpZiAoIXJhZGlpICYmICFwb3NpdGlvbikge1xuICAgIHJldHVybiBuZXcgQ3NzRnVuY05vZGUobmFtZSwgW10pO1xuICB9XG4gIGlmIChyYWRpaSAmJiBwb3NpdGlvbikge1xuICAgIHJldHVybiBuZXcgQ3NzRnVuY05vZGUobmFtZSwgW1xuICAgICAgbmV3IENzc0NvbmNhdE5vZGUoW3JhZGlpLCBuZXcgQ3NzUGFzc3Rocm91Z2hOb2RlKCdhdCcpLCBwb3NpdGlvbl0pLFxuICAgIF0pO1xuICB9XG4gIGlmIChwb3NpdGlvbikge1xuICAgIHJldHVybiBuZXcgQ3NzRnVuY05vZGUobmFtZSwgW1xuICAgICAgbmV3IENzc0NvbmNhdE5vZGUoW25ldyBDc3NQYXNzdGhyb3VnaE5vZGUoJ2F0JyksIHBvc2l0aW9uXSksXG4gICAgXSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBDc3NGdW5jTm9kZShuYW1lLCBbcmFkaWldKTtcbn1cblxuLyoqXG4gKiBBIENTUyBgcG9seWdvbigpYCBleHByZXNzaW9uOlxuICogYDxwb2x5Z29uKCk+ID0gcG9seWdvbiggWyA8bGVuZ3RoLXBlcmNlbnRhZ2U+IDxsZW5ndGgtcGVyY2VudGFnZT4gXSMgKWAuXG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9jbGlwLXBhdGgjcG9seWdvbigpXG4gKlxuICogQHBhcmFtIHshQXJyYXk8IUNzc05vZGU+fSB0dXBsZXNcbiAqIEByZXR1cm4geyFDc3NOb2RlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUG9seWdvbk5vZGUodHVwbGVzKSB7XG4gIGNvbnN0IHR1cGxlc1dpdGhEaW1zID0gdHVwbGVzLm1hcChcbiAgICAodHVwbGUpID0+IG5ldyBDc3NDb25jYXROb2RlKHR1cGxlLCBUVVBMRV9ESU1FTlNJT05TKVxuICApO1xuICByZXR1cm4gbmV3IENzc0Z1bmNOb2RlKCdwb2x5Z29uJywgdHVwbGVzV2l0aERpbXMpO1xufVxuXG4vKipcbiAqIEEgQ1NTIHRyYW5zbGF0ZSBmYW1pbHkgb2YgZnVuY3Rpb25zOlxuICogLSBgdHJhbnNsYXRlKHgsIHkpYFxuICogLSBgdHJhbnNsYXRlWCh4KWBcbiAqIC0gYHRyYW5zbGF0ZVkoeSlgXG4gKiAtIGB0cmFuc2xhdGVaKHopYFxuICogLSBgdHJhbnNsYXRlM2QoeCwgeSwgeilgXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NUcmFuc2xhdGVOb2RlIGV4dGVuZHMgQ3NzRnVuY05vZGUge1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN1ZmZpeFxuICAgKiBAcGFyYW0geyFBcnJheTwhQ3NzTm9kZT59IGFyZ3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHN1ZmZpeCwgYXJncykge1xuICAgIHN1cGVyKFxuICAgICAgYHRyYW5zbGF0ZSR7c3VmZml4LnRvVXBwZXJDYXNlKCl9YCxcbiAgICAgIGFyZ3MsXG4gICAgICBzdWZmaXggPT0gJydcbiAgICAgICAgPyBbJ3cnLCAnaCddXG4gICAgICAgIDogc3VmZml4ID09ICd4J1xuICAgICAgICA/IFsndyddXG4gICAgICAgIDogc3VmZml4ID09ICd5J1xuICAgICAgICA/IFsnaCddXG4gICAgICAgIDogc3VmZml4ID09ICd6J1xuICAgICAgICA/IFsneiddXG4gICAgICAgIDogc3VmZml4ID09ICczZCdcbiAgICAgICAgPyBbJ3cnLCAnaCcsICd6J11cbiAgICAgICAgOiBudWxsXG4gICAgKTtcbiAgICAvKiogQGNvbnN0IEBwcm90ZWN0ZWQge3N0cmluZ30gKi9cbiAgICB0aGlzLnN1ZmZpeF8gPSBzdWZmaXg7XG4gIH1cbn1cblxuLyoqXG4gKiBBTVAtc3BlY2lmaWMgYHdpZHRoKClgIGFuZCBgaGVpZ2h0KClgIGZ1bmN0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc1JlY3ROb2RlIGV4dGVuZHMgQ3NzTm9kZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmllbGQgeCwgeSwgd2lkdGggb3IgaGVpZ2h0XG4gICAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF9zZWxlY3RvclxuICAgKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfc2VsZWN0aW9uTWV0aG9kIEVpdGhlciBgdW5kZWZpbmVkYCBvciBcImNsb3Nlc3RcIi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGZpZWxkLCBvcHRfc2VsZWN0b3IsIG9wdF9zZWxlY3Rpb25NZXRob2QpIHtcbiAgICBzdXBlcigpO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLmZpZWxkXyA9IGZpZWxkO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLnNlbGVjdG9yXyA9IG9wdF9zZWxlY3RvciB8fCBudWxsO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLnNlbGVjdGlvbk1ldGhvZF8gPSBvcHRfc2VsZWN0aW9uTWV0aG9kIHx8IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNzcygpIHtcbiAgICB0aHJvdyBub0NzcygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2FsYyhjb250ZXh0KSB7XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuc2VsZWN0b3JfXG4gICAgICA/IGNvbnRleHQuZ2V0RWxlbWVudFJlY3QodGhpcy5zZWxlY3Rvcl8sIHRoaXMuc2VsZWN0aW9uTWV0aG9kXylcbiAgICAgIDogY29udGV4dC5nZXRDdXJyZW50RWxlbWVudFJlY3QoKTtcbiAgICByZXR1cm4gbmV3IENzc0xlbmd0aE5vZGUoZ2V0UmVjdEZpZWxkKHRoaXMuZmllbGRfLCByZWN0KSwgJ3B4Jyk7XG4gIH1cbn1cblxuLyoqXG4gKiBBTVAtc3BlY2lmaWMgYG51bSgpYCBmdW5jdGlvbi4gRm9ybWF0IGlzIGBudW0odmFsdWUpYC4gUmV0dXJucyBhIG51bWVyaWNcbiAqIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZS4gRS5nLiBgMTFweGAgLT4gMTEsIGAxMmVtYCAtPiAxMiwgYDEwc2AgLT4gMTAuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NOdW1Db252ZXJ0Tm9kZSBleHRlbmRzIENzc05vZGUge1xuICAvKipcbiAgICogQHBhcmFtIHshQ3NzTm9kZX0gdmFsdWVcbiAgICovXG4gIGNvbnN0cnVjdG9yKHZhbHVlKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy52YWx1ZV8gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY3NzKCkge1xuICAgIHRocm93IG5vQ3NzKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzQ29uc3QoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjYWxjKGNvbnRleHQsIG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52YWx1ZV8ucmVzb2x2ZShjb250ZXh0LCBub3JtYWxpemUpO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IG51bTtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBDc3NOdW1lcmljTm9kZSkge1xuICAgICAgbnVtID0gdmFsdWUubnVtXztcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtID0gcGFyc2VGbG9hdCh2YWx1ZS5jc3MoKSk7XG4gICAgfVxuICAgIGlmIChudW0gPT0gbnVsbCB8fCBpc05hTihudW0pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDc3NOdW1iZXJOb2RlKG51bSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBTVAtc3BlY2lmaWMgYHJhbmQoKWAgZnVuY3Rpb24uIEhhcyB0d28gZm9ybXM6XG4gKiAtIGByYW5kKClgIC0gcmV0dXJucyBhIHJhbmRvbSBudW1iZXIgdmFsdWUgYmV0d2VlbiAwIGFuZCAxLlxuICogLSBgcmFuZChsZWZ0LCByaWdodClgIC0gcmV0dXJucyBhIHJhbmRvbSB2YWx1ZSBiZXR3ZWVuIGBsZWZ0YCBhbmRcbiAqICAgYHJpZ2h0YC4gVGhlIGBsZWZ0YCBhbmQgYHJpZ2h0YCBhcmUgYW55IG51bWJlci1iYXNlZCB2YWx1ZXMgaW4gdGhpc1xuICogICBjYXNlLCBzdWNoIGFzIGEgbGVuZ3RoIChgMTBweGApLCBhIHRpbWUgKGAxc2ApLCBhbiBhbmdsZSAoYDFyYWRgKSwgZXRjLlxuICogICBUaGUgcmV0dXJuZWQgdmFsdWUgaXMgdGhlIHNhbWUgdHlwZSAtIGEgbGVuZ3RoLCB0aW1lIGFuZ2xlLCBldGMuIFRodXMsXG4gKiAgIGByYW5kKDFzLCA1cylgIG1heSByZXR1cm4gYSB2YWx1ZSBvZiBgcmFuZCgyLjFzKWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NSYW5kTm9kZSBleHRlbmRzIENzc05vZGUge1xuICAvKipcbiAgICogQHBhcmFtIHs/Q3NzTm9kZT19IGxlZnRcbiAgICogQHBhcmFtIHs/Q3NzTm9kZT19IHJpZ2h0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihsZWZ0ID0gbnVsbCwgcmlnaHQgPSBudWxsKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5sZWZ0XyA9IGxlZnQ7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSAqL1xuICAgIHRoaXMucmlnaHRfID0gcmlnaHQ7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNzcygpIHtcbiAgICB0aHJvdyBub0NzcygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2FsYyhjb250ZXh0LCBub3JtYWxpemUpIHtcbiAgICAvLyBObyBhcmd1bWVudHM6IHJldHVybiBhIHJhbmRvbSBub2RlIGJldHdlZW4gMCBhbmQgMS5cbiAgICBpZiAodGhpcy5sZWZ0XyA9PSBudWxsIHx8IHRoaXMucmlnaHRfID09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgQ3NzTnVtYmVyTm9kZShNYXRoLnJhbmRvbSgpKTtcbiAgICB9XG5cbiAgICAvLyBBcmd1bWVudHM6IGRvIGEgbWluL21heCByYW5kb20gbWF0aC5cbiAgICBsZXQgbGVmdCA9IHRoaXMubGVmdF8ucmVzb2x2ZShjb250ZXh0LCBub3JtYWxpemUpO1xuICAgIGxldCByaWdodCA9IHRoaXMucmlnaHRfLnJlc29sdmUoY29udGV4dCwgbm9ybWFsaXplKTtcbiAgICBpZiAobGVmdCA9PSBudWxsIHx8IHJpZ2h0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAhKGxlZnQgaW5zdGFuY2VvZiBDc3NOdW1lcmljTm9kZSkgfHxcbiAgICAgICEocmlnaHQgaW5zdGFuY2VvZiBDc3NOdW1lcmljTm9kZSlcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbGVmdCBhbmQgcmlnaHQgbXVzdCBiZSBib3RoIG51bWVyaWNhbCcpO1xuICAgIH1cbiAgICBpZiAobGVmdC50eXBlXyAhPSByaWdodC50eXBlXykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsZWZ0IGFuZCByaWdodCBtdXN0IGJlIHRoZSBzYW1lIHR5cGUnKTtcbiAgICB9XG5cbiAgICAvLyBVbml0cyBhcmUgdGhlIHNhbWUsIHRoZSBtYXRoIGlzIHNpbXBsZTogbnVtZXJhbHMgYXJlIHN1bW1lZC4gT3RoZXJ3aXNlLFxuICAgIC8vIHRoZSB1bml0cyBuZWVlZCB0byBiZSBub3JtYWxpemVkIGZpcnN0LlxuICAgIGlmIChsZWZ0LnVuaXRzXyAhPSByaWdodC51bml0c18pIHtcbiAgICAgIGxlZnQgPSBsZWZ0Lm5vcm0oY29udGV4dCk7XG4gICAgICByaWdodCA9IHJpZ2h0Lm5vcm0oY29udGV4dCk7XG4gICAgfVxuICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKGxlZnQubnVtXywgcmlnaHQubnVtXyk7XG4gICAgY29uc3QgbWF4ID0gTWF0aC5tYXgobGVmdC5udW1fLCByaWdodC5udW1fKTtcbiAgICBjb25zdCByYW5kID0gTWF0aC5yYW5kb20oKTtcbiAgICAvLyBGb3JtdWxhOiByYW5kKEEsIEIpID0gQSAqICgxIC0gUikgKyBCICogUlxuICAgIGNvbnN0IG51bSA9IG1pbiAqICgxIC0gcmFuZCkgKyBtYXggKiByYW5kO1xuICAgIHJldHVybiBsZWZ0LmNyZWF0ZVNhbWVVbml0cyhudW0pO1xuICB9XG59XG5cbi8qKlxuICogQU1QLXNwZWNpZmljIGBpbmRleCgpYCBmdW5jdGlvbi4gUmV0dXJucyAwLWJhc2VkIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiB0YXJnZXQgaW4gYSBsaXN0IG9mIGFsbCBzZWxlY3RlZCB0YXJnZXRzLlxuICovXG5leHBvcnQgY2xhc3MgQ3NzSW5kZXhOb2RlIGV4dGVuZHMgQ3NzTm9kZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIENzc0luZGV4Tm9kZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNzcygpIHtcbiAgICB0aHJvdyBub0NzcygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2FsYyhjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBDc3NOdW1iZXJOb2RlKGNvbnRleHQuZ2V0Q3VycmVudEluZGV4KCkpO1xuICB9XG59XG5cbi8qKlxuICogQU1QLXNwZWNpZmljIGBsZW5ndGgoKWAgZnVuY3Rpb24uIFJldHVybnMgbnVtYmVyIG9mIHRhcmdldHMgc2VsZWN0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NMZW5ndGhGdW5jTm9kZSBleHRlbmRzIENzc05vZGUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBDc3NMZW5ndGhGdW5jTm9kZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNzcygpIHtcbiAgICB0aHJvdyBub0NzcygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2FsYyhjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBDc3NOdW1iZXJOb2RlKGNvbnRleHQuZ2V0VGFyZ2V0TGVuZ3RoKCkpO1xuICB9XG59XG5cbi8qKlxuICogQSBDU1MgYHZhcigpYCBleHByZXNzaW9uOiBgdmFyKC0tbmFtZSlgLCBgdmFyKC0tbmFtZSwgMTAwcHgpYCwgZXRjLlxuICogU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtdmFyaWFibGVzLy5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc1Zhck5vZGUgZXh0ZW5kcyBDc3NOb2RlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YXJOYW1lXG4gICAqIEBwYXJhbSB7IUNzc05vZGU9fSBvcHRfZGVmXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih2YXJOYW1lLCBvcHRfZGVmKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHtzdHJpbmd9ICovXG4gICAgdGhpcy52YXJOYW1lXyA9IHZhck5hbWU7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7P0Nzc05vZGV9ICovXG4gICAgdGhpcy5kZWZfID0gb3B0X2RlZiB8fCBudWxsO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjc3MoKSB7XG4gICAgcmV0dXJuIGB2YXIoJHt0aGlzLnZhck5hbWVffSR7dGhpcy5kZWZfID8gJywnICsgdGhpcy5kZWZfLmNzcygpIDogJyd9KWA7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzQ29uc3QoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjYWxjKGNvbnRleHQsIG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHZhck5vZGUgPSBjb250ZXh0LmdldFZhcih0aGlzLnZhck5hbWVfKTtcbiAgICBpZiAodmFyTm9kZSkge1xuICAgICAgcmV0dXJuIHZhck5vZGUucmVzb2x2ZShjb250ZXh0LCBub3JtYWxpemUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5kZWZfKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZfLnJlc29sdmUoY29udGV4dCwgbm9ybWFsaXplKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBIENTUyBgY2FsYygpYCBleHByZXNzaW9uOiBgY2FsYygxMDBweClgLCBgY2FsYyg4MHZ3IC0gMzBlbSlgLCBldGMuXG4gKiBTZWUgaHR0cHM6Ly9kcmFmdHMuY3Nzd2cub3JnL2Nzcy12YWx1ZXMtMy8jY2FsYy1ub3RhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENzc0NhbGNOb2RlIGV4dGVuZHMgQ3NzTm9kZSB7XG4gIC8qKiBAcGFyYW0geyFDc3NOb2RlfSBleHByICovXG4gIGNvbnN0cnVjdG9yKGV4cHIpIHtcbiAgICBzdXBlcigpO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFDc3NOb2RlfSAqL1xuICAgIHRoaXMuZXhwcl8gPSBleHByO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjc3MoKSB7XG4gICAgcmV0dXJuIGBjYWxjKCR7dGhpcy5leHByXy5jc3MoKX0pYDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNDb25zdCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNhbGMoY29udGV4dCwgbm9ybWFsaXplKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwcl8ucmVzb2x2ZShjb250ZXh0LCBub3JtYWxpemUpO1xuICB9XG59XG5cbi8qKlxuICogQSBDU1MgYGNhbGMoKWAgc3VtIGV4cHJlc3Npb246IGAxMDBweCArIDIwZW1gLCBgODB2dyAtIDMwZW1gLCBldGMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDc3NDYWxjU3VtTm9kZSBleHRlbmRzIENzc05vZGUge1xuICAvKipcbiAgICogQHBhcmFtIHshQ3NzTm9kZX0gbGVmdFxuICAgKiBAcGFyYW0geyFDc3NOb2RlfSByaWdodFxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3AgRWl0aGVyIFwiK1wiIG9yIFwiLVwiLlxuICAgKi9cbiAgY29uc3RydWN0b3IobGVmdCwgcmlnaHQsIG9wKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshQ3NzTm9kZX0gKi9cbiAgICB0aGlzLmxlZnRfID0gbGVmdDtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshQ3NzTm9kZX0gKi9cbiAgICB0aGlzLnJpZ2h0XyA9IHJpZ2h0O1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLm9wXyA9IG9wO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjc3MoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMubGVmdF8uY3NzKCl9ICR7dGhpcy5vcF99ICR7dGhpcy5yaWdodF8uY3NzKCl9YDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNDb25zdCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNhbGMoY29udGV4dCwgbm9ybWFsaXplKSB7XG4gICAgLypcbiAgICAgKiBGcm9tIHNwZWM6XG4gICAgICogQXQgKyBvciAtLCBjaGVjayB0aGF0IGJvdGggc2lkZXMgaGF2ZSB0aGUgc2FtZSB0eXBlLCBvciB0aGF0IG9uZSBzaWRlIGlzXG4gICAgICogYSA8bnVtYmVyPiBhbmQgdGhlIG90aGVyIGlzIGFuIDxpbnRlZ2VyPi4gSWYgYm90aCBzaWRlcyBhcmUgdGhlIHNhbWVcbiAgICAgKiB0eXBlLCByZXNvbHZlIHRvIHRoYXQgdHlwZS4gSWYgb25lIHNpZGUgaXMgYSA8bnVtYmVyPiBhbmQgdGhlIG90aGVyIGlzXG4gICAgICogYW4gPGludGVnZXI+LCByZXNvbHZlIHRvIDxudW1iZXI+LlxuICAgICAqL1xuICAgIGxldCBsZWZ0ID0gdGhpcy5sZWZ0Xy5yZXNvbHZlKGNvbnRleHQsIG5vcm1hbGl6ZSk7XG4gICAgbGV0IHJpZ2h0ID0gdGhpcy5yaWdodF8ucmVzb2x2ZShjb250ZXh0LCBub3JtYWxpemUpO1xuICAgIGlmIChsZWZ0ID09IG51bGwgfHwgcmlnaHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChcbiAgICAgICEobGVmdCBpbnN0YW5jZW9mIENzc051bWVyaWNOb2RlKSB8fFxuICAgICAgIShyaWdodCBpbnN0YW5jZW9mIENzc051bWVyaWNOb2RlKVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsZWZ0IGFuZCByaWdodCBtdXN0IGJlIGJvdGggbnVtZXJpY2FsJyk7XG4gICAgfVxuICAgIGlmIChsZWZ0LnR5cGVfICE9IHJpZ2h0LnR5cGVfKSB7XG4gICAgICAvLyBQZXJjZW50IHZhbHVlcyBhcmUgc3BlY2lhbDogdGhleSBuZWVkIHRvIGJlIHJlc29sdmVkIGluIHRoZSBjb250ZXh0XG4gICAgICAvLyBvZiB0aGUgb3RoZXIgZGltZW5zaW9uLlxuICAgICAgaWYgKGxlZnQgaW5zdGFuY2VvZiBDc3NQZXJjZW50Tm9kZSkge1xuICAgICAgICBsZWZ0ID0gcmlnaHQuY2FsY1BlcmNlbnQobGVmdC5udW1fLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHQgaW5zdGFuY2VvZiBDc3NQZXJjZW50Tm9kZSkge1xuICAgICAgICByaWdodCA9IGxlZnQuY2FsY1BlcmNlbnQocmlnaHQubnVtXywgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xlZnQgYW5kIHJpZ2h0IG11c3QgYmUgdGhlIHNhbWUgdHlwZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVuaXRzIGFyZSB0aGUgc2FtZSwgdGhlIG1hdGggaXMgc2ltcGxlOiBudW1lcmFscyBhcmUgc3VtbWVkLiBPdGhlcndpc2UsXG4gICAgLy8gdGhlIHVuaXRzIG5lZWVkIHRvIGJlIG5vcm1hbGl6ZWQgZmlyc3QuXG4gICAgaWYgKGxlZnQudW5pdHNfICE9IHJpZ2h0LnVuaXRzXykge1xuICAgICAgbGVmdCA9IGxlZnQubm9ybShjb250ZXh0KTtcbiAgICAgIHJpZ2h0ID0gcmlnaHQubm9ybShjb250ZXh0KTtcbiAgICB9XG4gICAgY29uc3Qgc2lnbiA9IHRoaXMub3BfID09ICcrJyA/IDEgOiAtMTtcbiAgICByZXR1cm4gbGVmdC5jcmVhdGVTYW1lVW5pdHMobGVmdC5udW1fICsgc2lnbiAqIHJpZ2h0Lm51bV8pO1xuICB9XG59XG5cbi8qKlxuICogQSBDU1MgYGNhbGMoKWAgcHJvZHVjdCBleHByZXNzaW9uOiBgMTAwcHggKiAyYCwgYDgwdncgLyAyYCwgZXRjLlxuICovXG5leHBvcnQgY2xhc3MgQ3NzQ2FsY1Byb2R1Y3ROb2RlIGV4dGVuZHMgQ3NzTm9kZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFDc3NOb2RlfSBsZWZ0XG4gICAqIEBwYXJhbSB7IUNzc05vZGV9IHJpZ2h0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcCBFaXRoZXIgXCIqXCIgb3IgXCIvXCIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihsZWZ0LCByaWdodCwgb3ApIHtcbiAgICBzdXBlcigpO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFDc3NOb2RlfSAqL1xuICAgIHRoaXMubGVmdF8gPSBsZWZ0O1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFDc3NOb2RlfSAqL1xuICAgIHRoaXMucmlnaHRfID0gcmlnaHQ7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfSAqL1xuICAgIHRoaXMub3BfID0gb3A7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNzcygpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5sZWZ0Xy5jc3MoKX0gJHt0aGlzLm9wX30gJHt0aGlzLnJpZ2h0Xy5jc3MoKX1gO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0NvbnN0KCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY2FsYyhjb250ZXh0LCBub3JtYWxpemUpIHtcbiAgICBjb25zdCBsZWZ0ID0gdGhpcy5sZWZ0Xy5yZXNvbHZlKGNvbnRleHQsIG5vcm1hbGl6ZSk7XG4gICAgY29uc3QgcmlnaHQgPSB0aGlzLnJpZ2h0Xy5yZXNvbHZlKGNvbnRleHQsIG5vcm1hbGl6ZSk7XG4gICAgaWYgKGxlZnQgPT0gbnVsbCB8fCByaWdodCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgIShsZWZ0IGluc3RhbmNlb2YgQ3NzTnVtZXJpY05vZGUpIHx8XG4gICAgICAhKHJpZ2h0IGluc3RhbmNlb2YgQ3NzTnVtZXJpY05vZGUpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xlZnQgYW5kIHJpZ2h0IG11c3QgYmUgYm90aCBudW1lcmljYWwnKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEZyb20gc3BlYzpcbiAgICAgKiBBdCAqLCBjaGVjayB0aGF0IGF0IGxlYXN0IG9uZSBzaWRlIGlzIDxudW1iZXI+LiBJZiBib3RoIHNpZGVzIGFyZVxuICAgICAqIDxpbnRlZ2VyPiwgcmVzb2x2ZSB0byA8aW50ZWdlcj4uIE90aGVyd2lzZSwgcmVzb2x2ZSB0byB0aGUgdHlwZSBvZiB0aGVcbiAgICAgKiBvdGhlciBzaWRlLlxuICAgICAqIEF0IC8sIGNoZWNrIHRoYXQgdGhlIHJpZ2h0IHNpZGUgaXMgPG51bWJlcj4uIElmIHRoZSBsZWZ0IHNpZGUgaXNcbiAgICAgKiA8aW50ZWdlcj4sIHJlc29sdmUgdG8gPG51bWJlcj4uIE90aGVyd2lzZSwgcmVzb2x2ZSB0byB0aGUgdHlwZSBvZiB0aGVcbiAgICAgKiBsZWZ0IHNpZGUuXG4gICAgICovXG4gICAgbGV0IGJhc2U7XG4gICAgbGV0IG11bHRpO1xuICAgIGlmICh0aGlzLm9wXyA9PSAnKicpIHtcbiAgICAgIGlmIChsZWZ0IGluc3RhbmNlb2YgQ3NzTnVtYmVyTm9kZSkge1xuICAgICAgICBtdWx0aSA9IGxlZnQubnVtXztcbiAgICAgICAgYmFzZSA9IHJpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCEocmlnaHQgaW5zdGFuY2VvZiBDc3NOdW1iZXJOb2RlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb25lIG9mIHNpZGVzIGluIG11bHRpcGxpY2F0aW9uIG11c3QgYmUgYSBudW1iZXInKTtcbiAgICAgICAgfVxuICAgICAgICBtdWx0aSA9IHJpZ2h0Lm51bV87XG4gICAgICAgIGJhc2UgPSBsZWZ0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIShyaWdodCBpbnN0YW5jZW9mIENzc051bWJlck5vZGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZGVub21pbmF0b3IgbXVzdCBiZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgYmFzZSA9IGxlZnQ7XG4gICAgICBtdWx0aSA9IDEgLyByaWdodC5udW1fO1xuICAgIH1cblxuICAgIGNvbnN0IG51bSA9IGJhc2UubnVtXyAqIG11bHRpO1xuICAgIGlmICghaXNGaW5pdGUobnVtKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBiYXNlLmNyZWF0ZVNhbWVVbml0cyhudW0pO1xuICB9XG59XG5cbi8qKlxuICogQ1NTIGBtaW4oKWAgYW5kIGBtYXgoKWAuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL21pblxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9tYXhcbiAqL1xuZXhwb3J0IGNsYXNzIENzc01pbk1heE5vZGUgZXh0ZW5kcyBDc3NGdW5jTm9kZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyFBcnJheTwhQ3NzTm9kZT59IGFyZ3NcbiAgICovXG4gIGNvbnN0cnVjdG9yKG5hbWUsIGFyZ3MpIHtcbiAgICBzdXBlcihuYW1lLCBhcmdzKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNDb25zdCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNhbGMoY29udGV4dCwgbm9ybWFsaXplKSB7XG4gICAgbGV0IHJlc29sdmVkQXJncyA9IHJlc29sdmVBcnJheShjb250ZXh0LCBub3JtYWxpemUsIHRoaXMuYXJnc18sIG51bGwpO1xuICAgIGlmICghcmVzb2x2ZWRBcmdzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3ROb25QZXJjZW50ID0gbnVsbDtcbiAgICBsZXQgaGFzUGVyY2VudCA9IGZhbHNlO1xuICAgIGxldCBoYXNEaWZmZXJlbnRVbml0cyA9IGZhbHNlO1xuICAgIHJlc29sdmVkQXJncy5mb3JFYWNoKChhcmcpID0+IHtcbiAgICAgIGlmICghKGFyZyBpbnN0YW5jZW9mIENzc051bWVyaWNOb2RlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZ3VtZW50cyBtdXN0IGJlIG51bWVyaWNhbCcpO1xuICAgICAgfVxuICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIENzc1BlcmNlbnROb2RlKSB7XG4gICAgICAgIGhhc1BlcmNlbnQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChmaXJzdE5vblBlcmNlbnQpIHtcbiAgICAgICAgaWYgKGFyZy50eXBlXyAhPSBmaXJzdE5vblBlcmNlbnQudHlwZV8pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZ3VtZW50cyBtdXN0IGJlIHRoZSBzYW1lIHR5cGUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJnLnVuaXRzXyAhPSBmaXJzdE5vblBlcmNlbnQudW5pdHNfKSB7XG4gICAgICAgICAgaGFzRGlmZmVyZW50VW5pdHMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaXJzdE5vblBlcmNlbnQgPSBhcmc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGZpcnN0Tm9uUGVyY2VudCAmJiBoYXNQZXJjZW50KSB7XG4gICAgICBoYXNEaWZmZXJlbnRVbml0cyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGZpcnN0Tm9uUGVyY2VudCkge1xuICAgICAgLy8gUmVjYWxjdWxhdGUgcGVyY2VudCB2YWx1ZXMgYW5kIG5vcm1hbGl6ZSB1bml0cy5cbiAgICAgIGlmIChoYXNEaWZmZXJlbnRVbml0cykge1xuICAgICAgICBmaXJzdE5vblBlcmNlbnQgPSBmaXJzdE5vblBlcmNlbnQubm9ybShjb250ZXh0KTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmVkQXJncyA9IHJlc29sdmVkQXJncy5tYXAoKGFyZykgPT4ge1xuICAgICAgICBpZiAoYXJnID09IGZpcnN0Tm9uUGVyY2VudCkge1xuICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQZXJjZW50IHZhbHVlcy5cbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIENzc1BlcmNlbnROb2RlKSB7XG4gICAgICAgICAgcmV0dXJuIGZpcnN0Tm9uUGVyY2VudC5jYWxjUGVyY2VudChhcmcubnVtXywgY29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVbml0cyBhcmUgdGhlIHNhbWUsIHRoZSBtYXRoIGlzIHNpbXBsZTogbnVtZXJhbHMgYXJlIHN1bW1lZC5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB0aGUgdW5pdHMgbmVlZWQgdG8gYmUgbm9ybWFsaXplZCBmaXJzdC5cbiAgICAgICAgaWYgKGhhc0RpZmZlcmVudFVuaXRzKSB7XG4gICAgICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IUNzc051bWVyaWNOb2RlfSAqLyAoYXJnKS5ub3JtKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcmc7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUuXG4gICAgY29uc3QgbnVtcyA9IHJlc29sdmVkQXJncy5tYXAoKGFyZykgPT4gYXJnLm51bV8pO1xuICAgIGxldCB2YWx1ZTtcbiAgICBpZiAodGhpcy5uYW1lXyA9PSAnbWluJykge1xuICAgICAgLy8gbWluKC4uLilcbiAgICAgIHZhbHVlID0gTWF0aC5taW4uYXBwbHkobnVsbCwgbnVtcyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm5hbWVfID09ICdtYXgnKSB7XG4gICAgICAvLyBtYXgoLi4uKVxuICAgICAgdmFsdWUgPSBNYXRoLm1heC5hcHBseShudWxsLCBudW1zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2xhbXAobWluLCBwcmVmZXJyZWQsIG1heClcbiAgICAgIGNvbnN0IG1pbiA9IG51bXNbMF07XG4gICAgICBjb25zdCBwcmVmZXJyZWQgPSBudW1zWzFdO1xuICAgICAgY29uc3QgbWF4ID0gbnVtc1syXTtcbiAgICAgIHZhbHVlID0gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHByZWZlcnJlZCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzb2x2ZWRBcmdzWzBdLmNyZWF0ZVNhbWVVbml0cyh2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdW5pdHNcbiAqIEByZXR1cm4geyFFcnJvcn1cbiAqL1xuZnVuY3Rpb24gdW5rbm93blVuaXRzKHVuaXRzKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoJ3Vua25vd24gdW5pdHM6ICcgKyB1bml0cyk7XG59XG5cbi8qKlxuICogQHJldHVybiB7IUVycm9yfVxuICovXG5mdW5jdGlvbiBub0NzcygpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcignbm8gY3NzJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHs/c3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHshLi4vLi4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9IHJlY3RcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0UmVjdEZpZWxkKGZpZWxkLCByZWN0KSB7XG4gIGlmIChmaWVsZCA9PSAndycpIHtcbiAgICByZXR1cm4gcmVjdC53aWR0aDtcbiAgfVxuICBpZiAoZmllbGQgPT0gJ2gnKSB7XG4gICAgcmV0dXJuIHJlY3QuaGVpZ2h0O1xuICB9XG4gIHJldHVybiByZWN0W2ZpZWxkXSA/PyAwO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUNzc0NvbnRleHR9IGNvbnRleHRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9ybWFsaXplXG4gKiBAcGFyYW0geyFBcnJheTwhQ3NzTm9kZT59IGFycmF5XG4gKiBAcGFyYW0gez9BcnJheTxzdHJpbmc+fSBkaW1lbnNpb25zXG4gKiBAcmV0dXJuIHs/QXJyYXk8IUNzc05vZGU+fVxuICovXG5mdW5jdGlvbiByZXNvbHZlQXJyYXkoY29udGV4dCwgbm9ybWFsaXplLCBhcnJheSwgZGltZW5zaW9ucykge1xuICBjb25zdCByZXNvbHZlZEFycmF5ID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlID0gYXJyYXlbaV07XG4gICAgbGV0IHJlc29sdmVkO1xuICAgIGlmIChkaW1lbnNpb25zICYmIGkgPCBkaW1lbnNpb25zLmxlbmd0aCkge1xuICAgICAgcmVzb2x2ZWQgPSBjb250ZXh0LndpdGhEaW1lbnNpb24oZGltZW5zaW9uc1tpXSwgKCkgPT5cbiAgICAgICAgbm9kZS5yZXNvbHZlKGNvbnRleHQsIG5vcm1hbGl6ZSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmVkID0gbm9kZS5yZXNvbHZlKGNvbnRleHQsIG5vcm1hbGl6ZSk7XG4gICAgfVxuICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgcmVzb2x2ZWRBcnJheS5wdXNoKHJlc29sdmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT25lIGFyZ3VtZW50IGlzIG51bGwgLSB0aGUgZnVuY3Rpb24ncyByZXN1bHQgaXMgbnVsbC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzb2x2ZWRBcnJheTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/parsers/css-expr-ast.js