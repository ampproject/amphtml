import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Deferred } from "../../../src/core/data-structures/promise";
import {
PRESET_OPTION_ATTRIBUTES,
presets,
setStyleForPreset } from "./animation-presets";

import { Services } from "../../../src/service";
import {
StoryAnimationConfigDef,
StoryAnimationDimsDef,
StoryAnimationPresetDef,
WebAnimationDef,
WebAnimationPlayState,
WebAnimationSelectorDef,
WebAnimationTimingDef,
WebKeyframesCreateFnDef,
WebKeyframesDef } from "./animation-types";

import { assertDoesNotContainDisplay } from "../../../src/assert-display";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { escapeCssSelectorIdent } from "../../../src/core/dom/css-selectors";
import { getChildJsonConfig } from "../../../src/core/dom";
import { map, omit } from "../../../src/core/types/object";
import { prefersReducedMotion } from "../../../src/core/dom/media-query-props";
import {
matches,
scopedQuerySelector,
scopedQuerySelectorAll } from "../../../src/core/dom/query";

import { setStyles } from "../../../src/core/dom/style";
import { timeStrToMillis, unscaledClientRect } from "./utils";
import { isExperimentOn } from "../../../src/experiments";

var TAG = 'AMP-STORY';

/** @const {string} */
export var ANIMATE_IN_ATTRIBUTE_NAME = 'animate-in';
/** @const {string} */
var ANIMATE_IN_DURATION_ATTRIBUTE_NAME = 'animate-in-duration';
/** @const {string} */
var ANIMATE_IN_DELAY_ATTRIBUTE_NAME = 'animate-in-delay';
/** @const {string} */
var ANIMATE_IN_AFTER_ATTRIBUTE_NAME = 'animate-in-after';
/** @const {string} */
var ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME = 'animate-in-timing-function';
/** @const {string} */
var ANIMATABLE_ELEMENTS_SELECTOR = "[".concat(ANIMATE_IN_ATTRIBUTE_NAME, "]");

/** @const {string} */
var DEFAULT_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';

/**
 * @param {!Element} element
 * @return {boolean}
 * TODO(alanorozco): maybe memoize?
 */
export function hasAnimations(element) {
  var selector = "".concat(ANIMATABLE_ELEMENTS_SELECTOR, ",>amp-story-animation");
  return !!scopedQuerySelector(element, selector);
}

/** @enum {number} */
var PlaybackActivity = {
  START: 0,
  FINISH: 1 };


/**
 * @param {!Element} root
 * @param {!Element} element
 * @return {?string}
 */
function getSequencingStartAfterId(root, element) {
  if (!element.hasAttribute(ANIMATE_IN_AFTER_ATTRIBUTE_NAME)) {
    return null;
  }
  var dependencyId = element.getAttribute(ANIMATE_IN_AFTER_ATTRIBUTE_NAME);

  if (!root.querySelector("#".concat(escapeCssSelectorIdent(dependencyId)))) {
    user().warn(
    TAG,
    "The attribute '".concat(ANIMATE_IN_AFTER_ATTRIBUTE_NAME, "' in tag ") + "'".concat(
    element.tagName, "' is set to the invalid value ") + "'".concat(
    dependencyId, "'. No children of parenting 'amp-story-page' ") + "exist with id ".concat(
    dependencyId, "."));

    return null;
  }

  return dependencyId;
}

/** Wraps WebAnimationRunner for story page elements. */
export var AnimationRunner = /*#__PURE__*/function () {
  /**
   * @param {!Element} page
   * @param {!StoryAnimationConfigDef} config
   * @param {!Promise<!../../amp-animation/0.1/web-animations.Builder>} webAnimationBuilderPromise
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!AnimationSequence} sequence
   */
  function AnimationRunner(page, config, webAnimationBuilderPromise, vsync, sequence) {var _this = this;_classCallCheck(this, AnimationRunner);
    var preset = config.preset,source = config.source,spec = config.spec,startAfterId = config.startAfterId;

    /** @private @const */
    this.page_ = page;

    /** @private @const */
    this.source_ = source;

    /** @private @const */
    this.vsync_ = vsync;

    /** @private @const {?Element} */
    this.presetTarget_ = !!preset ? /** @type {!Element} */(spec.target) : null;

    /** @private @const */
    this.sequence_ = sequence;

    /** @private @const {?string} */
    this.startAfterId_ = startAfterId;

    /** @private @const {!Promise<!WebAnimationDef>} */
    this.resolvedSpecPromise_ = this.resolveSpec_(config);

    /**
     * @private @const {!Promise<
     *    !../../amp-animation/0.1/runners/animation-runner.AnimationRunner>}
     */
    this.runnerPromise_ = this.resolvedSpecPromise_.then(function (webAnimDef) {return (
        webAnimationBuilderPromise.then(function (builder) {return (
            builder.createRunner(webAnimDef));}));});



    /**
     * Evaluated set of CSS properties for first animation frame.
     * @private @const {!Promise<?Object<string, *>>}
     */
    this.firstFrameProps_ = this.resolvedSpecPromise_.then(function (spec) {
      var keyframes = spec.keyframes;
      if (!_this.presetTarget_) {
        // It's only possible to backfill the first frame if we can define it
        // as native CSS. <amp-animation> has CSS extensions and can have
        // keyframes defined in a way that prevents us from doing this.
        //
        // To avoid visual jumps, this depends on the author properly
        // defining their CSS so that the initial visual state matches the
        // initial animation frame.
        return null;
      }
      devAssert(
      !keyframes[0].offset);


      return omit(keyframes[0], ['offset']);
    });

    /** @private {?../../amp-animation/0.1/runners/animation-runner.AnimationRunner} */
    this.runner_ = null;

    /** @private {?PlaybackActivity} */
    this.scheduledActivity_ = null;

    /** @private {?Promise} */
    this.scheduledWait_ = null;

    if (this.presetTarget_) {
      var delay = /** @type {!WebAnimationTimingDef} */(spec).delay;
      userAssert(
      /** @type {number} */(delay) >= 0,
      'Negative delays are not allowed in amp-story "animate-in" animations.');

    }

    this.runnerPromise_.then(function (runner) {return _this.onRunnerReady_(runner);});
  }

  /**
   * @param {!Element} page
   * @param {!StoryAnimationConfigDef} config
   * @param {!Promise<!../../amp-animation/0.1/web-animations.Builder>} webAnimationBuilderPromise
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!AnimationSequence} sequence
   * @return {!AnimationRunner}
   */_createClass(AnimationRunner, [{ key: "getDims", value:










    /**
     * @return {!Promise<!StoryAnimationDimsDef>}
     * @visibleForTesting
     */
    function getDims() {var _this2 = this;
      return this.vsync_.measurePromise(function () {
        var target = /** @type {!Element} */(_this2.presetTarget_);
        var targetRect = unscaledClientRect(target);
        var pageRect = unscaledClientRect(_this2.page_);

        // TODO(alanorozco, https://go.amp.dev/issue/27758):
        // Expose equivalents to <amp-animation>
        // - targetWidth/targetHeight are already available as width()/height()
        // - pageWidth/pageHeight should be exposed as vw/vh
        // - targetX/targetY should be exposed somehow (?)
        //
        // TODO(alanorozco, https://go.amp.dev/issue/27758):
        // After exposing these to <amp-animation> syntax, we
        // can get rid of this entire method (and this async chain!) if we ensure
        // that presets avoid visual jumps either via:
        // a) default styles and/or
        // b) by not using special <amp-animation> syntax in initial keyframe.
        return (/** @type {!StoryAnimationDimsDef} */({
            pageWidth: pageRect.width,
            pageHeight: pageRect.height,
            targetWidth: targetRect.width,
            targetHeight: targetRect.height,
            targetX: targetRect.left - pageRect.left,
            targetY: targetRect.top - pageRect.top }));

      });
    }

    /**
     * Evaluates a preset's keyframes function using dimensions.
     * @param {!WebKeyframesDef|!WebKeyframesCreateFnDef} keyframesOrCreateFn
     * @param {!Object<string, *>=} keyframeOptions
     * @return {!Promise<!WebKeyframesDef>}
     * @private
     */ }, { key: "resolvePresetKeyframes_", value:
    function resolvePresetKeyframes_(keyframesOrCreateFn, keyframeOptions) {
      if (typeof keyframesOrCreateFn === 'function') {
        return this.getDims().then(function (dimensions) {
          var fn = /** @type {!WebKeyframesCreateFnDef} */(
          keyframesOrCreateFn);

          return fn(dimensions, keyframeOptions || {});
        });
      }
      return Promise.resolve(keyframesOrCreateFn);
    }

    /**
     * Resolves an animation spec that may be incomplete, like from an
     * [animate-in] preset.
     * @param {!StoryAnimationConfigDef} config
     * @return {!Promise<!WebAnimationDef>}
     */ }, { key: "resolveSpec_", value:
    function resolveSpec_(config) {
      var keyframeOptions = config.keyframeOptions,preset = config.preset,spec = config.spec;
      if (!preset) {
        // This is an amp-animation config, so it's already formed how the
        // WebAnimations Builder wants it.
        return Promise.resolve( /** @type {!WebAnimationDef} */(spec));
      }
      // The need for this cast is an unfortunate result of using @mixes in
      // WebAnimationDef. Otherwise Closure will not understand the timing props
      // mixed in from another type.
      var delay = /** @type {!WebAnimationTimingDef} */(
      spec).delay,duration = /** @type {!WebAnimationTimingDef} */(spec).duration,easing = /** @type {!WebAnimationTimingDef} */(spec).easing;

      var target = /** @type {!WebAnimationSelectorDef} */(spec).target;
      return this.resolvePresetKeyframes_(preset.keyframes, keyframeOptions).then(
      function (keyframes) {return ({
          keyframes: keyframes,
          target: target,
          delay: delay,
          duration: duration,
          easing: easing,
          fill: 'forwards' });});


    }

    /**
     * Applies the first animation frame as CSS props. This is similar to filling
     * the animation backwards, except:
     * - it evaluates before amp-animation is ready to prevent a race and cause
     *   a visual jump before being able to fill the first frame
     * - it allows for sequencing before an animation has started, like with
     *   `animate-in-after`.
     * @return {!Promise<void>}
     */ }, { key: "applyFirstFrame", value:
    function applyFirstFrame() {var _this3 = this;
      if (this.hasStarted()) {
        return _resolvedPromise();
      }

      if (this.runner_) {
        this.runner_.cancel();
      }

      return this.firstFrameProps_.then(function (firstFrameProps) {
        if (!firstFrameProps) {
          // These are only available when they can be evaluated:
          // - delay is not negative
          // - first frame is defined in plain CSS, so it does not use special
          //   <amp-animation> CSS syntax/extensions.
          //
          // We can't guarantee any of these properties when using
          // <amp-story-animation> effects, but we can do it for our own presets.
          return;
        }
        return _this3.vsync_.mutatePromise(function () {
          setStyles( /** @type {!Element} */(
          _this3.presetTarget_),
          assertDoesNotContainDisplay(devAssert(firstFrameProps)));

        });
      });
    }

    /**
     * Applies the last animation frame.
     * @return {!Promise<void>}
     */ }, { key: "applyLastFrame", value:
    function applyLastFrame() {
      if (this.presetTarget_) {
        return _resolvedPromise2();
      }
      this.runnerPromise_.then(function (runner) {
        runner.init();
        runner.finish( /* pauseOnError */true);
      });
    }

    /** Starts or resumes the animation. */ }, { key: "start", value:
    function start() {
      if (this.hasStarted()) {
        return;
      }

      this.playback_(PlaybackActivity.START, this.getStartWaitPromise_());
    }

    /**
     * @return {!Promise}
     * @private
     */ }, { key: "getStartWaitPromise_", value:
    function getStartWaitPromise_() {
      if (this.startAfterId_) {
        return this.sequence_.waitFor(this.startAfterId_);
      }
      return _resolvedPromise3();
    }

    /**
     * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
     * @private
     */ }, { key: "startWhenReady_", value:
    function startWhenReady_(runner) {
      runner.start();
    }

    /** @return {boolean} */ }, { key: "hasStarted", value:
    function hasStarted() {
      return (
      this.isActivityScheduled_(PlaybackActivity.START) || (
      !!this.runner_ &&
      devAssert(this.runner_).getPlayState() == WebAnimationPlayState.RUNNING));

    }

    /** Force-finishes all animations. */ }, { key: "finish", value:
    function finish() {
      if (!this.runner_) {
        this.notifyFinish_();
      }
      this.playback_(PlaybackActivity.FINISH);
    }

    /** Pauses the animation. */ }, { key: "pause", value:
    function pause() {
      // Animation hasn't started yet since it's waiting for a sequenced
      // animation.
      if (this.scheduledWait_ !== null) {
        return;
      }

      if (this.runner_) {
        try {
          this.runner_.pause();
        } catch (e) {
          // This fails when the story animations are not initialized and pause is called. Context on #35161.
        }
      }
    }

    /** Resumes the animation. */ }, { key: "resume", value:
    function resume() {
      // Animation hasn't started yet since it's waiting for a sequenced
      // animation.
      if (this.scheduledWait_ !== null) {
        return;
      }

      if (this.runner_) {
        this.runner_.resume();
      }
    }

    /**
     * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
     * @private
     */ }, { key: "finishWhenReady_", value:
    function finishWhenReady_(runner) {
      if (this.runner_) {
        // Init or no-op if the runner was already running.
        runner.start();
        runner.finish();
      }
    }

    /** Cancels animation. */ }, { key: "cancel", value:
    function cancel() {
      this.scheduledActivity_ = null;
      this.scheduledWait_ = null;

      if (this.runner_) {
        devAssert(this.runner_).cancel();
      }
    }

    /**
     * @param {!PlaybackActivity} activity
     * @param {!Promise=} opt_wait
     * @private
     */ }, { key: "playback_", value:
    function playback_(activity, opt_wait) {
      var wait = opt_wait || null;

      this.scheduledActivity_ = activity;
      this.scheduledWait_ = wait;

      if (this.runner_) {
        this.playbackWhenReady_(activity, wait);
      }
    }

    /**
     * Executes playback activity if runner is ready.
     * @param {!PlaybackActivity} activity
     * @param {?Promise} wait
     * @private
     */ }, { key: "playbackWhenReady_", value:
    function playbackWhenReady_(activity, wait) {var _this4 = this;
      var runner =
      /**
       * @type {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner}
       */(

      devAssert(
      this.runner_));




      (wait || _resolvedPromise4()).then(function () {
        if (!_this4.isActivityScheduled_(activity)) {
          return;
        }

        _this4.scheduledActivity_ = null;
        _this4.scheduledWait_ = null;

        switch (activity) {
          case PlaybackActivity.START:
            return _this4.startWhenReady_(runner);
          case PlaybackActivity.FINISH:
            return _this4.finishWhenReady_(runner);}

      });
    }

    /**
     * Marks runner as ready and executes playback activity if needed.
     * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
     * @private
     */ }, { key: "onRunnerReady_", value:
    function onRunnerReady_(runner) {var _this5 = this;
      this.runner_ = runner;

      runner.onPlayStateChanged(function (state) {
        if (state == WebAnimationPlayState.FINISHED) {
          _this5.notifyFinish_();
        }
      });

      if (!this.isActivityScheduled_()) {
        return;
      }

      this.playbackWhenReady_(
      /** @type {!PlaybackActivity} */(this.scheduledActivity_),
      this.scheduledWait_);

    }

    /**
     * @param {!PlaybackActivity=} opt_activity
     * @return {boolean}
     * @private
     */ }, { key: "isActivityScheduled_", value:
    function isActivityScheduled_(opt_activity) {
      if (!opt_activity) {
        return this.scheduledActivity_ !== null;
      }
      return this.scheduledActivity_ === opt_activity;
    }

    /** @private */ }, { key: "notifyFinish_", value:
    function notifyFinish_() {
      if (this.source_.id) {
        this.sequence_.notifyFinish(this.source_.id);
      }
    } }], [{ key: "create", value: function create(page, config, webAnimationBuilderPromise, vsync, sequence) {return new AnimationRunner(page, config, webAnimationBuilderPromise, vsync, sequence);} }]);return AnimationRunner;}();


// TODO(alanorozco): Looping animations
/** Manager for animations in story pages. */
export var AnimationManager = /*#__PURE__*/function () {
  /**
   * @param {!Element} page
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AnimationManager(page, ampdoc) {_classCallCheck(this, AnimationManager);
    /** @private @const */
    this.page_ = page;

    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(this.ampdoc_.win);

    /** @private @const */
    this.builderPromise_ = this.createAnimationBuilderPromise_();

    /** @private @const {bool} */
    this.skipAnimations_ =
    prefersReducedMotion(ampdoc.win) || (
    isExperimentOn(ampdoc.win, 'story-disable-animations-first-page') &&
    matches(page, 'amp-story-page:first-of-type'));

    /** @private {?Array<!AnimationRunner>} */
    this.runners_ = null;

    /** @private */
    this.sequence_ = AnimationSequence.create();
  }

  /**
   * Decouples constructor so it can be stubbed in tests.
   * @param {!Element} page
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} unusedBaseUrl
   * @return {!AnimationManager}
   */_createClass(AnimationManager, [{ key: "applyFirstFrameOrFinish", value:




    /**
     * Applies first frame to target element before starting animation.
     * @return {!Promise}
     */
    function applyFirstFrameOrFinish() {var _this6 = this;
      return Promise.all(
      this.getOrCreateRunners_().map(function (runner) {return (
          _this6.skipAnimations_ ?
          runner.applyLastFrame() :
          runner.applyFirstFrame());}));


    }

    /**
     * Applies last frame to target element before starting animation.
     * @return {!Promise}
     */ }, { key: "applyLastFrame", value:
    function applyLastFrame() {
      return Promise.all(
      this.getOrCreateRunners_().map(function (runner) {return runner.applyLastFrame();}));

    }

    /** Starts all entrance animations for the page. */ }, { key: "animateIn", value:
    function animateIn() {
      if (this.skipAnimations_) {
        return;
      }
      this.getRunners_().forEach(function (runner) {return runner.start();});
    }

    /** Skips all entrance animations for the page. */ }, { key: "finishAll", value:
    function finishAll() {
      this.getRunners_().forEach(function (runner) {return runner.finish();});
    }

    /** Cancels all entrance animations for the page. */ }, { key: "cancelAll", value:
    function cancelAll() {
      if (!this.runners_) {
        // nothing to cancel when the first frame has not been applied yet.
        return;
      }
      this.getRunners_().forEach(function (runner) {return runner.cancel();});
    }

    /** Pauses all animations in the page. */ }, { key: "pauseAll", value:
    function pauseAll() {
      if (!this.runners_ || this.skipAnimations_) {
        return;
      }
      this.getRunners_().forEach(function (runner) {return runner.pause();});
    }

    /** Resumes all animations in the page. */ }, { key: "resumeAll", value:
    function resumeAll() {
      if (!this.runners_ || this.skipAnimations_) {
        return;
      }
      this.getRunners_().forEach(function (runner) {return runner.resume();});
    }

    /**
     * Determines if there is an animation running.
     * @return {boolean}
     */ }, { key: "hasAnimationStarted", value:
    function hasAnimationStarted() {
      return this.getRunners_().some(function (runner) {return runner.hasStarted();});
    }

    /**
     * @return {!Array<!AnimationRunner>}
     * @private
     */ }, { key: "getRunners_", value:
    function getRunners_() {
      return devAssert(this.runners_);
    }

    /**
     * Gets or creates AnimationRunners.
     * These are either from an <amp-story-animation> spec or resolved from
     * presets via animate-in attributes.
     * If a page element contains both kinds of definitions, they'll run
     * concurrently.
     * @return {!Array<!AnimationRunner>}
     * @private
     */ }, { key: "getOrCreateRunners_", value:
    function getOrCreateRunners_() {var _this7 = this;
      if (!this.runners_) {
        this.runners_ = Array.prototype.map.
        call(
        scopedQuerySelectorAll(this.page_, ANIMATABLE_ELEMENTS_SELECTOR),
        function (el) {
          var preset = _this7.getPreset_(el);
          if (!preset) {
            return null;
          }
          return _this7.createRunner_({
            preset: preset,
            source: el,
            startAfterId: getSequencingStartAfterId(_this7.page_, el),
            keyframeOptions: _this7.getKeyframeOptions_(el),
            spec: _this7.partialAnimationSpecFromPreset_(el, preset) });

        }).

        concat(
        Array.prototype.map.call(
        this.page_.querySelectorAll(
        'amp-story-animation[trigger=visibility]'),

        function (el) {return (
            _this7.createRunner_({
              source: el,
              startAfterId: getSequencingStartAfterId(_this7.page_, el),
              // Casting since we're getting a JsonObject. This will be
              // validated during preparation phase.
              spec: /** @type {!WebAnimationDef} */(getChildJsonConfig(el)) }));})).



        filter(Boolean);
      }
      return devAssert(this.runners_);
    }

    /**
     * @param {!StoryAnimationConfigDef} config
     * @return {!AnimationRunner}
     */ }, { key: "createRunner_", value:
    function createRunner_(config) {
      return AnimationRunner.create(
      this.page_,
      config,
      devAssert(this.builderPromise_),
      this.vsync_,
      this.sequence_);

    }

    /**
     * @param {!Element} el
     * @param {!StoryAnimationPresetDef} preset
     * @return {!WebAnimationDef}
     * @private
     */ }, { key: "partialAnimationSpecFromPreset_", value:
    function partialAnimationSpecFromPreset_(el, preset) {
      var animationDef = {
        target: el,
        delay: preset.delay || 0,
        duration: preset.duration || 0,
        easing: preset.easing || DEFAULT_EASING,

        // This field is so that we type this as a WebAnimationDef, but it's
        // replaced when passed to an AnimationRunner.
        keyframes: [] };


      if (el.hasAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME)) {
        animationDef.duration = timeStrToMillis(
        el.getAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME),
        animationDef.duration);

      }

      if (el.hasAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME)) {
        animationDef.delay = timeStrToMillis(
        el.getAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME),
        animationDef.delay);

      }

      if (el.hasAttribute(ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME)) {
        animationDef.easing = el.getAttribute(
        ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME);

      }

      return animationDef;
    }

    /**
     * @return {!Promise<!../../amp-animation/0.1/web-animations.Builder>}
     * @private
     */ }, { key: "createAnimationBuilderPromise_", value:
    function createAnimationBuilderPromise_() {var _this8 = this;
      return Services.extensionsFor(this.ampdoc_.win).
      installExtensionForDoc(this.ampdoc_, 'amp-animation').
      then(function () {return Services.webAnimationServiceFor(_this8.page_);}).
      then(function (webAnimationService) {return (
          webAnimationService.createBuilder({
            scope: _this8.page_,
            scaleByScope: true }));});


    }

    /**
     * @param {!Element} el
     * @return {?StoryAnimationPresetDef}
     */ }, { key: "getPreset_", value:
    function getPreset_(el) {
      var name = el.getAttribute(ANIMATE_IN_ATTRIBUTE_NAME);

      if (!presets[name]) {
        user().warn(
        TAG,
        'Invalid',
        ANIMATE_IN_ATTRIBUTE_NAME,
        'preset',
        name,
        'for element',
        el);

        return null;
      }

      // TODO(alanorozco): This should be part of a mutate cycle.
      setStyleForPreset(el, name);

      return presets[name];
    }

    /**
     * @param {!Element} el
     * @return {!Object<string, *>}
     * @private
     */ }, { key: "getKeyframeOptions_", value:
    function getKeyframeOptions_(el) {
      var options = {};

      PRESET_OPTION_ATTRIBUTES.forEach(function (name) {
        if (!el.hasAttribute(name)) {
          return;
        }
        var value = parseFloat(el.getAttribute(name));

        if (isNaN(value) || value <= 0) {
          user().warn(
          TAG,
          name,
          'attribute must be a positive number. Found negative or zero in element',
          el);

          return;
        }

        options[name] = value;
      });

      return options;
    } }], [{ key: "create", value: function create(page, ampdoc, unusedBaseUrl) {return new AnimationManager(page, ampdoc);} }]);return AnimationManager;}();


/** Bus for animation sequencing. */
export var AnimationSequence = /*#__PURE__*/function () {
  /**
   * @public
   */
  function AnimationSequence() {_classCallCheck(this, AnimationSequence);
    /** @private @const {!Object<string, !Promise>} */
    this.subscriptionPromises_ = map();

    /** @private @const {!Object<string, !Function>} */
    this.subscriptionResolvers_ = map();
  }

  /**
   * Decouples constructor for testing.
   *
   * @return {!AnimationSequence}
   */_createClass(AnimationSequence, [{ key: "notifyFinish", value:




    /**
     * Notifies dependent elements that animation has finished.
     * @param {string} id
     */
    function notifyFinish(id) {
      if (id in this.subscriptionPromises_) {
        devAssert(this.subscriptionResolvers_[id])();

        delete this.subscriptionPromises_[id];
      }
    }

    /**
     * Waits for another element to finish animating.
     * @param {string} id
     * @return {!Promise<void>}
     */ }, { key: "waitFor", value:
    function waitFor(id) {
      if (!(id in this.subscriptionPromises_)) {
        var deferred = new Deferred();
        this.subscriptionPromises_[id] = deferred.promise;
        this.subscriptionResolvers_[id] = deferred.resolve;
      }
      return this.subscriptionPromises_[id];
    } }], [{ key: "create", value: function create() {return new AnimationSequence();} }]);return AnimationSequence;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/animation.js