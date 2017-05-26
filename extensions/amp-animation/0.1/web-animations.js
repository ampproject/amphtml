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
  WebCompAnimationDef,
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
 *   vars: ?Object<string, *>,
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
      // Apply vars.
      if (request.vars) {
        for (const k in request.vars) {
          request.target.style.setProperty(k, String(request.vars[k]));
        }
      }

      // Create the player.
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

    // WebAnimationDef: (!WebMultiAnimationDef|!WebCompAnimationDef|!WebKeyframeAnimationDef)
    if (spec.animations) {
      this.onMultiAnimation(/** @type {!WebMultiAnimationDef} */ (spec));
    } else if (spec.animation) {
      this.onCompAnimation(/** @type {!WebCompAnimationDef} */ (spec));
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
   * @param {!WebCompAnimationDef} unusedSpec
   * @abstract
   */
  onCompAnimation(unusedSpec) {}

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
 * Builds animation runners based on the provided spec.
 */
export class Builder {
  /**
   * @param {!Window} win
   * @param {!Node} rootNode
   * @param {string} baseUrl
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!../../../src/service/resources-impl.Resources} resources
   */
  constructor(win, rootNode, baseUrl, vsync, resources) {
    /** @const @private */
    this.css_ = new CssContextImpl(win, rootNode, baseUrl);

    /** @const @private */
    this.vsync_ = vsync;

    /** @const @private */
    this.resources_ = resources;

    /** @const @private {!Array<!Element>} */
    this.targets_ = [];

    /** @const @private {!Array<!Promise>} */
    this.loaders_ = [];
  }

  /**
   * Creates the animation runner for the provided spec. Waits for all
   * necessary resources to be loaded before the runner is resolved.
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @return {!Promise<!WebAnimationRunner>}
   */
  createRunner(spec) {
    return this.resolveRequests([], spec).then(requests => {
      if (getMode().localDev || getMode().development) {
        user().fine(TAG, 'Animation: ', requests);
      }
      return Promise.all(this.loaders_).then(() => {
        return new WebAnimationRunner(requests);
      });
    });
  }

  /**
   * @param {!Array<string>} path
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {?Element} target
   * @param {?Object<string, *>} vars
   * @param {?WebAnimationTimingDef} timing
   * @return {!Promise<!Array<!InternalWebAnimationRequestDef>>}
   * @protected
   */
  resolveRequests(path, spec, target = null, vars = null, timing = null) {
    const scanner = this.createScanner_(path, target, vars, timing);
    return this.vsync_.measurePromise(() => scanner.resolveRequests(spec));
  }

  /**
   * @param {!Element} target
   * @protected
   */
  requireLayout(target) {
    if (!this.targets_.includes(target)) {
      this.targets_.push(target);
      this.loaders_.push(this.resources_.requireLayout(target));
    }
  }

  /**
   * @param {!Array<string>} path
   * @param {?Element} target
   * @param {?Object<string, *>} vars
   * @param {?WebAnimationTimingDef} timing
   * @private
   */
  createScanner_(path, target, vars, timing) {
    return new MeasureScanner(this, this.css_, path, target, vars, timing);
  }
}


/**
 * The scanner that evaluates all expressions and builds the final
 * `WebAnimationRunner` instance for the target animation. It must be
 * executed in the "measure" vsync phase.
 */
export class MeasureScanner extends Scanner {

  /**
   * @param {!Builder} builder
   * @param {!CssContextImpl} css
   * @param {!Array<string>} path
   * @param {?Element} target
   * @param {?Object<string, *>} vars
   * @param {?WebAnimationTimingDef} timing
   */
  constructor(builder, css, path, target, vars, timing) {
    super();

    /** @const @private */
    this.builder_ = builder;

    /** @const @private */
    this.css_ = css;

    /** @const @private */
    this.path_ = path;

    /** @private {?Element} */
    this.target_ = target;

    /** @private {!Object<string, *>} */
    this.vars_ = vars || map();

    /** @private {!WebAnimationTimingDef} */
    this.timing_ = timing || {
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

    /** @private {!Array<!InternalWebAnimationRequestDef>} */
    this.requests_ = [];

    /** @const @private {!Array<!Promise>} */
    this.deps_ = [];
  }

  /**
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @return {!Promise<!Array<!InternalWebAnimationRequestDef>>}
   */
  resolveRequests(spec) {
    this.css_.withVars(this.vars_, () => {
      this.scan(spec);
    });
    return Promise.all(this.deps_).then(() => this.requests_);
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
    this.with_(spec, () => this.scan(spec.animations));
  }

  /** @override */
  onCompAnimation(spec) {
    user().assert(this.path_.indexOf(spec.animation) == -1,
        `Recursive animations are not allowed: "${spec.animation}"`);
    const newPath = this.path_.concat(spec.animation);
    const animationElement = user().assertElement(
        this.css_.getElementById(spec.animation),
        `Animation not found: "${spec.animation}"`);
    // Currently, only `<amp-animation>` supplies animations. In the future
    // this could become an interface.
    user().assert(animationElement.tagName == 'AMP-ANIMATION',
        `Element is not an animation: "${spec.animation}"`);
    const otherSpecPromise = animationElement.getImpl().then(impl => {
      return impl.getAnimationSpec();
    });
    this.with_(spec, () => {
      const target = this.target_;
      const vars = this.vars_;
      const timing = this.timing_;
      const promise = otherSpecPromise.then(otherSpec => {
        if (!otherSpec) {
          return;
        }
        return this.builder_.resolveRequests(
            newPath, otherSpec, target, vars, timing);
      }).then(requests => {
        requests.forEach(request => this.requests_.push(request));
      });
      this.deps_.push(promise);
    });
  }

  /** @override */
  onKeyframeAnimation(spec) {
    this.with_(spec, () => {
      const target = user().assertElement(this.target_, 'No target specified');
      const keyframes = this.createKeyframes_(target, spec);
      this.requests_.push({
        target,
        keyframes,
        vars: this.vars_,
        timing: this.timing_,
      });
    });
  }

  /**
   * @param {!Element} target
   * @param {!WebKeyframeAnimationDef} spec
   * @return {!WebKeyframesDef}
   * @private
   */
  createKeyframes_(target, spec) {
    if (isObject(spec.keyframes)) {
      // Property -> keyframes form.
      // The object is cloned, while properties are verified to be
      // whitelisted. Additionally, the `offset:0` frames are inserted
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187
      const object = /** {!Object<string, *>} */ (spec.keyframes);
      /** @type {!WebKeyframesDef} */
      const keyframes = {};
      for (const prop in object) {
        this.validateProperty_(prop);
        const value = object[prop];
        let preparedValue;
        if (SERVICE_PROPS[prop]) {
          preparedValue = value;
        } else if (!isArray(value) || value.length == 1) {
          // Missing "from" value. Measure and add.
          const fromValue = this.css_.measure(target, prop);
          const toValue = isArray(value) ? value[0] : value;
          preparedValue = [fromValue, this.css_.resolveCss(toValue)];
        } else {
          preparedValue = value.map(v => this.css_.resolveCss(v));
        }
        keyframes[prop] = preparedValue;
      }
      return keyframes;
    }

    if (isArray(spec.keyframes) && spec.keyframes.length > 0) {
      // Keyframes -> property form.
      // The array is cloned, while properties are verified to be whitelisted.
      // Additionally, if the `offset:0` properties are inserted when absent
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187 and
      // https://github.com/web-animations/web-animations-js/issues/14
      const array = /** {!Array<!Object<string, *>>} */ (spec.keyframes);
      /** @type {!WebKeyframesDef} */
      const keyframes = [];
      const addStartFrame = array.length == 1 || array[0].offset > 0;
      const startFrame = addStartFrame ? map() :
          this.css_.resolveCssMap(array[0]);
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
        keyframes.push(this.css_.resolveCssMap(frame));
      }
      return keyframes;
    }

    // TODO(dvoytenko): support CSS keyframes per https://github.com/w3c/web-animations/issues/189
    // Unknown form of keyframes spec.
    throw user().createError('keyframes not found', spec.keyframes);
  }

  /** @override */
  onUnknownAnimation() {
    throw user().createError('unknown animation type:' +
        ' must have "animation", "animations" or "keyframes" field');
  }

  /**
   * @param {string} prop
   * @private
   */
  validateProperty_(prop) {
    if (SERVICE_PROPS[prop]) {
      return;
    }
    user().assert(isWhitelistedProp(prop),
        'Property is not whitelisted for animation: %s', prop);
  }

  /**
   * Resolves common parameters of an animation: target, timing and vars.
   * @param {!WebAnimationDef} spec
   * @param {function()} callback
   * @private
   */
  with_(spec, callback) {
    // Save context.
    const prevTarget = this.target_;
    const prevVars = this.vars_;
    const prevTiming = this.timing_;

    // Push new context and perform calculations.
    const targets =
        (spec.target || spec.selector) ?
        this.resolveTargets_(spec) :
        [null];
    targets.forEach(target => {
      this.target_ = target || prevTarget;
      this.css_.withTarget(this.target_, () => {
        this.vars_ = this.mergeVars_(spec, prevVars);
        this.css_.withVars(this.vars_, () => {
          this.timing_ = this.mergeTiming_(spec, prevTiming);
          callback();
        });
      });
    });

    // Restore context.
    this.target_ = prevTarget;
    this.vars_ = prevVars;
    this.timing_ = prevTiming;
  }

  /**
   * @param {!WebAnimationDef} spec
   * @return {!Array<!Element>}
   * @private
   */
  resolveTargets_(spec) {
    let targets;
    if (spec.selector) {
      user().assert(!spec.target,
          'Both "selector" and "target" are not allowed');
      targets = this.css_.queryElements(spec.selector);
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
              this.css_.getElementById(spec.target) :
              spec.target,
          `Target not found: "${spec.target}"`);
      targets = [target];
    } else if (this.target_) {
      targets = [this.target_];
    }
    targets.forEach(target => this.builder_.requireLayout(target));
    return targets;
  }

  /**
   * Merges vars by defaulting values from the previous vars.
   * @param {!Object<string, *>} newVars
   * @param {!Object<string, *>} prevVars
   * @return {!Object<string, *>}
   * @private
   */
  mergeVars_(newVars, prevVars) {
    const result = map(prevVars);
    for (const k in newVars) {
      if (startsWith(k, '--')) {
        result[k] = this.css_.resolveCss(newVars[k]);
      }
    }
    return result;
  }

  /**
   * Merges timing by defaulting values from the previous timing.
   * @param {!WebAnimationTimingDef} newTiming
   * @param {!WebAnimationTimingDef} prevTiming
   * @return {!WebAnimationTimingDef}
   * @private
   */
  mergeTiming_(newTiming, prevTiming) {
    // CSS time values in milliseconds.
    const duration = this.css_.resolveMillis(
        newTiming.duration, prevTiming.duration);
    const delay = this.css_.resolveMillis(
        newTiming.delay, prevTiming.delay);
    const endDelay = this.css_.resolveMillis(
        newTiming.endDelay, prevTiming.endDelay);

    // Numeric.
    const iterations = this.css_.resolveNumber(
        newTiming.iterations,
        dev().assertNumber(prevTiming.iterations));
    const iterationStart = this.css_.resolveNumber(
        newTiming.iterationStart, prevTiming.iterationStart);

    // Identifier CSS values.
    const easing = newTiming.easing != null ?
        this.css_.resolveCss(newTiming.easing) :
        prevTiming.easing;
    const direction = newTiming.direction != null ?
        /** @type {!WebAnimationTimingDirection} */
        (this.css_.resolveCss(newTiming.direction)) :
        prevTiming.direction;
    const fill = newTiming.fill != null ?
        /** @type {!WebAnimationTimingFill} */
        (this.css_.resolveCss(newTiming.fill)) :
        prevTiming.fill;

    // Other.
    const ticker = newTiming.ticker != null ?
        newTiming.ticker : prevTiming.ticker;

    // Validate.
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
    if (newValue != null && Math.floor(value) != value && value < 1) {
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

    /** @private {?Object<string, *>} */
    this.vars_ = null;

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
   * @param {string} id
   * @return {?Element}
   */
  getElementById(id) {
    return this.rootNode_.getElementById(id);
  }

  /**
   * @param {string} selector
   * @return {!Array<!Element>}
   */
  queryElements(selector) {
    try {
      return toArray(this.rootNode_./*OK*/querySelectorAll(selector));
    } catch (e) {
      throw user().createError(`Bad query selector: "${selector}"`, e);
    }
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
   * @protected
   */
  withTarget(target, callback) {
    const prev = this.currentTarget_;
    this.currentTarget_ = target;
    const result = callback(target);
    this.currentTarget_ = prev;
    return result;
  }

  /**
   * @param {?Object<string, *>} vars
   * @param {function():T} callback
   * @return {T}
   * @template T
   * @protected
   */
  withVars(vars, callback) {
    const prev = this.vars_;
    this.vars_ = vars;
    const result = callback();
    this.vars_ = prev;
    return result;
  }

  /**
   * @param {*} input
   * @return {string}
   * @protected
   */
  resolveCss(input) {
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
    const result = this.resolveAsNode_(inputCss);
    return result != null ? result.css() : '';
  }

  /**
   * @param {!Object<string, *>} input
   * @return {!Object<string, string|number>}
   */
  resolveCssMap(input) {
    const result = map();
    for (const k in input) {
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
   * @param {number|undefined} def
   * @return {number|undefined}
   */
  resolveMillis(input, def) {
    if (input != null && input !== '') {
      if (typeof input == 'number') {
        return input;
      }
      const node = this.resolveAsNode_(input);
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
  resolveNumber(input, def) {
    if (input != null && input !== '') {
      if (typeof input == 'number') {
        return input;
      }
      const node = this.resolveAsNode_(input);
      if (node) {
        return CssNumberNode.num(node);
      }
    }
    return def;
  }

  /**
   * @param {*} input
   * @return {?./css-expr-ast.CssNode}
   * @private
   */
  resolveAsNode_(input) {
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
    return node.resolve(this);
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
    const rawValue = (this.vars_ && this.vars_[varName] != undefined) ?
        this.vars_[varName] :
        this.currentTarget_ ?
            this.measure(this.currentTarget_, varName) :
            null;
    if (rawValue == null || rawValue === '') {
      user().warn(TAG, `Variable not found: "${varName}"`);
    }
    return this.resolveAsNode_(rawValue);
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
