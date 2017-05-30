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

import {CssNumberNode, CssTimeNode, isVarCss} from './css-expr-ast';
import {Observable} from '../../../src/observable';
import {ScrollboundPlayer} from './scrollbound-player';
import {assertHttpsUrl, resolveRelativeUrl} from '../../../src/url';
import {closestBySelector} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {getVendorJsPropertyName, computedStyle} from '../../../src/style';
import {isArray, isObject, toArray} from '../../../src/types';
import {map} from '../../../src/utils/object';
import {parseCss} from './css-expr';
import {
  WebAnimationDef,
  WebAnimationPlayState,
  WebAnimationTimingDef,
  WebAnimationTimingDirection,
  WebAnimationTimingFill,
  WebKeyframeAnimationDef,
  WebKeyframesDef,
  WebMultiAnimationDef,
  isWhitelistedProp,
} from './web-animation-types';
import {dashToCamelCase, startsWith} from '../../../src/string';


/** @const {string} */
const TAG = 'amp-animation';
const TARGET_ANIM_ID = '__AMP_ANIM_ID';

/**
 * Auto-incrementing ID generator for internal animation uses.
 * See `TARGET_ANIM_ID`.
 * @type {number}
 */
let animIdCounter = 0;


/**
 * A struct for parameters for `Element.animate` call.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
 *
 * @typedef {{
 *   target: !Element,
 *   keyframes: !WebKeyframesDef,
 *   timing: !WebAnimationTimingDef,
 * }}
 */
export let InternalWebAnimationRequestDef;

/**
 * @private
 * @enum {string}
 */
const Tickers = {
  SCROLL: 'scroll',
  TIME: 'time',
};

/**
 * @const {!Object<string, boolean>}
 */
const SERVICE_PROPS = {
  'offset': true,
  'easing': true,
};

/**
 */
export class WebAnimationRunner {

  /**
   * @param {!Array<!InternalWebAnimationRequestDef>} requests
   */
  constructor(requests) {
    /** @const @private */
    this.requests_ = requests;

    /** @private {?Array<!Animation>} */
    this.players_ = null;


    /** @private {number} */
    this.runningCount_ = 0;

    /** @private {!WebAnimationPlayState} */
    this.playState_ = WebAnimationPlayState.IDLE;

    /** @private {!Observable} */
    this.playStateChangedObservable_ = new Observable();
  }

  /**
   * @return {!WebAnimationPlayState}
   */
  getPlayState() {
    return this.playState_;
  }

  /**
   * @param {function(!WebAnimationPlayState)} handler
   * @return {!UnlistenDef}
   */
  onPlayStateChanged(handler) {
    return this.playStateChangedObservable_.add(handler);
  }

  /**
   */
  start() {
    dev().assert(!this.players_);
    this.setPlayState_(WebAnimationPlayState.RUNNING);
    this.players_ = this.requests_.map(request => {
      let player;
      if (request.timing.ticker == Tickers.SCROLL) {
        player = new ScrollboundPlayer(request);
      } else {
        player = request.target.animate(request.keyframes, request.timing);
      }
      return player;
    });
    this.runningCount_ = this.players_.length;
    this.players_.forEach(player => {
      player.onfinish = () => {
        this.runningCount_--;
        if (this.runningCount_ == 0) {
          this.setPlayState_(WebAnimationPlayState.FINISHED);
        }
      };
    });
  }

  /**
   */
  pause() {
    dev().assert(this.players_);
    this.setPlayState_(WebAnimationPlayState.PAUSED);
    this.players_.forEach(player => {
      player.pause();
    });
  }

  /**
   */
  resume() {
    dev().assert(this.players_);
    if (this.playState_ == WebAnimationPlayState.RUNNING) {
      return;
    }
    this.setPlayState_(WebAnimationPlayState.RUNNING);
    this.players_.forEach(player => {
      player.play();
    });
  }

  /**
   */
  reverse() {
    dev().assert(this.players_);
    this.players_.forEach(player => {
      player.reverse();
    });
  }

  /**
   */
  finish() {
    if (!this.players_) {
      return;
    }
    const players = this.players_;
    this.players_ = null;
    this.setPlayState_(WebAnimationPlayState.FINISHED);
    players.forEach(player => {
      player.finish();
    });
  }

  /**
   */
  cancel() {
    if (!this.players_) {
      return;
    }
    this.setPlayState_(WebAnimationPlayState.IDLE);
    this.players_.forEach(player => {
      player.cancel();
    });
  }

  /**
   */
  scrollTick(pos) {
    this.players_.forEach(player => {
      if (player instanceof ScrollboundPlayer) {
        player.tick(pos);
      }
    });
  }

  /**
   */
  updateScrollDuration(newDuration) {
    this.requests_.forEach(request => {
      if (request.timing.ticker == Tickers.SCROLL) {
        request.timing.duration = newDuration;
      }
    });

    this.players_.forEach(player => {
      if (player instanceof ScrollboundPlayer) {
        player.onScrollDurationChanged();
      }
    });
  }

  /**
   */
  hasScrollboundAnimations() {
    for (let i = 0; i < this.requests_.length; i++) {
      if (this.requests_[i].timing.ticker == Tickers.SCROLL) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {!WebAnimationPlayState} playState
   * @private
   */
  setPlayState_(playState) {
    if (this.playState_ != playState) {
      this.playState_ = playState;
      this.playStateChangedObservable_.fire(this.playState_);
    }
  }
}


/**
 * The scanner for the `WebAnimationDef` format. It calls the appropriate
 * callbacks based on the discovered animation types.
 * @abstract
 */
class Scanner {

  /**
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   */
  scan(spec) {
    if (isArray(spec)) {
      spec.forEach(spec => this.scan(spec));
      return;
    }

    // Check whether the animation is enabled.
    if (!this.isEnabled(/** @type {!WebAnimationDef} */ (spec))) {
      return;
    }

    // WebAnimationDef: (!WebMultiAnimationDef|!WebKeyframeAnimationDef)
    if (spec.animations) {
      this.onMultiAnimation(/** @type {!WebMultiAnimationDef} */ (spec));
    } else if (spec.keyframes) {
      this.onKeyframeAnimation(/** @type {!WebKeyframeAnimationDef} */ (spec));
    } else {
      this.onUnknownAnimation(spec);
    }
  }

  /**
   * Whether the animation spec is enabled.
   * @param {!WebAnimationDef} unusedSpec
   * @return {boolean}
   */
  isEnabled(unusedSpec) {
    return true;
  }

  /**
   * @param {!WebMultiAnimationDef} unusedSpec
   * @abstract
   */
  onMultiAnimation(unusedSpec) {}

  /**
   * @param {!WebKeyframeAnimationDef} unusedSpec
   * @abstract
   */
  onKeyframeAnimation(unusedSpec) {}

  /** @param {!Object} unusedSpec */
  onUnknownAnimation(unusedSpec) {
    throw dev().createError('unknown animation type:' +
        ' must have "animations" or "keyframes" field');
  }
}


/**
 * The scanner that evaluates all expressions and builds the final
 * `WebAnimationRunner` instance for the target animation. It must be
 * executed in the "measure" vsync phase.
 */
export class MeasureScanner extends Scanner {

  /**
   * @param {!Window} win
   * @param {!Node} rootNode
   * @param {string} baseUrl
   * @param {boolean} validate
   */
  constructor(win, rootNode, baseUrl, validate) {
    super();

    /** @const @private */
    this.rootNode_ = rootNode;

    /** @const @private */
    this.css_ = new CssContextImpl(win, rootNode, baseUrl);

    /** @const @private */
    this.validate_ = validate;

    /** @private {!Array<!InternalWebAnimationRequestDef>} */
    this.requests_ = [];

    /** @private {!WebAnimationTimingDef} */
    this.timing_ = {
      ticker: Tickers.TIME,
      duration: 0,
      delay: 0,
      endDelay: 0,
      iterations: 1,
      iterationStart: 0,
      easing: 'linear',
      direction: WebAnimationTimingDirection.NORMAL,
      fill: WebAnimationTimingFill.NONE,
    };

    /** @private {!Array<!Element> } */
    this.targets_ = [];
  }

  /**
   * @param {!../../../src/service/resources-impl.Resources} resources
   * @return {!Promise<!WebAnimationRunner>}
   */
  createRunner(resources) {
    if (getMode().localDev || getMode().development) {
      user().fine(TAG, 'Animation: ', this.requests_);
    }
    return this.unblockElements_(resources).then(() => {
      return new WebAnimationRunner(this.requests_);
    });
  }

  /**
   * @param {!../../../src/service/resources-impl.Resources} resources
   * @return {!Promise}
   * @private
   */
  unblockElements_(resources) {
    const promises = [];
    for (let i = 0; i < this.targets_.length; i++) {
      const element = this.targets_[i];
      promises.push(resources.requireLayout(element));
    }
    return Promise.all(promises);
  }

  /** @override */
  isEnabled(spec) {
    if (spec.media) {
      return this.css_.matchMedia(spec.media);
    }
    return true;
  }

  /** @override */
  onMultiAnimation(spec) {
    const newTiming = this.mergeTiming_(spec, this.timing_, /* target */ null);
    this.withTiming_(newTiming, () => {
      this.scan(spec.animations);
    });
  }

  /** @override */
  onKeyframeAnimation(spec) {
    const targets = this.resolveTargets_(spec);
    targets.forEach(target => {
      this.requests_.push(this.createKeyframeAnimationForTarget_(target, spec));
    });
  }

  /**
   * @param {!Element} target
   * @param {!WebKeyframeAnimationDef} spec
   * @return {!InternalWebAnimationRequestDef}
   * @private
   */
  createKeyframeAnimationForTarget_(target, spec) {
    /** @type {!WebKeyframesDef} */
    let keyframes;

    if (isObject(spec.keyframes)) {
      // Property -> keyframes form.
      // The object is cloned, while properties are verified to be
      // whitelisted. Additionally, the `offset:0` frames are inserted
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187
      const object = /** {!Object<string, *>} */ (spec.keyframes);
      keyframes = {};
      for (const prop in object) {
        this.validateProperty_(prop);
        const value = object[prop];
        let preparedValue;
        if (SERVICE_PROPS[prop]) {
          preparedValue = value;
        } else if (!isArray(value) || value.length == 1) {
          // Missing "from" value. Measure and add.
          const fromValue = this.css_.measure(target, prop);
          preparedValue = [fromValue, this.css_.resolveCss(
              target, isArray(value) ? value[0] : value)];
        } else {
          preparedValue = value.map(v => this.css_.resolveCss(target, v));
        }
        keyframes[prop] = preparedValue;
      }
    } else if (isArray(spec.keyframes) && spec.keyframes.length > 0) {
      // Keyframes -> property form.
      // The array is cloned, while properties are verified to be whitelisted.
      // Additionally, if the `offset:0` properties are inserted when absent
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187 and
      // https://github.com/web-animations/web-animations-js/issues/14
      const array = /** {!Array<!Object<string, *>>} */ (spec.keyframes);
      keyframes = [];
      const addStartFrame = array.length == 1 || array[0].offset > 0;
      const startFrame = addStartFrame ? map() :
          this.css_.resolveCssMap(target, array[0]);
      keyframes.push(startFrame);
      const start = addStartFrame ? 0 : 1;
      for (let i = start; i < array.length; i++) {
        const frame = array[i];
        for (const prop in frame) {
          if (SERVICE_PROPS[prop]) {
            continue;
          }
          this.validateProperty_(prop);
          if (!startFrame[prop]) {
            // Missing "from" value. Measure and add to start frame.
            startFrame[prop] = this.css_.measure(target, prop);
          }
        }
        keyframes.push(this.css_.resolveCssMap(target, frame));
      }
    } else {
      // TODO(dvoytenko): support CSS keyframes per https://github.com/w3c/web-animations/issues/189
      // Unknown form of keyframes spec.
      if (this.validate_) {
        throw user().createError('keyframes not found', spec.keyframes);
      }
    }

    const timing = this.mergeTiming_(spec, this.timing_, target);
    return {target, keyframes, timing};
  }

  /** @override */
  onUnknownAnimation(spec) {
    if (this.validate_) {
      throw user().createError('unknown animation type:' +
          ' must have "animations" or "keyframes" field');
    } else {
      super.onUnknownAnimation(spec);
    }
  }

  /**
   * @param {string} prop
   * @private
   */
  validateProperty_(prop) {
    if (SERVICE_PROPS[prop]) {
      return;
    }
    if (this.validate_) {
      user().assert(isWhitelistedProp(prop),
          'Property is not whitelisted for animation: %s', prop);
    } else {
      dev().assert(isWhitelistedProp(prop),
          'Property is not whitelisted for animation: %s', prop);
    }
  }

  /**
   * Runs the callback with the specified timing and restores old timing
   * later.
   * @param {!WebAnimationTimingDef} timing
   * @param {function()} callback
   * @private
   */
  withTiming_(timing, callback) {
    const prevTiming = this.timing_;
    this.timing_ = timing;
    callback();
    this.timing_ = prevTiming;
  }

  /**
   * @param {!WebKeyframeAnimationDef} spec
   * @return {!Array<!Element>}
   * @private
   */
  resolveTargets_(spec) {
    let targets;
    if (spec.selector) {
      user().assert(!spec.target,
          'Both "selector" and "target" are not allowed');
      targets = this.queryTargets_(spec.selector);
      if (targets.length == 0) {
        user().warn(TAG, `Target not found: "${spec.selector}"`);
      }
    } else if (spec.target) {
      if (typeof spec.target == 'string') {
        // TODO(dvoytenko, #9129): cleanup deprecated string targets.
        user().error(TAG, 'string targets are deprecated');
      }
      const target = user().assertElement(
          typeof spec.target == 'string' ?
              this.resolveTarget_(spec.target) :
              spec.target,
          `Target not found: "${spec.target}"`);
      targets = [target];
    } else {
      user().assert(false, 'No target specified');
    }
    targets.forEach(target => {
      if (!this.targets_.includes(target)) {
        this.targets_.push(target);
      }
    });
    return targets;
  }

  /**
   * @param {string} id
   * @return {?Element}
   * @private
   * TODO(dvoytenko, #9129): cleanup deprecated string targets.
   */
  resolveTarget_(id) {
    return this.rootNode_.getElementById(id);
  }

  /**
   * @param {string} selector
   * @return {!Array<!Element>}
   * @private
   */
  queryTargets_(selector) {
    try {
      return toArray(this.rootNode_./*OK*/querySelectorAll(selector));
    } catch (e) {
      throw user().createError('Invalid selector: ', selector);
    }
  }


  /**
   * Merges timing by defaulting values from the previous timing.
   * @param {!WebAnimationTimingDef} newTiming
   * @param {!WebAnimationTimingDef} prevTiming
   * @param {?Element} target
   * @return {!WebAnimationTimingDef}
   * @private
   */
  mergeTiming_(newTiming, prevTiming, target) {
    // CSS time values in milliseconds.
    const duration = this.css_.resolveMillis(
        target, newTiming.duration, prevTiming.duration);
    const delay = this.css_.resolveMillis(
        target, newTiming.delay, prevTiming.delay);
    const endDelay = this.css_.resolveMillis(
        target, newTiming.endDelay, prevTiming.endDelay);

    // Numeric.
    const iterations = this.css_.resolveNumber(
        target, newTiming.iterations,
        dev().assertNumber(prevTiming.iterations));
    const iterationStart = this.css_.resolveNumber(
        target, newTiming.iterationStart, prevTiming.iterationStart);

    // Identifier CSS values.
    const easing = newTiming.easing != null ?
        this.css_.resolveCss(target, newTiming.easing) :
        prevTiming.easing;
    const direction = newTiming.direction != null ?
        /** @type {!WebAnimationTimingDirection} */
        (this.css_.resolveCss(target, newTiming.direction)) :
        prevTiming.direction;
    const fill = newTiming.fill != null ?
        /** @type {!WebAnimationTimingFill} */
        (this.css_.resolveCss(target, newTiming.fill)) :
        prevTiming.fill;

    // Other.
    const ticker = newTiming.ticker != null ?
        newTiming.ticker : prevTiming.ticker;

    // Validate.
    if (this.validate_) {
      this.validateTime_(duration, newTiming.duration, 'duration');
      this.validateTime_(delay, newTiming.delay, 'delay');
      this.validateTime_(endDelay, newTiming.endDelay, 'endDelay');
      user().assert(iterations != null && iterations >= 0,
          '"iterations" is invalid: %s', newTiming.iterations);
      user().assert(iterationStart != null &&
          iterationStart >= 0 && isFinite(iterationStart),
          '"iterationStart" is invalid: %s', newTiming.iterationStart);
      user().assertEnumValue(WebAnimationTimingDirection,
          /** @type {string} */ (direction), 'direction');
      user().assertEnumValue(WebAnimationTimingFill,
          /** @type {string} */ (fill), 'fill');
    }
    return {
      duration,
      delay,
      endDelay,
      iterations,
      iterationStart,
      easing,
      direction,
      fill,
      ticker,
    };
  }

  /**
   * @param {number|undefined} value
   * @param {*} newValue
   * @param {string} field
   * @private
   */
  validateTime_(value, newValue, field) {
    // Ensure that positive or zero values are only allowed.
    user().assert(value != null && value >= 0,
        '"%s" is invalid: %s', field, newValue);
    // Make sure that the values are in milliseconds: show a warning if
    // time is fractional.
    if (newValue != null && Math.floor(value) != value) {
      user().warn(TAG,
          `"${field}" is fractional.`
          + ' Note that all times are in milliseconds.');
    }
  }
}


/**
 * @implements {./css-expr-ast.CssContext}
 */
class CssContextImpl {
  /**
   * @param {!Window} win
   * @param {!Node} rootNode
   * @param {string} baseUrl
   */
  constructor(win, rootNode, baseUrl) {
    /** @const @private */
    this.win_ = win;

    /** @const @private */
    this.rootNode_ = rootNode;

    /** @const @private */
    this.baseUrl_ = baseUrl;

    /** @private {!Object<string, !CSSStyleDeclaration>} */
    this.computedStyleCache_ = map();

    /** @private {!Object<string, ?./css-expr-ast.CssNode>} */
    this.parsedCssCache_ = map();

    /** @private {?Element} */
    this.currentTarget_ = null;

    /** @private {?string} */
    this.dim_ = null;

    /** @private {?{width: number, height: number}} */
    this.viewportSize_ = null;
  }

  /**
   * @param {string} mediaQuery
   * @return {boolean}
   */
  matchMedia(mediaQuery) {
    return this.win_.matchMedia(mediaQuery).matches;
  }

  /**
   * @param {!Element} target
   * @param {string} prop
   * @return {string}
   */
  measure(target, prop) {
    // Get ID.
    let targetId = target[TARGET_ANIM_ID];
    if (!targetId) {
      targetId = String(++animIdCounter);
      target[TARGET_ANIM_ID] = targetId;
    }

    // Get and cache styles.
    let styles = this.computedStyleCache_[targetId];
    if (!styles) {
      styles = computedStyle(this.win_, target);
      this.computedStyleCache_[targetId] =
          /** @type {!CSSStyleDeclaration} */ (styles);
    }

    // Resolve a var or a property.
    return startsWith(prop, '--') ?
        styles.getPropertyValue(prop) :
        styles[getVendorJsPropertyName(styles, dashToCamelCase(prop))];
  }

  /**
   * @param {?Element} target
   * @param {function(?Element):T} callback
   * @return {T}
   * @template T
   * @private
   */
  withTarget_(target, callback) {
    const prev = this.currentTarget_;
    this.currentTarget_ = target;
    const result = callback(target);
    this.currentTarget_ = prev;
    return result;
  }

  /**
   * @param {?Element} target
   * @param {*} input
   * @return {string}
   */
  resolveCss(target, input) {
    if (input == null || input === '') {
      return '';
    }
    const inputCss = String(input);
    if (typeof input == 'number') {
      return inputCss;
    }
    // Test first if CSS contains any variable components. Otherwise, there's
    // no need to spend cycles to parse/evaluate.
    if (!isVarCss(inputCss)) {
      return inputCss;
    }
    const result = this.resolveAsNode_(target, inputCss);
    return result != null ? result.css() : '';
  }

  /**
   * @param {?Element} target
   * @param {!Object<string, *>} input
   * @return {!Object<string, string|number>}
   */
  resolveCssMap(target, input) {
    const result = map();
    for (const k in input) {
      if (k == 'offset') {
        result[k] = input[k];
      } else {
        result[k] = this.resolveCss(target, input[k]);
      }
    }
    return result;
  }

  /**
   * @param {?Element} target
   * @param {*} input
   * @param {number|undefined} def
   * @return {number|undefined}
   */
  resolveMillis(target, input, def) {
    if (input != null && input !== '') {
      if (typeof input == 'number') {
        return input;
      }
      const node = this.resolveAsNode_(target, input);
      if (node) {
        return CssTimeNode.millis(node);
      }
    }
    return def;
  }

  /**
   * @param {?Element} target
   * @param {*} input
   * @param {number|undefined} def
   * @return {number|undefined}
   */
  resolveNumber(target, input, def) {
    if (input != null && input !== '') {
      if (typeof input == 'number') {
        return input;
      }
      const node = this.resolveAsNode_(target, input);
      if (node) {
        return CssNumberNode.num(node);
      }
    }
    return def;
  }

  /**
   * @param {?Element} target
   * @param {*} input
   * @return {?./css-expr-ast.CssNode}
   * @private
   */
  resolveAsNode_(target, input) {
    if (input == null || input === '') {
      return null;
    }
    if (typeof input == 'number') {
      return new CssNumberNode(input);
    }
    // Check if the expression has already been parsed. Notice that the parsed
    // value could be `null`.
    const css = String(input);
    let node = this.parsedCssCache_[css];
    if (node === undefined) {
      node = parseCss(css);
      this.parsedCssCache_[css] = node;
    }
    if (!node) {
      return null;
    }
    return this.withTarget_(target, () => node.resolve(this));
  }

  /**
   * @return {!Element}
   * @private
   */
  requireTarget_() {
    return user().assertElement(this.currentTarget_,
        'Only allowed when target is specified');
  }

  /** @override */
  getVar(varName) {
    const target = this.requireTarget_();
    return this.resolveAsNode_(target, this.measure(target, varName));
  }

  /** @override */
  withDimension(dim, callback) {
    const savedDim = this.dim_;
    this.dim_ = dim;
    const result = callback();
    this.dim_ = savedDim;
    return result;
  }

  /** @override */
  getDimension() {
    return this.dim_;
  }

  /** @override */
  getViewportSize() {
    if (!this.viewportSize_) {
      this.viewportSize_ = {
        width: this.win_./*OK*/innerWidth,
        height: this.win_./*OK*/innerHeight,
      };
    }
    return this.viewportSize_;
  }

  /** @override */
  getCurrentFontSize() {
    return this.getElementFontSize_(this.requireTarget_());
  }

  /** @override */
  getRootFontSize() {
    return this.getElementFontSize_(this.win_.document.documentElement);
  }

  /**
   * @param {!Element} target
   * @return {number}
   * @private
   */
  getElementFontSize_(target) {
    return parseFloat(this.measure(target, 'font-size'));
  }

  /** @override */
  getCurrentElementSize() {
    return this.getElementSize_(this.requireTarget_());
  }

  /** @override */
  getElementSize(selector, selectionMethod) {
    return this.getElementSize_(this.getElement_(selector, selectionMethod));
  }

  /**
   * @param {string} selector
   * @param {?string} selectionMethod
   * @return {!Element}
   * @private
   */
  getElement_(selector, selectionMethod) {
    dev().assert(
        selectionMethod == null || selectionMethod == 'closest',
        'Unknown selection method: %s', selectionMethod);
    let element;
    try {
      if (selectionMethod == 'closest') {
        element = closestBySelector(this.requireTarget_(), selector);
      } else {
        element = this.rootNode_./*OK*/querySelector(selector);
      }
    } catch (e) {
      throw user().createError(`Bad query selector: "${selector}"`, e);
    }
    return user().assertElement(element, `Element not found: ${selector}`);
  }

  /**
   * @param {!Element} target
   * @return {!{width: number, height: number}}
   * @private
   */
  getElementSize_(target) {
    return {width: target./*OK*/offsetWidth, height: target./*OK*/offsetHeight};
  }

  /** @override */
  resolveUrl(url) {
    const resolvedUrl = resolveRelativeUrl(url, this.baseUrl_);
    return assertHttpsUrl(resolvedUrl, this.currentTarget_ || '');
  }
}
