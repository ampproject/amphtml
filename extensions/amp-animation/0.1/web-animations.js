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
import {Services} from '../../../src/services';
import {
  WebAnimationDef,
  WebAnimationPlayState,
  WebAnimationSelectorDef,
  WebAnimationSubtargetDef,
  WebAnimationTimingDef,
  WebAnimationTimingDirection,
  WebAnimationTimingFill,
  WebCompAnimationDef,
  WebKeyframeAnimationDef,
  WebKeyframesDef,
  WebMultiAnimationDef,
  WebSwitchAnimationDef,
  isWhitelistedProp,
} from './web-animation-types';
import {
  assertDoesNotContainDisplay,
  computedStyle,
  getVendorJsPropertyName,
  setStyles,
} from '../../../src/style';
import {assertHttpsUrl, resolveRelativeUrl} from '../../../src/url';
import {closestBySelector, matches} from '../../../src/dom';
import {dashToCamelCase, startsWith} from '../../../src/string';
import {dev, user} from '../../../src/log';
import {extractKeyframes} from './keyframes-extractor';
import {getMode} from '../../../src/mode';
import {isArray, isObject, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {layoutRectLtwh} from '../../../src/layout-rect';
import {map} from '../../../src/utils/object';
import {parseCss} from './css-expr';


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
 * @const {!Object<string, boolean>}
 */
const SERVICE_PROPS = {
  'offset': true,
  'easing': true,
};

/**
 */
export class AnimationRunner {

  /**
   * @param {!Array<!InternalWebAnimationRequestDef>} requests
   */
  constructor(requests) {
    /** @const @protected */
    this.requests_ = requests;
  }

  /**
   * @return {!WebAnimationPlayState}
   */
  getPlayState() {
  }

  /**
   * @param {function(!WebAnimationPlayState)} unusedHandler
   * @return {!UnlistenDef}
   */
  onPlayStateChanged(unusedHandler) {
  }

  /**
  * Initializes the players but does not change the state.
   */
  init() {
  }

  /**
   * Initializes the players if not already initialized,
   * and starts playing the animations.
   */
  start() {
  }

  /**
   */
  pause() {
  }

  /**
   */
  resume() {
  }

  /**
   */
  reverse() {
  }

  /**
   * @param {time} unusedTime
   */
  seekTo(unusedTime) {
  }

  /**
   * Seeks to a relative position within the animation timeline given a
   * percentage (0 to 1 number).
   * @param {number} unusedPercent between 0 and 1
   */
  seekToPercent(unusedPercent) {
  }

  /**
   */
  finish() {
  }

  /**
   */
  cancel() {
  }

  /**
   * @param {!WebAnimationPlayState} unusedPlayState
   * @private
   */
  setPlayState_(unusedPlayState) {
  }
}

/**
 */
export class AnimationWorkletRunner extends AnimationRunner {

  /**
   * @param {!Window} win
   * @param {!Array<!InternalWebAnimationRequestDef>} requests
   * @param {?Object=} viewportData
   */
  constructor(win, requests, viewportData) {
    super(requests);

    /** @const @private */
    this.win_ = win;

    /** @protected {?Array<!WorkletAnimation>} */
    this.players_ = [];

    /** @private {number} */
    this.topRatio_ = viewportData['top-ratio'];

    /** @private {number} */
    this.bottomRatio_ = viewportData['bottom-ratio'];

    /** @private {number} */
    this.topMargin_ = viewportData['top-margin'];

    /** @private {number} */
    this.bottomMargin_ =
      viewportData['bottom-margin'];
  }

  /**
   * @return {string}
   */
  createCodeBlob_() {
    //TODO(nainar): This code should be moved into a self-
    // contained file.
    // See issue: https://github.com/ampproject/amphtml/issues/19155
    return `
    registerAnimator('anim${++animIdCounter}', class {
      constructor(options = {
        'time-range': 0,
        'start-offset': 0,
        'end-offset': 0,
        'top-ratio': 0,
        'bottom-ratio': 0,
        'element-height': 0,
      }) {
        this.timeRange = options['time-range'];
        this.startOffset = options['start-offset'];
        this.endOffset = options['end-offset'];
        this.topRatio = options['top-ratio'];
        this.bottomRatio = options['bottom-ratio'];
        this.height = options['element-height'];
        this.prevPos = 0;
      }
      animate(currentTime, effect) {
        if (currentTime == NaN) {
          return;
        }
        const currentScrollPos =
        ((currentTime / this.timeRange) *
        (this.endOffset - this.startOffset)) +
        this.startOffset;
        const scrollingUpwards = this.prevPos < currentScrollPos;
        if (scrollingUpwards) {
          if ((currentScrollPos - this.bottomRatio * this.height) <=
          this.endOffset) {
            effect.localTime = currentTime;
            this.prevPos = currentScrollPos;
          }
        } else {
          if ((currentScrollPos - this.topRatio * this.height) <=
          this.startOffset) {
            effect.localTime = currentTime;
            this.prevPos = currentScrollPos;
          }
        }
      }
    });
    `;
  }

  /**
  * @override
  * Initializes the players but does not change the state.
   */
  init() {
    this.requests_.map(request => {
      // Apply vars.
      if (request.vars) {
        setStyles(request.target,
            assertDoesNotContainDisplay(request.vars));
      }
      // TODO(nainar): This switches all animations to AnimationWorklet.
      // Limit only to Scroll based animations for now.
      CSS.animationWorklet.addModule(
          URL.createObjectURL(new Blob([this.createCodeBlob_()],
              {type: 'text/javascript'}))).then(() => {
        const scrollSource =
          Services.viewportForDoc(this.win_.document).getScrollingElement();
        const elementRect = request.target./*OK*/getBoundingClientRect();
        const viewportRect =
          Services.viewportForDoc(this.win_.document).getRect();
        const adjustedViewportRect = this.applyMargins_(viewportRect);
        const scrollTimeline = new this.win_.ScrollTimeline({
          scrollSource,
          orientation: 'block',
          timeRange: request.timing.duration,
          startScrollOffset: `${adjustedViewportRect['top']}px`,
          endScrollOffset: `${adjustedViewportRect['bottom']}px`,
        });
        const keyframeEffect = new KeyframeEffect(request.target,
            request.keyframes, request.timing);
        const player = new this.win_.WorkletAnimation(`anim${animIdCounter}`,
            [keyframeEffect],
            scrollTimeline, {
              'time-range': request.timing.duration,
              'start-offset': adjustedViewportRect['top'],
              'end-offset': adjustedViewportRect['bottom'],
              'top-ratio': this.topRatio_,
              'bottom-ratio': this.bottomRatio_,
              'element-height': elementRect.height,
            });
        player.play();
        this.players_.push(player);
      });
    });
  }

  /**
   * Readjusts the given rect using the configured exclusion margins.
   * @param {!../../../src/layout-rect.LayoutRectDef} rect viewport rect adjusted for margins.
   * @private
   */
  applyMargins_(rect) {
    dev().assert(rect);
    rect = layoutRectLtwh(
        rect.left,
        (rect.top + this.topMargin_),
        rect.width,
        (rect.height - this.bottomMargin_ - this.topMargin_)
    );

    return rect;
  }

  /**
   * @override
   * Initializes the players if not already initialized,
   * and starts playing the animations.
   */
  start() {
    if (!this.players_) {
      this.init();
    }
  }

  /**
   * @override
   */
  cancel() {
    if (!this.players_) {
      return;
    }
    this.players_.forEach(player => {
      player.cancel();
    });
  }

}

/**
 */
export class WebAnimationRunner extends AnimationRunner {

  /**
   * @param {!Array<!InternalWebAnimationRequestDef>} requests
   */
  constructor(requests) {
    super(requests);

    /** @protected {?Array<!Animation>} */
    this.players_ = null;

    /** @private {number} */
    this.runningCount_ = 0;

    /** @private {!WebAnimationPlayState} */
    this.playState_ = WebAnimationPlayState.IDLE;

    /** @private {!Observable} */
    this.playStateChangedObservable_ = new Observable();
  }

  /**
   * @override
   * @return {!WebAnimationPlayState}
   */
  getPlayState() {
    return this.playState_;
  }

  /**
   * @override
   * @param {function(!WebAnimationPlayState)} handler
   * @return {!UnlistenDef}
   */
  onPlayStateChanged(handler) {
    return this.playStateChangedObservable_.add(handler);
  }

  /**
   * @override
   * Initializes the players but does not change the state.
   */
  init() {
    dev().assert(!this.players_);
    this.players_ = this.requests_.map(request => {
      // Apply vars.
      if (request.vars) {
        setStyles(request.target,
            assertDoesNotContainDisplay(request.vars));
      }
      const player = request.target.animate(
          request.keyframes, request.timing);
      player.pause();
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
   * @override
   * Initializes the players if not already initialized,
   * and starts playing the animations.
   */
  start() {
    if (!this.players_) {
      this.init();
    }
    this.resume();
  }

  /**
   * @override
   */
  pause() {
    dev().assert(this.players_);
    this.setPlayState_(WebAnimationPlayState.PAUSED);
    this.players_.forEach(player => {
      if (player.playState == WebAnimationPlayState.RUNNING) {
        player.pause();
      }
    });
  }

  /**
   * @override
   */
  resume() {
    dev().assert(this.players_);
    const oldRunnerPlayState = this.playState_;
    if (oldRunnerPlayState == WebAnimationPlayState.RUNNING) {
      return;
    }
    this.setPlayState_(WebAnimationPlayState.RUNNING);
    this.runningCount_ = 0;
    this.players_.forEach(player => {
      if (oldRunnerPlayState != WebAnimationPlayState.PAUSED ||
          player.playState == WebAnimationPlayState.PAUSED) {
        player.play();
        this.runningCount_++;
      }
    });
  }

  /**
   * @override
   */
  reverse() {
    dev().assert(this.players_);
    // TODO(nainar) there is no reverse call on WorkletAnimation
    this.players_.forEach(player => {
      player.reverse();
    });
  }

  /**
   * @override
   * @param {time} time
   */
  seekTo(time) {
    dev().assert(this.players_);
    this.setPlayState_(WebAnimationPlayState.PAUSED);
    this.players_.forEach(player => {
      player.pause();
      player.currentTime = time;
    });
  }

  /**
   * @override
   * Seeks to a relative position within the animation timeline given a
   * percentage (0 to 1 number).
   * @param {number} percent between 0 and 1
   */
  seekToPercent(percent) {
    dev().assert(percent >= 0 && percent <= 1);
    const totalDuration = this.getTotalDuration_();
    const time = totalDuration * percent;
    this.seekTo(time);
  }

  /**
   * @override
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
   * @override
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
   * @override
   * @param {!WebAnimationPlayState} playState
   * @private
   */
  setPlayState_(playState) {
    if (this.playState_ != playState) {
      this.playState_ = playState;
      this.playStateChangedObservable_.fire(this.playState_);
    }
  }

  /**
   * @return {number} total duration in milliseconds.
   * @throws {Error} If timeline is infinite.
   */
  getTotalDuration_() {
    let maxTotalDuration = 0;
    for (let i = 0; i < this.requests_.length; i++) {
      const {timing} = this.requests_[i];

      user().assert(isFinite(timing.iterations), 'Animation has infinite ' +
      'timeline, we can not seek to a relative position within an infinite ' +
      'timeline. Use "time" for seekTo or remove infinite iterations');

      const iteration = timing.iterations - timing.iterationStart;
      const totalDuration = (timing.duration * iteration) +
          timing.delay + timing.endDelay;

      if (totalDuration > maxTotalDuration) {
        maxTotalDuration = totalDuration;
      }
    }

    return maxTotalDuration;
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
   * @return {boolean}
   */
  scan(spec) {
    if (isArray(spec)) {
      // Returns `true` if any of the components scan successfully.
      return spec.reduce((acc, comp) => this.scan(comp) || acc, false);
    }

    // Check whether the animation is enabled.
    if (!this.isEnabled(/** @type {!WebAnimationDef} */ (spec))) {
      return false;
    }

    // WebAnimationDef: (!WebMultiAnimationDef|!WebSpecAnimationDef|
    //                   !WebCompAnimationDef|!WebKeyframeAnimationDef)
    if (spec.animations) {
      this.onMultiAnimation(/** @type {!WebMultiAnimationDef} */ (spec));
    } else if (spec.switch) {
      this.onSwitchAnimation(/** @type {!WebSwitchAnimationDef} */ (spec));
    } else if (spec.animation) {
      this.onCompAnimation(/** @type {!WebCompAnimationDef} */ (spec));
    } else if (spec.keyframes) {
      this.onKeyframeAnimation(/** @type {!WebKeyframeAnimationDef} */ (spec));
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
  isEnabled(unusedSpec) {
    return true;
  }

  /**
   * @param {!WebMultiAnimationDef} unusedSpec
   * @abstract
   */
  onMultiAnimation(unusedSpec) {}

  /**
   * @param {!WebSwitchAnimationDef} unusedSpec
   * @abstract
   */
  onSwitchAnimation(unusedSpec) {}

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
   * @param {!Document|!ShadowRoot} rootNode
   * @param {string} baseUrl
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!../../../src/service/resources-impl.Resources} resources
   */
  constructor(win, rootNode, baseUrl, vsync, resources) {
    /** @const @private */
    this.win_ = win;

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

    /** @private {boolean} */
    this.useAnimationWorklet_ =
      Services.platformFor(this.win_).isChrome() &&
      isExperimentOn(this.win_, 'chrome-animation-worklet') &&
      'animationWorklet' in CSS;
  }

  /**
   * Creates the animation runner for the provided spec. Waits for all
   * necessary resources to be loaded before the runner is resolved.
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {boolean=} hasPositionObserver
   * @param {?WebAnimationDef=} opt_args
   * @param {?Object=} opt_viewportData
   * @return {!Promise<!WebAnimationRunner>}
   */
  createRunner(spec, hasPositionObserver = false, opt_args,
    opt_viewportData = null) {
    return this.resolveRequests([], spec, opt_args).then(requests => {
      if (getMode().localDev || getMode().development) {
        user().fine(TAG, 'Animation: ', requests);
      }
      return Promise.all(this.loaders_).then(() => {
        return this.useAnimationWorklet_ && hasPositionObserver ?
          new AnimationWorkletRunner(this.win_, requests,
              opt_viewportData) :
          new WebAnimationRunner(requests);
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
  resolveRequests(path, spec, args,
    target = null, index = null, vars = null, timing = null) {
    const scanner = this.createScanner_(path, target, index, vars, timing);
    return this.vsync_.measurePromise(
        () => scanner.resolveRequests(spec, args));
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
   * @param {?number} index
   * @param {?Object<string, *>} vars
   * @param {?WebAnimationTimingDef} timing
   * @private
   */
  createScanner_(path, target, index, vars, timing) {
    return new MeasureScanner(this, this.css_, path,
        target, index, vars, timing);
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
   * @param {?number} index
   * @param {?Object<string, *>} vars
   * @param {?WebAnimationTimingDef} timing
   */
  constructor(builder, css, path, target, index, vars, timing) {
    super();

    /** @const @private */
    this.builder_ = builder;

    /** @const @private */
    this.css_ = css;

    /** @const @private */
    this.path_ = path;

    /** @private {?Element} */
    this.target_ = target;

    /** @private {?number} */
    this.index_ = index;

    /** @private {!Object<string, *>} */
    this.vars_ = vars || map();

    /** @private {!WebAnimationTimingDef} */
    this.timing_ = timing || {
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

    /**
     * Dependencies required to resolve all animation requests. In case of
     * composition, all requests can only be resolved asynchronously. This
     * dependencies are used to block `resolveRequests` to collect all
     * dependenices.
     * @const @private {!Array<!Promise>}
     */
    this.deps_ = [];
  }

  /**
   * This methods scans all animation declarations specified in `spec`
   * recursively to produce the animation requests. `opt_args` is an additional
   * spec that can be used to default timing and variables.
   * @param {!WebAnimationDef|!Array<!WebAnimationDef>} spec
   * @param {?WebAnimationDef=} opt_args
   * @return {!Promise<!Array<!InternalWebAnimationRequestDef>>}
   */
  resolveRequests(spec, opt_args) {
    if (opt_args) {
      this.with_(opt_args, () => {
        this.scan(spec);
      });
    } else {
      this.css_.withVars(this.vars_, () => {
        this.scan(spec);
      });
    }
    return Promise.all(this.deps_).then(() => this.requests_);
  }

  /** @override */
  isEnabled(spec) {
    if (spec.media && !this.css_.matchMedia(spec.media)) {
      return false;
    }
    if (spec.supports && !this.css_.supports(spec.supports)) {
      return false;
    }
    return true;
  }

  /** @override */
  onMultiAnimation(spec) {
    this.with_(spec, () => this.scan(spec.animations));
  }

  /** @override */
  onSwitchAnimation(spec) {
    // The first to match will be used; the rest will be ignored.
    this.with_(spec, () => {
      for (let i = 0; i < spec.switch.length; i++) {
        const candidate = spec.switch[i];
        if (this.scan(candidate)) {
          // First matching candidate is applied and the rest are ignored.
          break;
        }
      }
    });
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
      const {
        target_: target,
        index_: index,
        vars_: vars,
        timing_: timing,
      } = this;
      const promise = otherSpecPromise.then(otherSpec => {
        if (!otherSpec) {
          return;
        }
        return this.builder_.resolveRequests(
            newPath, otherSpec, /* args */ null, target, index, vars, timing);
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
    let specKeyframes = spec.keyframes;
    if (typeof specKeyframes == 'string') {
      // Keyframes name to be extracted from `<style>`.
      const keyframes = extractKeyframes(this.css_.rootNode_, specKeyframes);
      user().assert(keyframes,
          `Keyframes not found in stylesheet: "${specKeyframes}"`);
      specKeyframes = keyframes;
    }

    if (isObject(specKeyframes)) {
      // Property -> keyframes form.
      // The object is cloned, while properties are verified to be
      // whitelisted. Additionally, the `offset:0` frames are inserted
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187
      const object = /** @type {!Object<string, *>} */ (specKeyframes);
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

    if (isArray(specKeyframes) && specKeyframes.length > 0) {
      // Keyframes -> property form.
      // The array is cloned, while properties are verified to be whitelisted.
      // Additionally, if the `offset:0` properties are inserted when absent
      // to polyfill partial keyframes per spec.
      // See https://github.com/w3c/web-animations/issues/187 and
      // https://github.com/web-animations/web-animations-js/issues/14
      const array = /** @type {!Array<!Object<string, *>>} */ (specKeyframes);
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
    throw user().createError('keyframes not found', specKeyframes);
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
    const {
      target_: prevTarget,
      index_: prevIndex,
      vars_: prevVars,
      timing_: prevTiming,
    } = this;

    // Push new context and perform calculations.
    const targets =
        (spec.target || spec.selector) ?
          this.resolveTargets_(spec) :
          [null];
    targets.forEach((target, index) => {
      this.target_ = target || prevTarget;
      this.index_ = target ? index : prevIndex;
      this.css_.withTarget(this.target_, this.index_, () => {
        const subtargetSpec =
            this.target_ ?
              this.matchSubtargets_(this.target_, this.index_ || 0, spec) :
              spec;
        this.vars_ = this.mergeVars_(subtargetSpec, prevVars);
        this.css_.withVars(this.vars_, () => {
          this.timing_ = this.mergeTiming_(subtargetSpec, prevTiming);
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
   * @param {!Element} target
   * @param {number} index
   * @param {!WebAnimationSelectorDef} spec
   * @return {!WebAnimationSelectorDef}
   */
  matchSubtargets_(target, index, spec) {
    if (!spec.subtargets || spec.subtargets.length == 0) {
      return spec;
    }
    const result = map(spec);
    spec.subtargets.forEach(subtargetSpec => {
      const matcher = this.getMatcher_(subtargetSpec);
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
  getMatcher_(spec) {
    if (spec.matcher) {
      return spec.matcher;
    }
    user().assert(
        (spec.index !== undefined || spec.selector !== undefined) &&
        (spec.index === undefined || spec.selector === undefined),
        'Only one "index" or "selector" must be specified');

    let matcher;
    if (spec.index !== undefined) {
      // Match by index, e.g. `index: 0`.
      const specIndex = Number(spec.index);
      matcher = (target, index) => index === specIndex;
    } else {
      // Match by selector, e.g. `:nth-child(2n+1)`.
      const specSelector = /** @type {string} */ (spec.selector);
      matcher = target => {
        try {
          return matches(target, specSelector);
        } catch (e) {
          throw user().createError(
              `Bad subtarget selector: "${specSelector}"`, e);
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
  mergeVars_(newVars, prevVars) {
    // First combine all vars (previous and new) in one map. The new vars take
    // precedence. This is done so that the new vars can be resolved from both
    // the previous and new vars.
    const result = map(prevVars);
    for (const k in newVars) {
      if (startsWith(k, '--')) {
        result[k] = newVars[k];
      }
    }
    this.css_.withVars(result, () => {
      for (const k in newVars) {
        if (startsWith(k, '--')) {
          result[k] = this.css_.resolveCss(newVars[k]);
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
    const easing =
        this.css_.resolveIdent(newTiming.easing, prevTiming.easing);
    const direction = /** @type {!WebAnimationTimingDirection} */
        (this.css_.resolveIdent(newTiming.direction, prevTiming.direction));
    const fill = /** @type {!WebAnimationTimingFill} */
        (this.css_.resolveIdent(newTiming.fill, prevTiming.fill));


    // Validate.
    this.validateTime_(duration, newTiming.duration, 'duration');
    this.validateTime_(delay, newTiming.delay, 'delay', /* negative */ true);
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
    };
  }

  /**
   * @param {number|undefined} value
   * @param {*} newValue
   * @param {string} field
   * @param {boolean=} opt_allowNegative
   * @private
   */
  validateTime_(value, newValue, field, opt_allowNegative) {
    // Ensure that positive or zero values are only allowed.
    user().assert(
        value != null && (value >= 0 || (value < 0 && opt_allowNegative)),
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
   * @param {!Document|!ShadowRoot} rootNode
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

    /** @private {?number} */
    this.currentIndex_ = null;

    /** @private {?Object<string, *>} */
    this.vars_ = null;

    /** @private {!Array<string>} */
    this.varPath_ = [];

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
   * @param {string} query
   * @return {boolean}
   */
  supports(query) {
    if (this.win_.CSS && this.win_.CSS.supports) {
      return this.win_.CSS.supports(query);
    }
    return false;
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
   * @param {?number} index
   * @param {function(?Element):T} callback
   * @return {T}
   * @template T
   * @protected
   */
  withTarget(target, index, callback) {
    const {currentTarget_: prev, currentIndex_: prevIndex} = this;
    this.currentTarget_ = target;
    this.currentIndex_ = index;
    const result = callback(target);
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
    // Will always return a valid string, since the default value is `''`.
    return dev().assertString(this.resolveCss_(
        input, /* def */ '', /* normalize */ true));
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
   * @param {string|undefined} def
   * @return {string|undefined}
   */
  resolveIdent(input, def) {
    return this.resolveCss_(input, def, /* normalize */ false);
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
      const node = this.resolveAsNode_(input, /* normalize */ false);
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
      const node = this.resolveAsNode_(input, /* normalize */ false);
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
  resolveCss_(input, def, normalize) {
    if (input == null || input === '') {
      return def;
    }
    const inputCss = String(input);
    if (typeof input == 'number') {
      return inputCss;
    }
    // Test first if CSS contains any variable components. Otherwise, there's
    // no need to spend cycles to parse/evaluate.
    if (!isVarCss(inputCss, normalize)) {
      return inputCss;
    }
    const result = this.resolveAsNode_(inputCss, normalize);
    return result != null ? result.css() : def;
  }

  /**
   * @param {*} input
   * @param {boolean} normalize
   * @return {?./css-expr-ast.CssNode}
   * @private
   */
  resolveAsNode_(input, normalize) {
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
    return node.resolve(this, normalize);
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
    user().assert(
        this.varPath_.indexOf(varName) == -1,
        `Recursive variable: "${varName}"`);
    this.varPath_.push(varName);
    const rawValue = (this.vars_ && this.vars_[varName] != undefined) ?
      this.vars_[varName] :
      this.currentTarget_ ?
        this.measure(this.currentTarget_, varName) :
        null;
    if (rawValue == null || rawValue === '') {
      user().warn(TAG, `Variable not found: "${varName}"`);
    }
    // No need to normalize vars - they will be normalized later.
    const result = this.resolveAsNode_(rawValue, /* normalize */ false);
    this.varPath_.pop();
    return result;
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
  getCurrentIndex() {
    this.requireTarget_();
    return dev().assertNumber(this.currentIndex_);
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
    const b = target./*OK*/getBoundingClientRect();
    return {width: b.width, height: b.height};
  }

  /** @override */
  resolveUrl(url) {
    const resolvedUrl = resolveRelativeUrl(url, this.baseUrl_);
    return assertHttpsUrl(resolvedUrl, this.currentTarget_ || '');
  }
}
