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

import {dev, user} from '../../../src/log';
import {getVendorJsPropertyName} from '../../../src/style';
import {isArray, isObject} from '../../../src/types';
import {
  WebAnimationDef,
  WebAnimationTimingDef,
  WebAnimationTimingDirection,
  WebAnimationTimingFill,
  WebKeyframeAnimationDef,
  WebKeyframesDef,
  WebMultiAnimationDef,
  isWhitelistedProp,
} from './web-animation-types';


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
let InternalWebAnimationRequestDef;


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

    /** @private {!Array<!Animation>} */
    this.players_ = [];
  }

  /**
   */
  play() {
    this.players_ = this.requests_.map(request => {
      return request.target.animate(request.keyframes, request.timing);
    });
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

    /** @private {!Array<!CSSStyleDeclaration>} */
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
      if (element.classList.contains('-amp-element')) {
        const resource = resources.getResourceForElement(element);
        promises.push(resource.loadedOnce());
      }
    }
    return Promise.all(promises);
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
    const timing = this.mergeTiming_(spec, this.timing_);
    const target = this.resolveTarget_(spec.target);
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

    this.requests_.push({target, keyframes, timing});
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
   * @param {string|!Element} targetSpec
   * @return {!Element}
   * @private
   */
  resolveTarget_(targetSpec) {
    const target = user().assertElement(
        typeof targetSpec == 'string' ?
            this.context_.resolveTarget(targetSpec) :
            targetSpec,
        `Target not found: "${targetSpec}"`);
    if (this.targets_.indexOf(target) == -1) {
      this.targets_.push(target);
    }
    return target;
  }

  /**
   * @param {!Element} target
   * @param {string} prop
   * @private
   */
  measure_(target, prop) {
    const index = this.targets_.indexOf(target);
    if (!this.computedStyleCache_[index]) {
      this.computedStyleCache_[index] = /** @type {!CSSStyleDeclaration} */ (
          this.win./*OK*/getComputedStyle(target));
    }
    const vendorName = getVendorJsPropertyName(
        this.computedStyleCache_[index], prop);
    return this.computedStyleCache_[index].getPropertyValue(vendorName);
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

    // Validate.
    if (this.validate_) {
      user().assert(duration >= 0,
          '"duration" is invalid: %s', newTiming.duration);
      user().assert(delay >= 0,
          '"delay" is invalid: %s', newTiming.delay);
      user().assert(endDelay >= 0,
          '"endDelay" is invalid: %s', newTiming.endDelay);
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
    };
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
