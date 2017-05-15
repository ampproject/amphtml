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

import {ScrollboundPlayer} from './scrollbound-player';
import {Observable} from '../../../src/observable';
import {dev, user} from '../../../src/log';
import {getVendorJsPropertyName, computedStyle} from '../../../src/style';
import {isArray, isObject} from '../../../src/types';
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
import {dashToCamelCase} from '../../../src/string';


/** @const {string} */
const TAG = 'amp-animation';


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
   * @param {{
   *   queryTargets: function(string):!Array<!Element>,
   *   resolveTarget: function(string):?Element,
   * }} context
   * @param {boolean} validate
   */
  constructor(win, context, validate) {
    super();
    /** @const */
    this.win = win;

    /** @const @private */
    this.context_ = context;

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

    /** @private {!Array<!Object<string, string>>} */
    this.computedStyleCache_ = [];
  }

  /**
   * @param {!../../../src/service/resources-impl.Resources} resources
   * @return {!Promise<!WebAnimationRunner>}
   */
  createRunner(resources) {
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
      return this.win.matchMedia(spec.media).matches;
    }
    return true;
  }

  /** @override */
  onMultiAnimation(spec) {
    const newTiming = this.mergeTiming_(spec, this.timing_);
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
      // to polyfill partial keyframes.
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
          const fromValue = this.measure_(target, prop);
          preparedValue = [fromValue, clone(isArray(value) ? value[0] : value)];
        } else {
          preparedValue = clone(value);
        }
        keyframes[prop] = preparedValue;
      }
    } else if (isArray(spec.keyframes) && spec.keyframes.length > 0) {
      // Keyframes -> property form.
      // The array is cloned, while properties are verified to be whitelisted.
      // Additionally, if the `offset:0` properties are inserted when absent
      // to polyfill partial keyframes.
      // See https://github.com/web-animations/web-animations-js/issues/14
      const array = /** {!Array<!Object<string, *>>} */ (spec.keyframes);
      keyframes = [];
      const addStartFrame = array.length == 1 || array[0].offset > 0;
      const startFrame = addStartFrame ? {} : clone(array[0]);
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
            startFrame[prop] = this.measure_(target, prop);
          }
        }
        keyframes.push(clone(frame));
      }
    } else {
      // Unknown form of keyframes spec.
      if (this.validate_) {
        throw user().createError('keyframes not found', spec.keyframes);
      }
    }

    const timing = this.mergeTiming_(spec, this.timing_);
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
      targets = this.context_.queryTargets(spec.selector);
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
              this.context_.resolveTarget(spec.target) :
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
   * @param {!Element} target
   * @param {string} prop
   * @private
   */
  measure_(target, prop) {
    const index = this.targets_.indexOf(target);
    if (!this.computedStyleCache_[index]) {
      this.computedStyleCache_[index] = computedStyle(this.win, target);
    }
    const vendorName = getVendorJsPropertyName(this.computedStyleCache_[index],
        dashToCamelCase(prop));
    return this.computedStyleCache_[index][vendorName];
  }

  /**
   * Merges timing by defaulting values from the previous timing.
   * @param {!WebAnimationTimingDef} newTiming
   * @param {!WebAnimationTimingDef} prevTiming
   * @return {!WebAnimationTimingDef}
   * @private
   */
  mergeTiming_(newTiming, prevTiming) {
    const duration = newTiming.duration != null ?
        Number(newTiming.duration) : prevTiming.duration;
    const delay = newTiming.delay != null ?
        Number(newTiming.delay) : prevTiming.delay;
    const endDelay = newTiming.endDelay != null ?
        Number(newTiming.endDelay) : prevTiming.endDelay;
    const iterations = newTiming.iterations != null ?
        Number(newTiming.iterations) : prevTiming.iterations;
    const iterationStart = newTiming.iterationStart != null ?
        Number(newTiming.iterationStart) : prevTiming.iterationStart;
    const easing = newTiming.easing != null ?
        String(newTiming.easing) : prevTiming.easing;
    const direction = newTiming.direction != null ?
        newTiming.direction : prevTiming.direction;
    const fill = newTiming.fill != null ?
        newTiming.fill : prevTiming.fill;
    const ticker = newTiming.ticker != null ?
        newTiming.ticker : prevTiming.ticker;

    // Validate.
    if (this.validate_) {
      this.validateTime_(duration, newTiming.duration, 'duration');
      this.validateTime_(delay, newTiming.delay, 'delay');
      this.validateTime_(endDelay, newTiming.endDelay, 'endDelay');
      user().assert(iterations >= 0,
          '"iterations" is invalid: %s', newTiming.iterations);
      user().assert(iterationStart >= 0,
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
    user().assert(value >= 0,
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
 * Clones an array or an object.
 * @param {T} x
 * @return T
 * @template T
 */
function clone(x) {
  if (!x) {
    return x;
  }
  return JSON.parse(JSON.stringify(x));
}
