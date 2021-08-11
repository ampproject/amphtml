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
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { CssNumberNode, CssTimeNode, isVarCss } from "./parsers/css-expr-ast";
import { InternalWebAnimationRequestDef, WebAnimationDef, WebAnimationSelectorDef, WebAnimationSubtargetDef, WebAnimationTimingDef, WebAnimationTimingDirection, WebAnimationTimingFill, WebCompAnimationDef, WebKeyframeAnimationDef, WebKeyframesDef, WebMultiAnimationDef, WebSwitchAnimationDef, isAllowlistedProp } from "./web-animation-types";
import { NativeWebAnimationRunner } from "./runners/native-web-animation-runner";
import { ScrollTimelineWorkletRunner } from "./runners/scrolltimeline-worklet-runner";
import { assertHttpsUrl, resolveRelativeUrl } from "../../../src/url";
import { closestAncestorElementBySelector, matches, scopedQuerySelector, scopedQuerySelectorAll } from "../../../src/core/dom/query";
import { computedStyle, getVendorJsPropertyName } from "../../../src/core/dom/style";
import { dashToCamelCase } from "../../../src/core/types/string";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { escapeCssSelectorIdent } from "../../../src/core/dom/css-selectors";
import { extractKeyframes } from "./parsers/keyframes-extractor";
import { getMode } from "../../../src/mode";
import { isArray, toArray } from "../../../src/core/types/array";
import { isEnumValue, isObject } from "../../../src/core/types";
import { isExperimentOn } from "../../../src/experiments";
import { isInFie } from "../../../src/iframe-helper";
import { layoutRectLtwh } from "../../../src/core/dom/layout/rect";
import { map } from "../../../src/core/types/object";
import { parseCss } from "./parsers/css-expr";

/** @const {string} */
var TAG = 'amp-animation';
var TARGET_ANIM_ID = '__AMP_ANIM_ID';

/**
 * Auto-incrementing ID generator for internal animation uses.
 * See `TARGET_ANIM_ID`.
 * @type {number}
 */
var animIdCounter = 0;

/**
 * @const {!Object<string, boolean>}
 */
var SERVICE_PROPS = {
  'offset': true,
  'easing': true
};

/**
 * Clip-path is an only CSS property we allow for animation that may require
 * vendor prefix. And it's always "-webkit". Use a simple map to avoid
 * expensive lookup for all other properties.
 */
var ADD_PROPS = {
  'clip-path': '-webkit-clip-path',
  'clipPath': '-webkit-clip-path'
};

/**
 * The scanner for the `WebAnimationDef` format. It calls the appropriate
 * callbacks based on the discovered animation types.
 * @abstract
 */
var Scanner = /*#__PURE__*/function () {
  function Scanner() {
    _classCallCheck(this, Scanner);
  }

  _createClass(Scanner, [{
    key: "scan",
    value:
    /**
     * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
     * @return {boolean}
     */
    function scan(spec) {
      var _this = this;

      if (isArray(spec)) {
        // Returns `true` if any of the components scan successfully.
        return spec.reduce(function (acc, comp) {
          return _this.scan(comp) || acc;
        }, false);
      }

      // Check whether the animation is enabled.
      if (!this.isEnabled(
      /** @type {!WebAnimationDef} */
      spec)) {
        return false;
      }

      // WebAnimationDef: (!WebMultiAnimationDef|!WebSpecAnimationDef|
      //                   !WebCompAnimationDef|!WebKeyframeAnimationDef)
      if (spec.animations) {
        this.onMultiAnimation(
        /** @type {!WebMultiAnimationDef} */
        spec);
      } else if (spec.switch) {
        this.onSwitchAnimation(
        /** @type {!WebSwitchAnimationDef} */
        spec);
      } else if (spec.animation) {
        this.onCompAnimation(
        /** @type {!WebCompAnimationDef} */
        spec);
      } else if (spec.keyframes) {
        this.onKeyframeAnimation(
        /** @type {!WebKeyframeAnimationDef} */
        spec);
      } else {
        this.onUnknownAnimation(spec);
      }

      return true;
    }
    /**
     * Whether the animation spec is enabled.
     * @param {!WebAnimationDef} unusedSpec
     * @return {boolean}
     */

  }, {
    key: "isEnabled",
    value: function isEnabled(unusedSpec) {
      return true;
    }
    /**
     * @param {!WebMultiAnimationDef} unusedSpec
     * @abstract
     */

  }, {
    key: "onMultiAnimation",
    value: function onMultiAnimation(unusedSpec) {}
    /**
     * @param {!WebSwitchAnimationDef} unusedSpec
     * @abstract
     */

  }, {
    key: "onSwitchAnimation",
    value: function onSwitchAnimation(unusedSpec) {}
    /**
     * @param {!WebCompAnimationDef} unusedSpec
     * @abstract
     */

  }, {
    key: "onCompAnimation",
    value: function onCompAnimation(unusedSpec) {}
    /**
     * @param {!WebKeyframeAnimationDef} unusedSpec
     * @abstract
     */

  }, {
    key: "onKeyframeAnimation",
    value: function onKeyframeAnimation(unusedSpec) {}
    /** @param {!Object} unusedSpec */

  }, {
    key: "onUnknownAnimation",
    value: function onUnknownAnimation(unusedSpec) {
      throw dev().createError('unknown animation type: must have "animations" or "keyframes" field');
    }
  }]);

  return Scanner;
}();

/**
 * Builds animation runners based on the provided spec.
 */
export var Builder = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Document|!ShadowRoot} rootNode
   * @param {string} baseUrl
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!../../../src/service/owners-interface.OwnersInterface} owners
   * @param {!./web-animation-types.WebAnimationBuilderOptionsDef=} options
   */
  function Builder(win, rootNode, baseUrl, vsync, owners, options) {
    if (options === void 0) {
      options = {};
    }

    _classCallCheck(this, Builder);

    /** @const @private */
    this.win_ = win;

    /** @const @private */
    this.css_ = new CssContextImpl(win, rootNode, baseUrl, options);

    /** @const @private */
    this.vsync_ = vsync;

    /** @const @private */
    this.owners_ = owners;

    /** @const @private {!Array<!Element>} */
    this.targets_ = [];

    /** @const @private {!Array<!Promise>} */
    this.loaders_ = [];
  }

  /**
   * Creates the animation runner for the provided spec. Waits for all
   * necessary resources to be loaded before the runner is resolved.
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {?WebAnimationDef=} opt_args
   * @param {?JsonObject=} opt_positionObserverData
   * @return {!Promise<!./runners/animation-runner.AnimationRunner>}
   */
  _createClass(Builder, [{
    key: "createRunner",
    value: function createRunner(spec, opt_args, opt_positionObserverData) {
      var _this2 = this;

      if (opt_positionObserverData === void 0) {
        opt_positionObserverData = null;
      }

      return this.resolveRequests([], spec, opt_args).then(function (requests) {
        if (getMode().localDev || getMode().development) {
          user().fine(TAG, 'Animation: ', requests);
        }

        return Promise.all(_this2.loaders_).then(function () {
          return _this2.isAnimationWorkletSupported_() && opt_positionObserverData ? new ScrollTimelineWorkletRunner(_this2.win_, requests, opt_positionObserverData) : new NativeWebAnimationRunner(requests);
        });
      });
    }
    /**
     * @param {!Array<string>} path
     * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
     * @param {?WebAnimationDef|undefined} args
     * @param {?Element} target
     * @param {?number} index
     * @param {?Object<string, *>} vars
     * @param {?WebAnimationTimingDef} timing
     * @return {!Promise<!Array<!InternalWebAnimationRequestDef>>}
     * @protected
     */

  }, {
    key: "resolveRequests",
    value: function resolveRequests(path, spec, args, target, index, vars, timing) {
      if (target === void 0) {
        target = null;
      }

      if (index === void 0) {
        index = null;
      }

      if (vars === void 0) {
        vars = null;
      }

      if (timing === void 0) {
        timing = null;
      }

      var scanner = this.createScanner_(path, target, index, vars, timing);
      return this.vsync_.measurePromise(function () {
        return scanner.resolveRequests(spec, args);
      });
    }
    /**
     * @param {!Element} target
     * @protected
     */

  }, {
    key: "requireLayout",
    value: function requireLayout(target) {
      if (!this.targets_.includes(target)) {
        this.targets_.push(target);
        this.loaders_.push(this.owners_.requireLayout(target));
      }
    }
    /**
     * @param {!Array<string>} path
     * @param {?Element} target
     * @param {?number} index
     * @param {?Object<string, *>} vars
     * @param {?WebAnimationTimingDef} timing
     * @private
     * @return {*} TODO(#23582): Specify return type
     */

  }, {
    key: "createScanner_",
    value: function createScanner_(path, target, index, vars, timing) {
      return new MeasureScanner(this, this.css_, path, target, index, vars, timing);
    }
    /**
     * @return {boolean} Whether animationWorklet can be used.
     * @private
     */

  }, {
    key: "isAnimationWorkletSupported_",
    value: function isAnimationWorkletSupported_() {
      return isExperimentOn(this.win_, 'chrome-animation-worklet') && 'animationWorklet' in CSS && getMode(this.win_).runtime != 'inabox' && !isInFie(this.win_.document.documentElement);
    }
  }]);

  return Builder;
}();

/**
 * The scanner that evaluates all expressions and builds the final
 * `AnimationRunner` instance for the target animation. It must be
 * executed in the "measure" vsync phase.
 */
export var MeasureScanner = /*#__PURE__*/function (_Scanner) {
  _inherits(MeasureScanner, _Scanner);

  var _super = _createSuper(MeasureScanner);

  /**
   * @param {!Builder} builder
   * @param {!CssContextImpl} css
   * @param {!Array<string>} path
   * @param {?Element} target
   * @param {?number} index
   * @param {?Object<string, *>} vars
   * @param {?WebAnimationTimingDef} timing
   */
  function MeasureScanner(builder, css, path, target, index, vars, timing) {
    var _this3;

    _classCallCheck(this, MeasureScanner);

    _this3 = _super.call(this);

    /** @const @private */
    _this3.builder_ = builder;

    /** @const @private */
    _this3.css_ = css;

    /** @const @private */
    _this3.path_ = path;

    /** @private {?Element} */
    _this3.target_ = target;

    /** @private {?number} */
    _this3.index_ = index;

    /** @private {!Object<string, *>} */
    _this3.vars_ = vars || map();

    /** @private {!WebAnimationTimingDef} */
    _this3.timing_ = timing || {
      duration: 0,
      delay: 0,
      endDelay: 0,
      iterations: 1,
      iterationStart: 0,
      easing: 'linear',
      direction: WebAnimationTimingDirection.NORMAL,
      fill: WebAnimationTimingFill.NONE
    };

    /** @private {!Array<!InternalWebAnimationRequestDef>} */
    _this3.requests_ = [];

    /**
     * Dependencies required to resolve all animation requests. In case of
     * composition, all requests can only be resolved asynchronously. This
     * dependencies are used to block `resolveRequests` to collect all
     * dependenices.
     * @const @private {!Array<!Promise>}
     */
    _this3.deps_ = [];
    return _this3;
  }

  /**
   * This methods scans all animation declarations specified in `spec`
   * recursively to produce the animation requests. `opt_args` is an additional
   * spec that can be used to default timing and variables.
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {?WebAnimationDef=} opt_args
   * @return {!Promise<!Array<!InternalWebAnimationRequestDef>>}
   */
  _createClass(MeasureScanner, [{
    key: "resolveRequests",
    value: function resolveRequests(spec, opt_args) {
      var _this4 = this;

      if (opt_args) {
        this.with_(opt_args, function () {
          _this4.scan(spec);
        });
      } else {
        this.css_.withVars(this.vars_, function () {
          _this4.scan(spec);
        });
      }

      return Promise.all(this.deps_).then(function () {
        return _this4.requests_;
      });
    }
    /** @override */

  }, {
    key: "isEnabled",
    value: function isEnabled(spec) {
      if (spec.media && !this.css_.matchMedia(spec.media)) {
        return false;
      }

      if (spec.supports && !this.css_.supports(spec.supports)) {
        return false;
      }

      return true;
    }
    /** @override */

  }, {
    key: "onMultiAnimation",
    value: function onMultiAnimation(spec) {
      var _this5 = this;

      this.with_(spec, function () {
        return _this5.scan(spec.animations);
      });
    }
    /** @override */

  }, {
    key: "onSwitchAnimation",
    value: function onSwitchAnimation(spec) {
      var _this6 = this;

      // The first to match will be used; the rest will be ignored.
      this.with_(spec, function () {
        for (var i = 0; i < spec.switch.length; i++) {
          var candidate = spec.switch[i];

          if (_this6.scan(candidate)) {
            // First matching candidate is applied and the rest are ignored.
            break;
          }
        }
      });
    }
    /** @override */

  }, {
    key: "onCompAnimation",
    value: function onCompAnimation(spec) {
      var _this7 = this;

      userAssert(this.path_.indexOf(spec.animation) == -1, "Recursive animations are not allowed: \"" + spec.animation + "\"");
      var newPath = this.path_.concat(spec.animation);
      var animationElement = user().assertElement(this.css_.getElementById(spec.animation), "Animation not found: \"" + spec.animation + "\"");
      // Currently, only `<amp-animation>` supplies animations. In the future
      // this could become an interface.
      userAssert(animationElement.tagName == 'AMP-ANIMATION', "Element is not an animation: \"" + spec.animation + "\"");
      var otherSpecPromise = animationElement.getImpl().then(function (impl) {
        return impl.getAnimationSpec();
      });
      this.with_(spec, function () {
        var index = _this7.index_,
            target = _this7.target_,
            timing = _this7.timing_,
            vars = _this7.vars_;
        var promise = otherSpecPromise.then(function (otherSpec) {
          if (!otherSpec) {
            return;
          }

          return _this7.builder_.resolveRequests(newPath, otherSpec,
          /* args */
          null, target, index, vars, timing);
        }).then(function (requests) {
          /** @type {!Array} */
          requests.forEach(function (request) {
            return _this7.requests_.push(request);
          });
        });

        _this7.deps_.push(promise);
      });
    }
    /** @override */

  }, {
    key: "onKeyframeAnimation",
    value: function onKeyframeAnimation(spec) {
      var _this8 = this;

      this.with_(spec, function () {
        var target = user().assertElement(_this8.target_, 'No target specified');

        var keyframes = _this8.createKeyframes_(target, spec);

        _this8.requests_.push({
          target: target,
          keyframes: keyframes,
          vars: _this8.vars_,
          timing: _this8.timing_
        });
      });
    }
    /**
     * @param {!Element} target
     * @param {!WebKeyframeAnimationDef} spec
     * @return {!WebKeyframesDef}
     * @private
     */

  }, {
    key: "createKeyframes_",
    value: function createKeyframes_(target, spec) {
      var _this9 = this;

      var specKeyframes = spec.keyframes;

      if (typeof specKeyframes == 'string') {
        // Keyframes name to be extracted from `<style>`.
        var keyframes = extractKeyframes(this.css_.rootNode, specKeyframes);
        userAssert(keyframes, "Keyframes not found in stylesheet: \"" + specKeyframes + "\"");
        specKeyframes = keyframes;
      }

      if (isObject(specKeyframes)) {
        // Property -> keyframes form.
        // The object is cloned, while properties are verified to be
        // allowlisted. Additionally, the `offset:0` frames are inserted
        // to polyfill partial keyframes per spec.
        // See https://github.com/w3c/web-animations/issues/187
        var object =
        /** @type {!Object<string, *>} */
        specKeyframes;

        /** @type {!WebKeyframesDef} */
        var _keyframes = {};

        for (var prop in object) {
          this.validateProperty_(prop);
          var value = object[prop];
          var preparedValue = void 0;

          if (SERVICE_PROPS[prop]) {
            preparedValue = value;
          } else if (!isArray(value) || value.length == 1) {
            // Missing "from" value. Measure and add.
            var fromValue = this.css_.measure(target, prop);
            var toValue = isArray(value) ? value[0] : value;
            preparedValue = [fromValue, this.css_.resolveCss(toValue)];
          } else {
            preparedValue = value.map(function (v) {
              return _this9.css_.resolveCss(v);
            });
          }

          _keyframes[prop] = preparedValue;

          if (prop in ADD_PROPS) {
            _keyframes[ADD_PROPS[prop]] = preparedValue;
          }
        }

        return _keyframes;
      }

      if (isArray(specKeyframes) && specKeyframes.length > 0) {
        // Keyframes -> property form.
        // The array is cloned, while properties are verified to be allowlisted.
        // Additionally, if the `offset:0` properties are inserted when absent
        // to polyfill partial keyframes per spec.
        // See https://github.com/w3c/web-animations/issues/187 and
        // https://github.com/web-animations/web-animations-js/issues/14
        var array =
        /** @type {!Array<!Object<string, *>>} */
        specKeyframes;

        /** @type {!WebKeyframesDef} */
        var _keyframes2 = [];
        var addStartFrame = array.length == 1 || array[0].offset > 0;
        var startFrame = addStartFrame ? map() : this.css_.resolveCssMap(array[0]);

        _keyframes2.push(startFrame);

        var start = addStartFrame ? 0 : 1;

        for (var i = start; i < array.length; i++) {
          var frame = array[i];

          for (var _prop in frame) {
            if (SERVICE_PROPS[_prop]) {
              continue;
            }

            this.validateProperty_(_prop);

            if (!startFrame[_prop]) {
              // Missing "from" value. Measure and add to start frame.
              startFrame[_prop] = this.css_.measure(target, _prop);
            }
          }

          _keyframes2.push(this.css_.resolveCssMap(frame));
        }

        for (var _i = 0; _i < _keyframes2.length; _i++) {
          var _frame = _keyframes2[_i];

          for (var k in ADD_PROPS) {
            if (k in _frame) {
              _frame[ADD_PROPS[k]] = _frame[k];
            }
          }
        }

        return _keyframes2;
      }

      // TODO(dvoytenko): support CSS keyframes per https://github.com/w3c/web-animations/issues/189
      // Unknown form of keyframes spec.
      throw user().createError('keyframes not found', specKeyframes);
    }
    /** @override */

  }, {
    key: "onUnknownAnimation",
    value: function onUnknownAnimation() {
      throw user().createError('unknown animation type:' + ' must have "animation", "animations" or "keyframes" field');
    }
    /**
     * @param {string} prop
     * @private
     */

  }, {
    key: "validateProperty_",
    value: function validateProperty_(prop) {
      if (SERVICE_PROPS[prop]) {
        return;
      }

      userAssert(isAllowlistedProp(prop), 'Property is not allowlisted for animation: %s', prop);
    }
    /**
     * Resolves common parameters of an animation: target, timing and vars.
     * @param {!WebAnimationDef} spec
     * @param {function()} callback
     * @private
     */

  }, {
    key: "with_",
    value: function with_(spec, callback) {
      var _this10 = this;

      // Save context.
      var prevIndex = this.index_,
          prevTarget = this.target_,
          prevTiming = this.timing_,
          prevVars = this.vars_;
      // Push new context and perform calculations.
      var targets = spec.target || spec.selector ? this.resolveTargets_(spec) : [null];
      this.css_.setTargetLength(targets.length);
      targets.forEach(function (target, index) {
        _this10.target_ = target || prevTarget;
        _this10.index_ = target ? index : prevIndex;

        _this10.css_.withTarget(_this10.target_, _this10.index_, function () {
          var subtargetSpec = _this10.target_ ? _this10.matchSubtargets_(_this10.target_, _this10.index_ || 0, spec) : spec;
          _this10.vars_ = _this10.mergeVars_(subtargetSpec, prevVars);

          _this10.css_.withVars(_this10.vars_, function () {
            _this10.timing_ = _this10.mergeTiming_(subtargetSpec, prevTiming);
            callback();
          });
        });
      });
      // Restore context.
      this.target_ = prevTarget;
      this.index_ = prevIndex;
      this.vars_ = prevVars;
      this.timing_ = prevTiming;
    }
    /**
     * @param {!WebAnimationDef} spec
     * @return {!Array<!Element>}
     * @private
     */

  }, {
    key: "resolveTargets_",
    value: function resolveTargets_(spec) {
      var _this11 = this;

      var targets;

      if (spec.selector) {
        userAssert(!spec.target, 'Both "selector" and "target" are not allowed');
        targets = this.css_.queryElements(spec.selector);

        if (targets.length == 0) {
          user().warn(TAG, "Target not found: \"" + spec.selector + "\"");
        }
      } else if (spec.target) {
        if (typeof spec.target == 'string') {
          // TODO(dvoytenko, #9129): cleanup deprecated string targets.
          user().error(TAG, 'string targets are deprecated');
        }

        var target = user().assertElement(typeof spec.target == 'string' ? this.css_.getElementById(spec.target) : spec.target, "Target not found: \"" + spec.target + "\"");
        targets = [target];
      } else if (this.target_) {
        targets = [this.target_];
      }

      targets.forEach(function (target) {
        return _this11.builder_.requireLayout(target);
      });
      return targets;
    }
    /**
     * @param {!Element} target
     * @param {number} index
     * @param {!WebAnimationSelectorDef} spec
     * @return {!WebAnimationSelectorDef}
     */

  }, {
    key: "matchSubtargets_",
    value: function matchSubtargets_(target, index, spec) {
      var _this12 = this;

      if (!spec.subtargets || spec.subtargets.length == 0) {
        return spec;
      }

      var result = map(spec);
      spec.subtargets.forEach(function (subtargetSpec) {
        var matcher = _this12.getMatcher_(subtargetSpec);

        if (matcher(target, index)) {
          Object.assign(result, subtargetSpec);
        }
      });
      return result;
    }
    /**
     * @param {!WebAnimationSubtargetDef} spec
     * @return {function(!Element, number):boolean}
     */

  }, {
    key: "getMatcher_",
    value: function getMatcher_(spec) {
      if (spec.matcher) {
        return spec.matcher;
      }

      userAssert((spec.index !== undefined || spec.selector !== undefined) && (spec.index === undefined || spec.selector === undefined), 'Only one "index" or "selector" must be specified');
      var matcher;

      if (spec.index !== undefined) {
        // Match by index, e.g. `index: 0`.
        var specIndex = Number(spec.index);

        matcher = function matcher(target, index) {
          return index === specIndex;
        };
      } else {
        // Match by selector, e.g. `:nth-child(2n+1)`.
        var specSelector =
        /** @type {string} */
        spec.selector;

        matcher = function matcher(target) {
          try {
            return matches(target, specSelector);
          } catch (e) {
            throw user().createError("Bad subtarget selector: \"" + specSelector + "\"", e);
          }
        };
      }

      return spec.matcher = matcher;
    }
    /**
     * Merges vars by defaulting values from the previous vars.
     * @param {!Object<string, *>} newVars
     * @param {!Object<string, *>} prevVars
     * @return {!Object<string, *>}
     * @private
     */

  }, {
    key: "mergeVars_",
    value: function mergeVars_(newVars, prevVars) {
      var _this13 = this;

      // First combine all vars (previous and new) in one map. The new vars take
      // precedence. This is done so that the new vars can be resolved from both
      // the previous and new vars.
      var result = map(prevVars);

      for (var k in newVars) {
        if (k.startsWith('--')) {
          result[k] = newVars[k];
        }
      }

      this.css_.withVars(result, function () {
        for (var _k in newVars) {
          if (_k.startsWith('--')) {
            result[_k] = _this13.css_.resolveCss(newVars[_k]);
          }
        }
      });
      return result;
    }
    /**
     * Merges timing by defaulting values from the previous timing.
     * @param {!WebAnimationTimingDef} newTiming
     * @param {!WebAnimationTimingDef} prevTiming
     * @return {!WebAnimationTimingDef}
     * @private
     */

  }, {
    key: "mergeTiming_",
    value: function mergeTiming_(newTiming, prevTiming) {
      // CSS time values in milliseconds.
      var duration = this.css_.resolveMillis(newTiming.duration, prevTiming.duration);
      var delay = this.css_.resolveMillis(newTiming.delay, prevTiming.delay);
      var endDelay = this.css_.resolveMillis(newTiming.endDelay, prevTiming.endDelay);
      // Numeric.
      var iterations = this.css_.resolveNumber(newTiming.iterations, dev().assertNumber(prevTiming.iterations));
      var iterationStart = this.css_.resolveNumber(newTiming.iterationStart, prevTiming.iterationStart);
      // Identifier CSS values.
      var easing = this.css_.resolveIdent(newTiming.easing, prevTiming.easing);
      var direction =
      /** @type {!WebAnimationTimingDirection} */
      this.css_.resolveIdent(newTiming.direction, prevTiming.direction);
      var fill =
      /** @type {!WebAnimationTimingFill} */
      this.css_.resolveIdent(newTiming.fill, prevTiming.fill);
      // Validate.
      this.validateTime_(duration, newTiming.duration, 'duration');
      this.validateTime_(delay, newTiming.delay, 'delay',
      /* negative */
      true);
      this.validateTime_(endDelay, newTiming.endDelay, 'endDelay');
      userAssert(iterations != null && iterations >= 0, '"iterations" is invalid: %s', newTiming.iterations);
      userAssert(iterationStart != null && iterationStart >= 0 && isFinite(iterationStart), '"iterationStart" is invalid: %s', newTiming.iterationStart);
      userAssert(isEnumValue(WebAnimationTimingDirection, direction), "Unknown direction: " + direction);
      userAssert(isEnumValue(WebAnimationTimingFill, fill), "Unknown fill: " + fill);
      return {
        duration: duration,
        delay: delay,
        endDelay: endDelay,
        iterations: iterations,
        iterationStart: iterationStart,
        easing: easing,
        direction: direction,
        fill: fill
      };
    }
    /**
     * @param {number|undefined} value
     * @param {*} newValue
     * @param {string} field
     * @param {boolean=} opt_allowNegative
     * @private
     */

  }, {
    key: "validateTime_",
    value: function validateTime_(value, newValue, field, opt_allowNegative) {
      // Ensure that positive or zero values are only allowed.
      userAssert(value != null && (value >= 0 || value < 0 && opt_allowNegative), '"%s" is invalid: %s', field, newValue);

      // Make sure that the values are in milliseconds: show a warning if
      // time is fractional.
      if (newValue != null && Math.floor(value) != value && value < 1) {
        user().warn(TAG, "\"" + field + "\" is fractional." + ' Note that all times are in milliseconds.');
      }
    }
  }]);

  return MeasureScanner;
}(Scanner);

/**
 * @implements {./parsers/css-expr-ast.CssContext}
 */
var CssContextImpl = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Document|!ShadowRoot} rootNode
   * @param {string} baseUrl
   * @param {!./web-animation-types.WebAnimationBuilderOptionsDef} options
   */
  function CssContextImpl(win, rootNode, baseUrl, options) {
    _classCallCheck(this, CssContextImpl);

    var _options$scaleByScope = options.scaleByScope,
        scaleByScope = _options$scaleByScope === void 0 ? false : _options$scaleByScope,
        _options$scope = options.scope,
        scope = _options$scope === void 0 ? null : _options$scope;

    /** @const @private */
    this.win_ = win;

    /** @const @private {!Document|!ShadowRoot} */
    this.rootNode_ = rootNode;

    /** @const @private {?Element} */
    this.scope_ = scope;

    /** @const @private {boolean} */
    this.scaleByScope_ = scaleByScope;

    /** @const @private */
    this.baseUrl_ = baseUrl;

    /** @private {!Object<string, !CSSStyleDeclaration>} */
    this.computedStyleCache_ = map();

    /** @private {!Object<string, ?./parsers/css-expr-ast.CssNode>} */
    this.parsedCssCache_ = map();

    /** @private {?number} */
    this.targetLength_ = null;

    /** @private {?Element} */
    this.currentTarget_ = null;

    /** @private {?number} */
    this.currentIndex_ = null;

    /** @private {?Object<string, *>} */
    this.vars_ = null;

    /** @private {!Array<string>} */
    this.varPath_ = [];

    /** @private {?string} */
    this.dim_ = null;

    /**
     * @private {?{
     *   size: {width: number, height: number},
     *   offset: {x: number, y: number},
     *   scaleFactorX: number,
     *   scaleFactorY: number,
     * }}
     */
    this.viewportParams_ = null;
  }

  /** @return {!Document|!ShadowRoot} */
  _createClass(CssContextImpl, [{
    key: "rootNode",
    get: function get() {
      return this.rootNode_;
    }
    /**
     * @param {string} mediaQuery
     * @return {boolean}
     */

  }, {
    key: "matchMedia",
    value: function matchMedia(mediaQuery) {
      return this.win_.matchMedia(mediaQuery).matches;
    }
    /**
     * @param {string} query
     * @return {boolean}
     */

  }, {
    key: "supports",
    value: function supports(query) {
      if (this.win_.CSS && this.win_.CSS.supports) {
        return this.win_.CSS.supports(query);
      }

      return false;
    }
    /**
     * @param {string} id
     * @return {?Element}
     */

  }, {
    key: "getElementById",
    value: function getElementById(id) {
      return this.scopedQuerySelector_("#" + escapeCssSelectorIdent(id));
    }
    /**
     * @param {string} selector
     * @return {!Array<!Element>}
     */

  }, {
    key: "queryElements",
    value: function queryElements(selector) {
      try {
        return toArray(this.scopedQuerySelectorAll_(selector));
      } catch (e) {
        throw user().createError("Bad query selector: \"" + selector + "\"", e);
      }
    }
    /**
     * @param {!Element} target
     * @param {string} prop
     * @return {string}
     */

  }, {
    key: "measure",
    value: function measure(target, prop) {
      // Get ID.
      var targetId = target[TARGET_ANIM_ID];

      if (!targetId) {
        targetId = String(++animIdCounter);
        target[TARGET_ANIM_ID] = targetId;
      }

      // Get and cache styles.
      var styles = this.computedStyleCache_[targetId];

      if (!styles) {
        styles = computedStyle(this.win_, target);
        this.computedStyleCache_[targetId] =
        /** @type {!CSSStyleDeclaration} */
        styles;
      }

      // Resolve a var or a property.
      return prop.startsWith('--') ? styles.getPropertyValue(prop) : styles[getVendorJsPropertyName(styles, dashToCamelCase(prop))];
    }
    /**
     * @param {number} len
     * @protected
     */

  }, {
    key: "setTargetLength",
    value: function setTargetLength(len) {
      this.targetLength_ = len;
    }
    /**
     * @param {?Element} target
     * @param {?number} index
     * @param {function(?Element):T} callback
     * @return {T}
     * @template T
     * @protected
     */

  }, {
    key: "withTarget",
    value: function withTarget(target, index, callback) {
      var prevIndex = this.currentIndex_,
          prev = this.currentTarget_;
      this.currentTarget_ = target;
      this.currentIndex_ = index;
      var result = callback(target);
      this.currentTarget_ = prev;
      this.currentIndex_ = prevIndex;
      return result;
    }
    /**
     * @param {?Object<string, *>} vars
     * @param {function():T} callback
     * @return {T}
     * @template T
     * @protected
     */

  }, {
    key: "withVars",
    value: function withVars(vars, callback) {
      var prev = this.vars_;
      this.vars_ = vars;
      var result = callback();
      this.vars_ = prev;
      return result;
    }
    /**
     * @param {*} input
     * @return {string}
     * @protected
     */

  }, {
    key: "resolveCss",
    value: function resolveCss(input) {
      // Will always return a valid string, since the default value is `''`.
      return dev().assertString(this.resolveCss_(input,
      /* def */
      '',
      /* normalize */
      true));
    }
    /**
     * @param {!Object<string, *>} input
     * @return {!Object<string, string|number>}
     */

  }, {
    key: "resolveCssMap",
    value: function resolveCssMap(input) {
      var result = map();

      for (var k in input) {
        if (k == 'offset') {
          result[k] = input[k];
        } else {
          result[k] = this.resolveCss(input[k]);
        }
      }

      return result;
    }
    /**
     * @param {*} input
     * @param {string|undefined} def
     * @return {string|undefined}
     */

  }, {
    key: "resolveIdent",
    value: function resolveIdent(input, def) {
      return this.resolveCss_(input, def,
      /* normalize */
      false);
    }
    /**
     * @param {*} input
     * @param {number|undefined} def
     * @return {number|undefined}
     */

  }, {
    key: "resolveMillis",
    value: function resolveMillis(input, def) {
      if (input != null && input !== '') {
        if (typeof input == 'number') {
          return input;
        }

        var node = this.resolveAsNode_(input,
        /* normalize */
        false);

        if (node) {
          return CssTimeNode.millis(node);
        }
      }

      return def;
    }
    /**
     * @param {*} input
     * @param {number|undefined} def
     * @return {number|undefined}
     */

  }, {
    key: "resolveNumber",
    value: function resolveNumber(input, def) {
      if (input != null && input !== '') {
        if (typeof input == 'number') {
          return input;
        }

        var node = this.resolveAsNode_(input,
        /* normalize */
        false);

        if (node) {
          return CssNumberNode.num(node);
        }
      }

      return def;
    }
    /**
     * @param {*} input
     * @param {string|undefined} def
     * @param {boolean} normalize
     * @return {string|undefined}
     * @private
     */

  }, {
    key: "resolveCss_",
    value: function resolveCss_(input, def, normalize) {
      if (input == null || input === '') {
        return def;
      }

      var inputCss = String(input);

      if (typeof input == 'number') {
        return inputCss;
      }

      // Test first if CSS contains any variable components. Otherwise, there's
      // no need to spend cycles to parse/evaluate.
      if (!isVarCss(inputCss, normalize)) {
        return inputCss;
      }

      var result = this.resolveAsNode_(inputCss, normalize);
      return result != null ? result.css() : def;
    }
    /**
     * @param {*} input
     * @param {boolean} normalize
     * @return {?./parsers/css-expr-ast.CssNode}
     * @private
     */

  }, {
    key: "resolveAsNode_",
    value: function resolveAsNode_(input, normalize) {
      if (input == null || input === '') {
        return null;
      }

      if (typeof input == 'number') {
        return new CssNumberNode(input);
      }

      // Check if the expression has already been parsed. Notice that the parsed
      // value could be `null`.
      var css = String(input);
      var node = this.parsedCssCache_[css];

      if (node === undefined) {
        node = parseCss(css);
        this.parsedCssCache_[css] = node;
      }

      if (!node) {
        return null;
      }

      return node.resolve(this, normalize);
    }
    /**
     * @return {!Element}
     * @private
     */

  }, {
    key: "requireTarget_",
    value: function requireTarget_() {
      return user().assertElement(this.currentTarget_, 'Only allowed when target is specified');
    }
    /** @override */

  }, {
    key: "getVar",
    value: function getVar(varName) {
      userAssert(this.varPath_.indexOf(varName) == -1, "Recursive variable: \"" + varName + "\"");
      this.varPath_.push(varName);
      var rawValue = this.vars_ && this.vars_[varName] != undefined ? this.vars_[varName] : this.currentTarget_ ? this.measure(this.currentTarget_, varName) : null;

      if (rawValue == null || rawValue === '') {
        user().warn(TAG, "Variable not found: \"" + varName + "\"");
      }

      // No need to normalize vars - they will be normalized later.
      var result = this.resolveAsNode_(rawValue,
      /* normalize */
      false);
      this.varPath_.pop();
      return result;
    }
    /** @override */

  }, {
    key: "withDimension",
    value: function withDimension(dim, callback) {
      var savedDim = this.dim_;
      this.dim_ = dim;
      var result = callback();
      this.dim_ = savedDim;
      return result;
    }
    /** @override */

  }, {
    key: "getDimension",
    value: function getDimension() {
      return this.dim_;
    }
    /** @override */

  }, {
    key: "getViewportSize",
    value: function getViewportSize() {
      return this.getViewportParams_().size;
    }
    /** @private */

  }, {
    key: "getViewportParams_",
    value: function getViewportParams_() {
      if (!this.viewportParams_) {
        if (this.scope_ && this.scaleByScope_) {
          var rect = this.scope_.
          /*OK*/
          getBoundingClientRect();
          var _this$scope_ = this.scope_,
              offsetHeight = _this$scope_.offsetHeight,
              offsetWidth = _this$scope_.offsetWidth;
          this.viewportParams_ = {
            offset: {
              x: rect.x,
              y: rect.y
            },
            size: {
              width: offsetWidth,
              height: offsetHeight
            },
            scaleFactorX: offsetWidth / (rect.width || 1),
            scaleFactorY: offsetHeight / (rect.height || 1)
          };
        } else {
          var _this$win_ = this.win_,
              innerHeight = _this$win_.innerHeight,
              innerWidth = _this$win_.innerWidth;
          this.viewportParams_ = {
            offset: {
              x: 0,
              y: 0
            },
            size: {
              width: innerWidth,
              height: innerHeight
            },
            scaleFactorX: 1,
            scaleFactorY: 1
          };
        }
      }

      return this.viewportParams_;
    }
    /** @override */

  }, {
    key: "getCurrentIndex",
    value: function getCurrentIndex() {
      this.requireTarget_();
      return dev().assertNumber(this.currentIndex_);
    }
    /** @override */

  }, {
    key: "getTargetLength",
    value: function getTargetLength() {
      this.requireTarget_();
      return dev().assertNumber(this.targetLength_);
    }
    /** @override */

  }, {
    key: "getCurrentFontSize",
    value: function getCurrentFontSize() {
      return this.getElementFontSize_(this.requireTarget_());
    }
    /** @override */

  }, {
    key: "getRootFontSize",
    value: function getRootFontSize() {
      return this.getElementFontSize_(this.win_.document.documentElement);
    }
    /**
     * @param {!Element} target
     * @return {number}
     * @private
     */

  }, {
    key: "getElementFontSize_",
    value: function getElementFontSize_(target) {
      return parseFloat(this.measure(target, 'font-size'));
    }
    /** @override */

  }, {
    key: "getCurrentElementRect",
    value: function getCurrentElementRect() {
      return this.getElementRect_(this.requireTarget_());
    }
    /** @override */

  }, {
    key: "getElementRect",
    value: function getElementRect(selector, selectionMethod) {
      return this.getElementRect_(this.getElement_(selector, selectionMethod));
    }
    /**
     * @param {string} selector
     * @param {?string} selectionMethod
     * @return {!Element}
     * @private
     */

  }, {
    key: "getElement_",
    value: function getElement_(selector, selectionMethod) {
      devAssert(selectionMethod == null || selectionMethod == 'closest', 'Unknown selection method: %s', selectionMethod);
      var element;

      try {
        if (selectionMethod == 'closest') {
          var maybeFoundInScope = closestAncestorElementBySelector(this.requireTarget_(), selector);

          if (maybeFoundInScope && (!this.scope_ || this.scope_.contains(maybeFoundInScope))) {
            element = maybeFoundInScope;
          }
        } else {
          element = this.scopedQuerySelector_(selector);
        }
      } catch (e) {
        throw user().createError("Bad query selector: \"" + selector + "\"", e);
      }

      return user().assertElement(element, "Element not found: " + selector);
    }
    /**
     * @param {!Element} target
     * @return {!../../../src/layout-rect.LayoutRectDef}
     * @private
     */

  }, {
    key: "getElementRect_",
    value: function getElementRect_(target) {
      var _this$getViewportPara = this.getViewportParams_(),
          offset = _this$getViewportPara.offset,
          scaleFactorX = _this$getViewportPara.scaleFactorX,
          scaleFactorY = _this$getViewportPara.scaleFactorY;

      var _target$getBoundingCl = target.
      /*OK*/
      getBoundingClientRect(),
          height = _target$getBoundingCl.height,
          width = _target$getBoundingCl.width,
          x = _target$getBoundingCl.x,
          y = _target$getBoundingCl.y;

      // This assumes default `transform-origin: center center`
      return layoutRectLtwh((x - offset.x) * scaleFactorX, (y - offset.y) * scaleFactorY, width * scaleFactorX, height * scaleFactorY);
    }
    /** @override */

  }, {
    key: "resolveUrl",
    value: function resolveUrl(url) {
      var resolvedUrl = resolveRelativeUrl(url, this.baseUrl_);
      return assertHttpsUrl(resolvedUrl, this.currentTarget_ || '');
    }
    /**
     * @param {string} selector
     * @return {?Element}
     * @private
     */

  }, {
    key: "scopedQuerySelector_",
    value: function scopedQuerySelector_(selector) {
      if (this.scope_) {
        return (
          /*OK*/
          scopedQuerySelector(this.scope_, selector)
        );
      }

      return this.rootNode_.
      /*OK*/
      querySelector(selector);
    }
    /**
     * @param {string} selector
     * @return {!NodeList}
     * @private
     */

  }, {
    key: "scopedQuerySelectorAll_",
    value: function scopedQuerySelectorAll_(selector) {
      if (this.scope_) {
        return (
          /*OK*/
          scopedQuerySelectorAll(this.scope_, selector)
        );
      }

      return this.rootNode_.
      /*OK*/
      querySelectorAll(selector);
    }
  }]);

  return CssContextImpl;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYi1hbmltYXRpb25zLmpzIl0sIm5hbWVzIjpbIkNzc051bWJlck5vZGUiLCJDc3NUaW1lTm9kZSIsImlzVmFyQ3NzIiwiSW50ZXJuYWxXZWJBbmltYXRpb25SZXF1ZXN0RGVmIiwiV2ViQW5pbWF0aW9uRGVmIiwiV2ViQW5pbWF0aW9uU2VsZWN0b3JEZWYiLCJXZWJBbmltYXRpb25TdWJ0YXJnZXREZWYiLCJXZWJBbmltYXRpb25UaW1pbmdEZWYiLCJXZWJBbmltYXRpb25UaW1pbmdEaXJlY3Rpb24iLCJXZWJBbmltYXRpb25UaW1pbmdGaWxsIiwiV2ViQ29tcEFuaW1hdGlvbkRlZiIsIldlYktleWZyYW1lQW5pbWF0aW9uRGVmIiwiV2ViS2V5ZnJhbWVzRGVmIiwiV2ViTXVsdGlBbmltYXRpb25EZWYiLCJXZWJTd2l0Y2hBbmltYXRpb25EZWYiLCJpc0FsbG93bGlzdGVkUHJvcCIsIk5hdGl2ZVdlYkFuaW1hdGlvblJ1bm5lciIsIlNjcm9sbFRpbWVsaW5lV29ya2xldFJ1bm5lciIsImFzc2VydEh0dHBzVXJsIiwicmVzb2x2ZVJlbGF0aXZlVXJsIiwiY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IiLCJtYXRjaGVzIiwic2NvcGVkUXVlcnlTZWxlY3RvciIsInNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwiLCJjb21wdXRlZFN0eWxlIiwiZ2V0VmVuZG9ySnNQcm9wZXJ0eU5hbWUiLCJkYXNoVG9DYW1lbENhc2UiLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwidXNlckFzc2VydCIsImVzY2FwZUNzc1NlbGVjdG9ySWRlbnQiLCJleHRyYWN0S2V5ZnJhbWVzIiwiZ2V0TW9kZSIsImlzQXJyYXkiLCJ0b0FycmF5IiwiaXNFbnVtVmFsdWUiLCJpc09iamVjdCIsImlzRXhwZXJpbWVudE9uIiwiaXNJbkZpZSIsImxheW91dFJlY3RMdHdoIiwibWFwIiwicGFyc2VDc3MiLCJUQUciLCJUQVJHRVRfQU5JTV9JRCIsImFuaW1JZENvdW50ZXIiLCJTRVJWSUNFX1BST1BTIiwiQUREX1BST1BTIiwiU2Nhbm5lciIsInNwZWMiLCJyZWR1Y2UiLCJhY2MiLCJjb21wIiwic2NhbiIsImlzRW5hYmxlZCIsImFuaW1hdGlvbnMiLCJvbk11bHRpQW5pbWF0aW9uIiwic3dpdGNoIiwib25Td2l0Y2hBbmltYXRpb24iLCJhbmltYXRpb24iLCJvbkNvbXBBbmltYXRpb24iLCJrZXlmcmFtZXMiLCJvbktleWZyYW1lQW5pbWF0aW9uIiwib25Vbmtub3duQW5pbWF0aW9uIiwidW51c2VkU3BlYyIsImNyZWF0ZUVycm9yIiwiQnVpbGRlciIsIndpbiIsInJvb3ROb2RlIiwiYmFzZVVybCIsInZzeW5jIiwib3duZXJzIiwib3B0aW9ucyIsIndpbl8iLCJjc3NfIiwiQ3NzQ29udGV4dEltcGwiLCJ2c3luY18iLCJvd25lcnNfIiwidGFyZ2V0c18iLCJsb2FkZXJzXyIsIm9wdF9hcmdzIiwib3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhIiwicmVzb2x2ZVJlcXVlc3RzIiwidGhlbiIsInJlcXVlc3RzIiwibG9jYWxEZXYiLCJkZXZlbG9wbWVudCIsImZpbmUiLCJQcm9taXNlIiwiYWxsIiwiaXNBbmltYXRpb25Xb3JrbGV0U3VwcG9ydGVkXyIsInBhdGgiLCJhcmdzIiwidGFyZ2V0IiwiaW5kZXgiLCJ2YXJzIiwidGltaW5nIiwic2Nhbm5lciIsImNyZWF0ZVNjYW5uZXJfIiwibWVhc3VyZVByb21pc2UiLCJpbmNsdWRlcyIsInB1c2giLCJyZXF1aXJlTGF5b3V0IiwiTWVhc3VyZVNjYW5uZXIiLCJDU1MiLCJydW50aW1lIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJidWlsZGVyIiwiY3NzIiwiYnVpbGRlcl8iLCJwYXRoXyIsInRhcmdldF8iLCJpbmRleF8iLCJ2YXJzXyIsInRpbWluZ18iLCJkdXJhdGlvbiIsImRlbGF5IiwiZW5kRGVsYXkiLCJpdGVyYXRpb25zIiwiaXRlcmF0aW9uU3RhcnQiLCJlYXNpbmciLCJkaXJlY3Rpb24iLCJOT1JNQUwiLCJmaWxsIiwiTk9ORSIsInJlcXVlc3RzXyIsImRlcHNfIiwid2l0aF8iLCJ3aXRoVmFycyIsIm1lZGlhIiwibWF0Y2hNZWRpYSIsInN1cHBvcnRzIiwiaSIsImxlbmd0aCIsImNhbmRpZGF0ZSIsImluZGV4T2YiLCJuZXdQYXRoIiwiY29uY2F0IiwiYW5pbWF0aW9uRWxlbWVudCIsImFzc2VydEVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInRhZ05hbWUiLCJvdGhlclNwZWNQcm9taXNlIiwiZ2V0SW1wbCIsImltcGwiLCJnZXRBbmltYXRpb25TcGVjIiwicHJvbWlzZSIsIm90aGVyU3BlYyIsImZvckVhY2giLCJyZXF1ZXN0IiwiY3JlYXRlS2V5ZnJhbWVzXyIsInNwZWNLZXlmcmFtZXMiLCJvYmplY3QiLCJwcm9wIiwidmFsaWRhdGVQcm9wZXJ0eV8iLCJ2YWx1ZSIsInByZXBhcmVkVmFsdWUiLCJmcm9tVmFsdWUiLCJtZWFzdXJlIiwidG9WYWx1ZSIsInJlc29sdmVDc3MiLCJ2IiwiYXJyYXkiLCJhZGRTdGFydEZyYW1lIiwib2Zmc2V0Iiwic3RhcnRGcmFtZSIsInJlc29sdmVDc3NNYXAiLCJzdGFydCIsImZyYW1lIiwiayIsImNhbGxiYWNrIiwicHJldkluZGV4IiwicHJldlRhcmdldCIsInByZXZUaW1pbmciLCJwcmV2VmFycyIsInRhcmdldHMiLCJzZWxlY3RvciIsInJlc29sdmVUYXJnZXRzXyIsInNldFRhcmdldExlbmd0aCIsIndpdGhUYXJnZXQiLCJzdWJ0YXJnZXRTcGVjIiwibWF0Y2hTdWJ0YXJnZXRzXyIsIm1lcmdlVmFyc18iLCJtZXJnZVRpbWluZ18iLCJxdWVyeUVsZW1lbnRzIiwid2FybiIsImVycm9yIiwic3VidGFyZ2V0cyIsInJlc3VsdCIsIm1hdGNoZXIiLCJnZXRNYXRjaGVyXyIsIk9iamVjdCIsImFzc2lnbiIsInVuZGVmaW5lZCIsInNwZWNJbmRleCIsIk51bWJlciIsInNwZWNTZWxlY3RvciIsImUiLCJuZXdWYXJzIiwic3RhcnRzV2l0aCIsIm5ld1RpbWluZyIsInJlc29sdmVNaWxsaXMiLCJyZXNvbHZlTnVtYmVyIiwiYXNzZXJ0TnVtYmVyIiwicmVzb2x2ZUlkZW50IiwidmFsaWRhdGVUaW1lXyIsImlzRmluaXRlIiwibmV3VmFsdWUiLCJmaWVsZCIsIm9wdF9hbGxvd05lZ2F0aXZlIiwiTWF0aCIsImZsb29yIiwic2NhbGVCeVNjb3BlIiwic2NvcGUiLCJyb290Tm9kZV8iLCJzY29wZV8iLCJzY2FsZUJ5U2NvcGVfIiwiYmFzZVVybF8iLCJjb21wdXRlZFN0eWxlQ2FjaGVfIiwicGFyc2VkQ3NzQ2FjaGVfIiwidGFyZ2V0TGVuZ3RoXyIsImN1cnJlbnRUYXJnZXRfIiwiY3VycmVudEluZGV4XyIsInZhclBhdGhfIiwiZGltXyIsInZpZXdwb3J0UGFyYW1zXyIsIm1lZGlhUXVlcnkiLCJxdWVyeSIsImlkIiwic2NvcGVkUXVlcnlTZWxlY3Rvcl8iLCJzY29wZWRRdWVyeVNlbGVjdG9yQWxsXyIsInRhcmdldElkIiwiU3RyaW5nIiwic3R5bGVzIiwiZ2V0UHJvcGVydHlWYWx1ZSIsImxlbiIsInByZXYiLCJpbnB1dCIsImFzc2VydFN0cmluZyIsInJlc29sdmVDc3NfIiwiZGVmIiwibm9kZSIsInJlc29sdmVBc05vZGVfIiwibWlsbGlzIiwibnVtIiwibm9ybWFsaXplIiwiaW5wdXRDc3MiLCJyZXNvbHZlIiwidmFyTmFtZSIsInJhd1ZhbHVlIiwicG9wIiwiZGltIiwic2F2ZWREaW0iLCJnZXRWaWV3cG9ydFBhcmFtc18iLCJzaXplIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIm9mZnNldEhlaWdodCIsIm9mZnNldFdpZHRoIiwieCIsInkiLCJ3aWR0aCIsImhlaWdodCIsInNjYWxlRmFjdG9yWCIsInNjYWxlRmFjdG9yWSIsImlubmVySGVpZ2h0IiwiaW5uZXJXaWR0aCIsInJlcXVpcmVUYXJnZXRfIiwiZ2V0RWxlbWVudEZvbnRTaXplXyIsInBhcnNlRmxvYXQiLCJnZXRFbGVtZW50UmVjdF8iLCJzZWxlY3Rpb25NZXRob2QiLCJnZXRFbGVtZW50XyIsImVsZW1lbnQiLCJtYXliZUZvdW5kSW5TY29wZSIsImNvbnRhaW5zIiwidXJsIiwicmVzb2x2ZWRVcmwiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlTZWxlY3RvckFsbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxhQUFSLEVBQXVCQyxXQUF2QixFQUFvQ0MsUUFBcEM7QUFDQSxTQUNFQyw4QkFERixFQUVFQyxlQUZGLEVBR0VDLHVCQUhGLEVBSUVDLHdCQUpGLEVBS0VDLHFCQUxGLEVBTUVDLDJCQU5GLEVBT0VDLHNCQVBGLEVBUUVDLG1CQVJGLEVBU0VDLHVCQVRGLEVBVUVDLGVBVkYsRUFXRUMsb0JBWEYsRUFZRUMscUJBWkYsRUFhRUMsaUJBYkY7QUFlQSxTQUFRQyx3QkFBUjtBQUNBLFNBQVFDLDJCQUFSO0FBQ0EsU0FBUUMsY0FBUixFQUF3QkMsa0JBQXhCO0FBQ0EsU0FDRUMsZ0NBREYsRUFFRUMsT0FGRixFQUdFQyxtQkFIRixFQUlFQyxzQkFKRjtBQU1BLFNBQVFDLGFBQVIsRUFBdUJDLHVCQUF2QjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLElBQXhCLEVBQThCQyxVQUE5QjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsZ0JBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsT0FBakI7QUFDQSxTQUFRQyxXQUFSLEVBQXFCQyxRQUFyQjtBQUNBLFNBQVFDLGNBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLEdBQVI7QUFFQSxTQUFRQyxRQUFSOztBQUVBO0FBQ0EsSUFBTUMsR0FBRyxHQUFHLGVBQVo7QUFDQSxJQUFNQyxjQUFjLEdBQUcsZUFBdkI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlD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QUFlO0FBQU9nRSxNQUFBQSxhQUF0QixDQUFvQ3RHLFFBQXBDLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDRSxpQ0FBd0JBLFFBQXhCLEVBQWtDO0FBQ2hDLFVBQUksS0FBS3VDLE1BQVQsRUFBaUI7QUFDZjtBQUFPO0FBQU9qTSxVQUFBQSxzQkFBc0IsQ0FBQyxLQUFLaU0sTUFBTixFQUFjdkMsUUFBZDtBQUFwQztBQUNEOztBQUNELGFBQU8sS0FBS3NDLFNBQUw7QUFBZTtBQUFPaUUsTUFBQUEsZ0JBQXRCLENBQXVDdkcsUUFBdkMsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Q3NzTnVtYmVyTm9kZSwgQ3NzVGltZU5vZGUsIGlzVmFyQ3NzfSBmcm9tICcuL3BhcnNlcnMvY3NzLWV4cHItYXN0JztcbmltcG9ydCB7XG4gIEludGVybmFsV2ViQW5pbWF0aW9uUmVxdWVzdERlZixcbiAgV2ViQW5pbWF0aW9uRGVmLFxuICBXZWJBbmltYXRpb25TZWxlY3RvckRlZixcbiAgV2ViQW5pbWF0aW9uU3VidGFyZ2V0RGVmLFxuICBXZWJBbmltYXRpb25UaW1pbmdEZWYsXG4gIFdlYkFuaW1hdGlvblRpbWluZ0RpcmVjdGlvbixcbiAgV2ViQW5pbWF0aW9uVGltaW5nRmlsbCxcbiAgV2ViQ29tcEFuaW1hdGlvbkRlZixcbiAgV2ViS2V5ZnJhbWVBbmltYXRpb25EZWYsXG4gIFdlYktleWZyYW1lc0RlZixcbiAgV2ViTXVsdGlBbmltYXRpb25EZWYsXG4gIFdlYlN3aXRjaEFuaW1hdGlvbkRlZixcbiAgaXNBbGxvd2xpc3RlZFByb3AsXG59IGZyb20gJy4vd2ViLWFuaW1hdGlvbi10eXBlcyc7XG5pbXBvcnQge05hdGl2ZVdlYkFuaW1hdGlvblJ1bm5lcn0gZnJvbSAnLi9ydW5uZXJzL25hdGl2ZS13ZWItYW5pbWF0aW9uLXJ1bm5lcic7XG5pbXBvcnQge1Njcm9sbFRpbWVsaW5lV29ya2xldFJ1bm5lcn0gZnJvbSAnLi9ydW5uZXJzL3Njcm9sbHRpbWVsaW5lLXdvcmtsZXQtcnVubmVyJztcbmltcG9ydCB7YXNzZXJ0SHR0cHNVcmwsIHJlc29sdmVSZWxhdGl2ZVVybH0gZnJvbSAnLi4vLi4vLi4vc3JjL3VybCc7XG5pbXBvcnQge1xuICBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvcixcbiAgbWF0Y2hlcyxcbiAgc2NvcGVkUXVlcnlTZWxlY3RvcixcbiAgc2NvcGVkUXVlcnlTZWxlY3RvckFsbCxcbn0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7Y29tcHV0ZWRTdHlsZSwgZ2V0VmVuZG9ySnNQcm9wZXJ0eU5hbWV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2Rhc2hUb0NhbWVsQ2FzZX0gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtlc2NhcGVDc3NTZWxlY3RvcklkZW50fSBmcm9tICcjY29yZS9kb20vY3NzLXNlbGVjdG9ycyc7XG5pbXBvcnQge2V4dHJhY3RLZXlmcmFtZXN9IGZyb20gJy4vcGFyc2Vycy9rZXlmcmFtZXMtZXh0cmFjdG9yJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtpc0FycmF5LCB0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5pbXBvcnQge2lzRW51bVZhbHVlLCBpc09iamVjdH0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHtpc0V4cGVyaW1lbnRPbn0gZnJvbSAnI2V4cGVyaW1lbnRzJztcbmltcG9ydCB7aXNJbkZpZX0gZnJvbSAnLi4vLi4vLi4vc3JjL2lmcmFtZS1oZWxwZXInO1xuaW1wb3J0IHtsYXlvdXRSZWN0THR3aH0gZnJvbSAnI2NvcmUvZG9tL2xheW91dC9yZWN0JztcbmltcG9ydCB7bWFwfSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuXG5pbXBvcnQge3BhcnNlQ3NzfSBmcm9tICcuL3BhcnNlcnMvY3NzLWV4cHInO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnYW1wLWFuaW1hdGlvbic7XG5jb25zdCBUQVJHRVRfQU5JTV9JRCA9ICdfX0FNUF9BTklNX0lEJztcblxuLyoqXG4gKiBBdXRvLWluY3JlbWVudGluZyBJRCBnZW5lcmF0b3IgZm9yIGludGVybmFsIGFuaW1hdGlvbiB1c2VzLlxuICogU2VlIGBUQVJHRVRfQU5JTV9JRGAuXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5sZXQgYW5pbUlkQ291bnRlciA9IDA7XG5cbi8qKlxuICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj59XG4gKi9cbmNvbnN0IFNFUlZJQ0VfUFJPUFMgPSB7XG4gICdvZmZzZXQnOiB0cnVlLFxuICAnZWFzaW5nJzogdHJ1ZSxcbn07XG5cbi8qKlxuICogQ2xpcC1wYXRoIGlzIGFuIG9ubHkgQ1NTIHByb3BlcnR5IHdlIGFsbG93IGZvciBhbmltYXRpb24gdGhhdCBtYXkgcmVxdWlyZVxuICogdmVuZG9yIHByZWZpeC4gQW5kIGl0J3MgYWx3YXlzIFwiLXdlYmtpdFwiLiBVc2UgYSBzaW1wbGUgbWFwIHRvIGF2b2lkXG4gKiBleHBlbnNpdmUgbG9va3VwIGZvciBhbGwgb3RoZXIgcHJvcGVydGllcy5cbiAqL1xuY29uc3QgQUREX1BST1BTID0ge1xuICAnY2xpcC1wYXRoJzogJy13ZWJraXQtY2xpcC1wYXRoJyxcbiAgJ2NsaXBQYXRoJzogJy13ZWJraXQtY2xpcC1wYXRoJyxcbn07XG5cbi8qKlxuICogVGhlIHNjYW5uZXIgZm9yIHRoZSBgV2ViQW5pbWF0aW9uRGVmYCBmb3JtYXQuIEl0IGNhbGxzIHRoZSBhcHByb3ByaWF0ZVxuICogY2FsbGJhY2tzIGJhc2VkIG9uIHRoZSBkaXNjb3ZlcmVkIGFuaW1hdGlvbiB0eXBlcy5cbiAqIEBhYnN0cmFjdFxuICovXG5jbGFzcyBTY2FubmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdlYkFuaW1hdGlvbkRlZnwhQXJyYXk8IVdlYkFuaW1hdGlvbkRlZj59IHNwZWNcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHNjYW4oc3BlYykge1xuICAgIGlmIChpc0FycmF5KHNwZWMpKSB7XG4gICAgICAvLyBSZXR1cm5zIGB0cnVlYCBpZiBhbnkgb2YgdGhlIGNvbXBvbmVudHMgc2NhbiBzdWNjZXNzZnVsbHkuXG4gICAgICByZXR1cm4gc3BlYy5yZWR1Y2UoKGFjYywgY29tcCkgPT4gdGhpcy5zY2FuKGNvbXApIHx8IGFjYywgZmFsc2UpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGFuaW1hdGlvbiBpcyBlbmFibGVkLlxuICAgIGlmICghdGhpcy5pc0VuYWJsZWQoLyoqIEB0eXBlIHshV2ViQW5pbWF0aW9uRGVmfSAqLyAoc3BlYykpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gV2ViQW5pbWF0aW9uRGVmOiAoIVdlYk11bHRpQW5pbWF0aW9uRGVmfCFXZWJTcGVjQW5pbWF0aW9uRGVmfFxuICAgIC8vICAgICAgICAgICAgICAgICAgICFXZWJDb21wQW5pbWF0aW9uRGVmfCFXZWJLZXlmcmFtZUFuaW1hdGlvbkRlZilcbiAgICBpZiAoc3BlYy5hbmltYXRpb25zKSB7XG4gICAgICB0aGlzLm9uTXVsdGlBbmltYXRpb24oLyoqIEB0eXBlIHshV2ViTXVsdGlBbmltYXRpb25EZWZ9ICovIChzcGVjKSk7XG4gICAgfSBlbHNlIGlmIChzcGVjLnN3aXRjaCkge1xuICAgICAgdGhpcy5vblN3aXRjaEFuaW1hdGlvbigvKiogQHR5cGUgeyFXZWJTd2l0Y2hBbmltYXRpb25EZWZ9ICovIChzcGVjKSk7XG4gICAgfSBlbHNlIGlmIChzcGVjLmFuaW1hdGlvbikge1xuICAgICAgdGhpcy5vbkNvbXBBbmltYXRpb24oLyoqIEB0eXBlIHshV2ViQ29tcEFuaW1hdGlvbkRlZn0gKi8gKHNwZWMpKTtcbiAgICB9IGVsc2UgaWYgKHNwZWMua2V5ZnJhbWVzKSB7XG4gICAgICB0aGlzLm9uS2V5ZnJhbWVBbmltYXRpb24oLyoqIEB0eXBlIHshV2ViS2V5ZnJhbWVBbmltYXRpb25EZWZ9ICovIChzcGVjKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25Vbmtub3duQW5pbWF0aW9uKHNwZWMpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBhbmltYXRpb24gc3BlYyBpcyBlbmFibGVkLlxuICAgKiBAcGFyYW0geyFXZWJBbmltYXRpb25EZWZ9IHVudXNlZFNwZWNcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRW5hYmxlZCh1bnVzZWRTcGVjKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2ViTXVsdGlBbmltYXRpb25EZWZ9IHVudXNlZFNwZWNcbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBvbk11bHRpQW5pbWF0aW9uKHVudXNlZFNwZWMpIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdlYlN3aXRjaEFuaW1hdGlvbkRlZn0gdW51c2VkU3BlY1xuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIG9uU3dpdGNoQW5pbWF0aW9uKHVudXNlZFNwZWMpIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdlYkNvbXBBbmltYXRpb25EZWZ9IHVudXNlZFNwZWNcbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBvbkNvbXBBbmltYXRpb24odW51c2VkU3BlYykge31cblxuICAvKipcbiAgICogQHBhcmFtIHshV2ViS2V5ZnJhbWVBbmltYXRpb25EZWZ9IHVudXNlZFNwZWNcbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBvbktleWZyYW1lQW5pbWF0aW9uKHVudXNlZFNwZWMpIHt9XG5cbiAgLyoqIEBwYXJhbSB7IU9iamVjdH0gdW51c2VkU3BlYyAqL1xuICBvblVua25vd25BbmltYXRpb24odW51c2VkU3BlYykge1xuICAgIHRocm93IGRldigpLmNyZWF0ZUVycm9yKFxuICAgICAgJ3Vua25vd24gYW5pbWF0aW9uIHR5cGU6IG11c3QgaGF2ZSBcImFuaW1hdGlvbnNcIiBvciBcImtleWZyYW1lc1wiIGZpZWxkJ1xuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYW5pbWF0aW9uIHJ1bm5lcnMgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHNwZWMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCdWlsZGVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IURvY3VtZW50fCFTaGFkb3dSb290fSByb290Tm9kZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVybFxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS92c3luYy1pbXBsLlZzeW5jfSB2c3luY1xuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9vd25lcnMtaW50ZXJmYWNlLk93bmVyc0ludGVyZmFjZX0gb3duZXJzXG4gICAqIEBwYXJhbSB7IS4vd2ViLWFuaW1hdGlvbi10eXBlcy5XZWJBbmltYXRpb25CdWlsZGVyT3B0aW9uc0RlZj19IG9wdGlvbnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgcm9vdE5vZGUsIGJhc2VVcmwsIHZzeW5jLCBvd25lcnMsIG9wdGlvbnMgPSB7fSkge1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5jc3NfID0gbmV3IENzc0NvbnRleHRJbXBsKHdpbiwgcm9vdE5vZGUsIGJhc2VVcmwsIG9wdGlvbnMpO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSAqL1xuICAgIHRoaXMudnN5bmNfID0gdnN5bmM7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5vd25lcnNfID0gb3duZXJzO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IUFycmF5PCFFbGVtZW50Pn0gKi9cbiAgICB0aGlzLnRhcmdldHNfID0gW107XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshQXJyYXk8IVByb21pc2U+fSAqL1xuICAgIHRoaXMubG9hZGVyc18gPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBhbmltYXRpb24gcnVubmVyIGZvciB0aGUgcHJvdmlkZWQgc3BlYy4gV2FpdHMgZm9yIGFsbFxuICAgKiBuZWNlc3NhcnkgcmVzb3VyY2VzIHRvIGJlIGxvYWRlZCBiZWZvcmUgdGhlIHJ1bm5lciBpcyByZXNvbHZlZC5cbiAgICogQHBhcmFtIHshV2ViQW5pbWF0aW9uRGVmfCFBcnJheTwhV2ViQW5pbWF0aW9uRGVmPn0gc3BlY1xuICAgKiBAcGFyYW0gez9XZWJBbmltYXRpb25EZWY9fSBvcHRfYXJnc1xuICAgKiBAcGFyYW0gez9Kc29uT2JqZWN0PX0gb3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCEuL3J1bm5lcnMvYW5pbWF0aW9uLXJ1bm5lci5BbmltYXRpb25SdW5uZXI+fVxuICAgKi9cbiAgY3JlYXRlUnVubmVyKHNwZWMsIG9wdF9hcmdzLCBvcHRfcG9zaXRpb25PYnNlcnZlckRhdGEgPSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZVJlcXVlc3RzKFtdLCBzcGVjLCBvcHRfYXJncykudGhlbigocmVxdWVzdHMpID0+IHtcbiAgICAgIGlmIChnZXRNb2RlKCkubG9jYWxEZXYgfHwgZ2V0TW9kZSgpLmRldmVsb3BtZW50KSB7XG4gICAgICAgIHVzZXIoKS5maW5lKFRBRywgJ0FuaW1hdGlvbjogJywgcmVxdWVzdHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHRoaXMubG9hZGVyc18pLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0FuaW1hdGlvbldvcmtsZXRTdXBwb3J0ZWRfKCkgJiYgb3B0X3Bvc2l0aW9uT2JzZXJ2ZXJEYXRhXG4gICAgICAgICAgPyBuZXcgU2Nyb2xsVGltZWxpbmVXb3JrbGV0UnVubmVyKFxuICAgICAgICAgICAgICB0aGlzLndpbl8sXG4gICAgICAgICAgICAgIHJlcXVlc3RzLFxuICAgICAgICAgICAgICBvcHRfcG9zaXRpb25PYnNlcnZlckRhdGFcbiAgICAgICAgICAgIClcbiAgICAgICAgICA6IG5ldyBOYXRpdmVXZWJBbmltYXRpb25SdW5uZXIocmVxdWVzdHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPn0gcGF0aFxuICAgKiBAcGFyYW0geyFXZWJBbmltYXRpb25EZWZ8IUFycmF5PCFXZWJBbmltYXRpb25EZWY+fSBzcGVjXG4gICAqIEBwYXJhbSB7P1dlYkFuaW1hdGlvbkRlZnx1bmRlZmluZWR9IGFyZ3NcbiAgICogQHBhcmFtIHs/RWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7P251bWJlcn0gaW5kZXhcbiAgICogQHBhcmFtIHs/T2JqZWN0PHN0cmluZywgKj59IHZhcnNcbiAgICogQHBhcmFtIHs/V2ViQW5pbWF0aW9uVGltaW5nRGVmfSB0aW1pbmdcbiAgICogQHJldHVybiB7IVByb21pc2U8IUFycmF5PCFJbnRlcm5hbFdlYkFuaW1hdGlvblJlcXVlc3REZWY+Pn1cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcmVzb2x2ZVJlcXVlc3RzKFxuICAgIHBhdGgsXG4gICAgc3BlYyxcbiAgICBhcmdzLFxuICAgIHRhcmdldCA9IG51bGwsXG4gICAgaW5kZXggPSBudWxsLFxuICAgIHZhcnMgPSBudWxsLFxuICAgIHRpbWluZyA9IG51bGxcbiAgKSB7XG4gICAgY29uc3Qgc2Nhbm5lciA9IHRoaXMuY3JlYXRlU2Nhbm5lcl8ocGF0aCwgdGFyZ2V0LCBpbmRleCwgdmFycywgdGltaW5nKTtcbiAgICByZXR1cm4gdGhpcy52c3luY18ubWVhc3VyZVByb21pc2UoKCkgPT5cbiAgICAgIHNjYW5uZXIucmVzb2x2ZVJlcXVlc3RzKHNwZWMsIGFyZ3MpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcmVxdWlyZUxheW91dCh0YXJnZXQpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0c18uaW5jbHVkZXModGFyZ2V0KSkge1xuICAgICAgdGhpcy50YXJnZXRzXy5wdXNoKHRhcmdldCk7XG4gICAgICB0aGlzLmxvYWRlcnNfLnB1c2godGhpcy5vd25lcnNfLnJlcXVpcmVMYXlvdXQodGFyZ2V0KSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFycmF5PHN0cmluZz59IHBhdGhcbiAgICogQHBhcmFtIHs/RWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7P251bWJlcn0gaW5kZXhcbiAgICogQHBhcmFtIHs/T2JqZWN0PHN0cmluZywgKj59IHZhcnNcbiAgICogQHBhcmFtIHs/V2ViQW5pbWF0aW9uVGltaW5nRGVmfSB0aW1pbmdcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7Kn0gVE9ETygjMjM1ODIpOiBTcGVjaWZ5IHJldHVybiB0eXBlXG4gICAqL1xuICBjcmVhdGVTY2FubmVyXyhwYXRoLCB0YXJnZXQsIGluZGV4LCB2YXJzLCB0aW1pbmcpIHtcbiAgICByZXR1cm4gbmV3IE1lYXN1cmVTY2FubmVyKFxuICAgICAgdGhpcyxcbiAgICAgIHRoaXMuY3NzXyxcbiAgICAgIHBhdGgsXG4gICAgICB0YXJnZXQsXG4gICAgICBpbmRleCxcbiAgICAgIHZhcnMsXG4gICAgICB0aW1pbmdcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgYW5pbWF0aW9uV29ya2xldCBjYW4gYmUgdXNlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzQW5pbWF0aW9uV29ya2xldFN1cHBvcnRlZF8oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGlzRXhwZXJpbWVudE9uKHRoaXMud2luXywgJ2Nocm9tZS1hbmltYXRpb24td29ya2xldCcpICYmXG4gICAgICAnYW5pbWF0aW9uV29ya2xldCcgaW4gQ1NTICYmXG4gICAgICBnZXRNb2RlKHRoaXMud2luXykucnVudGltZSAhPSAnaW5hYm94JyAmJlxuICAgICAgIWlzSW5GaWUodGhpcy53aW5fLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudClcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHNjYW5uZXIgdGhhdCBldmFsdWF0ZXMgYWxsIGV4cHJlc3Npb25zIGFuZCBidWlsZHMgdGhlIGZpbmFsXG4gKiBgQW5pbWF0aW9uUnVubmVyYCBpbnN0YW5jZSBmb3IgdGhlIHRhcmdldCBhbmltYXRpb24uIEl0IG11c3QgYmVcbiAqIGV4ZWN1dGVkIGluIHRoZSBcIm1lYXN1cmVcIiB2c3luYyBwaGFzZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lYXN1cmVTY2FubmVyIGV4dGVuZHMgU2Nhbm5lciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFCdWlsZGVyfSBidWlsZGVyXG4gICAqIEBwYXJhbSB7IUNzc0NvbnRleHRJbXBsfSBjc3NcbiAgICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPn0gcGF0aFxuICAgKiBAcGFyYW0gez9FbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHs/bnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0gez9PYmplY3Q8c3RyaW5nLCAqPn0gdmFyc1xuICAgKiBAcGFyYW0gez9XZWJBbmltYXRpb25UaW1pbmdEZWZ9IHRpbWluZ1xuICAgKi9cbiAgY29uc3RydWN0b3IoYnVpbGRlciwgY3NzLCBwYXRoLCB0YXJnZXQsIGluZGV4LCB2YXJzLCB0aW1pbmcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuYnVpbGRlcl8gPSBidWlsZGVyO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuY3NzXyA9IGNzcztcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLnBhdGhfID0gcGF0aDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy50YXJnZXRfID0gdGFyZ2V0O1xuXG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfSAqL1xuICAgIHRoaXMuaW5kZXhfID0gaW5kZXg7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAqPn0gKi9cbiAgICB0aGlzLnZhcnNfID0gdmFycyB8fCBtYXAoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVdlYkFuaW1hdGlvblRpbWluZ0RlZn0gKi9cbiAgICB0aGlzLnRpbWluZ18gPSB0aW1pbmcgfHwge1xuICAgICAgZHVyYXRpb246IDAsXG4gICAgICBkZWxheTogMCxcbiAgICAgIGVuZERlbGF5OiAwLFxuICAgICAgaXRlcmF0aW9uczogMSxcbiAgICAgIGl0ZXJhdGlvblN0YXJ0OiAwLFxuICAgICAgZWFzaW5nOiAnbGluZWFyJyxcbiAgICAgIGRpcmVjdGlvbjogV2ViQW5pbWF0aW9uVGltaW5nRGlyZWN0aW9uLk5PUk1BTCxcbiAgICAgIGZpbGw6IFdlYkFuaW1hdGlvblRpbWluZ0ZpbGwuTk9ORSxcbiAgICB9O1xuXG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8IUludGVybmFsV2ViQW5pbWF0aW9uUmVxdWVzdERlZj59ICovXG4gICAgdGhpcy5yZXF1ZXN0c18gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIERlcGVuZGVuY2llcyByZXF1aXJlZCB0byByZXNvbHZlIGFsbCBhbmltYXRpb24gcmVxdWVzdHMuIEluIGNhc2Ugb2ZcbiAgICAgKiBjb21wb3NpdGlvbiwgYWxsIHJlcXVlc3RzIGNhbiBvbmx5IGJlIHJlc29sdmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzXG4gICAgICogZGVwZW5kZW5jaWVzIGFyZSB1c2VkIHRvIGJsb2NrIGByZXNvbHZlUmVxdWVzdHNgIHRvIGNvbGxlY3QgYWxsXG4gICAgICogZGVwZW5kZW5pY2VzLlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7IUFycmF5PCFQcm9taXNlPn1cbiAgICAgKi9cbiAgICB0aGlzLmRlcHNfID0gW107XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2RzIHNjYW5zIGFsbCBhbmltYXRpb24gZGVjbGFyYXRpb25zIHNwZWNpZmllZCBpbiBgc3BlY2BcbiAgICogcmVjdXJzaXZlbHkgdG8gcHJvZHVjZSB0aGUgYW5pbWF0aW9uIHJlcXVlc3RzLiBgb3B0X2FyZ3NgIGlzIGFuIGFkZGl0aW9uYWxcbiAgICogc3BlYyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRlZmF1bHQgdGltaW5nIGFuZCB2YXJpYWJsZXMuXG4gICAqIEBwYXJhbSB7IVdlYkFuaW1hdGlvbkRlZnwhQXJyYXk8IVdlYkFuaW1hdGlvbkRlZj59IHNwZWNcbiAgICogQHBhcmFtIHs/V2ViQW5pbWF0aW9uRGVmPX0gb3B0X2FyZ3NcbiAgICogQHJldHVybiB7IVByb21pc2U8IUFycmF5PCFJbnRlcm5hbFdlYkFuaW1hdGlvblJlcXVlc3REZWY+Pn1cbiAgICovXG4gIHJlc29sdmVSZXF1ZXN0cyhzcGVjLCBvcHRfYXJncykge1xuICAgIGlmIChvcHRfYXJncykge1xuICAgICAgdGhpcy53aXRoXyhvcHRfYXJncywgKCkgPT4ge1xuICAgICAgICB0aGlzLnNjYW4oc3BlYyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jc3NfLndpdGhWYXJzKHRoaXMudmFyc18sICgpID0+IHtcbiAgICAgICAgdGhpcy5zY2FuKHNwZWMpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLmRlcHNfKS50aGVuKCgpID0+IHRoaXMucmVxdWVzdHNfKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNFbmFibGVkKHNwZWMpIHtcbiAgICBpZiAoc3BlYy5tZWRpYSAmJiAhdGhpcy5jc3NfLm1hdGNoTWVkaWEoc3BlYy5tZWRpYSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHNwZWMuc3VwcG9ydHMgJiYgIXRoaXMuY3NzXy5zdXBwb3J0cyhzcGVjLnN1cHBvcnRzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25NdWx0aUFuaW1hdGlvbihzcGVjKSB7XG4gICAgdGhpcy53aXRoXyhzcGVjLCAoKSA9PiB0aGlzLnNjYW4oc3BlYy5hbmltYXRpb25zKSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uU3dpdGNoQW5pbWF0aW9uKHNwZWMpIHtcbiAgICAvLyBUaGUgZmlyc3QgdG8gbWF0Y2ggd2lsbCBiZSB1c2VkOyB0aGUgcmVzdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAgdGhpcy53aXRoXyhzcGVjLCAoKSA9PiB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNwZWMuc3dpdGNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHNwZWMuc3dpdGNoW2ldO1xuICAgICAgICBpZiAodGhpcy5zY2FuKGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgICAvLyBGaXJzdCBtYXRjaGluZyBjYW5kaWRhdGUgaXMgYXBwbGllZCBhbmQgdGhlIHJlc3QgYXJlIGlnbm9yZWQuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25Db21wQW5pbWF0aW9uKHNwZWMpIHtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgdGhpcy5wYXRoXy5pbmRleE9mKHNwZWMuYW5pbWF0aW9uKSA9PSAtMSxcbiAgICAgIGBSZWN1cnNpdmUgYW5pbWF0aW9ucyBhcmUgbm90IGFsbG93ZWQ6IFwiJHtzcGVjLmFuaW1hdGlvbn1cImBcbiAgICApO1xuICAgIGNvbnN0IG5ld1BhdGggPSB0aGlzLnBhdGhfLmNvbmNhdChzcGVjLmFuaW1hdGlvbik7XG4gICAgY29uc3QgYW5pbWF0aW9uRWxlbWVudCA9IHVzZXIoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGhpcy5jc3NfLmdldEVsZW1lbnRCeUlkKHNwZWMuYW5pbWF0aW9uKSxcbiAgICAgIGBBbmltYXRpb24gbm90IGZvdW5kOiBcIiR7c3BlYy5hbmltYXRpb259XCJgXG4gICAgKTtcbiAgICAvLyBDdXJyZW50bHksIG9ubHkgYDxhbXAtYW5pbWF0aW9uPmAgc3VwcGxpZXMgYW5pbWF0aW9ucy4gSW4gdGhlIGZ1dHVyZVxuICAgIC8vIHRoaXMgY291bGQgYmVjb21lIGFuIGludGVyZmFjZS5cbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgYW5pbWF0aW9uRWxlbWVudC50YWdOYW1lID09ICdBTVAtQU5JTUFUSU9OJyxcbiAgICAgIGBFbGVtZW50IGlzIG5vdCBhbiBhbmltYXRpb246IFwiJHtzcGVjLmFuaW1hdGlvbn1cImBcbiAgICApO1xuICAgIGNvbnN0IG90aGVyU3BlY1Byb21pc2UgPSBhbmltYXRpb25FbGVtZW50LmdldEltcGwoKS50aGVuKChpbXBsKSA9PiB7XG4gICAgICByZXR1cm4gaW1wbC5nZXRBbmltYXRpb25TcGVjKCk7XG4gICAgfSk7XG4gICAgdGhpcy53aXRoXyhzcGVjLCAoKSA9PiB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGluZGV4XzogaW5kZXgsXG4gICAgICAgIHRhcmdldF86IHRhcmdldCxcbiAgICAgICAgdGltaW5nXzogdGltaW5nLFxuICAgICAgICB2YXJzXzogdmFycyxcbiAgICAgIH0gPSB0aGlzO1xuICAgICAgY29uc3QgcHJvbWlzZSA9IG90aGVyU3BlY1Byb21pc2VcbiAgICAgICAgLnRoZW4oKG90aGVyU3BlYykgPT4ge1xuICAgICAgICAgIGlmICghb3RoZXJTcGVjKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLmJ1aWxkZXJfLnJlc29sdmVSZXF1ZXN0cyhcbiAgICAgICAgICAgIG5ld1BhdGgsXG4gICAgICAgICAgICBvdGhlclNwZWMsXG4gICAgICAgICAgICAvKiBhcmdzICovIG51bGwsXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHZhcnMsXG4gICAgICAgICAgICB0aW1pbmdcbiAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigocmVxdWVzdHMpID0+IHtcbiAgICAgICAgICAvKiogQHR5cGUgeyFBcnJheX0gKi8gKHJlcXVlc3RzKS5mb3JFYWNoKChyZXF1ZXN0KSA9PlxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0c18ucHVzaChyZXF1ZXN0KVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5kZXBzXy5wdXNoKHByb21pc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvbktleWZyYW1lQW5pbWF0aW9uKHNwZWMpIHtcbiAgICB0aGlzLndpdGhfKHNwZWMsICgpID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IHVzZXIoKS5hc3NlcnRFbGVtZW50KHRoaXMudGFyZ2V0XywgJ05vIHRhcmdldCBzcGVjaWZpZWQnKTtcbiAgICAgIGNvbnN0IGtleWZyYW1lcyA9IHRoaXMuY3JlYXRlS2V5ZnJhbWVzXyh0YXJnZXQsIHNwZWMpO1xuICAgICAgdGhpcy5yZXF1ZXN0c18ucHVzaCh7XG4gICAgICAgIHRhcmdldCxcbiAgICAgICAga2V5ZnJhbWVzLFxuICAgICAgICB2YXJzOiB0aGlzLnZhcnNfLFxuICAgICAgICB0aW1pbmc6IHRoaXMudGltaW5nXyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0geyFXZWJLZXlmcmFtZUFuaW1hdGlvbkRlZn0gc3BlY1xuICAgKiBAcmV0dXJuIHshV2ViS2V5ZnJhbWVzRGVmfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlS2V5ZnJhbWVzXyh0YXJnZXQsIHNwZWMpIHtcbiAgICBsZXQgc3BlY0tleWZyYW1lcyA9IHNwZWMua2V5ZnJhbWVzO1xuICAgIGlmICh0eXBlb2Ygc3BlY0tleWZyYW1lcyA9PSAnc3RyaW5nJykge1xuICAgICAgLy8gS2V5ZnJhbWVzIG5hbWUgdG8gYmUgZXh0cmFjdGVkIGZyb20gYDxzdHlsZT5gLlxuICAgICAgY29uc3Qga2V5ZnJhbWVzID0gZXh0cmFjdEtleWZyYW1lcyh0aGlzLmNzc18ucm9vdE5vZGUsIHNwZWNLZXlmcmFtZXMpO1xuICAgICAgdXNlckFzc2VydChcbiAgICAgICAga2V5ZnJhbWVzLFxuICAgICAgICBgS2V5ZnJhbWVzIG5vdCBmb3VuZCBpbiBzdHlsZXNoZWV0OiBcIiR7c3BlY0tleWZyYW1lc31cImBcbiAgICAgICk7XG4gICAgICBzcGVjS2V5ZnJhbWVzID0ga2V5ZnJhbWVzO1xuICAgIH1cblxuICAgIGlmIChpc09iamVjdChzcGVjS2V5ZnJhbWVzKSkge1xuICAgICAgLy8gUHJvcGVydHkgLT4ga2V5ZnJhbWVzIGZvcm0uXG4gICAgICAvLyBUaGUgb2JqZWN0IGlzIGNsb25lZCwgd2hpbGUgcHJvcGVydGllcyBhcmUgdmVyaWZpZWQgdG8gYmVcbiAgICAgIC8vIGFsbG93bGlzdGVkLiBBZGRpdGlvbmFsbHksIHRoZSBgb2Zmc2V0OjBgIGZyYW1lcyBhcmUgaW5zZXJ0ZWRcbiAgICAgIC8vIHRvIHBvbHlmaWxsIHBhcnRpYWwga2V5ZnJhbWVzIHBlciBzcGVjLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93M2Mvd2ViLWFuaW1hdGlvbnMvaXNzdWVzLzE4N1xuICAgICAgY29uc3Qgb2JqZWN0ID0gLyoqIEB0eXBlIHshT2JqZWN0PHN0cmluZywgKj59ICovIChzcGVjS2V5ZnJhbWVzKTtcbiAgICAgIC8qKiBAdHlwZSB7IVdlYktleWZyYW1lc0RlZn0gKi9cbiAgICAgIGNvbnN0IGtleWZyYW1lcyA9IHt9O1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIG9iamVjdCkge1xuICAgICAgICB0aGlzLnZhbGlkYXRlUHJvcGVydHlfKHByb3ApO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IG9iamVjdFtwcm9wXTtcbiAgICAgICAgbGV0IHByZXBhcmVkVmFsdWU7XG4gICAgICAgIGlmIChTRVJWSUNFX1BST1BTW3Byb3BdKSB7XG4gICAgICAgICAgcHJlcGFyZWRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCFpc0FycmF5KHZhbHVlKSB8fCB2YWx1ZS5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIC8vIE1pc3NpbmcgXCJmcm9tXCIgdmFsdWUuIE1lYXN1cmUgYW5kIGFkZC5cbiAgICAgICAgICBjb25zdCBmcm9tVmFsdWUgPSB0aGlzLmNzc18ubWVhc3VyZSh0YXJnZXQsIHByb3ApO1xuICAgICAgICAgIGNvbnN0IHRvVmFsdWUgPSBpc0FycmF5KHZhbHVlKSA/IHZhbHVlWzBdIDogdmFsdWU7XG4gICAgICAgICAgcHJlcGFyZWRWYWx1ZSA9IFtmcm9tVmFsdWUsIHRoaXMuY3NzXy5yZXNvbHZlQ3NzKHRvVmFsdWUpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcmVwYXJlZFZhbHVlID0gdmFsdWUubWFwKCh2KSA9PiB0aGlzLmNzc18ucmVzb2x2ZUNzcyh2KSk7XG4gICAgICAgIH1cbiAgICAgICAga2V5ZnJhbWVzW3Byb3BdID0gcHJlcGFyZWRWYWx1ZTtcbiAgICAgICAgaWYgKHByb3AgaW4gQUREX1BST1BTKSB7XG4gICAgICAgICAga2V5ZnJhbWVzW0FERF9QUk9QU1twcm9wXV0gPSBwcmVwYXJlZFZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5ZnJhbWVzO1xuICAgIH1cblxuICAgIGlmIChpc0FycmF5KHNwZWNLZXlmcmFtZXMpICYmIHNwZWNLZXlmcmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gS2V5ZnJhbWVzIC0+IHByb3BlcnR5IGZvcm0uXG4gICAgICAvLyBUaGUgYXJyYXkgaXMgY2xvbmVkLCB3aGlsZSBwcm9wZXJ0aWVzIGFyZSB2ZXJpZmllZCB0byBiZSBhbGxvd2xpc3RlZC5cbiAgICAgIC8vIEFkZGl0aW9uYWxseSwgaWYgdGhlIGBvZmZzZXQ6MGAgcHJvcGVydGllcyBhcmUgaW5zZXJ0ZWQgd2hlbiBhYnNlbnRcbiAgICAgIC8vIHRvIHBvbHlmaWxsIHBhcnRpYWwga2V5ZnJhbWVzIHBlciBzcGVjLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93M2Mvd2ViLWFuaW1hdGlvbnMvaXNzdWVzLzE4NyBhbmRcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWItYW5pbWF0aW9ucy93ZWItYW5pbWF0aW9ucy1qcy9pc3N1ZXMvMTRcbiAgICAgIGNvbnN0IGFycmF5ID0gLyoqIEB0eXBlIHshQXJyYXk8IU9iamVjdDxzdHJpbmcsICo+Pn0gKi8gKHNwZWNLZXlmcmFtZXMpO1xuICAgICAgLyoqIEB0eXBlIHshV2ViS2V5ZnJhbWVzRGVmfSAqL1xuICAgICAgY29uc3Qga2V5ZnJhbWVzID0gW107XG4gICAgICBjb25zdCBhZGRTdGFydEZyYW1lID0gYXJyYXkubGVuZ3RoID09IDEgfHwgYXJyYXlbMF0ub2Zmc2V0ID4gMDtcbiAgICAgIGNvbnN0IHN0YXJ0RnJhbWUgPSBhZGRTdGFydEZyYW1lXG4gICAgICAgID8gbWFwKClcbiAgICAgICAgOiB0aGlzLmNzc18ucmVzb2x2ZUNzc01hcChhcnJheVswXSk7XG4gICAgICBrZXlmcmFtZXMucHVzaChzdGFydEZyYW1lKTtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gYWRkU3RhcnRGcmFtZSA/IDAgOiAxO1xuICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZnJhbWUgPSBhcnJheVtpXTtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIGluIGZyYW1lKSB7XG4gICAgICAgICAgaWYgKFNFUlZJQ0VfUFJPUFNbcHJvcF0pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnZhbGlkYXRlUHJvcGVydHlfKHByb3ApO1xuICAgICAgICAgIGlmICghc3RhcnRGcmFtZVtwcm9wXSkge1xuICAgICAgICAgICAgLy8gTWlzc2luZyBcImZyb21cIiB2YWx1ZS4gTWVhc3VyZSBhbmQgYWRkIHRvIHN0YXJ0IGZyYW1lLlxuICAgICAgICAgICAgc3RhcnRGcmFtZVtwcm9wXSA9IHRoaXMuY3NzXy5tZWFzdXJlKHRhcmdldCwgcHJvcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGtleWZyYW1lcy5wdXNoKHRoaXMuY3NzXy5yZXNvbHZlQ3NzTWFwKGZyYW1lKSk7XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBmcmFtZSA9IGtleWZyYW1lc1tpXTtcbiAgICAgICAgZm9yIChjb25zdCBrIGluIEFERF9QUk9QUykge1xuICAgICAgICAgIGlmIChrIGluIGZyYW1lKSB7XG4gICAgICAgICAgICBmcmFtZVtBRERfUFJPUFNba11dID0gZnJhbWVba107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5ZnJhbWVzO1xuICAgIH1cblxuICAgIC8vIFRPRE8oZHZveXRlbmtvKTogc3VwcG9ydCBDU1Mga2V5ZnJhbWVzIHBlciBodHRwczovL2dpdGh1Yi5jb20vdzNjL3dlYi1hbmltYXRpb25zL2lzc3Vlcy8xODlcbiAgICAvLyBVbmtub3duIGZvcm0gb2Yga2V5ZnJhbWVzIHNwZWMuXG4gICAgdGhyb3cgdXNlcigpLmNyZWF0ZUVycm9yKCdrZXlmcmFtZXMgbm90IGZvdW5kJywgc3BlY0tleWZyYW1lcyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uVW5rbm93bkFuaW1hdGlvbigpIHtcbiAgICB0aHJvdyB1c2VyKCkuY3JlYXRlRXJyb3IoXG4gICAgICAndW5rbm93biBhbmltYXRpb24gdHlwZTonICtcbiAgICAgICAgJyBtdXN0IGhhdmUgXCJhbmltYXRpb25cIiwgXCJhbmltYXRpb25zXCIgb3IgXCJrZXlmcmFtZXNcIiBmaWVsZCdcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YWxpZGF0ZVByb3BlcnR5Xyhwcm9wKSB7XG4gICAgaWYgKFNFUlZJQ0VfUFJPUFNbcHJvcF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdXNlckFzc2VydChcbiAgICAgIGlzQWxsb3dsaXN0ZWRQcm9wKHByb3ApLFxuICAgICAgJ1Byb3BlcnR5IGlzIG5vdCBhbGxvd2xpc3RlZCBmb3IgYW5pbWF0aW9uOiAlcycsXG4gICAgICBwcm9wXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBjb21tb24gcGFyYW1ldGVycyBvZiBhbiBhbmltYXRpb246IHRhcmdldCwgdGltaW5nIGFuZCB2YXJzLlxuICAgKiBAcGFyYW0geyFXZWJBbmltYXRpb25EZWZ9IHNwZWNcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBjYWxsYmFja1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgd2l0aF8oc3BlYywgY2FsbGJhY2spIHtcbiAgICAvLyBTYXZlIGNvbnRleHQuXG4gICAgY29uc3Qge1xuICAgICAgaW5kZXhfOiBwcmV2SW5kZXgsXG4gICAgICB0YXJnZXRfOiBwcmV2VGFyZ2V0LFxuICAgICAgdGltaW5nXzogcHJldlRpbWluZyxcbiAgICAgIHZhcnNfOiBwcmV2VmFycyxcbiAgICB9ID0gdGhpcztcblxuICAgIC8vIFB1c2ggbmV3IGNvbnRleHQgYW5kIHBlcmZvcm0gY2FsY3VsYXRpb25zLlxuICAgIGNvbnN0IHRhcmdldHMgPVxuICAgICAgc3BlYy50YXJnZXQgfHwgc3BlYy5zZWxlY3RvciA/IHRoaXMucmVzb2x2ZVRhcmdldHNfKHNwZWMpIDogW251bGxdO1xuICAgIHRoaXMuY3NzXy5zZXRUYXJnZXRMZW5ndGgodGFyZ2V0cy5sZW5ndGgpO1xuICAgIHRhcmdldHMuZm9yRWFjaCgodGFyZ2V0LCBpbmRleCkgPT4ge1xuICAgICAgdGhpcy50YXJnZXRfID0gdGFyZ2V0IHx8IHByZXZUYXJnZXQ7XG4gICAgICB0aGlzLmluZGV4XyA9IHRhcmdldCA/IGluZGV4IDogcHJldkluZGV4O1xuICAgICAgdGhpcy5jc3NfLndpdGhUYXJnZXQodGhpcy50YXJnZXRfLCB0aGlzLmluZGV4XywgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJ0YXJnZXRTcGVjID0gdGhpcy50YXJnZXRfXG4gICAgICAgICAgPyB0aGlzLm1hdGNoU3VidGFyZ2V0c18odGhpcy50YXJnZXRfLCB0aGlzLmluZGV4XyB8fCAwLCBzcGVjKVxuICAgICAgICAgIDogc3BlYztcbiAgICAgICAgdGhpcy52YXJzXyA9IHRoaXMubWVyZ2VWYXJzXyhzdWJ0YXJnZXRTcGVjLCBwcmV2VmFycyk7XG4gICAgICAgIHRoaXMuY3NzXy53aXRoVmFycyh0aGlzLnZhcnNfLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy50aW1pbmdfID0gdGhpcy5tZXJnZVRpbWluZ18oc3VidGFyZ2V0U3BlYywgcHJldlRpbWluZyk7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFJlc3RvcmUgY29udGV4dC5cbiAgICB0aGlzLnRhcmdldF8gPSBwcmV2VGFyZ2V0O1xuICAgIHRoaXMuaW5kZXhfID0gcHJldkluZGV4O1xuICAgIHRoaXMudmFyc18gPSBwcmV2VmFycztcbiAgICB0aGlzLnRpbWluZ18gPSBwcmV2VGltaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVdlYkFuaW1hdGlvbkRlZn0gc3BlY1xuICAgKiBAcmV0dXJuIHshQXJyYXk8IUVsZW1lbnQ+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVzb2x2ZVRhcmdldHNfKHNwZWMpIHtcbiAgICBsZXQgdGFyZ2V0cztcbiAgICBpZiAoc3BlYy5zZWxlY3Rvcikge1xuICAgICAgdXNlckFzc2VydCghc3BlYy50YXJnZXQsICdCb3RoIFwic2VsZWN0b3JcIiBhbmQgXCJ0YXJnZXRcIiBhcmUgbm90IGFsbG93ZWQnKTtcbiAgICAgIHRhcmdldHMgPSB0aGlzLmNzc18ucXVlcnlFbGVtZW50cyhzcGVjLnNlbGVjdG9yKTtcbiAgICAgIGlmICh0YXJnZXRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHVzZXIoKS53YXJuKFRBRywgYFRhcmdldCBub3QgZm91bmQ6IFwiJHtzcGVjLnNlbGVjdG9yfVwiYCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzcGVjLnRhcmdldCkge1xuICAgICAgaWYgKHR5cGVvZiBzcGVjLnRhcmdldCA9PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBUT0RPKGR2b3l0ZW5rbywgIzkxMjkpOiBjbGVhbnVwIGRlcHJlY2F0ZWQgc3RyaW5nIHRhcmdldHMuXG4gICAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdzdHJpbmcgdGFyZ2V0cyBhcmUgZGVwcmVjYXRlZCcpO1xuICAgICAgfVxuICAgICAgY29uc3QgdGFyZ2V0ID0gdXNlcigpLmFzc2VydEVsZW1lbnQoXG4gICAgICAgIHR5cGVvZiBzcGVjLnRhcmdldCA9PSAnc3RyaW5nJ1xuICAgICAgICAgID8gdGhpcy5jc3NfLmdldEVsZW1lbnRCeUlkKHNwZWMudGFyZ2V0KVxuICAgICAgICAgIDogc3BlYy50YXJnZXQsXG4gICAgICAgIGBUYXJnZXQgbm90IGZvdW5kOiBcIiR7c3BlYy50YXJnZXR9XCJgXG4gICAgICApO1xuICAgICAgdGFyZ2V0cyA9IFt0YXJnZXRdO1xuICAgIH0gZWxzZSBpZiAodGhpcy50YXJnZXRfKSB7XG4gICAgICB0YXJnZXRzID0gW3RoaXMudGFyZ2V0X107XG4gICAgfVxuICAgIHRhcmdldHMuZm9yRWFjaCgodGFyZ2V0KSA9PiB0aGlzLmJ1aWxkZXJfLnJlcXVpcmVMYXlvdXQodGFyZ2V0KSk7XG4gICAgcmV0dXJuIHRhcmdldHM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0geyFXZWJBbmltYXRpb25TZWxlY3RvckRlZn0gc3BlY1xuICAgKiBAcmV0dXJuIHshV2ViQW5pbWF0aW9uU2VsZWN0b3JEZWZ9XG4gICAqL1xuICBtYXRjaFN1YnRhcmdldHNfKHRhcmdldCwgaW5kZXgsIHNwZWMpIHtcbiAgICBpZiAoIXNwZWMuc3VidGFyZ2V0cyB8fCBzcGVjLnN1YnRhcmdldHMubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBzcGVjO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBtYXAoc3BlYyk7XG4gICAgc3BlYy5zdWJ0YXJnZXRzLmZvckVhY2goKHN1YnRhcmdldFNwZWMpID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoZXIgPSB0aGlzLmdldE1hdGNoZXJfKHN1YnRhcmdldFNwZWMpO1xuICAgICAgaWYgKG1hdGNoZXIodGFyZ2V0LCBpbmRleCkpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIHN1YnRhcmdldFNwZWMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2ViQW5pbWF0aW9uU3VidGFyZ2V0RGVmfSBzcGVjXG4gICAqIEByZXR1cm4ge2Z1bmN0aW9uKCFFbGVtZW50LCBudW1iZXIpOmJvb2xlYW59XG4gICAqL1xuICBnZXRNYXRjaGVyXyhzcGVjKSB7XG4gICAgaWYgKHNwZWMubWF0Y2hlcikge1xuICAgICAgcmV0dXJuIHNwZWMubWF0Y2hlcjtcbiAgICB9XG4gICAgdXNlckFzc2VydChcbiAgICAgIChzcGVjLmluZGV4ICE9PSB1bmRlZmluZWQgfHwgc3BlYy5zZWxlY3RvciAhPT0gdW5kZWZpbmVkKSAmJlxuICAgICAgICAoc3BlYy5pbmRleCA9PT0gdW5kZWZpbmVkIHx8IHNwZWMuc2VsZWN0b3IgPT09IHVuZGVmaW5lZCksXG4gICAgICAnT25seSBvbmUgXCJpbmRleFwiIG9yIFwic2VsZWN0b3JcIiBtdXN0IGJlIHNwZWNpZmllZCdcbiAgICApO1xuXG4gICAgbGV0IG1hdGNoZXI7XG4gICAgaWYgKHNwZWMuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gTWF0Y2ggYnkgaW5kZXgsIGUuZy4gYGluZGV4OiAwYC5cbiAgICAgIGNvbnN0IHNwZWNJbmRleCA9IE51bWJlcihzcGVjLmluZGV4KTtcbiAgICAgIG1hdGNoZXIgPSAodGFyZ2V0LCBpbmRleCkgPT4gaW5kZXggPT09IHNwZWNJbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTWF0Y2ggYnkgc2VsZWN0b3IsIGUuZy4gYDpudGgtY2hpbGQoMm4rMSlgLlxuICAgICAgY29uc3Qgc3BlY1NlbGVjdG9yID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChzcGVjLnNlbGVjdG9yKTtcbiAgICAgIG1hdGNoZXIgPSAodGFyZ2V0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoZXModGFyZ2V0LCBzcGVjU2VsZWN0b3IpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhyb3cgdXNlcigpLmNyZWF0ZUVycm9yKFxuICAgICAgICAgICAgYEJhZCBzdWJ0YXJnZXQgc2VsZWN0b3I6IFwiJHtzcGVjU2VsZWN0b3J9XCJgLFxuICAgICAgICAgICAgZVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiAoc3BlYy5tYXRjaGVyID0gbWF0Y2hlcik7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHZhcnMgYnkgZGVmYXVsdGluZyB2YWx1ZXMgZnJvbSB0aGUgcHJldmlvdXMgdmFycy5cbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKj59IG5ld1ZhcnNcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKj59IHByZXZWYXJzXG4gICAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCAqPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1lcmdlVmFyc18obmV3VmFycywgcHJldlZhcnMpIHtcbiAgICAvLyBGaXJzdCBjb21iaW5lIGFsbCB2YXJzIChwcmV2aW91cyBhbmQgbmV3KSBpbiBvbmUgbWFwLiBUaGUgbmV3IHZhcnMgdGFrZVxuICAgIC8vIHByZWNlZGVuY2UuIFRoaXMgaXMgZG9uZSBzbyB0aGF0IHRoZSBuZXcgdmFycyBjYW4gYmUgcmVzb2x2ZWQgZnJvbSBib3RoXG4gICAgLy8gdGhlIHByZXZpb3VzIGFuZCBuZXcgdmFycy5cbiAgICBjb25zdCByZXN1bHQgPSBtYXAocHJldlZhcnMpO1xuICAgIGZvciAoY29uc3QgayBpbiBuZXdWYXJzKSB7XG4gICAgICBpZiAoay5zdGFydHNXaXRoKCctLScpKSB7XG4gICAgICAgIHJlc3VsdFtrXSA9IG5ld1ZhcnNba107XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY3NzXy53aXRoVmFycyhyZXN1bHQsICgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgayBpbiBuZXdWYXJzKSB7XG4gICAgICAgIGlmIChrLnN0YXJ0c1dpdGgoJy0tJykpIHtcbiAgICAgICAgICByZXN1bHRba10gPSB0aGlzLmNzc18ucmVzb2x2ZUNzcyhuZXdWYXJzW2tdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHRpbWluZyBieSBkZWZhdWx0aW5nIHZhbHVlcyBmcm9tIHRoZSBwcmV2aW91cyB0aW1pbmcuXG4gICAqIEBwYXJhbSB7IVdlYkFuaW1hdGlvblRpbWluZ0RlZn0gbmV3VGltaW5nXG4gICAqIEBwYXJhbSB7IVdlYkFuaW1hdGlvblRpbWluZ0RlZn0gcHJldlRpbWluZ1xuICAgKiBAcmV0dXJuIHshV2ViQW5pbWF0aW9uVGltaW5nRGVmfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWVyZ2VUaW1pbmdfKG5ld1RpbWluZywgcHJldlRpbWluZykge1xuICAgIC8vIENTUyB0aW1lIHZhbHVlcyBpbiBtaWxsaXNlY29uZHMuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLmNzc18ucmVzb2x2ZU1pbGxpcyhcbiAgICAgIG5ld1RpbWluZy5kdXJhdGlvbixcbiAgICAgIHByZXZUaW1pbmcuZHVyYXRpb25cbiAgICApO1xuICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5jc3NfLnJlc29sdmVNaWxsaXMobmV3VGltaW5nLmRlbGF5LCBwcmV2VGltaW5nLmRlbGF5KTtcbiAgICBjb25zdCBlbmREZWxheSA9IHRoaXMuY3NzXy5yZXNvbHZlTWlsbGlzKFxuICAgICAgbmV3VGltaW5nLmVuZERlbGF5LFxuICAgICAgcHJldlRpbWluZy5lbmREZWxheVxuICAgICk7XG5cbiAgICAvLyBOdW1lcmljLlxuICAgIGNvbnN0IGl0ZXJhdGlvbnMgPSB0aGlzLmNzc18ucmVzb2x2ZU51bWJlcihcbiAgICAgIG5ld1RpbWluZy5pdGVyYXRpb25zLFxuICAgICAgZGV2KCkuYXNzZXJ0TnVtYmVyKHByZXZUaW1pbmcuaXRlcmF0aW9ucylcbiAgICApO1xuICAgIGNvbnN0IGl0ZXJhdGlvblN0YXJ0ID0gdGhpcy5jc3NfLnJlc29sdmVOdW1iZXIoXG4gICAgICBuZXdUaW1pbmcuaXRlcmF0aW9uU3RhcnQsXG4gICAgICBwcmV2VGltaW5nLml0ZXJhdGlvblN0YXJ0XG4gICAgKTtcblxuICAgIC8vIElkZW50aWZpZXIgQ1NTIHZhbHVlcy5cbiAgICBjb25zdCBlYXNpbmcgPSB0aGlzLmNzc18ucmVzb2x2ZUlkZW50KG5ld1RpbWluZy5lYXNpbmcsIHByZXZUaW1pbmcuZWFzaW5nKTtcbiAgICBjb25zdCBkaXJlY3Rpb24gPSAvKiogQHR5cGUgeyFXZWJBbmltYXRpb25UaW1pbmdEaXJlY3Rpb259ICovIChcbiAgICAgIHRoaXMuY3NzXy5yZXNvbHZlSWRlbnQobmV3VGltaW5nLmRpcmVjdGlvbiwgcHJldlRpbWluZy5kaXJlY3Rpb24pXG4gICAgKTtcbiAgICBjb25zdCBmaWxsID0gLyoqIEB0eXBlIHshV2ViQW5pbWF0aW9uVGltaW5nRmlsbH0gKi8gKFxuICAgICAgdGhpcy5jc3NfLnJlc29sdmVJZGVudChuZXdUaW1pbmcuZmlsbCwgcHJldlRpbWluZy5maWxsKVxuICAgICk7XG5cbiAgICAvLyBWYWxpZGF0ZS5cbiAgICB0aGlzLnZhbGlkYXRlVGltZV8oZHVyYXRpb24sIG5ld1RpbWluZy5kdXJhdGlvbiwgJ2R1cmF0aW9uJyk7XG4gICAgdGhpcy52YWxpZGF0ZVRpbWVfKGRlbGF5LCBuZXdUaW1pbmcuZGVsYXksICdkZWxheScsIC8qIG5lZ2F0aXZlICovIHRydWUpO1xuICAgIHRoaXMudmFsaWRhdGVUaW1lXyhlbmREZWxheSwgbmV3VGltaW5nLmVuZERlbGF5LCAnZW5kRGVsYXknKTtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgaXRlcmF0aW9ucyAhPSBudWxsICYmIGl0ZXJhdGlvbnMgPj0gMCxcbiAgICAgICdcIml0ZXJhdGlvbnNcIiBpcyBpbnZhbGlkOiAlcycsXG4gICAgICBuZXdUaW1pbmcuaXRlcmF0aW9uc1xuICAgICk7XG4gICAgdXNlckFzc2VydChcbiAgICAgIGl0ZXJhdGlvblN0YXJ0ICE9IG51bGwgJiYgaXRlcmF0aW9uU3RhcnQgPj0gMCAmJiBpc0Zpbml0ZShpdGVyYXRpb25TdGFydCksXG4gICAgICAnXCJpdGVyYXRpb25TdGFydFwiIGlzIGludmFsaWQ6ICVzJyxcbiAgICAgIG5ld1RpbWluZy5pdGVyYXRpb25TdGFydFxuICAgICk7XG5cbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgaXNFbnVtVmFsdWUoV2ViQW5pbWF0aW9uVGltaW5nRGlyZWN0aW9uLCBkaXJlY3Rpb24pLFxuICAgICAgYFVua25vd24gZGlyZWN0aW9uOiAke2RpcmVjdGlvbn1gXG4gICAgKTtcblxuICAgIHVzZXJBc3NlcnQoXG4gICAgICBpc0VudW1WYWx1ZShXZWJBbmltYXRpb25UaW1pbmdGaWxsLCBmaWxsKSxcbiAgICAgIGBVbmtub3duIGZpbGw6ICR7ZmlsbH1gXG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICBkdXJhdGlvbixcbiAgICAgIGRlbGF5LFxuICAgICAgZW5kRGVsYXksXG4gICAgICBpdGVyYXRpb25zLFxuICAgICAgaXRlcmF0aW9uU3RhcnQsXG4gICAgICBlYXNpbmcsXG4gICAgICBkaXJlY3Rpb24sXG4gICAgICBmaWxsLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSB2YWx1ZVxuICAgKiBAcGFyYW0geyp9IG5ld1ZhbHVlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfYWxsb3dOZWdhdGl2ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFsaWRhdGVUaW1lXyh2YWx1ZSwgbmV3VmFsdWUsIGZpZWxkLCBvcHRfYWxsb3dOZWdhdGl2ZSkge1xuICAgIC8vIEVuc3VyZSB0aGF0IHBvc2l0aXZlIG9yIHplcm8gdmFsdWVzIGFyZSBvbmx5IGFsbG93ZWQuXG4gICAgdXNlckFzc2VydChcbiAgICAgIHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID49IDAgfHwgKHZhbHVlIDwgMCAmJiBvcHRfYWxsb3dOZWdhdGl2ZSkpLFxuICAgICAgJ1wiJXNcIiBpcyBpbnZhbGlkOiAlcycsXG4gICAgICBmaWVsZCxcbiAgICAgIG5ld1ZhbHVlXG4gICAgKTtcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWVzIGFyZSBpbiBtaWxsaXNlY29uZHM6IHNob3cgYSB3YXJuaW5nIGlmXG4gICAgLy8gdGltZSBpcyBmcmFjdGlvbmFsLlxuICAgIGlmIChuZXdWYWx1ZSAhPSBudWxsICYmIE1hdGguZmxvb3IodmFsdWUpICE9IHZhbHVlICYmIHZhbHVlIDwgMSkge1xuICAgICAgdXNlcigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgYFwiJHtmaWVsZH1cIiBpcyBmcmFjdGlvbmFsLmAgK1xuICAgICAgICAgICcgTm90ZSB0aGF0IGFsbCB0aW1lcyBhcmUgaW4gbWlsbGlzZWNvbmRzLidcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQGltcGxlbWVudHMgey4vcGFyc2Vycy9jc3MtZXhwci1hc3QuQ3NzQ29udGV4dH1cbiAqL1xuY2xhc3MgQ3NzQ29udGV4dEltcGwge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRG9jdW1lbnR8IVNoYWRvd1Jvb3R9IHJvb3ROb2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVXJsXG4gICAqIEBwYXJhbSB7IS4vd2ViLWFuaW1hdGlvbi10eXBlcy5XZWJBbmltYXRpb25CdWlsZGVyT3B0aW9uc0RlZn0gb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCByb290Tm9kZSwgYmFzZVVybCwgb3B0aW9ucykge1xuICAgIGNvbnN0IHtzY2FsZUJ5U2NvcGUgPSBmYWxzZSwgc2NvcGUgPSBudWxsfSA9IG9wdGlvbnM7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IURvY3VtZW50fCFTaGFkb3dSb290fSAqL1xuICAgIHRoaXMucm9vdE5vZGVfID0gcm9vdE5vZGU7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnNjb3BlXyA9IHNjb3BlO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnNjYWxlQnlTY29wZV8gPSBzY2FsZUJ5U2NvcGU7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy5iYXNlVXJsXyA9IGJhc2VVcmw7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAhQ1NTU3R5bGVEZWNsYXJhdGlvbj59ICovXG4gICAgdGhpcy5jb21wdXRlZFN0eWxlQ2FjaGVfID0gbWFwKCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCA/Li9wYXJzZXJzL2Nzcy1leHByLWFzdC5Dc3NOb2RlPn0gKi9cbiAgICB0aGlzLnBhcnNlZENzc0NhY2hlXyA9IG1hcCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfSAqL1xuICAgIHRoaXMudGFyZ2V0TGVuZ3RoXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSAqL1xuICAgIHRoaXMuY3VycmVudFRhcmdldF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/bnVtYmVyfSAqL1xuICAgIHRoaXMuY3VycmVudEluZGV4XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9PYmplY3Q8c3RyaW5nLCAqPn0gKi9cbiAgICB0aGlzLnZhcnNfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PHN0cmluZz59ICovXG4gICAgdGhpcy52YXJQYXRoXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/c3RyaW5nfSAqL1xuICAgIHRoaXMuZGltXyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7P3tcbiAgICAgKiAgIHNpemU6IHt3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0sXG4gICAgICogICBvZmZzZXQ6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sXG4gICAgICogICBzY2FsZUZhY3Rvclg6IG51bWJlcixcbiAgICAgKiAgIHNjYWxlRmFjdG9yWTogbnVtYmVyLFxuICAgICAqIH19XG4gICAgICovXG4gICAgdGhpcy52aWV3cG9ydFBhcmFtc18gPSBudWxsO1xuICB9XG5cbiAgLyoqIEByZXR1cm4geyFEb2N1bWVudHwhU2hhZG93Um9vdH0gKi9cbiAgZ2V0IHJvb3ROb2RlKCkge1xuICAgIHJldHVybiB0aGlzLnJvb3ROb2RlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVkaWFRdWVyeVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgbWF0Y2hNZWRpYShtZWRpYVF1ZXJ5KSB7XG4gICAgcmV0dXJuIHRoaXMud2luXy5tYXRjaE1lZGlhKG1lZGlhUXVlcnkpLm1hdGNoZXM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzdXBwb3J0cyhxdWVyeSkge1xuICAgIGlmICh0aGlzLndpbl8uQ1NTICYmIHRoaXMud2luXy5DU1Muc3VwcG9ydHMpIHtcbiAgICAgIHJldHVybiB0aGlzLndpbl8uQ1NTLnN1cHBvcnRzKHF1ZXJ5KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICovXG4gIGdldEVsZW1lbnRCeUlkKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NvcGVkUXVlcnlTZWxlY3Rvcl8oYCMke2VzY2FwZUNzc1NlbGVjdG9ySWRlbnQoaWQpfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvclxuICAgKiBAcmV0dXJuIHshQXJyYXk8IUVsZW1lbnQ+fVxuICAgKi9cbiAgcXVlcnlFbGVtZW50cyhzZWxlY3Rvcikge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdG9BcnJheSh0aGlzLnNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGxfKHNlbGVjdG9yKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgdXNlcigpLmNyZWF0ZUVycm9yKGBCYWQgcXVlcnkgc2VsZWN0b3I6IFwiJHtzZWxlY3Rvcn1cImAsIGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgbWVhc3VyZSh0YXJnZXQsIHByb3ApIHtcbiAgICAvLyBHZXQgSUQuXG4gICAgbGV0IHRhcmdldElkID0gdGFyZ2V0W1RBUkdFVF9BTklNX0lEXTtcbiAgICBpZiAoIXRhcmdldElkKSB7XG4gICAgICB0YXJnZXRJZCA9IFN0cmluZygrK2FuaW1JZENvdW50ZXIpO1xuICAgICAgdGFyZ2V0W1RBUkdFVF9BTklNX0lEXSA9IHRhcmdldElkO1xuICAgIH1cblxuICAgIC8vIEdldCBhbmQgY2FjaGUgc3R5bGVzLlxuICAgIGxldCBzdHlsZXMgPSB0aGlzLmNvbXB1dGVkU3R5bGVDYWNoZV9bdGFyZ2V0SWRdO1xuICAgIGlmICghc3R5bGVzKSB7XG4gICAgICBzdHlsZXMgPSBjb21wdXRlZFN0eWxlKHRoaXMud2luXywgdGFyZ2V0KTtcbiAgICAgIHRoaXMuY29tcHV0ZWRTdHlsZUNhY2hlX1t0YXJnZXRJZF0gPSAvKiogQHR5cGUgeyFDU1NTdHlsZURlY2xhcmF0aW9ufSAqLyAoXG4gICAgICAgIHN0eWxlc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBSZXNvbHZlIGEgdmFyIG9yIGEgcHJvcGVydHkuXG4gICAgcmV0dXJuIHByb3Auc3RhcnRzV2l0aCgnLS0nKVxuICAgICAgPyBzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZShwcm9wKVxuICAgICAgOiBzdHlsZXNbZ2V0VmVuZG9ySnNQcm9wZXJ0eU5hbWUoc3R5bGVzLCBkYXNoVG9DYW1lbENhc2UocHJvcCkpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbGVuXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIHNldFRhcmdldExlbmd0aChsZW4pIHtcbiAgICB0aGlzLnRhcmdldExlbmd0aF8gPSBsZW47XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHs/RWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7P251bWJlcn0gaW5kZXhcbiAgICogQHBhcmFtIHtmdW5jdGlvbig/RWxlbWVudCk6VH0gY2FsbGJhY2tcbiAgICogQHJldHVybiB7VH1cbiAgICogQHRlbXBsYXRlIFRcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgd2l0aFRhcmdldCh0YXJnZXQsIGluZGV4LCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHtjdXJyZW50SW5kZXhfOiBwcmV2SW5kZXgsIGN1cnJlbnRUYXJnZXRfOiBwcmV2fSA9IHRoaXM7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0XyA9IHRhcmdldDtcbiAgICB0aGlzLmN1cnJlbnRJbmRleF8gPSBpbmRleDtcbiAgICBjb25zdCByZXN1bHQgPSBjYWxsYmFjayh0YXJnZXQpO1xuICAgIHRoaXMuY3VycmVudFRhcmdldF8gPSBwcmV2O1xuICAgIHRoaXMuY3VycmVudEluZGV4XyA9IHByZXZJbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7P09iamVjdDxzdHJpbmcsICo+fSB2YXJzXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpUfSBjYWxsYmFja1xuICAgKiBAcmV0dXJuIHtUfVxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB3aXRoVmFycyh2YXJzLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLnZhcnNfO1xuICAgIHRoaXMudmFyc18gPSB2YXJzO1xuICAgIGNvbnN0IHJlc3VsdCA9IGNhbGxiYWNrKCk7XG4gICAgdGhpcy52YXJzXyA9IHByZXY7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyp9IGlucHV0XG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcmVzb2x2ZUNzcyhpbnB1dCkge1xuICAgIC8vIFdpbGwgYWx3YXlzIHJldHVybiBhIHZhbGlkIHN0cmluZywgc2luY2UgdGhlIGRlZmF1bHQgdmFsdWUgaXMgYCcnYC5cbiAgICByZXR1cm4gZGV2KCkuYXNzZXJ0U3RyaW5nKFxuICAgICAgdGhpcy5yZXNvbHZlQ3NzXyhpbnB1dCwgLyogZGVmICovICcnLCAvKiBub3JtYWxpemUgKi8gdHJ1ZSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICo+fSBpbnB1dFxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgc3RyaW5nfG51bWJlcj59XG4gICAqL1xuICByZXNvbHZlQ3NzTWFwKGlucHV0KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gbWFwKCk7XG4gICAgZm9yIChjb25zdCBrIGluIGlucHV0KSB7XG4gICAgICBpZiAoayA9PSAnb2Zmc2V0Jykge1xuICAgICAgICByZXN1bHRba10gPSBpbnB1dFtrXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtrXSA9IHRoaXMucmVzb2x2ZUNzcyhpbnB1dFtrXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBpbnB1dFxuICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IGRlZlxuICAgKiBAcmV0dXJuIHtzdHJpbmd8dW5kZWZpbmVkfVxuICAgKi9cbiAgcmVzb2x2ZUlkZW50KGlucHV0LCBkZWYpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlQ3NzXyhpbnB1dCwgZGVmLCAvKiBub3JtYWxpemUgKi8gZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gaW5wdXRcbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBkZWZcbiAgICogQHJldHVybiB7bnVtYmVyfHVuZGVmaW5lZH1cbiAgICovXG4gIHJlc29sdmVNaWxsaXMoaW5wdXQsIGRlZikge1xuICAgIGlmIChpbnB1dCAhPSBudWxsICYmIGlucHV0ICE9PSAnJykge1xuICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICB9XG4gICAgICBjb25zdCBub2RlID0gdGhpcy5yZXNvbHZlQXNOb2RlXyhpbnB1dCwgLyogbm9ybWFsaXplICovIGZhbHNlKTtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIHJldHVybiBDc3NUaW1lTm9kZS5taWxsaXMobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWY7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBpbnB1dFxuICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IGRlZlxuICAgKiBAcmV0dXJuIHtudW1iZXJ8dW5kZWZpbmVkfVxuICAgKi9cbiAgcmVzb2x2ZU51bWJlcihpbnB1dCwgZGVmKSB7XG4gICAgaWYgKGlucHV0ICE9IG51bGwgJiYgaW5wdXQgIT09ICcnKSB7XG4gICAgICBpZiAodHlwZW9mIGlucHV0ID09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnJlc29sdmVBc05vZGVfKGlucHV0LCAvKiBub3JtYWxpemUgKi8gZmFsc2UpO1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIENzc051bWJlck5vZGUubnVtKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gaW5wdXRcbiAgICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBkZWZcbiAgICogQHBhcmFtIHtib29sZWFufSBub3JtYWxpemVcbiAgICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlc29sdmVDc3NfKGlucHV0LCBkZWYsIG5vcm1hbGl6ZSkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsIHx8IGlucHV0ID09PSAnJykge1xuICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG4gICAgY29uc3QgaW5wdXRDc3MgPSBTdHJpbmcoaW5wdXQpO1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiBpbnB1dENzcztcbiAgICB9XG4gICAgLy8gVGVzdCBmaXJzdCBpZiBDU1MgY29udGFpbnMgYW55IHZhcmlhYmxlIGNvbXBvbmVudHMuIE90aGVyd2lzZSwgdGhlcmUnc1xuICAgIC8vIG5vIG5lZWQgdG8gc3BlbmQgY3ljbGVzIHRvIHBhcnNlL2V2YWx1YXRlLlxuICAgIGlmICghaXNWYXJDc3MoaW5wdXRDc3MsIG5vcm1hbGl6ZSkpIHtcbiAgICAgIHJldHVybiBpbnB1dENzcztcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5yZXNvbHZlQXNOb2RlXyhpbnB1dENzcywgbm9ybWFsaXplKTtcbiAgICByZXR1cm4gcmVzdWx0ICE9IG51bGwgPyByZXN1bHQuY3NzKCkgOiBkZWY7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHsqfSBpbnB1dFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG5vcm1hbGl6ZVxuICAgKiBAcmV0dXJuIHs/Li9wYXJzZXJzL2Nzcy1leHByLWFzdC5Dc3NOb2RlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVzb2x2ZUFzTm9kZV8oaW5wdXQsIG5vcm1hbGl6ZSkge1xuICAgIGlmIChpbnB1dCA9PSBudWxsIHx8IGlucHV0ID09PSAnJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiBuZXcgQ3NzTnVtYmVyTm9kZShpbnB1dCk7XG4gICAgfVxuICAgIC8vIENoZWNrIGlmIHRoZSBleHByZXNzaW9uIGhhcyBhbHJlYWR5IGJlZW4gcGFyc2VkLiBOb3RpY2UgdGhhdCB0aGUgcGFyc2VkXG4gICAgLy8gdmFsdWUgY291bGQgYmUgYG51bGxgLlxuICAgIGNvbnN0IGNzcyA9IFN0cmluZyhpbnB1dCk7XG4gICAgbGV0IG5vZGUgPSB0aGlzLnBhcnNlZENzc0NhY2hlX1tjc3NdO1xuICAgIGlmIChub2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5vZGUgPSBwYXJzZUNzcyhjc3MpO1xuICAgICAgdGhpcy5wYXJzZWRDc3NDYWNoZV9bY3NzXSA9IG5vZGU7XG4gICAgfVxuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBub2RlLnJlc29sdmUodGhpcywgbm9ybWFsaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlcXVpcmVUYXJnZXRfKCkge1xuICAgIHJldHVybiB1c2VyKCkuYXNzZXJ0RWxlbWVudChcbiAgICAgIHRoaXMuY3VycmVudFRhcmdldF8sXG4gICAgICAnT25seSBhbGxvd2VkIHdoZW4gdGFyZ2V0IGlzIHNwZWNpZmllZCdcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRWYXIodmFyTmFtZSkge1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICB0aGlzLnZhclBhdGhfLmluZGV4T2YodmFyTmFtZSkgPT0gLTEsXG4gICAgICBgUmVjdXJzaXZlIHZhcmlhYmxlOiBcIiR7dmFyTmFtZX1cImBcbiAgICApO1xuICAgIHRoaXMudmFyUGF0aF8ucHVzaCh2YXJOYW1lKTtcbiAgICBjb25zdCByYXdWYWx1ZSA9XG4gICAgICB0aGlzLnZhcnNfICYmIHRoaXMudmFyc19bdmFyTmFtZV0gIT0gdW5kZWZpbmVkXG4gICAgICAgID8gdGhpcy52YXJzX1t2YXJOYW1lXVxuICAgICAgICA6IHRoaXMuY3VycmVudFRhcmdldF9cbiAgICAgICAgPyB0aGlzLm1lYXN1cmUodGhpcy5jdXJyZW50VGFyZ2V0XywgdmFyTmFtZSlcbiAgICAgICAgOiBudWxsO1xuICAgIGlmIChyYXdWYWx1ZSA9PSBudWxsIHx8IHJhd1ZhbHVlID09PSAnJykge1xuICAgICAgdXNlcigpLndhcm4oVEFHLCBgVmFyaWFibGUgbm90IGZvdW5kOiBcIiR7dmFyTmFtZX1cImApO1xuICAgIH1cbiAgICAvLyBObyBuZWVkIHRvIG5vcm1hbGl6ZSB2YXJzIC0gdGhleSB3aWxsIGJlIG5vcm1hbGl6ZWQgbGF0ZXIuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5yZXNvbHZlQXNOb2RlXyhyYXdWYWx1ZSwgLyogbm9ybWFsaXplICovIGZhbHNlKTtcbiAgICB0aGlzLnZhclBhdGhfLnBvcCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdpdGhEaW1lbnNpb24oZGltLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHNhdmVkRGltID0gdGhpcy5kaW1fO1xuICAgIHRoaXMuZGltXyA9IGRpbTtcbiAgICBjb25zdCByZXN1bHQgPSBjYWxsYmFjaygpO1xuICAgIHRoaXMuZGltXyA9IHNhdmVkRGltO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldERpbWVuc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kaW1fO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRWaWV3cG9ydFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Vmlld3BvcnRQYXJhbXNfKCkuc2l6ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBnZXRWaWV3cG9ydFBhcmFtc18oKSB7XG4gICAgaWYgKCF0aGlzLnZpZXdwb3J0UGFyYW1zXykge1xuICAgICAgaWYgKHRoaXMuc2NvcGVfICYmIHRoaXMuc2NhbGVCeVNjb3BlXykge1xuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy5zY29wZV8uLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCB7b2Zmc2V0SGVpZ2h0LCBvZmZzZXRXaWR0aH0gPSB0aGlzLnNjb3BlXztcbiAgICAgICAgdGhpcy52aWV3cG9ydFBhcmFtc18gPSB7XG4gICAgICAgICAgb2Zmc2V0OiB7eDogcmVjdC54LCB5OiByZWN0Lnl9LFxuICAgICAgICAgIHNpemU6IHt3aWR0aDogb2Zmc2V0V2lkdGgsIGhlaWdodDogb2Zmc2V0SGVpZ2h0fSxcbiAgICAgICAgICBzY2FsZUZhY3Rvclg6IG9mZnNldFdpZHRoIC8gKHJlY3Qud2lkdGggfHwgMSksXG4gICAgICAgICAgc2NhbGVGYWN0b3JZOiBvZmZzZXRIZWlnaHQgLyAocmVjdC5oZWlnaHQgfHwgMSksXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7aW5uZXJIZWlnaHQsIGlubmVyV2lkdGh9ID0gdGhpcy53aW5fO1xuICAgICAgICB0aGlzLnZpZXdwb3J0UGFyYW1zXyA9IHtcbiAgICAgICAgICBvZmZzZXQ6IHt4OiAwLCB5OiAwfSxcbiAgICAgICAgICBzaXplOiB7d2lkdGg6IGlubmVyV2lkdGgsIGhlaWdodDogaW5uZXJIZWlnaHR9LFxuICAgICAgICAgIHNjYWxlRmFjdG9yWDogMSxcbiAgICAgICAgICBzY2FsZUZhY3Rvclk6IDEsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZpZXdwb3J0UGFyYW1zXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Q3VycmVudEluZGV4KCkge1xuICAgIHRoaXMucmVxdWlyZVRhcmdldF8oKTtcbiAgICByZXR1cm4gZGV2KCkuYXNzZXJ0TnVtYmVyKHRoaXMuY3VycmVudEluZGV4Xyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFRhcmdldExlbmd0aCgpIHtcbiAgICB0aGlzLnJlcXVpcmVUYXJnZXRfKCk7XG4gICAgcmV0dXJuIGRldigpLmFzc2VydE51bWJlcih0aGlzLnRhcmdldExlbmd0aF8pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRDdXJyZW50Rm9udFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudEZvbnRTaXplXyh0aGlzLnJlcXVpcmVUYXJnZXRfKCkpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSb290Rm9udFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudEZvbnRTaXplXyh0aGlzLndpbl8uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0RWxlbWVudEZvbnRTaXplXyh0YXJnZXQpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLm1lYXN1cmUodGFyZ2V0LCAnZm9udC1zaXplJykpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRDdXJyZW50RWxlbWVudFJlY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudFJlY3RfKHRoaXMucmVxdWlyZVRhcmdldF8oKSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEVsZW1lbnRSZWN0KHNlbGVjdG9yLCBzZWxlY3Rpb25NZXRob2QpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50UmVjdF8odGhpcy5nZXRFbGVtZW50XyhzZWxlY3Rvciwgc2VsZWN0aW9uTWV0aG9kKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gc2VsZWN0aW9uTWV0aG9kXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0RWxlbWVudF8oc2VsZWN0b3IsIHNlbGVjdGlvbk1ldGhvZCkge1xuICAgIGRldkFzc2VydChcbiAgICAgIHNlbGVjdGlvbk1ldGhvZCA9PSBudWxsIHx8IHNlbGVjdGlvbk1ldGhvZCA9PSAnY2xvc2VzdCcsXG4gICAgICAnVW5rbm93biBzZWxlY3Rpb24gbWV0aG9kOiAlcycsXG4gICAgICBzZWxlY3Rpb25NZXRob2RcbiAgICApO1xuICAgIGxldCBlbGVtZW50O1xuICAgIHRyeSB7XG4gICAgICBpZiAoc2VsZWN0aW9uTWV0aG9kID09ICdjbG9zZXN0Jykge1xuICAgICAgICBjb25zdCBtYXliZUZvdW5kSW5TY29wZSA9IGNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yKFxuICAgICAgICAgIHRoaXMucmVxdWlyZVRhcmdldF8oKSxcbiAgICAgICAgICBzZWxlY3RvclxuICAgICAgICApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbWF5YmVGb3VuZEluU2NvcGUgJiZcbiAgICAgICAgICAoIXRoaXMuc2NvcGVfIHx8IHRoaXMuc2NvcGVfLmNvbnRhaW5zKG1heWJlRm91bmRJblNjb3BlKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgZWxlbWVudCA9IG1heWJlRm91bmRJblNjb3BlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50ID0gdGhpcy5zY29wZWRRdWVyeVNlbGVjdG9yXyhzZWxlY3Rvcik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgdXNlcigpLmNyZWF0ZUVycm9yKGBCYWQgcXVlcnkgc2VsZWN0b3I6IFwiJHtzZWxlY3Rvcn1cImAsIGUpO1xuICAgIH1cbiAgICByZXR1cm4gdXNlcigpLmFzc2VydEVsZW1lbnQoZWxlbWVudCwgYEVsZW1lbnQgbm90IGZvdW5kOiAke3NlbGVjdG9yfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHRhcmdldFxuICAgKiBAcmV0dXJuIHshLi4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRFbGVtZW50UmVjdF8odGFyZ2V0KSB7XG4gICAgY29uc3Qge29mZnNldCwgc2NhbGVGYWN0b3JYLCBzY2FsZUZhY3Rvcll9ID0gdGhpcy5nZXRWaWV3cG9ydFBhcmFtc18oKTtcbiAgICBjb25zdCB7aGVpZ2h0LCB3aWR0aCwgeCwgeX0gPSB0YXJnZXQuLypPSyovIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gVGhpcyBhc3N1bWVzIGRlZmF1bHQgYHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXJgXG4gICAgcmV0dXJuIGxheW91dFJlY3RMdHdoKFxuICAgICAgKHggLSBvZmZzZXQueCkgKiBzY2FsZUZhY3RvclgsXG4gICAgICAoeSAtIG9mZnNldC55KSAqIHNjYWxlRmFjdG9yWSxcbiAgICAgIHdpZHRoICogc2NhbGVGYWN0b3JYLFxuICAgICAgaGVpZ2h0ICogc2NhbGVGYWN0b3JZXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVzb2x2ZVVybCh1cmwpIHtcbiAgICBjb25zdCByZXNvbHZlZFVybCA9IHJlc29sdmVSZWxhdGl2ZVVybCh1cmwsIHRoaXMuYmFzZVVybF8pO1xuICAgIHJldHVybiBhc3NlcnRIdHRwc1VybChyZXNvbHZlZFVybCwgdGhpcy5jdXJyZW50VGFyZ2V0XyB8fCAnJyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2NvcGVkUXVlcnlTZWxlY3Rvcl8oc2VsZWN0b3IpIHtcbiAgICBpZiAodGhpcy5zY29wZV8pIHtcbiAgICAgIHJldHVybiAvKk9LKi8gc2NvcGVkUXVlcnlTZWxlY3Rvcih0aGlzLnNjb3BlXywgc2VsZWN0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yb290Tm9kZV8uLypPSyovIHF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvclxuICAgKiBAcmV0dXJuIHshTm9kZUxpc3R9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzY29wZWRRdWVyeVNlbGVjdG9yQWxsXyhzZWxlY3Rvcikge1xuICAgIGlmICh0aGlzLnNjb3BlXykge1xuICAgICAgcmV0dXJuIC8qT0sqLyBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2NvcGVfLCBzZWxlY3Rvcik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJvb3ROb2RlXy4vKk9LKi8gcXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/web-animations.js