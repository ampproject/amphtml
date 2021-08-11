import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

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
import { Deferred } from "../../../src/core/data-structures/promise";
import { PRESET_OPTION_ATTRIBUTES, presets, setStyleForPreset } from "./animation-presets";
import { Services } from "../../../src/service";
import { StoryAnimationConfigDef, StoryAnimationDimsDef, StoryAnimationPresetDef, WebAnimationDef, WebAnimationPlayState, WebAnimationSelectorDef, WebAnimationTimingDef, WebKeyframesCreateFnDef, WebKeyframesDef } from "./animation-types";
import { assertDoesNotContainDisplay } from "../../../src/assert-display";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { escapeCssSelectorIdent } from "../../../src/core/dom/css-selectors";
import { getChildJsonConfig } from "../../../src/core/dom";
import { map, omit } from "../../../src/core/types/object";
import { prefersReducedMotion } from "../../../src/core/dom/media-query-props";
import { matches, scopedQuerySelector, scopedQuerySelectorAll } from "../../../src/core/dom/query";
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
var ANIMATABLE_ELEMENTS_SELECTOR = "[" + ANIMATE_IN_ATTRIBUTE_NAME + "]";

/** @const {string} */
var DEFAULT_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';

/**
 * @param {!Element} element
 * @return {boolean}
 * TODO(alanorozco): maybe memoize?
 */
export function hasAnimations(element) {
  var selector = ANIMATABLE_ELEMENTS_SELECTOR + ",>amp-story-animation";
  return !!scopedQuerySelector(element, selector);
}

/** @enum {number} */
var PlaybackActivity = {
  START: 0,
  FINISH: 1
};

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

  if (!root.querySelector("#" + escapeCssSelectorIdent(dependencyId))) {
    user().warn(TAG, "The attribute '" + ANIMATE_IN_AFTER_ATTRIBUTE_NAME + "' in tag " + ("'" + element.tagName + "' is set to the invalid value ") + ("'" + dependencyId + "'. No children of parenting 'amp-story-page' ") + ("exist with id " + dependencyId + "."));
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
  function AnimationRunner(page, config, webAnimationBuilderPromise, vsync, sequence) {
    var _this = this;

    _classCallCheck(this, AnimationRunner);

    var preset = config.preset,
        source = config.source,
        spec = config.spec,
        startAfterId = config.startAfterId;

    /** @private @const */
    this.page_ = page;

    /** @private @const */
    this.source_ = source;

    /** @private @const */
    this.vsync_ = vsync;

    /** @private @const {?Element} */
    this.presetTarget_ = !!preset ? dev().assertElement(spec.target) : null;

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
    this.runnerPromise_ = this.resolvedSpecPromise_.then(function (webAnimDef) {
      return webAnimationBuilderPromise.then(function (builder) {
        return builder.createRunner(webAnimDef);
      });
    });

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

      devAssert(!keyframes[0].offset, 'First keyframe offset for animation preset should be 0 or undefined');
      return omit(keyframes[0], ['offset']);
    });

    /** @private {?../../amp-animation/0.1/runners/animation-runner.AnimationRunner} */
    this.runner_ = null;

    /** @private {?PlaybackActivity} */
    this.scheduledActivity_ = null;

    /** @private {?Promise} */
    this.scheduledWait_ = null;

    if (this.presetTarget_) {
      var delay =
      /** @type {!WebAnimationTimingDef} */
      spec.delay;
      userAssert(dev().assertNumber(delay) >= 0, 'Negative delays are not allowed in amp-story "animate-in" animations.');
    }

    this.runnerPromise_.then(function (runner) {
      return _this.onRunnerReady_(runner);
    });
  }

  /**
   * @param {!Element} page
   * @param {!StoryAnimationConfigDef} config
   * @param {!Promise<!../../amp-animation/0.1/web-animations.Builder>} webAnimationBuilderPromise
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!AnimationSequence} sequence
   * @return {!AnimationRunner}
   */
  _createClass(AnimationRunner, [{
    key: "getDims",
    value:
    /**
     * @return {!Promise<!StoryAnimationDimsDef>}
     * @visibleForTesting
     */
    function getDims() {
      var _this2 = this;

      return this.vsync_.measurePromise(function () {
        var target = dev().assertElement(_this2.presetTarget_);
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
        return (
          /** @type {!StoryAnimationDimsDef} */
          {
            pageWidth: pageRect.width,
            pageHeight: pageRect.height,
            targetWidth: targetRect.width,
            targetHeight: targetRect.height,
            targetX: targetRect.left - pageRect.left,
            targetY: targetRect.top - pageRect.top
          }
        );
      });
    }
    /**
     * Evaluates a preset's keyframes function using dimensions.
     * @param {!WebKeyframesDef|!WebKeyframesCreateFnDef} keyframesOrCreateFn
     * @param {!Object<string, *>=} keyframeOptions
     * @return {!Promise<!WebKeyframesDef>}
     * @private
     */

  }, {
    key: "resolvePresetKeyframes_",
    value: function resolvePresetKeyframes_(keyframesOrCreateFn, keyframeOptions) {
      if (typeof keyframesOrCreateFn === 'function') {
        return this.getDims().then(function (dimensions) {
          var fn =
          /** @type {!WebKeyframesCreateFnDef} */
          keyframesOrCreateFn;
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
     */

  }, {
    key: "resolveSpec_",
    value: function resolveSpec_(config) {
      var keyframeOptions = config.keyframeOptions,
          preset = config.preset,
          spec = config.spec;

      if (!preset) {
        // This is an amp-animation config, so it's already formed how the
        // WebAnimations Builder wants it.
        return Promise.resolve(
        /** @type {!WebAnimationDef} */
        spec);
      }

      // The need for this cast is an unfortunate result of using @mixes in
      // WebAnimationDef. Otherwise Closure will not understand the timing props
      // mixed in from another type.
      var delay =
      /** @type {!WebAnimationTimingDef} */
      spec.delay,
          duration =
      /** @type {!WebAnimationTimingDef} */
      spec.duration,
          easing =
      /** @type {!WebAnimationTimingDef} */
      spec.easing;
      var target =
      /** @type {!WebAnimationSelectorDef} */
      spec.target;
      return this.resolvePresetKeyframes_(preset.keyframes, keyframeOptions).then(function (keyframes) {
        return {
          keyframes: keyframes,
          target: target,
          delay: delay,
          duration: duration,
          easing: easing,
          fill: 'forwards'
        };
      });
    }
    /**
     * Applies the first animation frame as CSS props. This is similar to filling
     * the animation backwards, except:
     * - it evaluates before amp-animation is ready to prevent a race and cause
     *   a visual jump before being able to fill the first frame
     * - it allows for sequencing before an animation has started, like with
     *   `animate-in-after`.
     * @return {!Promise<void>}
     */

  }, {
    key: "applyFirstFrame",
    value: function applyFirstFrame() {
      var _this3 = this;

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
          setStyles(dev().assertElement(_this3.presetTarget_), assertDoesNotContainDisplay(devAssert(firstFrameProps)));
        });
      });
    }
    /**
     * Applies the last animation frame.
     * @return {!Promise<void>}
     */

  }, {
    key: "applyLastFrame",
    value: function applyLastFrame() {
      if (this.presetTarget_) {
        return _resolvedPromise2();
      }

      this.runnerPromise_.then(function (runner) {
        runner.init();
        runner.finish(
        /* pauseOnError */
        true);
      });
    }
    /** Starts or resumes the animation. */

  }, {
    key: "start",
    value: function start() {
      if (this.hasStarted()) {
        return;
      }

      this.playback_(PlaybackActivity.START, this.getStartWaitPromise_());
    }
    /**
     * @return {!Promise}
     * @private
     */

  }, {
    key: "getStartWaitPromise_",
    value: function getStartWaitPromise_() {
      if (this.startAfterId_) {
        return this.sequence_.waitFor(this.startAfterId_);
      }

      return _resolvedPromise3();
    }
    /**
     * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
     * @private
     */

  }, {
    key: "startWhenReady_",
    value: function startWhenReady_(runner) {
      runner.start();
    }
    /** @return {boolean} */

  }, {
    key: "hasStarted",
    value: function hasStarted() {
      return this.isActivityScheduled_(PlaybackActivity.START) || !!this.runner_ && devAssert(this.runner_).getPlayState() == WebAnimationPlayState.RUNNING;
    }
    /** Force-finishes all animations. */

  }, {
    key: "finish",
    value: function finish() {
      if (!this.runner_) {
        this.notifyFinish_();
      }

      this.playback_(PlaybackActivity.FINISH);
    }
    /** Pauses the animation. */

  }, {
    key: "pause",
    value: function pause() {
      // Animation hasn't started yet since it's waiting for a sequenced
      // animation.
      if (this.scheduledWait_ !== null) {
        return;
      }

      if (this.runner_) {
        try {
          this.runner_.pause();
        } catch (e) {// This fails when the story animations are not initialized and pause is called. Context on #35161.
        }
      }
    }
    /** Resumes the animation. */

  }, {
    key: "resume",
    value: function resume() {
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
     */

  }, {
    key: "finishWhenReady_",
    value: function finishWhenReady_(runner) {
      if (this.runner_) {
        // Init or no-op if the runner was already running.
        runner.start();
        runner.finish();
      }
    }
    /** Cancels animation. */

  }, {
    key: "cancel",
    value: function cancel() {
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
     */

  }, {
    key: "playback_",
    value: function playback_(activity, opt_wait) {
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
     */

  }, {
    key: "playbackWhenReady_",
    value: function playbackWhenReady_(activity, wait) {
      var _this4 = this;

      var runner =
      /**
       * @type {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner}
       */
      devAssert(this.runner_, 'Tried to execute playbackWhenReady_ before runner was resolved.');

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
            return _this4.finishWhenReady_(runner);
        }
      });
    }
    /**
     * Marks runner as ready and executes playback activity if needed.
     * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
     * @private
     */

  }, {
    key: "onRunnerReady_",
    value: function onRunnerReady_(runner) {
      var _this5 = this;

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
      /** @type {!PlaybackActivity} */
      this.scheduledActivity_, this.scheduledWait_);
    }
    /**
     * @param {!PlaybackActivity=} opt_activity
     * @return {boolean}
     * @private
     */

  }, {
    key: "isActivityScheduled_",
    value: function isActivityScheduled_(opt_activity) {
      if (!opt_activity) {
        return this.scheduledActivity_ !== null;
      }

      return this.scheduledActivity_ === opt_activity;
    }
    /** @private */

  }, {
    key: "notifyFinish_",
    value: function notifyFinish_() {
      if (this.source_.id) {
        this.sequence_.notifyFinish(this.source_.id);
      }
    }
  }], [{
    key: "create",
    value: function create(page, config, webAnimationBuilderPromise, vsync, sequence) {
      return new AnimationRunner(page, config, webAnimationBuilderPromise, vsync, sequence);
    }
  }]);

  return AnimationRunner;
}();
// TODO(alanorozco): Looping animations

/** Manager for animations in story pages. */
export var AnimationManager = /*#__PURE__*/function () {
  /**
   * @param {!Element} page
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AnimationManager(page, ampdoc) {
    _classCallCheck(this, AnimationManager);

    /** @private @const */
    this.page_ = page;

    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(this.ampdoc_.win);

    /** @private @const */
    this.builderPromise_ = this.createAnimationBuilderPromise_();

    /** @private @const {bool} */
    this.skipAnimations_ = prefersReducedMotion(ampdoc.win) || isExperimentOn(ampdoc.win, 'story-disable-animations-first-page') && matches(page, 'amp-story-page:first-of-type');
    console.log(page.id, this.skipAnimations_);

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
   */
  _createClass(AnimationManager, [{
    key: "applyFirstFrameOrFinish",
    value:
    /**
     * Applies first frame to target element before starting animation.
     * @return {!Promise}
     */
    function applyFirstFrameOrFinish() {
      var _this6 = this;

      return Promise.all(this.getOrCreateRunners_().map(function (runner) {
        return _this6.skipAnimations_ ? runner.applyLastFrame() : runner.applyFirstFrame();
      }));
    }
    /**
     * Applies last frame to target element before starting animation.
     * @return {!Promise}
     */

  }, {
    key: "applyLastFrame",
    value: function applyLastFrame() {
      return Promise.all(this.getOrCreateRunners_().map(function (runner) {
        return runner.applyLastFrame();
      }));
    }
    /** Starts all entrance animations for the page. */

  }, {
    key: "animateIn",
    value: function animateIn() {
      if (this.skipAnimations_) {
        return;
      }

      this.getRunners_().forEach(function (runner) {
        return runner.start();
      });
    }
    /** Skips all entrance animations for the page. */

  }, {
    key: "finishAll",
    value: function finishAll() {
      this.getRunners_().forEach(function (runner) {
        return runner.finish();
      });
    }
    /** Cancels all entrance animations for the page. */

  }, {
    key: "cancelAll",
    value: function cancelAll() {
      if (!this.runners_) {
        // nothing to cancel when the first frame has not been applied yet.
        return;
      }

      this.getRunners_().forEach(function (runner) {
        return runner.cancel();
      });
    }
    /** Pauses all animations in the page. */

  }, {
    key: "pauseAll",
    value: function pauseAll() {
      if (!this.runners_ || this.skipAnimations_) {
        return;
      }

      this.getRunners_().forEach(function (runner) {
        return runner.pause();
      });
    }
    /** Resumes all animations in the page. */

  }, {
    key: "resumeAll",
    value: function resumeAll() {
      if (!this.runners_ || this.skipAnimations_) {
        return;
      }

      this.getRunners_().forEach(function (runner) {
        return runner.resume();
      });
    }
    /**
     * Determines if there is an animation running.
     * @return {boolean}
     */

  }, {
    key: "hasAnimationStarted",
    value: function hasAnimationStarted() {
      return this.getRunners_().some(function (runner) {
        return runner.hasStarted();
      });
    }
    /**
     * @return {!Array<!AnimationRunner>}
     * @private
     */

  }, {
    key: "getRunners_",
    value: function getRunners_() {
      return devAssert(this.runners_, 'Executed before applyFirstFrameOrFinish');
    }
    /**
     * Gets or creates AnimationRunners.
     * These are either from an <amp-story-animation> spec or resolved from
     * presets via animate-in attributes.
     * If a page element contains both kinds of definitions, they'll run
     * concurrently.
     * @return {!Array<!AnimationRunner>}
     * @private
     */

  }, {
    key: "getOrCreateRunners_",
    value: function getOrCreateRunners_() {
      var _this7 = this;

      if (!this.runners_) {
        this.runners_ = Array.prototype.map.call(scopedQuerySelectorAll(this.page_, ANIMATABLE_ELEMENTS_SELECTOR), function (el) {
          var preset = _this7.getPreset_(el);

          if (!preset) {
            return null;
          }

          return _this7.createRunner_({
            preset: preset,
            source: el,
            startAfterId: getSequencingStartAfterId(_this7.page_, el),
            keyframeOptions: _this7.getKeyframeOptions_(el),
            spec: _this7.partialAnimationSpecFromPreset_(el, preset)
          });
        }).concat(Array.prototype.map.call(this.page_.querySelectorAll('amp-story-animation[trigger=visibility]'), function (el) {
          return _this7.createRunner_({
            source: el,
            startAfterId: getSequencingStartAfterId(_this7.page_, el),
            // Casting since we're getting a JsonObject. This will be
            // validated during preparation phase.
            spec:
            /** @type {!WebAnimationDef} */
            getChildJsonConfig(el)
          });
        })).filter(Boolean);
      }

      return devAssert(this.runners_);
    }
    /**
     * @param {!StoryAnimationConfigDef} config
     * @return {!AnimationRunner}
     */

  }, {
    key: "createRunner_",
    value: function createRunner_(config) {
      return AnimationRunner.create(this.page_, config, devAssert(this.builderPromise_), this.vsync_, this.sequence_);
    }
    /**
     * @param {!Element} el
     * @param {!StoryAnimationPresetDef} preset
     * @return {!WebAnimationDef}
     * @private
     */

  }, {
    key: "partialAnimationSpecFromPreset_",
    value: function partialAnimationSpecFromPreset_(el, preset) {
      var animationDef = {
        target: el,
        delay: preset.delay || 0,
        duration: preset.duration || 0,
        easing: preset.easing || DEFAULT_EASING,
        // This field is so that we type this as a WebAnimationDef, but it's
        // replaced when passed to an AnimationRunner.
        keyframes: []
      };

      if (el.hasAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME)) {
        animationDef.duration = timeStrToMillis(el.getAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME), animationDef.duration);
      }

      if (el.hasAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME)) {
        animationDef.delay = timeStrToMillis(el.getAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME), animationDef.delay);
      }

      if (el.hasAttribute(ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME)) {
        animationDef.easing = el.getAttribute(ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME);
      }

      return animationDef;
    }
    /**
     * @return {!Promise<!../../amp-animation/0.1/web-animations.Builder>}
     * @private
     */

  }, {
    key: "createAnimationBuilderPromise_",
    value: function createAnimationBuilderPromise_() {
      var _this8 = this;

      return Services.extensionsFor(this.ampdoc_.win).installExtensionForDoc(this.ampdoc_, 'amp-animation').then(function () {
        return Services.webAnimationServiceFor(_this8.page_);
      }).then(function (webAnimationService) {
        return webAnimationService.createBuilder({
          scope: _this8.page_,
          scaleByScope: true
        });
      });
    }
    /**
     * @param {!Element} el
     * @return {?StoryAnimationPresetDef}
     */

  }, {
    key: "getPreset_",
    value: function getPreset_(el) {
      var name = el.getAttribute(ANIMATE_IN_ATTRIBUTE_NAME);

      if (!presets[name]) {
        user().warn(TAG, 'Invalid', ANIMATE_IN_ATTRIBUTE_NAME, 'preset', name, 'for element', el);
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
     */

  }, {
    key: "getKeyframeOptions_",
    value: function getKeyframeOptions_(el) {
      var options = {};
      PRESET_OPTION_ATTRIBUTES.forEach(function (name) {
        if (!el.hasAttribute(name)) {
          return;
        }

        var value = parseFloat(el.getAttribute(name));

        if (isNaN(value) || value <= 0) {
          user().warn(TAG, name, 'attribute must be a positive number. Found negative or zero in element', el);
          return;
        }

        options[name] = value;
      });
      return options;
    }
  }], [{
    key: "create",
    value: function create(page, ampdoc, unusedBaseUrl) {
      return new AnimationManager(page, ampdoc);
    }
  }]);

  return AnimationManager;
}();

/** Bus for animation sequencing. */
export var AnimationSequence = /*#__PURE__*/function () {
  /**
   * @public
   */
  function AnimationSequence() {
    _classCallCheck(this, AnimationSequence);

    /** @private @const {!Object<string, !Promise>} */
    this.subscriptionPromises_ = map();

    /** @private @const {!Object<string, !Function>} */
    this.subscriptionResolvers_ = map();
  }

  /**
   * Decouples constructor for testing.
   *
   * @return {!AnimationSequence}
   */
  _createClass(AnimationSequence, [{
    key: "notifyFinish",
    value:
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
     */

  }, {
    key: "waitFor",
    value: function waitFor(id) {
      if (!(id in this.subscriptionPromises_)) {
        var deferred = new Deferred();
        this.subscriptionPromises_[id] = deferred.promise;
        this.subscriptionResolvers_[id] = deferred.resolve;
      }

      return this.subscriptionPromises_[id];
    }
  }], [{
    key: "create",
    value: function create() {
      return new AnimationSequence();
    }
  }]);

  return AnimationSequence;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6WyJEZWZlcnJlZCIsIlBSRVNFVF9PUFRJT05fQVRUUklCVVRFUyIsInByZXNldHMiLCJzZXRTdHlsZUZvclByZXNldCIsIlNlcnZpY2VzIiwiU3RvcnlBbmltYXRpb25Db25maWdEZWYiLCJTdG9yeUFuaW1hdGlvbkRpbXNEZWYiLCJTdG9yeUFuaW1hdGlvblByZXNldERlZiIsIldlYkFuaW1hdGlvbkRlZiIsIldlYkFuaW1hdGlvblBsYXlTdGF0ZSIsIldlYkFuaW1hdGlvblNlbGVjdG9yRGVmIiwiV2ViQW5pbWF0aW9uVGltaW5nRGVmIiwiV2ViS2V5ZnJhbWVzQ3JlYXRlRm5EZWYiLCJXZWJLZXlmcmFtZXNEZWYiLCJhc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXkiLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwidXNlckFzc2VydCIsImVzY2FwZUNzc1NlbGVjdG9ySWRlbnQiLCJnZXRDaGlsZEpzb25Db25maWciLCJtYXAiLCJvbWl0IiwicHJlZmVyc1JlZHVjZWRNb3Rpb24iLCJtYXRjaGVzIiwic2NvcGVkUXVlcnlTZWxlY3RvciIsInNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwiLCJzZXRTdHlsZXMiLCJ0aW1lU3RyVG9NaWxsaXMiLCJ1bnNjYWxlZENsaWVudFJlY3QiLCJpc0V4cGVyaW1lbnRPbiIsIlRBRyIsIkFOSU1BVEVfSU5fQVRUUklCVVRFX05BTUUiLCJBTklNQVRFX0lOX0RVUkFUSU9OX0FUVFJJQlVURV9OQU1FIiwiQU5JTUFURV9JTl9ERUxBWV9BVFRSSUJVVEVfTkFNRSIsIkFOSU1BVEVfSU5fQUZURVJfQVRUUklCVVRFX05BTUUiLCJBTklNQVRFX0lOX1RJTUlOR19GVU5DVElPTl9BVFRSSUJVVEVfTkFNRSIsIkFOSU1BVEFCTEVfRUxFTUVOVFNfU0VMRUNUT1IiLCJERUZBVUxUX0VBU0lORyIsImhhc0FuaW1hdGlvbnMiLCJlbGVtZW50Iiwic2VsZWN0b3IiLCJQbGF5YmFja0FjdGl2aXR5IiwiU1RBUlQiLCJGSU5JU0giLCJnZXRTZXF1ZW5jaW5nU3RhcnRBZnRlcklkIiwicm9vdCIsImhhc0F0dHJpYnV0ZSIsImRlcGVuZGVuY3lJZCIsImdldEF0dHJpYnV0ZSIsInF1ZXJ5U2VsZWN0b3IiLCJ3YXJuIiwidGFnTmFtZSIsIkFuaW1hdGlvblJ1bm5lciIsInBhZ2UiLCJjb25maWciLCJ3ZWJBbmltYXRpb25CdWlsZGVyUHJvbWlzZSIsInZzeW5jIiwic2VxdWVuY2UiLCJwcmVzZXQiLCJzb3VyY2UiLCJzcGVjIiwic3RhcnRBZnRlcklkIiwicGFnZV8iLCJzb3VyY2VfIiwidnN5bmNfIiwicHJlc2V0VGFyZ2V0XyIsImFzc2VydEVsZW1lbnQiLCJ0YXJnZXQiLCJzZXF1ZW5jZV8iLCJzdGFydEFmdGVySWRfIiwicmVzb2x2ZWRTcGVjUHJvbWlzZV8iLCJyZXNvbHZlU3BlY18iLCJydW5uZXJQcm9taXNlXyIsInRoZW4iLCJ3ZWJBbmltRGVmIiwiYnVpbGRlciIsImNyZWF0ZVJ1bm5lciIsImZpcnN0RnJhbWVQcm9wc18iLCJrZXlmcmFtZXMiLCJvZmZzZXQiLCJydW5uZXJfIiwic2NoZWR1bGVkQWN0aXZpdHlfIiwic2NoZWR1bGVkV2FpdF8iLCJkZWxheSIsImFzc2VydE51bWJlciIsInJ1bm5lciIsIm9uUnVubmVyUmVhZHlfIiwibWVhc3VyZVByb21pc2UiLCJ0YXJnZXRSZWN0IiwicGFnZVJlY3QiLCJwYWdlV2lkdGgiLCJ3aWR0aCIsInBhZ2VIZWlnaHQiLCJoZWlnaHQiLCJ0YXJnZXRXaWR0aCIsInRhcmdldEhlaWdodCIsInRhcmdldFgiLCJsZWZ0IiwidGFyZ2V0WSIsInRvcCIsImtleWZyYW1lc09yQ3JlYXRlRm4iLCJrZXlmcmFtZU9wdGlvbnMiLCJnZXREaW1zIiwiZGltZW5zaW9ucyIsImZuIiwiUHJvbWlzZSIsInJlc29sdmUiLCJkdXJhdGlvbiIsImVhc2luZyIsInJlc29sdmVQcmVzZXRLZXlmcmFtZXNfIiwiZmlsbCIsImhhc1N0YXJ0ZWQiLCJjYW5jZWwiLCJmaXJzdEZyYW1lUHJvcHMiLCJtdXRhdGVQcm9taXNlIiwiaW5pdCIsImZpbmlzaCIsInBsYXliYWNrXyIsImdldFN0YXJ0V2FpdFByb21pc2VfIiwid2FpdEZvciIsInN0YXJ0IiwiaXNBY3Rpdml0eVNjaGVkdWxlZF8iLCJnZXRQbGF5U3RhdGUiLCJSVU5OSU5HIiwibm90aWZ5RmluaXNoXyIsInBhdXNlIiwiZSIsInJlc3VtZSIsImFjdGl2aXR5Iiwib3B0X3dhaXQiLCJ3YWl0IiwicGxheWJhY2tXaGVuUmVhZHlfIiwic3RhcnRXaGVuUmVhZHlfIiwiZmluaXNoV2hlblJlYWR5XyIsIm9uUGxheVN0YXRlQ2hhbmdlZCIsInN0YXRlIiwiRklOSVNIRUQiLCJvcHRfYWN0aXZpdHkiLCJpZCIsIm5vdGlmeUZpbmlzaCIsIkFuaW1hdGlvbk1hbmFnZXIiLCJhbXBkb2MiLCJhbXBkb2NfIiwidnN5bmNGb3IiLCJ3aW4iLCJidWlsZGVyUHJvbWlzZV8iLCJjcmVhdGVBbmltYXRpb25CdWlsZGVyUHJvbWlzZV8iLCJza2lwQW5pbWF0aW9uc18iLCJjb25zb2xlIiwibG9nIiwicnVubmVyc18iLCJBbmltYXRpb25TZXF1ZW5jZSIsImNyZWF0ZSIsImFsbCIsImdldE9yQ3JlYXRlUnVubmVyc18iLCJhcHBseUxhc3RGcmFtZSIsImFwcGx5Rmlyc3RGcmFtZSIsImdldFJ1bm5lcnNfIiwiZm9yRWFjaCIsInNvbWUiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJlbCIsImdldFByZXNldF8iLCJjcmVhdGVSdW5uZXJfIiwiZ2V0S2V5ZnJhbWVPcHRpb25zXyIsInBhcnRpYWxBbmltYXRpb25TcGVjRnJvbVByZXNldF8iLCJjb25jYXQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZmlsdGVyIiwiQm9vbGVhbiIsImFuaW1hdGlvbkRlZiIsImV4dGVuc2lvbnNGb3IiLCJpbnN0YWxsRXh0ZW5zaW9uRm9yRG9jIiwid2ViQW5pbWF0aW9uU2VydmljZUZvciIsIndlYkFuaW1hdGlvblNlcnZpY2UiLCJjcmVhdGVCdWlsZGVyIiwic2NvcGUiLCJzY2FsZUJ5U2NvcGUiLCJuYW1lIiwib3B0aW9ucyIsInZhbHVlIiwicGFyc2VGbG9hdCIsImlzTmFOIiwidW51c2VkQmFzZVVybCIsInN1YnNjcmlwdGlvblByb21pc2VzXyIsInN1YnNjcmlwdGlvblJlc29sdmVyc18iLCJkZWZlcnJlZCIsInByb21pc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQ0VDLHdCQURGLEVBRUVDLE9BRkYsRUFHRUMsaUJBSEY7QUFLQSxTQUFRQyxRQUFSO0FBQ0EsU0FDRUMsdUJBREYsRUFFRUMscUJBRkYsRUFHRUMsdUJBSEYsRUFJRUMsZUFKRixFQUtFQyxxQkFMRixFQU1FQyx1QkFORixFQU9FQyxxQkFQRixFQVFFQyx1QkFSRixFQVNFQyxlQVRGO0FBV0EsU0FBUUMsMkJBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLFNBQWIsRUFBd0JDLElBQXhCLEVBQThCQyxVQUE5QjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLElBQWI7QUFDQSxTQUFRQyxvQkFBUjtBQUNBLFNBQ0VDLE9BREYsRUFFRUMsbUJBRkYsRUFHRUMsc0JBSEY7QUFLQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsZUFBUixFQUF5QkMsa0JBQXpCO0FBQ0EsU0FBUUMsY0FBUjtBQUVBLElBQU1DLEdBQUcsR0FBRyxXQUFaOztBQUVBO0FBQ0EsT0FBTyxJQUFNQyx5QkFBeUIsR0FBRyxZQUFsQzs7QUFDUDtBQUNBLElBQU1DLGtDQUFrQyxHQUFHLHFCQUEzQzs7QUFDQTtBQUNBLElBQU1DLCtCQUErQixHQUFHLGtCQUF4Qzs7QUFDQTtBQUNBLElBQU1DLCtCQUErQixHQUFHLGtCQUF4Qzs7QUFDQTtBQUNBLElBQU1DLHlDQUF5QyxHQUFHLDRCQUFsRDs7QUFDQTtBQUNBLElBQU1DLDRCQUE0QixTQUFPTCx5QkFBUCxNQUFsQzs7QUFFQTtBQUNBLElBQU1NLGNBQWMsR0FBRyxnQ0FBdkI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsYUFBVCxDQUF1QkMsT0FBdkIsRUFBZ0M7QUFDckMsTUFBTUMsUUFBUSxHQUFNSiw0QkFBTiwwQkFBZDtBQUNBLFNBQU8sQ0FBQyxDQUFDWixtQkFBbUIsQ0FBQ2UsT0FBRCxFQUFVQyxRQUFWLENBQTVCO0FBQ0Q7O0FBRUQ7QUFDQSxJQUFNQyxnQkFBZ0IsR0FBRztBQUN2QkMsRUFBQUEsS0FBSyxFQUFFLENBRGdCO0FBRXZCQyxFQUFBQSxNQUFNLEVBQUU7QUFGZSxDQUF6Qjs7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MseUJBQVQsQ0FBbUNDLElBQW5DLEVBQXlDTixPQUF6QyxFQUFrRDtBQUNoRCxNQUFJLENBQUNBLE9BQU8sQ0FBQ08sWUFBUixDQUFxQlosK0JBQXJCLENBQUwsRUFBNEQ7QUFDMUQsV0FBTyxJQUFQO0FBQ0Q7O0FBQ0QsTUFBTWEsWUFBWSxHQUFHUixPQUFPLENBQUNTLFlBQVIsQ0FBcUJkLCtCQUFyQixDQUFyQjs7QUFFQSxNQUFJLENBQUNXLElBQUksQ0FBQ0ksYUFBTCxPQUF1Qi9CLHNCQUFzQixDQUFDNkIsWUFBRCxDQUE3QyxDQUFMLEVBQXFFO0FBQ25FL0IsSUFBQUEsSUFBSSxHQUFHa0MsSUFBUCxDQUNFcEIsR0FERixFQUVFLG9CQUFrQkksK0JBQWxCLHdCQUNNSyxPQUFPLENBQUNZLE9BRGQsOENBRU1KLFlBRk4sMEVBR21CQSxZQUhuQixPQUZGO0FBT0EsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsU0FBT0EsWUFBUDtBQUNEOztBQUVEO0FBQ0EsV0FBYUssZUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0UsMkJBQVlDLElBQVosRUFBa0JDLE1BQWxCLEVBQTBCQywwQkFBMUIsRUFBc0RDLEtBQXRELEVBQTZEQyxRQUE3RCxFQUF1RTtBQUFBOztBQUFBOztBQUNyRSxRQUFPQyxNQUFQLEdBQTZDSixNQUE3QyxDQUFPSSxNQUFQO0FBQUEsUUFBZUMsTUFBZixHQUE2Q0wsTUFBN0MsQ0FBZUssTUFBZjtBQUFBLFFBQXVCQyxJQUF2QixHQUE2Q04sTUFBN0MsQ0FBdUJNLElBQXZCO0FBQUEsUUFBNkJDLFlBQTdCLEdBQTZDUCxNQUE3QyxDQUE2Qk8sWUFBN0I7O0FBRUE7QUFDQSxTQUFLQyxLQUFMLEdBQWFULElBQWI7O0FBRUE7QUFDQSxTQUFLVSxPQUFMLEdBQWVKLE1BQWY7O0FBRUE7QUFDQSxTQUFLSyxNQUFMLEdBQWNSLEtBQWQ7O0FBRUE7QUFDQSxTQUFLUyxhQUFMLEdBQXFCLENBQUMsQ0FBQ1AsTUFBRixHQUFXNUMsR0FBRyxHQUFHb0QsYUFBTixDQUFvQk4sSUFBSSxDQUFDTyxNQUF6QixDQUFYLEdBQThDLElBQW5FOztBQUVBO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQlgsUUFBakI7O0FBRUE7QUFDQSxTQUFLWSxhQUFMLEdBQXFCUixZQUFyQjs7QUFFQTtBQUNBLFNBQUtTLG9CQUFMLEdBQTRCLEtBQUtDLFlBQUwsQ0FBa0JqQixNQUFsQixDQUE1Qjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNJLFNBQUtrQixjQUFMLEdBQXNCLEtBQUtGLG9CQUFMLENBQTBCRyxJQUExQixDQUErQixVQUFDQyxVQUFEO0FBQUEsYUFDbkRuQiwwQkFBMEIsQ0FBQ2tCLElBQTNCLENBQWdDLFVBQUNFLE9BQUQ7QUFBQSxlQUM5QkEsT0FBTyxDQUFDQyxZQUFSLENBQXFCRixVQUFyQixDQUQ4QjtBQUFBLE9BQWhDLENBRG1EO0FBQUEsS0FBL0IsQ0FBdEI7O0FBTUE7QUFDSjtBQUNBO0FBQ0E7QUFDSSxTQUFLRyxnQkFBTCxHQUF3QixLQUFLUCxvQkFBTCxDQUEwQkcsSUFBMUIsQ0FBK0IsVUFBQ2IsSUFBRCxFQUFVO0FBQy9ELFVBQU9rQixTQUFQLEdBQW9CbEIsSUFBcEIsQ0FBT2tCLFNBQVA7O0FBQ0EsVUFBSSxDQUFDLEtBQUksQ0FBQ2IsYUFBVixFQUF5QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQU8sSUFBUDtBQUNEOztBQUNEbEQsTUFBQUEsU0FBUyxDQUNQLENBQUMrRCxTQUFTLENBQUMsQ0FBRCxDQUFULENBQWFDLE1BRFAsRUFFUCxxRUFGTyxDQUFUO0FBSUEsYUFBTzFELElBQUksQ0FBQ3lELFNBQVMsQ0FBQyxDQUFELENBQVYsRUFBZSxDQUFDLFFBQUQsQ0FBZixDQUFYO0FBQ0QsS0FqQnVCLENBQXhCOztBQW1CQTtBQUNBLFNBQUtFLE9BQUwsR0FBZSxJQUFmOztBQUVBO0FBQ0EsU0FBS0Msa0JBQUwsR0FBMEIsSUFBMUI7O0FBRUE7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCOztBQUVBLFFBQUksS0FBS2pCLGFBQVQsRUFBd0I7QUFDdEIsVUFBT2tCLEtBQVA7QUFBZ0I7QUFBdUN2QixNQUFBQSxJQUF2RCxDQUFPdUIsS0FBUDtBQUNBbEUsTUFBQUEsVUFBVSxDQUNSSCxHQUFHLEdBQUdzRSxZQUFOLENBQW1CRCxLQUFuQixLQUE2QixDQURyQixFQUVSLHVFQUZRLENBQVY7QUFJRDs7QUFFRCxTQUFLWCxjQUFMLENBQW9CQyxJQUFwQixDQUF5QixVQUFDWSxNQUFEO0FBQUEsYUFBWSxLQUFJLENBQUNDLGNBQUwsQ0FBb0JELE1BQXBCLENBQVo7QUFBQSxLQUF6QjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE1RkE7QUFBQTtBQUFBO0FBdUdFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0UsdUJBQVU7QUFBQTs7QUFDUixhQUFPLEtBQUtyQixNQUFMLENBQVl1QixjQUFaLENBQTJCLFlBQU07QUFDdEMsWUFBTXBCLE1BQU0sR0FBR3JELEdBQUcsR0FBR29ELGFBQU4sQ0FBb0IsTUFBSSxDQUFDRCxhQUF6QixDQUFmO0FBQ0EsWUFBTXVCLFVBQVUsR0FBRzVELGtCQUFrQixDQUFDdUMsTUFBRCxDQUFyQztBQUNBLFlBQU1zQixRQUFRLEdBQUc3RCxrQkFBa0IsQ0FBQyxNQUFJLENBQUNrQyxLQUFOLENBQW5DO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBTztBQUF1QztBQUM1QzRCLFlBQUFBLFNBQVMsRUFBRUQsUUFBUSxDQUFDRSxLQUR3QjtBQUU1Q0MsWUFBQUEsVUFBVSxFQUFFSCxRQUFRLENBQUNJLE1BRnVCO0FBRzVDQyxZQUFBQSxXQUFXLEVBQUVOLFVBQVUsQ0FBQ0csS0FIb0I7QUFJNUNJLFlBQUFBLFlBQVksRUFBRVAsVUFBVSxDQUFDSyxNQUptQjtBQUs1Q0csWUFBQUEsT0FBTyxFQUFFUixVQUFVLENBQUNTLElBQVgsR0FBa0JSLFFBQVEsQ0FBQ1EsSUFMUTtBQU01Q0MsWUFBQUEsT0FBTyxFQUFFVixVQUFVLENBQUNXLEdBQVgsR0FBaUJWLFFBQVEsQ0FBQ1U7QUFOUztBQUE5QztBQVFELE9BekJNLENBQVA7QUEwQkQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE5SUE7QUFBQTtBQUFBLFdBK0lFLGlDQUF3QkMsbUJBQXhCLEVBQTZDQyxlQUE3QyxFQUE4RDtBQUM1RCxVQUFJLE9BQU9ELG1CQUFQLEtBQStCLFVBQW5DLEVBQStDO0FBQzdDLGVBQU8sS0FBS0UsT0FBTCxHQUFlN0IsSUFBZixDQUFvQixVQUFDOEIsVUFBRCxFQUFnQjtBQUN6QyxjQUFNQyxFQUFFO0FBQUc7QUFDVEosVUFBQUEsbUJBREY7QUFHQSxpQkFBT0ksRUFBRSxDQUFDRCxVQUFELEVBQWFGLGVBQWUsSUFBSSxFQUFoQyxDQUFUO0FBQ0QsU0FMTSxDQUFQO0FBTUQ7O0FBQ0QsYUFBT0ksT0FBTyxDQUFDQyxPQUFSLENBQWdCTixtQkFBaEIsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhLQTtBQUFBO0FBQUEsV0FpS0Usc0JBQWE5QyxNQUFiLEVBQXFCO0FBQ25CLFVBQU8rQyxlQUFQLEdBQXdDL0MsTUFBeEMsQ0FBTytDLGVBQVA7QUFBQSxVQUF3QjNDLE1BQXhCLEdBQXdDSixNQUF4QyxDQUF3QkksTUFBeEI7QUFBQSxVQUFnQ0UsSUFBaEMsR0FBd0NOLE1BQXhDLENBQWdDTSxJQUFoQzs7QUFDQSxVQUFJLENBQUNGLE1BQUwsRUFBYTtBQUNYO0FBQ0E7QUFDQSxlQUFPK0MsT0FBTyxDQUFDQyxPQUFSO0FBQWdCO0FBQWlDOUMsUUFBQUEsSUFBakQsQ0FBUDtBQUNEOztBQUNEO0FBQ0E7QUFDQTtBQUNBLFVBQU91QixLQUFQO0FBQWtDO0FBQ2hDdkIsTUFBQUEsSUFERixDQUFPdUIsS0FBUDtBQUFBLFVBQWN3QixRQUFkO0FBQWtDO0FBQ2hDL0MsTUFBQUEsSUFERixDQUFjK0MsUUFBZDtBQUFBLFVBQXdCQyxNQUF4QjtBQUFrQztBQUNoQ2hELE1BQUFBLElBREYsQ0FBd0JnRCxNQUF4QjtBQUdBLFVBQU96QyxNQUFQO0FBQWlCO0FBQXlDUCxNQUFBQSxJQUExRCxDQUFPTyxNQUFQO0FBQ0EsYUFBTyxLQUFLMEMsdUJBQUwsQ0FBNkJuRCxNQUFNLENBQUNvQixTQUFwQyxFQUErQ3VCLGVBQS9DLEVBQWdFNUIsSUFBaEUsQ0FDTCxVQUFDSyxTQUFEO0FBQUEsZUFBZ0I7QUFDZEEsVUFBQUEsU0FBUyxFQUFUQSxTQURjO0FBRWRYLFVBQUFBLE1BQU0sRUFBTkEsTUFGYztBQUdkZ0IsVUFBQUEsS0FBSyxFQUFMQSxLQUhjO0FBSWR3QixVQUFBQSxRQUFRLEVBQVJBLFFBSmM7QUFLZEMsVUFBQUEsTUFBTSxFQUFOQSxNQUxjO0FBTWRFLFVBQUFBLElBQUksRUFBRTtBQU5RLFNBQWhCO0FBQUEsT0FESyxDQUFQO0FBVUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbk1BO0FBQUE7QUFBQSxXQW9NRSwyQkFBa0I7QUFBQTs7QUFDaEIsVUFBSSxLQUFLQyxVQUFMLEVBQUosRUFBdUI7QUFDckIsZUFBTyxrQkFBUDtBQUNEOztBQUVELFVBQUksS0FBSy9CLE9BQVQsRUFBa0I7QUFDaEIsYUFBS0EsT0FBTCxDQUFhZ0MsTUFBYjtBQUNEOztBQUVELGFBQU8sS0FBS25DLGdCQUFMLENBQXNCSixJQUF0QixDQUEyQixVQUFDd0MsZUFBRCxFQUFxQjtBQUNyRCxZQUFJLENBQUNBLGVBQUwsRUFBc0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEOztBQUNELGVBQU8sTUFBSSxDQUFDakQsTUFBTCxDQUFZa0QsYUFBWixDQUEwQixZQUFNO0FBQ3JDeEYsVUFBQUEsU0FBUyxDQUNQWixHQUFHLEdBQUdvRCxhQUFOLENBQW9CLE1BQUksQ0FBQ0QsYUFBekIsQ0FETyxFQUVQcEQsMkJBQTJCLENBQUNFLFNBQVMsQ0FBQ2tHLGVBQUQsQ0FBVixDQUZwQixDQUFUO0FBSUQsU0FMTSxDQUFQO0FBTUQsT0FqQk0sQ0FBUDtBQWtCRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXBPQTtBQUFBO0FBQUEsV0FxT0UsMEJBQWlCO0FBQ2YsVUFBSSxLQUFLaEQsYUFBVCxFQUF3QjtBQUN0QixlQUFPLG1CQUFQO0FBQ0Q7O0FBQ0QsV0FBS08sY0FBTCxDQUFvQkMsSUFBcEIsQ0FBeUIsVUFBQ1ksTUFBRCxFQUFZO0FBQ25DQSxRQUFBQSxNQUFNLENBQUM4QixJQUFQO0FBQ0E5QixRQUFBQSxNQUFNLENBQUMrQixNQUFQO0FBQWM7QUFBbUIsWUFBakM7QUFDRCxPQUhEO0FBSUQ7QUFFRDs7QUEvT0Y7QUFBQTtBQUFBLFdBZ1BFLGlCQUFRO0FBQ04sVUFBSSxLQUFLTCxVQUFMLEVBQUosRUFBdUI7QUFDckI7QUFDRDs7QUFFRCxXQUFLTSxTQUFMLENBQWU1RSxnQkFBZ0IsQ0FBQ0MsS0FBaEMsRUFBdUMsS0FBSzRFLG9CQUFMLEVBQXZDO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUEzUEE7QUFBQTtBQUFBLFdBNFBFLGdDQUF1QjtBQUNyQixVQUFJLEtBQUtqRCxhQUFULEVBQXdCO0FBQ3RCLGVBQU8sS0FBS0QsU0FBTCxDQUFlbUQsT0FBZixDQUF1QixLQUFLbEQsYUFBNUIsQ0FBUDtBQUNEOztBQUNELGFBQU8sbUJBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXRRQTtBQUFBO0FBQUEsV0F1UUUseUJBQWdCZ0IsTUFBaEIsRUFBd0I7QUFDdEJBLE1BQUFBLE1BQU0sQ0FBQ21DLEtBQVA7QUFDRDtBQUVEOztBQTNRRjtBQUFBO0FBQUEsV0E0UUUsc0JBQWE7QUFDWCxhQUNFLEtBQUtDLG9CQUFMLENBQTBCaEYsZ0JBQWdCLENBQUNDLEtBQTNDLEtBQ0MsQ0FBQyxDQUFDLEtBQUtzQyxPQUFQLElBQ0NqRSxTQUFTLENBQUMsS0FBS2lFLE9BQU4sQ0FBVCxDQUF3QjBDLFlBQXhCLE1BQTBDbEgscUJBQXFCLENBQUNtSCxPQUhwRTtBQUtEO0FBRUQ7O0FBcFJGO0FBQUE7QUFBQSxXQXFSRSxrQkFBUztBQUNQLFVBQUksQ0FBQyxLQUFLM0MsT0FBVixFQUFtQjtBQUNqQixhQUFLNEMsYUFBTDtBQUNEOztBQUNELFdBQUtQLFNBQUwsQ0FBZTVFLGdCQUFnQixDQUFDRSxNQUFoQztBQUNEO0FBRUQ7O0FBNVJGO0FBQUE7QUFBQSxXQTZSRSxpQkFBUTtBQUNOO0FBQ0E7QUFDQSxVQUFJLEtBQUt1QyxjQUFMLEtBQXdCLElBQTVCLEVBQWtDO0FBQ2hDO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLRixPQUFULEVBQWtCO0FBQ2hCLFlBQUk7QUFDRixlQUFLQSxPQUFMLENBQWE2QyxLQUFiO0FBQ0QsU0FGRCxDQUVFLE9BQU9DLENBQVAsRUFBVSxDQUNWO0FBQ0Q7QUFDRjtBQUNGO0FBRUQ7O0FBN1NGO0FBQUE7QUFBQSxXQThTRSxrQkFBUztBQUNQO0FBQ0E7QUFDQSxVQUFJLEtBQUs1QyxjQUFMLEtBQXdCLElBQTVCLEVBQWtDO0FBQ2hDO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLRixPQUFULEVBQWtCO0FBQ2hCLGFBQUtBLE9BQUwsQ0FBYStDLE1BQWI7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBN1RBO0FBQUE7QUFBQSxXQThURSwwQkFBaUIxQyxNQUFqQixFQUF5QjtBQUN2QixVQUFJLEtBQUtMLE9BQVQsRUFBa0I7QUFDaEI7QUFDQUssUUFBQUEsTUFBTSxDQUFDbUMsS0FBUDtBQUNBbkMsUUFBQUEsTUFBTSxDQUFDK0IsTUFBUDtBQUNEO0FBQ0Y7QUFFRDs7QUF0VUY7QUFBQTtBQUFBLFdBdVVFLGtCQUFTO0FBQ1AsV0FBS25DLGtCQUFMLEdBQTBCLElBQTFCO0FBQ0EsV0FBS0MsY0FBTCxHQUFzQixJQUF0Qjs7QUFFQSxVQUFJLEtBQUtGLE9BQVQsRUFBa0I7QUFDaEJqRSxRQUFBQSxTQUFTLENBQUMsS0FBS2lFLE9BQU4sQ0FBVCxDQUF3QmdDLE1BQXhCO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBcFZBO0FBQUE7QUFBQSxXQXFWRSxtQkFBVWdCLFFBQVYsRUFBb0JDLFFBQXBCLEVBQThCO0FBQzVCLFVBQU1DLElBQUksR0FBR0QsUUFBUSxJQUFJLElBQXpCO0FBRUEsV0FBS2hELGtCQUFMLEdBQTBCK0MsUUFBMUI7QUFDQSxXQUFLOUMsY0FBTCxHQUFzQmdELElBQXRCOztBQUVBLFVBQUksS0FBS2xELE9BQVQsRUFBa0I7QUFDaEIsYUFBS21ELGtCQUFMLENBQXdCSCxRQUF4QixFQUFrQ0UsSUFBbEM7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXJXQTtBQUFBO0FBQUEsV0FzV0UsNEJBQW1CRixRQUFuQixFQUE2QkUsSUFBN0IsRUFBbUM7QUFBQTs7QUFDakMsVUFBTTdDLE1BQU07QUFDVjtBQUNOO0FBQ0E7QUFFUXRFLE1BQUFBLFNBQVMsQ0FDUCxLQUFLaUUsT0FERSxFQUVQLGlFQUZPLENBTGI7O0FBV0EsT0FBQ2tELElBQUksSUFBSSxtQkFBVCxFQUE0QnpELElBQTVCLENBQWlDLFlBQU07QUFDckMsWUFBSSxDQUFDLE1BQUksQ0FBQ2dELG9CQUFMLENBQTBCTyxRQUExQixDQUFMLEVBQTBDO0FBQ3hDO0FBQ0Q7O0FBRUQsUUFBQSxNQUFJLENBQUMvQyxrQkFBTCxHQUEwQixJQUExQjtBQUNBLFFBQUEsTUFBSSxDQUFDQyxjQUFMLEdBQXNCLElBQXRCOztBQUVBLGdCQUFROEMsUUFBUjtBQUNFLGVBQUt2RixnQkFBZ0IsQ0FBQ0MsS0FBdEI7QUFDRSxtQkFBTyxNQUFJLENBQUMwRixlQUFMLENBQXFCL0MsTUFBckIsQ0FBUDs7QUFDRixlQUFLNUMsZ0JBQWdCLENBQUNFLE1BQXRCO0FBQ0UsbUJBQU8sTUFBSSxDQUFDMEYsZ0JBQUwsQ0FBc0JoRCxNQUF0QixDQUFQO0FBSko7QUFNRCxPQWREO0FBZUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXZZQTtBQUFBO0FBQUEsV0F3WUUsd0JBQWVBLE1BQWYsRUFBdUI7QUFBQTs7QUFDckIsV0FBS0wsT0FBTCxHQUFlSyxNQUFmO0FBRUFBLE1BQUFBLE1BQU0sQ0FBQ2lELGtCQUFQLENBQTBCLFVBQUNDLEtBQUQsRUFBVztBQUNuQyxZQUFJQSxLQUFLLElBQUkvSCxxQkFBcUIsQ0FBQ2dJLFFBQW5DLEVBQTZDO0FBQzNDLFVBQUEsTUFBSSxDQUFDWixhQUFMO0FBQ0Q7QUFDRixPQUpEOztBQU1BLFVBQUksQ0FBQyxLQUFLSCxvQkFBTCxFQUFMLEVBQWtDO0FBQ2hDO0FBQ0Q7O0FBRUQsV0FBS1Usa0JBQUw7QUFDRTtBQUFrQyxXQUFLbEQsa0JBRHpDLEVBRUUsS0FBS0MsY0FGUDtBQUlEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUEvWkE7QUFBQTtBQUFBLFdBZ2FFLDhCQUFxQnVELFlBQXJCLEVBQW1DO0FBQ2pDLFVBQUksQ0FBQ0EsWUFBTCxFQUFtQjtBQUNqQixlQUFPLEtBQUt4RCxrQkFBTCxLQUE0QixJQUFuQztBQUNEOztBQUNELGFBQU8sS0FBS0Esa0JBQUwsS0FBNEJ3RCxZQUFuQztBQUNEO0FBRUQ7O0FBdmFGO0FBQUE7QUFBQSxXQXdhRSx5QkFBZ0I7QUFDZCxVQUFJLEtBQUsxRSxPQUFMLENBQWEyRSxFQUFqQixFQUFxQjtBQUNuQixhQUFLdEUsU0FBTCxDQUFldUUsWUFBZixDQUE0QixLQUFLNUUsT0FBTCxDQUFhMkUsRUFBekM7QUFDRDtBQUNGO0FBNWFIO0FBQUE7QUFBQSxXQTZGRSxnQkFBY3JGLElBQWQsRUFBb0JDLE1BQXBCLEVBQTRCQywwQkFBNUIsRUFBd0RDLEtBQXhELEVBQStEQyxRQUEvRCxFQUF5RTtBQUN2RSxhQUFPLElBQUlMLGVBQUosQ0FDTEMsSUFESyxFQUVMQyxNQUZLLEVBR0xDLDBCQUhLLEVBSUxDLEtBSkssRUFLTEMsUUFMSyxDQUFQO0FBT0Q7QUFyR0g7O0FBQUE7QUFBQTtBQSthQTs7QUFDQTtBQUNBLFdBQWFtRixnQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0UsNEJBQVl2RixJQUFaLEVBQWtCd0YsTUFBbEIsRUFBMEI7QUFBQTs7QUFDeEI7QUFDQSxTQUFLL0UsS0FBTCxHQUFhVCxJQUFiOztBQUVBO0FBQ0EsU0FBS3lGLE9BQUwsR0FBZUQsTUFBZjs7QUFFQTtBQUNBLFNBQUs3RSxNQUFMLEdBQWM3RCxRQUFRLENBQUM0SSxRQUFULENBQWtCLEtBQUtELE9BQUwsQ0FBYUUsR0FBL0IsQ0FBZDs7QUFFQTtBQUNBLFNBQUtDLGVBQUwsR0FBdUIsS0FBS0MsOEJBQUwsRUFBdkI7O0FBRUE7QUFDQSxTQUFLQyxlQUFMLEdBQ0U3SCxvQkFBb0IsQ0FBQ3VILE1BQU0sQ0FBQ0csR0FBUixDQUFwQixJQUNDbkgsY0FBYyxDQUFDZ0gsTUFBTSxDQUFDRyxHQUFSLEVBQWEscUNBQWIsQ0FBZCxJQUNDekgsT0FBTyxDQUFDOEIsSUFBRCxFQUFPLDhCQUFQLENBSFg7QUFLQStGLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZaEcsSUFBSSxDQUFDcUYsRUFBakIsRUFBcUIsS0FBS1MsZUFBMUI7O0FBRUE7QUFDQSxTQUFLRyxRQUFMLEdBQWdCLElBQWhCOztBQUVBO0FBQ0EsU0FBS2xGLFNBQUwsR0FBaUJtRixpQkFBaUIsQ0FBQ0MsTUFBbEIsRUFBakI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXZDQTtBQUFBO0FBQUE7QUE0Q0U7QUFDRjtBQUNBO0FBQ0E7QUFDRSx1Q0FBMEI7QUFBQTs7QUFDeEIsYUFBTy9DLE9BQU8sQ0FBQ2dELEdBQVIsQ0FDTCxLQUFLQyxtQkFBTCxHQUEyQnRJLEdBQTNCLENBQStCLFVBQUNpRSxNQUFEO0FBQUEsZUFDN0IsTUFBSSxDQUFDOEQsZUFBTCxHQUNJOUQsTUFBTSxDQUFDc0UsY0FBUCxFQURKLEdBRUl0RSxNQUFNLENBQUN1RSxlQUFQLEVBSHlCO0FBQUEsT0FBL0IsQ0FESyxDQUFQO0FBT0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE3REE7QUFBQTtBQUFBLFdBOERFLDBCQUFpQjtBQUNmLGFBQU9uRCxPQUFPLENBQUNnRCxHQUFSLENBQ0wsS0FBS0MsbUJBQUwsR0FBMkJ0SSxHQUEzQixDQUErQixVQUFDaUUsTUFBRDtBQUFBLGVBQVlBLE1BQU0sQ0FBQ3NFLGNBQVAsRUFBWjtBQUFBLE9BQS9CLENBREssQ0FBUDtBQUdEO0FBRUQ7O0FBcEVGO0FBQUE7QUFBQSxXQXFFRSxxQkFBWTtBQUNWLFVBQUksS0FBS1IsZUFBVCxFQUEwQjtBQUN4QjtBQUNEOztBQUNELFdBQUtVLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUN6RSxNQUFEO0FBQUEsZUFBWUEsTUFBTSxDQUFDbUMsS0FBUCxFQUFaO0FBQUEsT0FBM0I7QUFDRDtBQUVEOztBQTVFRjtBQUFBO0FBQUEsV0E2RUUscUJBQVk7QUFDVixXQUFLcUMsV0FBTCxHQUFtQkMsT0FBbkIsQ0FBMkIsVUFBQ3pFLE1BQUQ7QUFBQSxlQUFZQSxNQUFNLENBQUMrQixNQUFQLEVBQVo7QUFBQSxPQUEzQjtBQUNEO0FBRUQ7O0FBakZGO0FBQUE7QUFBQSxXQWtGRSxxQkFBWTtBQUNWLFVBQUksQ0FBQyxLQUFLa0MsUUFBVixFQUFvQjtBQUNsQjtBQUNBO0FBQ0Q7O0FBQ0QsV0FBS08sV0FBTCxHQUFtQkMsT0FBbkIsQ0FBMkIsVUFBQ3pFLE1BQUQ7QUFBQSxlQUFZQSxNQUFNLENBQUMyQixNQUFQLEVBQVo7QUFBQSxPQUEzQjtBQUNEO0FBRUQ7O0FBMUZGO0FBQUE7QUFBQSxXQTJGRSxvQkFBVztBQUNULFVBQUksQ0FBQyxLQUFLc0MsUUFBTixJQUFrQixLQUFLSCxlQUEzQixFQUE0QztBQUMxQztBQUNEOztBQUNELFdBQUtVLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUN6RSxNQUFEO0FBQUEsZUFBWUEsTUFBTSxDQUFDd0MsS0FBUCxFQUFaO0FBQUEsT0FBM0I7QUFDRDtBQUVEOztBQWxHRjtBQUFBO0FBQUEsV0FtR0UscUJBQVk7QUFDVixVQUFJLENBQUMsS0FBS3lCLFFBQU4sSUFBa0IsS0FBS0gsZUFBM0IsRUFBNEM7QUFDMUM7QUFDRDs7QUFDRCxXQUFLVSxXQUFMLEdBQW1CQyxPQUFuQixDQUEyQixVQUFDekUsTUFBRDtBQUFBLGVBQVlBLE1BQU0sQ0FBQzBDLE1BQVAsRUFBWjtBQUFBLE9BQTNCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE3R0E7QUFBQTtBQUFBLFdBOEdFLCtCQUFzQjtBQUNwQixhQUFPLEtBQUs4QixXQUFMLEdBQW1CRSxJQUFuQixDQUF3QixVQUFDMUUsTUFBRDtBQUFBLGVBQVlBLE1BQU0sQ0FBQzBCLFVBQVAsRUFBWjtBQUFBLE9BQXhCLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXJIQTtBQUFBO0FBQUEsV0FzSEUsdUJBQWM7QUFDWixhQUFPaEcsU0FBUyxDQUFDLEtBQUt1SSxRQUFOLEVBQWdCLHlDQUFoQixDQUFoQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWxJQTtBQUFBO0FBQUEsV0FtSUUsK0JBQXNCO0FBQUE7O0FBQ3BCLFVBQUksQ0FBQyxLQUFLQSxRQUFWLEVBQW9CO0FBQ2xCLGFBQUtBLFFBQUwsR0FBZ0JVLEtBQUssQ0FBQ0MsU0FBTixDQUFnQjdJLEdBQWhCLENBQ2I4SSxJQURhLENBRVp6SSxzQkFBc0IsQ0FBQyxLQUFLcUMsS0FBTixFQUFhMUIsNEJBQWIsQ0FGVixFQUdaLFVBQUMrSCxFQUFELEVBQVE7QUFDTixjQUFNekcsTUFBTSxHQUFHLE1BQUksQ0FBQzBHLFVBQUwsQ0FBZ0JELEVBQWhCLENBQWY7O0FBQ0EsY0FBSSxDQUFDekcsTUFBTCxFQUFhO0FBQ1gsbUJBQU8sSUFBUDtBQUNEOztBQUNELGlCQUFPLE1BQUksQ0FBQzJHLGFBQUwsQ0FBbUI7QUFDeEIzRyxZQUFBQSxNQUFNLEVBQU5BLE1BRHdCO0FBRXhCQyxZQUFBQSxNQUFNLEVBQUV3RyxFQUZnQjtBQUd4QnRHLFlBQUFBLFlBQVksRUFBRWpCLHlCQUF5QixDQUFDLE1BQUksQ0FBQ2tCLEtBQU4sRUFBYXFHLEVBQWIsQ0FIZjtBQUl4QjlELFlBQUFBLGVBQWUsRUFBRSxNQUFJLENBQUNpRSxtQkFBTCxDQUF5QkgsRUFBekIsQ0FKTztBQUt4QnZHLFlBQUFBLElBQUksRUFBRSxNQUFJLENBQUMyRywrQkFBTCxDQUFxQ0osRUFBckMsRUFBeUN6RyxNQUF6QztBQUxrQixXQUFuQixDQUFQO0FBT0QsU0FmVyxFQWlCYjhHLE1BakJhLENBa0JaUixLQUFLLENBQUNDLFNBQU4sQ0FBZ0I3SSxHQUFoQixDQUFvQjhJLElBQXBCLENBQ0UsS0FBS3BHLEtBQUwsQ0FBVzJHLGdCQUFYLENBQ0UseUNBREYsQ0FERixFQUlFLFVBQUNOLEVBQUQ7QUFBQSxpQkFDRSxNQUFJLENBQUNFLGFBQUwsQ0FBbUI7QUFDakIxRyxZQUFBQSxNQUFNLEVBQUV3RyxFQURTO0FBRWpCdEcsWUFBQUEsWUFBWSxFQUFFakIseUJBQXlCLENBQUMsTUFBSSxDQUFDa0IsS0FBTixFQUFhcUcsRUFBYixDQUZ0QjtBQUdqQjtBQUNBO0FBQ0F2RyxZQUFBQSxJQUFJO0FBQUU7QUFBaUN6QyxZQUFBQSxrQkFBa0IsQ0FBQ2dKLEVBQUQ7QUFMeEMsV0FBbkIsQ0FERjtBQUFBLFNBSkYsQ0FsQlksRUFnQ2JPLE1BaENhLENBZ0NOQyxPQWhDTSxDQUFoQjtBQWlDRDs7QUFDRCxhQUFPNUosU0FBUyxDQUFDLEtBQUt1SSxRQUFOLENBQWhCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE3S0E7QUFBQTtBQUFBLFdBOEtFLHVCQUFjaEcsTUFBZCxFQUFzQjtBQUNwQixhQUFPRixlQUFlLENBQUNvRyxNQUFoQixDQUNMLEtBQUsxRixLQURBLEVBRUxSLE1BRkssRUFHTHZDLFNBQVMsQ0FBQyxLQUFLa0ksZUFBTixDQUhKLEVBSUwsS0FBS2pGLE1BSkEsRUFLTCxLQUFLSSxTQUxBLENBQVA7QUFPRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE3TEE7QUFBQTtBQUFBLFdBOExFLHlDQUFnQytGLEVBQWhDLEVBQW9DekcsTUFBcEMsRUFBNEM7QUFDMUMsVUFBTWtILFlBQVksR0FBRztBQUNuQnpHLFFBQUFBLE1BQU0sRUFBRWdHLEVBRFc7QUFFbkJoRixRQUFBQSxLQUFLLEVBQUV6QixNQUFNLENBQUN5QixLQUFQLElBQWdCLENBRko7QUFHbkJ3QixRQUFBQSxRQUFRLEVBQUVqRCxNQUFNLENBQUNpRCxRQUFQLElBQW1CLENBSFY7QUFJbkJDLFFBQUFBLE1BQU0sRUFBRWxELE1BQU0sQ0FBQ2tELE1BQVAsSUFBaUJ2RSxjQUpOO0FBTW5CO0FBQ0E7QUFDQXlDLFFBQUFBLFNBQVMsRUFBRTtBQVJRLE9BQXJCOztBQVdBLFVBQUlxRixFQUFFLENBQUNySCxZQUFILENBQWdCZCxrQ0FBaEIsQ0FBSixFQUF5RDtBQUN2RDRJLFFBQUFBLFlBQVksQ0FBQ2pFLFFBQWIsR0FBd0JoRixlQUFlLENBQ3JDd0ksRUFBRSxDQUFDbkgsWUFBSCxDQUFnQmhCLGtDQUFoQixDQURxQyxFQUVyQzRJLFlBQVksQ0FBQ2pFLFFBRndCLENBQXZDO0FBSUQ7O0FBRUQsVUFBSXdELEVBQUUsQ0FBQ3JILFlBQUgsQ0FBZ0JiLCtCQUFoQixDQUFKLEVBQXNEO0FBQ3BEMkksUUFBQUEsWUFBWSxDQUFDekYsS0FBYixHQUFxQnhELGVBQWUsQ0FDbEN3SSxFQUFFLENBQUNuSCxZQUFILENBQWdCZiwrQkFBaEIsQ0FEa0MsRUFFbEMySSxZQUFZLENBQUN6RixLQUZxQixDQUFwQztBQUlEOztBQUVELFVBQUlnRixFQUFFLENBQUNySCxZQUFILENBQWdCWCx5Q0FBaEIsQ0FBSixFQUFnRTtBQUM5RHlJLFFBQUFBLFlBQVksQ0FBQ2hFLE1BQWIsR0FBc0J1RCxFQUFFLENBQUNuSCxZQUFILENBQ3BCYix5Q0FEb0IsQ0FBdEI7QUFHRDs7QUFFRCxhQUFPeUksWUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBcE9BO0FBQUE7QUFBQSxXQXFPRSwwQ0FBaUM7QUFBQTs7QUFDL0IsYUFBT3pLLFFBQVEsQ0FBQzBLLGFBQVQsQ0FBdUIsS0FBSy9CLE9BQUwsQ0FBYUUsR0FBcEMsRUFDSjhCLHNCQURJLENBQ21CLEtBQUtoQyxPQUR4QixFQUNpQyxlQURqQyxFQUVKckUsSUFGSSxDQUVDO0FBQUEsZUFBTXRFLFFBQVEsQ0FBQzRLLHNCQUFULENBQWdDLE1BQUksQ0FBQ2pILEtBQXJDLENBQU47QUFBQSxPQUZELEVBR0pXLElBSEksQ0FHQyxVQUFDdUcsbUJBQUQ7QUFBQSxlQUNKQSxtQkFBbUIsQ0FBQ0MsYUFBcEIsQ0FBa0M7QUFDaENDLFVBQUFBLEtBQUssRUFBRSxNQUFJLENBQUNwSCxLQURvQjtBQUVoQ3FILFVBQUFBLFlBQVksRUFBRTtBQUZrQixTQUFsQyxDQURJO0FBQUEsT0FIRCxDQUFQO0FBU0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFwUEE7QUFBQTtBQUFBLFdBcVBFLG9CQUFXaEIsRUFBWCxFQUFlO0FBQ2IsVUFBTWlCLElBQUksR0FBR2pCLEVBQUUsQ0FBQ25ILFlBQUgsQ0FBZ0JqQix5QkFBaEIsQ0FBYjs7QUFFQSxVQUFJLENBQUM5QixPQUFPLENBQUNtTCxJQUFELENBQVosRUFBb0I7QUFDbEJwSyxRQUFBQSxJQUFJLEdBQUdrQyxJQUFQLENBQ0VwQixHQURGLEVBRUUsU0FGRixFQUdFQyx5QkFIRixFQUlFLFFBSkYsRUFLRXFKLElBTEYsRUFNRSxhQU5GLEVBT0VqQixFQVBGO0FBU0EsZUFBTyxJQUFQO0FBQ0Q7O0FBRUQ7QUFDQWpLLE1BQUFBLGlCQUFpQixDQUFDaUssRUFBRCxFQUFLaUIsSUFBTCxDQUFqQjtBQUVBLGFBQU9uTCxPQUFPLENBQUNtTCxJQUFELENBQWQ7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBL1FBO0FBQUE7QUFBQSxXQWdSRSw2QkFBb0JqQixFQUFwQixFQUF3QjtBQUN0QixVQUFNa0IsT0FBTyxHQUFHLEVBQWhCO0FBRUFyTCxNQUFBQSx3QkFBd0IsQ0FBQzhKLE9BQXpCLENBQWlDLFVBQUNzQixJQUFELEVBQVU7QUFDekMsWUFBSSxDQUFDakIsRUFBRSxDQUFDckgsWUFBSCxDQUFnQnNJLElBQWhCLENBQUwsRUFBNEI7QUFDMUI7QUFDRDs7QUFDRCxZQUFNRSxLQUFLLEdBQUdDLFVBQVUsQ0FBQ3BCLEVBQUUsQ0FBQ25ILFlBQUgsQ0FBZ0JvSSxJQUFoQixDQUFELENBQXhCOztBQUVBLFlBQUlJLEtBQUssQ0FBQ0YsS0FBRCxDQUFMLElBQWdCQSxLQUFLLElBQUksQ0FBN0IsRUFBZ0M7QUFDOUJ0SyxVQUFBQSxJQUFJLEdBQUdrQyxJQUFQLENBQ0VwQixHQURGLEVBRUVzSixJQUZGLEVBR0Usd0VBSEYsRUFJRWpCLEVBSkY7QUFNQTtBQUNEOztBQUVEa0IsUUFBQUEsT0FBTyxDQUFDRCxJQUFELENBQVAsR0FBZ0JFLEtBQWhCO0FBQ0QsT0FqQkQ7QUFtQkEsYUFBT0QsT0FBUDtBQUNEO0FBdlNIO0FBQUE7QUFBQSxXQXdDRSxnQkFBY2hJLElBQWQsRUFBb0J3RixNQUFwQixFQUE0QjRDLGFBQTVCLEVBQTJDO0FBQ3pDLGFBQU8sSUFBSTdDLGdCQUFKLENBQXFCdkYsSUFBckIsRUFBMkJ3RixNQUEzQixDQUFQO0FBQ0Q7QUExQ0g7O0FBQUE7QUFBQTs7QUEwU0E7QUFDQSxXQUFhVSxpQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLCtCQUFjO0FBQUE7O0FBQ1o7QUFDQSxTQUFLbUMscUJBQUwsR0FBNkJ0SyxHQUFHLEVBQWhDOztBQUVBO0FBQ0EsU0FBS3VLLHNCQUFMLEdBQThCdkssR0FBRyxFQUFqQztBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFoQkE7QUFBQTtBQUFBO0FBcUJFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0UsMEJBQWFzSCxFQUFiLEVBQWlCO0FBQ2YsVUFBSUEsRUFBRSxJQUFJLEtBQUtnRCxxQkFBZixFQUFzQztBQUNwQzNLLFFBQUFBLFNBQVMsQ0FBQyxLQUFLNEssc0JBQUwsQ0FBNEJqRCxFQUE1QixDQUFELENBQVQ7QUFFQSxlQUFPLEtBQUtnRCxxQkFBTCxDQUEyQmhELEVBQTNCLENBQVA7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFyQ0E7QUFBQTtBQUFBLFdBc0NFLGlCQUFRQSxFQUFSLEVBQVk7QUFDVixVQUFJLEVBQUVBLEVBQUUsSUFBSSxLQUFLZ0QscUJBQWIsQ0FBSixFQUF5QztBQUN2QyxZQUFNRSxRQUFRLEdBQUcsSUFBSTdMLFFBQUosRUFBakI7QUFDQSxhQUFLMkwscUJBQUwsQ0FBMkJoRCxFQUEzQixJQUFpQ2tELFFBQVEsQ0FBQ0MsT0FBMUM7QUFDQSxhQUFLRixzQkFBTCxDQUE0QmpELEVBQTVCLElBQWtDa0QsUUFBUSxDQUFDbEYsT0FBM0M7QUFDRDs7QUFDRCxhQUFPLEtBQUtnRixxQkFBTCxDQUEyQmhELEVBQTNCLENBQVA7QUFDRDtBQTdDSDtBQUFBO0FBQUEsV0FpQkUsa0JBQWdCO0FBQ2QsYUFBTyxJQUFJYSxpQkFBSixFQUFQO0FBQ0Q7QUFuQkg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0RlZmVycmVkfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge1xuICBQUkVTRVRfT1BUSU9OX0FUVFJJQlVURVMsXG4gIHByZXNldHMsXG4gIHNldFN0eWxlRm9yUHJlc2V0LFxufSBmcm9tICcuL2FuaW1hdGlvbi1wcmVzZXRzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7XG4gIFN0b3J5QW5pbWF0aW9uQ29uZmlnRGVmLFxuICBTdG9yeUFuaW1hdGlvbkRpbXNEZWYsXG4gIFN0b3J5QW5pbWF0aW9uUHJlc2V0RGVmLFxuICBXZWJBbmltYXRpb25EZWYsXG4gIFdlYkFuaW1hdGlvblBsYXlTdGF0ZSxcbiAgV2ViQW5pbWF0aW9uU2VsZWN0b3JEZWYsXG4gIFdlYkFuaW1hdGlvblRpbWluZ0RlZixcbiAgV2ViS2V5ZnJhbWVzQ3JlYXRlRm5EZWYsXG4gIFdlYktleWZyYW1lc0RlZixcbn0gZnJvbSAnLi9hbmltYXRpb24tdHlwZXMnO1xuaW1wb3J0IHthc3NlcnREb2VzTm90Q29udGFpbkRpc3BsYXl9IGZyb20gJy4uLy4uLy4uL3NyYy9hc3NlcnQtZGlzcGxheSc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyLCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7ZXNjYXBlQ3NzU2VsZWN0b3JJZGVudH0gZnJvbSAnI2NvcmUvZG9tL2Nzcy1zZWxlY3RvcnMnO1xuaW1wb3J0IHtnZXRDaGlsZEpzb25Db25maWd9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge21hcCwgb21pdH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7cHJlZmVyc1JlZHVjZWRNb3Rpb259IGZyb20gJyNjb3JlL2RvbS9tZWRpYS1xdWVyeS1wcm9wcyc7XG5pbXBvcnQge1xuICBtYXRjaGVzLFxuICBzY29wZWRRdWVyeVNlbGVjdG9yLFxuICBzY29wZWRRdWVyeVNlbGVjdG9yQWxsLFxufSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtzZXRTdHlsZXN9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge3RpbWVTdHJUb01pbGxpcywgdW5zY2FsZWRDbGllbnRSZWN0fSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5cbmNvbnN0IFRBRyA9ICdBTVAtU1RPUlknO1xuXG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgQU5JTUFURV9JTl9BVFRSSUJVVEVfTkFNRSA9ICdhbmltYXRlLWluJztcbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEFOSU1BVEVfSU5fRFVSQVRJT05fQVRUUklCVVRFX05BTUUgPSAnYW5pbWF0ZS1pbi1kdXJhdGlvbic7XG4vKiogQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBBTklNQVRFX0lOX0RFTEFZX0FUVFJJQlVURV9OQU1FID0gJ2FuaW1hdGUtaW4tZGVsYXknO1xuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgQU5JTUFURV9JTl9BRlRFUl9BVFRSSUJVVEVfTkFNRSA9ICdhbmltYXRlLWluLWFmdGVyJztcbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEFOSU1BVEVfSU5fVElNSU5HX0ZVTkNUSU9OX0FUVFJJQlVURV9OQU1FID0gJ2FuaW1hdGUtaW4tdGltaW5nLWZ1bmN0aW9uJztcbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IEFOSU1BVEFCTEVfRUxFTUVOVFNfU0VMRUNUT1IgPSBgWyR7QU5JTUFURV9JTl9BVFRSSUJVVEVfTkFNRX1dYDtcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgREVGQVVMVF9FQVNJTkcgPSAnY3ViaWMtYmV6aWVyKDAuNCwgMC4wLCAwLjIsIDEpJztcblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogVE9ETyhhbGFub3JvemNvKTogbWF5YmUgbWVtb2l6ZT9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0FuaW1hdGlvbnMoZWxlbWVudCkge1xuICBjb25zdCBzZWxlY3RvciA9IGAke0FOSU1BVEFCTEVfRUxFTUVOVFNfU0VMRUNUT1J9LD5hbXAtc3RvcnktYW5pbWF0aW9uYDtcbiAgcmV0dXJuICEhc2NvcGVkUXVlcnlTZWxlY3RvcihlbGVtZW50LCBzZWxlY3Rvcik7XG59XG5cbi8qKiBAZW51bSB7bnVtYmVyfSAqL1xuY29uc3QgUGxheWJhY2tBY3Rpdml0eSA9IHtcbiAgU1RBUlQ6IDAsXG4gIEZJTklTSDogMSxcbn07XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gcm9vdFxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7P3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0U2VxdWVuY2luZ1N0YXJ0QWZ0ZXJJZChyb290LCBlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudC5oYXNBdHRyaWJ1dGUoQU5JTUFURV9JTl9BRlRFUl9BVFRSSUJVVEVfTkFNRSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBkZXBlbmRlbmN5SWQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShBTklNQVRFX0lOX0FGVEVSX0FUVFJJQlVURV9OQU1FKTtcblxuICBpZiAoIXJvb3QucXVlcnlTZWxlY3RvcihgIyR7ZXNjYXBlQ3NzU2VsZWN0b3JJZGVudChkZXBlbmRlbmN5SWQpfWApKSB7XG4gICAgdXNlcigpLndhcm4oXG4gICAgICBUQUcsXG4gICAgICBgVGhlIGF0dHJpYnV0ZSAnJHtBTklNQVRFX0lOX0FGVEVSX0FUVFJJQlVURV9OQU1FfScgaW4gdGFnIGAgK1xuICAgICAgICBgJyR7ZWxlbWVudC50YWdOYW1lfScgaXMgc2V0IHRvIHRoZSBpbnZhbGlkIHZhbHVlIGAgK1xuICAgICAgICBgJyR7ZGVwZW5kZW5jeUlkfScuIE5vIGNoaWxkcmVuIG9mIHBhcmVudGluZyAnYW1wLXN0b3J5LXBhZ2UnIGAgK1xuICAgICAgICBgZXhpc3Qgd2l0aCBpZCAke2RlcGVuZGVuY3lJZH0uYFxuICAgICk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZGVwZW5kZW5jeUlkO1xufVxuXG4vKiogV3JhcHMgV2ViQW5pbWF0aW9uUnVubmVyIGZvciBzdG9yeSBwYWdlIGVsZW1lbnRzLiAqL1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblJ1bm5lciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYWdlXG4gICAqIEBwYXJhbSB7IVN0b3J5QW5pbWF0aW9uQ29uZmlnRGVmfSBjb25maWdcbiAgICogQHBhcmFtIHshUHJvbWlzZTwhLi4vLi4vYW1wLWFuaW1hdGlvbi8wLjEvd2ViLWFuaW1hdGlvbnMuQnVpbGRlcj59IHdlYkFuaW1hdGlvbkJ1aWxkZXJQcm9taXNlXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZzeW5jLWltcGwuVnN5bmN9IHZzeW5jXG4gICAqIEBwYXJhbSB7IUFuaW1hdGlvblNlcXVlbmNlfSBzZXF1ZW5jZVxuICAgKi9cbiAgY29uc3RydWN0b3IocGFnZSwgY29uZmlnLCB3ZWJBbmltYXRpb25CdWlsZGVyUHJvbWlzZSwgdnN5bmMsIHNlcXVlbmNlKSB7XG4gICAgY29uc3Qge3ByZXNldCwgc291cmNlLCBzcGVjLCBzdGFydEFmdGVySWR9ID0gY29uZmlnO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMucGFnZV8gPSBwYWdlO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMuc291cmNlXyA9IHNvdXJjZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLnZzeW5jXyA9IHZzeW5jO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5wcmVzZXRUYXJnZXRfID0gISFwcmVzZXQgPyBkZXYoKS5hc3NlcnRFbGVtZW50KHNwZWMudGFyZ2V0KSA6IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5zZXF1ZW5jZV8gPSBzZXF1ZW5jZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qgez9zdHJpbmd9ICovXG4gICAgdGhpcy5zdGFydEFmdGVySWRfID0gc3RhcnRBZnRlcklkO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVByb21pc2U8IVdlYkFuaW1hdGlvbkRlZj59ICovXG4gICAgdGhpcy5yZXNvbHZlZFNwZWNQcm9taXNlXyA9IHRoaXMucmVzb2x2ZVNwZWNfKGNvbmZpZyk7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSBAY29uc3QgeyFQcm9taXNlPFxuICAgICAqICAgICEuLi8uLi9hbXAtYW5pbWF0aW9uLzAuMS9ydW5uZXJzL2FuaW1hdGlvbi1ydW5uZXIuQW5pbWF0aW9uUnVubmVyPn1cbiAgICAgKi9cbiAgICB0aGlzLnJ1bm5lclByb21pc2VfID0gdGhpcy5yZXNvbHZlZFNwZWNQcm9taXNlXy50aGVuKCh3ZWJBbmltRGVmKSA9PlxuICAgICAgd2ViQW5pbWF0aW9uQnVpbGRlclByb21pc2UudGhlbigoYnVpbGRlcikgPT5cbiAgICAgICAgYnVpbGRlci5jcmVhdGVSdW5uZXIod2ViQW5pbURlZilcbiAgICAgIClcbiAgICApO1xuXG4gICAgLyoqXG4gICAgICogRXZhbHVhdGVkIHNldCBvZiBDU1MgcHJvcGVydGllcyBmb3IgZmlyc3QgYW5pbWF0aW9uIGZyYW1lLlxuICAgICAqIEBwcml2YXRlIEBjb25zdCB7IVByb21pc2U8P09iamVjdDxzdHJpbmcsICo+Pn1cbiAgICAgKi9cbiAgICB0aGlzLmZpcnN0RnJhbWVQcm9wc18gPSB0aGlzLnJlc29sdmVkU3BlY1Byb21pc2VfLnRoZW4oKHNwZWMpID0+IHtcbiAgICAgIGNvbnN0IHtrZXlmcmFtZXN9ID0gc3BlYztcbiAgICAgIGlmICghdGhpcy5wcmVzZXRUYXJnZXRfKSB7XG4gICAgICAgIC8vIEl0J3Mgb25seSBwb3NzaWJsZSB0byBiYWNrZmlsbCB0aGUgZmlyc3QgZnJhbWUgaWYgd2UgY2FuIGRlZmluZSBpdFxuICAgICAgICAvLyBhcyBuYXRpdmUgQ1NTLiA8YW1wLWFuaW1hdGlvbj4gaGFzIENTUyBleHRlbnNpb25zIGFuZCBjYW4gaGF2ZVxuICAgICAgICAvLyBrZXlmcmFtZXMgZGVmaW5lZCBpbiBhIHdheSB0aGF0IHByZXZlbnRzIHVzIGZyb20gZG9pbmcgdGhpcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVG8gYXZvaWQgdmlzdWFsIGp1bXBzLCB0aGlzIGRlcGVuZHMgb24gdGhlIGF1dGhvciBwcm9wZXJseVxuICAgICAgICAvLyBkZWZpbmluZyB0aGVpciBDU1Mgc28gdGhhdCB0aGUgaW5pdGlhbCB2aXN1YWwgc3RhdGUgbWF0Y2hlcyB0aGVcbiAgICAgICAgLy8gaW5pdGlhbCBhbmltYXRpb24gZnJhbWUuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZGV2QXNzZXJ0KFxuICAgICAgICAha2V5ZnJhbWVzWzBdLm9mZnNldCxcbiAgICAgICAgJ0ZpcnN0IGtleWZyYW1lIG9mZnNldCBmb3IgYW5pbWF0aW9uIHByZXNldCBzaG91bGQgYmUgMCBvciB1bmRlZmluZWQnXG4gICAgICApO1xuICAgICAgcmV0dXJuIG9taXQoa2V5ZnJhbWVzWzBdLCBbJ29mZnNldCddKTtcbiAgICB9KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4uLy4uL2FtcC1hbmltYXRpb24vMC4xL3J1bm5lcnMvYW5pbWF0aW9uLXJ1bm5lci5BbmltYXRpb25SdW5uZXJ9ICovXG4gICAgdGhpcy5ydW5uZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P1BsYXliYWNrQWN0aXZpdHl9ICovXG4gICAgdGhpcy5zY2hlZHVsZWRBY3Rpdml0eV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UHJvbWlzZX0gKi9cbiAgICB0aGlzLnNjaGVkdWxlZFdhaXRfID0gbnVsbDtcblxuICAgIGlmICh0aGlzLnByZXNldFRhcmdldF8pIHtcbiAgICAgIGNvbnN0IHtkZWxheX0gPSAvKiogQHR5cGUgeyFXZWJBbmltYXRpb25UaW1pbmdEZWZ9ICovIChzcGVjKTtcbiAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgIGRldigpLmFzc2VydE51bWJlcihkZWxheSkgPj0gMCxcbiAgICAgICAgJ05lZ2F0aXZlIGRlbGF5cyBhcmUgbm90IGFsbG93ZWQgaW4gYW1wLXN0b3J5IFwiYW5pbWF0ZS1pblwiIGFuaW1hdGlvbnMuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLnJ1bm5lclByb21pc2VfLnRoZW4oKHJ1bm5lcikgPT4gdGhpcy5vblJ1bm5lclJlYWR5XyhydW5uZXIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYWdlXG4gICAqIEBwYXJhbSB7IVN0b3J5QW5pbWF0aW9uQ29uZmlnRGVmfSBjb25maWdcbiAgICogQHBhcmFtIHshUHJvbWlzZTwhLi4vLi4vYW1wLWFuaW1hdGlvbi8wLjEvd2ViLWFuaW1hdGlvbnMuQnVpbGRlcj59IHdlYkFuaW1hdGlvbkJ1aWxkZXJQcm9taXNlXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZzeW5jLWltcGwuVnN5bmN9IHZzeW5jXG4gICAqIEBwYXJhbSB7IUFuaW1hdGlvblNlcXVlbmNlfSBzZXF1ZW5jZVxuICAgKiBAcmV0dXJuIHshQW5pbWF0aW9uUnVubmVyfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZShwYWdlLCBjb25maWcsIHdlYkFuaW1hdGlvbkJ1aWxkZXJQcm9taXNlLCB2c3luYywgc2VxdWVuY2UpIHtcbiAgICByZXR1cm4gbmV3IEFuaW1hdGlvblJ1bm5lcihcbiAgICAgIHBhZ2UsXG4gICAgICBjb25maWcsXG4gICAgICB3ZWJBbmltYXRpb25CdWlsZGVyUHJvbWlzZSxcbiAgICAgIHZzeW5jLFxuICAgICAgc2VxdWVuY2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFTdG9yeUFuaW1hdGlvbkRpbXNEZWY+fVxuICAgKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAgICovXG4gIGdldERpbXMoKSB7XG4gICAgcmV0dXJuIHRoaXMudnN5bmNfLm1lYXN1cmVQcm9taXNlKCgpID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5wcmVzZXRUYXJnZXRfKTtcbiAgICAgIGNvbnN0IHRhcmdldFJlY3QgPSB1bnNjYWxlZENsaWVudFJlY3QodGFyZ2V0KTtcbiAgICAgIGNvbnN0IHBhZ2VSZWN0ID0gdW5zY2FsZWRDbGllbnRSZWN0KHRoaXMucGFnZV8pO1xuXG4gICAgICAvLyBUT0RPKGFsYW5vcm96Y28sIGh0dHBzOi8vZ28uYW1wLmRldi9pc3N1ZS8yNzc1OCk6XG4gICAgICAvLyBFeHBvc2UgZXF1aXZhbGVudHMgdG8gPGFtcC1hbmltYXRpb24+XG4gICAgICAvLyAtIHRhcmdldFdpZHRoL3RhcmdldEhlaWdodCBhcmUgYWxyZWFkeSBhdmFpbGFibGUgYXMgd2lkdGgoKS9oZWlnaHQoKVxuICAgICAgLy8gLSBwYWdlV2lkdGgvcGFnZUhlaWdodCBzaG91bGQgYmUgZXhwb3NlZCBhcyB2dy92aFxuICAgICAgLy8gLSB0YXJnZXRYL3RhcmdldFkgc2hvdWxkIGJlIGV4cG9zZWQgc29tZWhvdyAoPylcbiAgICAgIC8vXG4gICAgICAvLyBUT0RPKGFsYW5vcm96Y28sIGh0dHBzOi8vZ28uYW1wLmRldi9pc3N1ZS8yNzc1OCk6XG4gICAgICAvLyBBZnRlciBleHBvc2luZyB0aGVzZSB0byA8YW1wLWFuaW1hdGlvbj4gc3ludGF4LCB3ZVxuICAgICAgLy8gY2FuIGdldCByaWQgb2YgdGhpcyBlbnRpcmUgbWV0aG9kIChhbmQgdGhpcyBhc3luYyBjaGFpbiEpIGlmIHdlIGVuc3VyZVxuICAgICAgLy8gdGhhdCBwcmVzZXRzIGF2b2lkIHZpc3VhbCBqdW1wcyBlaXRoZXIgdmlhOlxuICAgICAgLy8gYSkgZGVmYXVsdCBzdHlsZXMgYW5kL29yXG4gICAgICAvLyBiKSBieSBub3QgdXNpbmcgc3BlY2lhbCA8YW1wLWFuaW1hdGlvbj4gc3ludGF4IGluIGluaXRpYWwga2V5ZnJhbWUuXG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshU3RvcnlBbmltYXRpb25EaW1zRGVmfSAqLyAoe1xuICAgICAgICBwYWdlV2lkdGg6IHBhZ2VSZWN0LndpZHRoLFxuICAgICAgICBwYWdlSGVpZ2h0OiBwYWdlUmVjdC5oZWlnaHQsXG4gICAgICAgIHRhcmdldFdpZHRoOiB0YXJnZXRSZWN0LndpZHRoLFxuICAgICAgICB0YXJnZXRIZWlnaHQ6IHRhcmdldFJlY3QuaGVpZ2h0LFxuICAgICAgICB0YXJnZXRYOiB0YXJnZXRSZWN0LmxlZnQgLSBwYWdlUmVjdC5sZWZ0LFxuICAgICAgICB0YXJnZXRZOiB0YXJnZXRSZWN0LnRvcCAtIHBhZ2VSZWN0LnRvcCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlcyBhIHByZXNldCdzIGtleWZyYW1lcyBmdW5jdGlvbiB1c2luZyBkaW1lbnNpb25zLlxuICAgKiBAcGFyYW0geyFXZWJLZXlmcmFtZXNEZWZ8IVdlYktleWZyYW1lc0NyZWF0ZUZuRGVmfSBrZXlmcmFtZXNPckNyZWF0ZUZuXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICo+PX0ga2V5ZnJhbWVPcHRpb25zXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFXZWJLZXlmcmFtZXNEZWY+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVzb2x2ZVByZXNldEtleWZyYW1lc18oa2V5ZnJhbWVzT3JDcmVhdGVGbiwga2V5ZnJhbWVPcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlmcmFtZXNPckNyZWF0ZUZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXREaW1zKCkudGhlbigoZGltZW5zaW9ucykgPT4ge1xuICAgICAgICBjb25zdCBmbiA9IC8qKiBAdHlwZSB7IVdlYktleWZyYW1lc0NyZWF0ZUZuRGVmfSAqLyAoXG4gICAgICAgICAga2V5ZnJhbWVzT3JDcmVhdGVGblxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZm4oZGltZW5zaW9ucywga2V5ZnJhbWVPcHRpb25zIHx8IHt9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGtleWZyYW1lc09yQ3JlYXRlRm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGFuIGFuaW1hdGlvbiBzcGVjIHRoYXQgbWF5IGJlIGluY29tcGxldGUsIGxpa2UgZnJvbSBhblxuICAgKiBbYW5pbWF0ZS1pbl0gcHJlc2V0LlxuICAgKiBAcGFyYW0geyFTdG9yeUFuaW1hdGlvbkNvbmZpZ0RlZn0gY29uZmlnXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFXZWJBbmltYXRpb25EZWY+fVxuICAgKi9cbiAgcmVzb2x2ZVNwZWNfKGNvbmZpZykge1xuICAgIGNvbnN0IHtrZXlmcmFtZU9wdGlvbnMsIHByZXNldCwgc3BlY30gPSBjb25maWc7XG4gICAgaWYgKCFwcmVzZXQpIHtcbiAgICAgIC8vIFRoaXMgaXMgYW4gYW1wLWFuaW1hdGlvbiBjb25maWcsIHNvIGl0J3MgYWxyZWFkeSBmb3JtZWQgaG93IHRoZVxuICAgICAgLy8gV2ViQW5pbWF0aW9ucyBCdWlsZGVyIHdhbnRzIGl0LlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgvKiogQHR5cGUgeyFXZWJBbmltYXRpb25EZWZ9ICovIChzcGVjKSk7XG4gICAgfVxuICAgIC8vIFRoZSBuZWVkIGZvciB0aGlzIGNhc3QgaXMgYW4gdW5mb3J0dW5hdGUgcmVzdWx0IG9mIHVzaW5nIEBtaXhlcyBpblxuICAgIC8vIFdlYkFuaW1hdGlvbkRlZi4gT3RoZXJ3aXNlIENsb3N1cmUgd2lsbCBub3QgdW5kZXJzdGFuZCB0aGUgdGltaW5nIHByb3BzXG4gICAgLy8gbWl4ZWQgaW4gZnJvbSBhbm90aGVyIHR5cGUuXG4gICAgY29uc3Qge2RlbGF5LCBkdXJhdGlvbiwgZWFzaW5nfSA9IC8qKiBAdHlwZSB7IVdlYkFuaW1hdGlvblRpbWluZ0RlZn0gKi8gKFxuICAgICAgc3BlY1xuICAgICk7XG4gICAgY29uc3Qge3RhcmdldH0gPSAvKiogQHR5cGUgeyFXZWJBbmltYXRpb25TZWxlY3RvckRlZn0gKi8gKHNwZWMpO1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVQcmVzZXRLZXlmcmFtZXNfKHByZXNldC5rZXlmcmFtZXMsIGtleWZyYW1lT3B0aW9ucykudGhlbihcbiAgICAgIChrZXlmcmFtZXMpID0+ICh7XG4gICAgICAgIGtleWZyYW1lcyxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgZmlsbDogJ2ZvcndhcmRzJyxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSBmaXJzdCBhbmltYXRpb24gZnJhbWUgYXMgQ1NTIHByb3BzLiBUaGlzIGlzIHNpbWlsYXIgdG8gZmlsbGluZ1xuICAgKiB0aGUgYW5pbWF0aW9uIGJhY2t3YXJkcywgZXhjZXB0OlxuICAgKiAtIGl0IGV2YWx1YXRlcyBiZWZvcmUgYW1wLWFuaW1hdGlvbiBpcyByZWFkeSB0byBwcmV2ZW50IGEgcmFjZSBhbmQgY2F1c2VcbiAgICogICBhIHZpc3VhbCBqdW1wIGJlZm9yZSBiZWluZyBhYmxlIHRvIGZpbGwgdGhlIGZpcnN0IGZyYW1lXG4gICAqIC0gaXQgYWxsb3dzIGZvciBzZXF1ZW5jaW5nIGJlZm9yZSBhbiBhbmltYXRpb24gaGFzIHN0YXJ0ZWQsIGxpa2Ugd2l0aFxuICAgKiAgIGBhbmltYXRlLWluLWFmdGVyYC5cbiAgICogQHJldHVybiB7IVByb21pc2U8dm9pZD59XG4gICAqL1xuICBhcHBseUZpcnN0RnJhbWUoKSB7XG4gICAgaWYgKHRoaXMuaGFzU3RhcnRlZCgpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucnVubmVyXykge1xuICAgICAgdGhpcy5ydW5uZXJfLmNhbmNlbCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmZpcnN0RnJhbWVQcm9wc18udGhlbigoZmlyc3RGcmFtZVByb3BzKSA9PiB7XG4gICAgICBpZiAoIWZpcnN0RnJhbWVQcm9wcykge1xuICAgICAgICAvLyBUaGVzZSBhcmUgb25seSBhdmFpbGFibGUgd2hlbiB0aGV5IGNhbiBiZSBldmFsdWF0ZWQ6XG4gICAgICAgIC8vIC0gZGVsYXkgaXMgbm90IG5lZ2F0aXZlXG4gICAgICAgIC8vIC0gZmlyc3QgZnJhbWUgaXMgZGVmaW5lZCBpbiBwbGFpbiBDU1MsIHNvIGl0IGRvZXMgbm90IHVzZSBzcGVjaWFsXG4gICAgICAgIC8vICAgPGFtcC1hbmltYXRpb24+IENTUyBzeW50YXgvZXh0ZW5zaW9ucy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgY2FuJ3QgZ3VhcmFudGVlIGFueSBvZiB0aGVzZSBwcm9wZXJ0aWVzIHdoZW4gdXNpbmdcbiAgICAgICAgLy8gPGFtcC1zdG9yeS1hbmltYXRpb24+IGVmZmVjdHMsIGJ1dCB3ZSBjYW4gZG8gaXQgZm9yIG91ciBvd24gcHJlc2V0cy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudnN5bmNfLm11dGF0ZVByb21pc2UoKCkgPT4ge1xuICAgICAgICBzZXRTdHlsZXMoXG4gICAgICAgICAgZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnByZXNldFRhcmdldF8pLFxuICAgICAgICAgIGFzc2VydERvZXNOb3RDb250YWluRGlzcGxheShkZXZBc3NlcnQoZmlyc3RGcmFtZVByb3BzKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIGxhc3QgYW5pbWF0aW9uIGZyYW1lLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIGFwcGx5TGFzdEZyYW1lKCkge1xuICAgIGlmICh0aGlzLnByZXNldFRhcmdldF8pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgdGhpcy5ydW5uZXJQcm9taXNlXy50aGVuKChydW5uZXIpID0+IHtcbiAgICAgIHJ1bm5lci5pbml0KCk7XG4gICAgICBydW5uZXIuZmluaXNoKC8qIHBhdXNlT25FcnJvciAqLyB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBTdGFydHMgb3IgcmVzdW1lcyB0aGUgYW5pbWF0aW9uLiAqL1xuICBzdGFydCgpIHtcbiAgICBpZiAodGhpcy5oYXNTdGFydGVkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnBsYXliYWNrXyhQbGF5YmFja0FjdGl2aXR5LlNUQVJULCB0aGlzLmdldFN0YXJ0V2FpdFByb21pc2VfKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0U3RhcnRXYWl0UHJvbWlzZV8oKSB7XG4gICAgaWYgKHRoaXMuc3RhcnRBZnRlcklkXykge1xuICAgICAgcmV0dXJuIHRoaXMuc2VxdWVuY2VfLndhaXRGb3IodGhpcy5zdGFydEFmdGVySWRfKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uLy4uL2FtcC1hbmltYXRpb24vMC4xL3J1bm5lcnMvYW5pbWF0aW9uLXJ1bm5lci5BbmltYXRpb25SdW5uZXJ9IHJ1bm5lclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnRXaGVuUmVhZHlfKHJ1bm5lcikge1xuICAgIHJ1bm5lci5zdGFydCgpO1xuICB9XG5cbiAgLyoqIEByZXR1cm4ge2Jvb2xlYW59ICovXG4gIGhhc1N0YXJ0ZWQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuaXNBY3Rpdml0eVNjaGVkdWxlZF8oUGxheWJhY2tBY3Rpdml0eS5TVEFSVCkgfHxcbiAgICAgICghIXRoaXMucnVubmVyXyAmJlxuICAgICAgICBkZXZBc3NlcnQodGhpcy5ydW5uZXJfKS5nZXRQbGF5U3RhdGUoKSA9PSBXZWJBbmltYXRpb25QbGF5U3RhdGUuUlVOTklORylcbiAgICApO1xuICB9XG5cbiAgLyoqIEZvcmNlLWZpbmlzaGVzIGFsbCBhbmltYXRpb25zLiAqL1xuICBmaW5pc2goKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5lcl8pIHtcbiAgICAgIHRoaXMubm90aWZ5RmluaXNoXygpO1xuICAgIH1cbiAgICB0aGlzLnBsYXliYWNrXyhQbGF5YmFja0FjdGl2aXR5LkZJTklTSCk7XG4gIH1cblxuICAvKiogUGF1c2VzIHRoZSBhbmltYXRpb24uICovXG4gIHBhdXNlKCkge1xuICAgIC8vIEFuaW1hdGlvbiBoYXNuJ3Qgc3RhcnRlZCB5ZXQgc2luY2UgaXQncyB3YWl0aW5nIGZvciBhIHNlcXVlbmNlZFxuICAgIC8vIGFuaW1hdGlvbi5cbiAgICBpZiAodGhpcy5zY2hlZHVsZWRXYWl0XyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJ1bm5lcl8pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMucnVubmVyXy5wYXVzZSgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBUaGlzIGZhaWxzIHdoZW4gdGhlIHN0b3J5IGFuaW1hdGlvbnMgYXJlIG5vdCBpbml0aWFsaXplZCBhbmQgcGF1c2UgaXMgY2FsbGVkLiBDb250ZXh0IG9uICMzNTE2MS5cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUmVzdW1lcyB0aGUgYW5pbWF0aW9uLiAqL1xuICByZXN1bWUoKSB7XG4gICAgLy8gQW5pbWF0aW9uIGhhc24ndCBzdGFydGVkIHlldCBzaW5jZSBpdCdzIHdhaXRpbmcgZm9yIGEgc2VxdWVuY2VkXG4gICAgLy8gYW5pbWF0aW9uLlxuICAgIGlmICh0aGlzLnNjaGVkdWxlZFdhaXRfICE9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucnVubmVyXykge1xuICAgICAgdGhpcy5ydW5uZXJfLnJlc3VtZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi9hbXAtYW5pbWF0aW9uLzAuMS9ydW5uZXJzL2FuaW1hdGlvbi1ydW5uZXIuQW5pbWF0aW9uUnVubmVyfSBydW5uZXJcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZpbmlzaFdoZW5SZWFkeV8ocnVubmVyKSB7XG4gICAgaWYgKHRoaXMucnVubmVyXykge1xuICAgICAgLy8gSW5pdCBvciBuby1vcCBpZiB0aGUgcnVubmVyIHdhcyBhbHJlYWR5IHJ1bm5pbmcuXG4gICAgICBydW5uZXIuc3RhcnQoKTtcbiAgICAgIHJ1bm5lci5maW5pc2goKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2FuY2VscyBhbmltYXRpb24uICovXG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLnNjaGVkdWxlZEFjdGl2aXR5XyA9IG51bGw7XG4gICAgdGhpcy5zY2hlZHVsZWRXYWl0XyA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5ydW5uZXJfKSB7XG4gICAgICBkZXZBc3NlcnQodGhpcy5ydW5uZXJfKS5jYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshUGxheWJhY2tBY3Rpdml0eX0gYWN0aXZpdHlcbiAgICogQHBhcmFtIHshUHJvbWlzZT19IG9wdF93YWl0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwbGF5YmFja18oYWN0aXZpdHksIG9wdF93YWl0KSB7XG4gICAgY29uc3Qgd2FpdCA9IG9wdF93YWl0IHx8IG51bGw7XG5cbiAgICB0aGlzLnNjaGVkdWxlZEFjdGl2aXR5XyA9IGFjdGl2aXR5O1xuICAgIHRoaXMuc2NoZWR1bGVkV2FpdF8gPSB3YWl0O1xuXG4gICAgaWYgKHRoaXMucnVubmVyXykge1xuICAgICAgdGhpcy5wbGF5YmFja1doZW5SZWFkeV8oYWN0aXZpdHksIHdhaXQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBwbGF5YmFjayBhY3Rpdml0eSBpZiBydW5uZXIgaXMgcmVhZHkuXG4gICAqIEBwYXJhbSB7IVBsYXliYWNrQWN0aXZpdHl9IGFjdGl2aXR5XG4gICAqIEBwYXJhbSB7P1Byb21pc2V9IHdhaXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHBsYXliYWNrV2hlblJlYWR5XyhhY3Rpdml0eSwgd2FpdCkge1xuICAgIGNvbnN0IHJ1bm5lciA9XG4gICAgICAvKipcbiAgICAgICAqIEB0eXBlIHshLi4vLi4vYW1wLWFuaW1hdGlvbi8wLjEvcnVubmVycy9hbmltYXRpb24tcnVubmVyLkFuaW1hdGlvblJ1bm5lcn1cbiAgICAgICAqL1xuICAgICAgKFxuICAgICAgICBkZXZBc3NlcnQoXG4gICAgICAgICAgdGhpcy5ydW5uZXJfLFxuICAgICAgICAgICdUcmllZCB0byBleGVjdXRlIHBsYXliYWNrV2hlblJlYWR5XyBiZWZvcmUgcnVubmVyIHdhcyByZXNvbHZlZC4nXG4gICAgICAgIClcbiAgICAgICk7XG5cbiAgICAod2FpdCB8fCBQcm9taXNlLnJlc29sdmUoKSkudGhlbigoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuaXNBY3Rpdml0eVNjaGVkdWxlZF8oYWN0aXZpdHkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zY2hlZHVsZWRBY3Rpdml0eV8gPSBudWxsO1xuICAgICAgdGhpcy5zY2hlZHVsZWRXYWl0XyA9IG51bGw7XG5cbiAgICAgIHN3aXRjaCAoYWN0aXZpdHkpIHtcbiAgICAgICAgY2FzZSBQbGF5YmFja0FjdGl2aXR5LlNUQVJUOlxuICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0V2hlblJlYWR5XyhydW5uZXIpO1xuICAgICAgICBjYXNlIFBsYXliYWNrQWN0aXZpdHkuRklOSVNIOlxuICAgICAgICAgIHJldHVybiB0aGlzLmZpbmlzaFdoZW5SZWFkeV8ocnVubmVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyBydW5uZXIgYXMgcmVhZHkgYW5kIGV4ZWN1dGVzIHBsYXliYWNrIGFjdGl2aXR5IGlmIG5lZWRlZC5cbiAgICogQHBhcmFtIHshLi4vLi4vYW1wLWFuaW1hdGlvbi8wLjEvcnVubmVycy9hbmltYXRpb24tcnVubmVyLkFuaW1hdGlvblJ1bm5lcn0gcnVubmVyXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblJ1bm5lclJlYWR5XyhydW5uZXIpIHtcbiAgICB0aGlzLnJ1bm5lcl8gPSBydW5uZXI7XG5cbiAgICBydW5uZXIub25QbGF5U3RhdGVDaGFuZ2VkKChzdGF0ZSkgPT4ge1xuICAgICAgaWYgKHN0YXRlID09IFdlYkFuaW1hdGlvblBsYXlTdGF0ZS5GSU5JU0hFRCkge1xuICAgICAgICB0aGlzLm5vdGlmeUZpbmlzaF8oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5pc0FjdGl2aXR5U2NoZWR1bGVkXygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wbGF5YmFja1doZW5SZWFkeV8oXG4gICAgICAvKiogQHR5cGUgeyFQbGF5YmFja0FjdGl2aXR5fSAqLyAodGhpcy5zY2hlZHVsZWRBY3Rpdml0eV8pLFxuICAgICAgdGhpcy5zY2hlZHVsZWRXYWl0X1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshUGxheWJhY2tBY3Rpdml0eT19IG9wdF9hY3Rpdml0eVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaXNBY3Rpdml0eVNjaGVkdWxlZF8ob3B0X2FjdGl2aXR5KSB7XG4gICAgaWYgKCFvcHRfYWN0aXZpdHkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjaGVkdWxlZEFjdGl2aXR5XyAhPT0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVkQWN0aXZpdHlfID09PSBvcHRfYWN0aXZpdHk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgbm90aWZ5RmluaXNoXygpIHtcbiAgICBpZiAodGhpcy5zb3VyY2VfLmlkKSB7XG4gICAgICB0aGlzLnNlcXVlbmNlXy5ub3RpZnlGaW5pc2godGhpcy5zb3VyY2VfLmlkKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETyhhbGFub3JvemNvKTogTG9vcGluZyBhbmltYXRpb25zXG4vKiogTWFuYWdlciBmb3IgYW5pbWF0aW9ucyBpbiBzdG9yeSBwYWdlcy4gKi9cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25NYW5hZ2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhZ2VcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhZ2UsIGFtcGRvYykge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLnBhZ2VfID0gcGFnZTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmFtcGRvY18gPSBhbXBkb2M7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy52c3luY18gPSBTZXJ2aWNlcy52c3luY0Zvcih0aGlzLmFtcGRvY18ud2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmJ1aWxkZXJQcm9taXNlXyA9IHRoaXMuY3JlYXRlQW5pbWF0aW9uQnVpbGRlclByb21pc2VfKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtib29sfSAqL1xuICAgIHRoaXMuc2tpcEFuaW1hdGlvbnNfID1cbiAgICAgIHByZWZlcnNSZWR1Y2VkTW90aW9uKGFtcGRvYy53aW4pIHx8XG4gICAgICAoaXNFeHBlcmltZW50T24oYW1wZG9jLndpbiwgJ3N0b3J5LWRpc2FibGUtYW5pbWF0aW9ucy1maXJzdC1wYWdlJykgJiZcbiAgICAgICAgbWF0Y2hlcyhwYWdlLCAnYW1wLXN0b3J5LXBhZ2U6Zmlyc3Qtb2YtdHlwZScpKTtcblxuICAgIGNvbnNvbGUubG9nKHBhZ2UuaWQsIHRoaXMuc2tpcEFuaW1hdGlvbnNfKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0FycmF5PCFBbmltYXRpb25SdW5uZXI+fSAqL1xuICAgIHRoaXMucnVubmVyc18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlICovXG4gICAgdGhpcy5zZXF1ZW5jZV8gPSBBbmltYXRpb25TZXF1ZW5jZS5jcmVhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvdXBsZXMgY29uc3RydWN0b3Igc28gaXQgY2FuIGJlIHN0dWJiZWQgaW4gdGVzdHMuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhZ2VcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZEJhc2VVcmxcbiAgICogQHJldHVybiB7IUFuaW1hdGlvbk1hbmFnZXJ9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlKHBhZ2UsIGFtcGRvYywgdW51c2VkQmFzZVVybCkge1xuICAgIHJldHVybiBuZXcgQW5pbWF0aW9uTWFuYWdlcihwYWdlLCBhbXBkb2MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgZmlyc3QgZnJhbWUgdG8gdGFyZ2V0IGVsZW1lbnQgYmVmb3JlIHN0YXJ0aW5nIGFuaW1hdGlvbi5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBhcHBseUZpcnN0RnJhbWVPckZpbmlzaCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICB0aGlzLmdldE9yQ3JlYXRlUnVubmVyc18oKS5tYXAoKHJ1bm5lcikgPT5cbiAgICAgICAgdGhpcy5za2lwQW5pbWF0aW9uc19cbiAgICAgICAgICA/IHJ1bm5lci5hcHBseUxhc3RGcmFtZSgpXG4gICAgICAgICAgOiBydW5uZXIuYXBwbHlGaXJzdEZyYW1lKClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgbGFzdCBmcmFtZSB0byB0YXJnZXQgZWxlbWVudCBiZWZvcmUgc3RhcnRpbmcgYW5pbWF0aW9uLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGFwcGx5TGFzdEZyYW1lKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgIHRoaXMuZ2V0T3JDcmVhdGVSdW5uZXJzXygpLm1hcCgocnVubmVyKSA9PiBydW5uZXIuYXBwbHlMYXN0RnJhbWUoKSlcbiAgICApO1xuICB9XG5cbiAgLyoqIFN0YXJ0cyBhbGwgZW50cmFuY2UgYW5pbWF0aW9ucyBmb3IgdGhlIHBhZ2UuICovXG4gIGFuaW1hdGVJbigpIHtcbiAgICBpZiAodGhpcy5za2lwQW5pbWF0aW9uc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5nZXRSdW5uZXJzXygpLmZvckVhY2goKHJ1bm5lcikgPT4gcnVubmVyLnN0YXJ0KCkpO1xuICB9XG5cbiAgLyoqIFNraXBzIGFsbCBlbnRyYW5jZSBhbmltYXRpb25zIGZvciB0aGUgcGFnZS4gKi9cbiAgZmluaXNoQWxsKCkge1xuICAgIHRoaXMuZ2V0UnVubmVyc18oKS5mb3JFYWNoKChydW5uZXIpID0+IHJ1bm5lci5maW5pc2goKSk7XG4gIH1cblxuICAvKiogQ2FuY2VscyBhbGwgZW50cmFuY2UgYW5pbWF0aW9ucyBmb3IgdGhlIHBhZ2UuICovXG4gIGNhbmNlbEFsbCgpIHtcbiAgICBpZiAoIXRoaXMucnVubmVyc18pIHtcbiAgICAgIC8vIG5vdGhpbmcgdG8gY2FuY2VsIHdoZW4gdGhlIGZpcnN0IGZyYW1lIGhhcyBub3QgYmVlbiBhcHBsaWVkIHlldC5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5nZXRSdW5uZXJzXygpLmZvckVhY2goKHJ1bm5lcikgPT4gcnVubmVyLmNhbmNlbCgpKTtcbiAgfVxuXG4gIC8qKiBQYXVzZXMgYWxsIGFuaW1hdGlvbnMgaW4gdGhlIHBhZ2UuICovXG4gIHBhdXNlQWxsKCkge1xuICAgIGlmICghdGhpcy5ydW5uZXJzXyB8fCB0aGlzLnNraXBBbmltYXRpb25zXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdldFJ1bm5lcnNfKCkuZm9yRWFjaCgocnVubmVyKSA9PiBydW5uZXIucGF1c2UoKSk7XG4gIH1cblxuICAvKiogUmVzdW1lcyBhbGwgYW5pbWF0aW9ucyBpbiB0aGUgcGFnZS4gKi9cbiAgcmVzdW1lQWxsKCkge1xuICAgIGlmICghdGhpcy5ydW5uZXJzXyB8fCB0aGlzLnNraXBBbmltYXRpb25zXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdldFJ1bm5lcnNfKCkuZm9yRWFjaCgocnVubmVyKSA9PiBydW5uZXIucmVzdW1lKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhlcmUgaXMgYW4gYW5pbWF0aW9uIHJ1bm5pbmcuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXNBbmltYXRpb25TdGFydGVkKCkge1xuICAgIHJldHVybiB0aGlzLmdldFJ1bm5lcnNfKCkuc29tZSgocnVubmVyKSA9PiBydW5uZXIuaGFzU3RhcnRlZCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshQXJyYXk8IUFuaW1hdGlvblJ1bm5lcj59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRSdW5uZXJzXygpIHtcbiAgICByZXR1cm4gZGV2QXNzZXJ0KHRoaXMucnVubmVyc18sICdFeGVjdXRlZCBiZWZvcmUgYXBwbHlGaXJzdEZyYW1lT3JGaW5pc2gnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIG9yIGNyZWF0ZXMgQW5pbWF0aW9uUnVubmVycy5cbiAgICogVGhlc2UgYXJlIGVpdGhlciBmcm9tIGFuIDxhbXAtc3RvcnktYW5pbWF0aW9uPiBzcGVjIG9yIHJlc29sdmVkIGZyb21cbiAgICogcHJlc2V0cyB2aWEgYW5pbWF0ZS1pbiBhdHRyaWJ1dGVzLlxuICAgKiBJZiBhIHBhZ2UgZWxlbWVudCBjb250YWlucyBib3RoIGtpbmRzIG9mIGRlZmluaXRpb25zLCB0aGV5J2xsIHJ1blxuICAgKiBjb25jdXJyZW50bHkuXG4gICAqIEByZXR1cm4geyFBcnJheTwhQW5pbWF0aW9uUnVubmVyPn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldE9yQ3JlYXRlUnVubmVyc18oKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5lcnNfKSB7XG4gICAgICB0aGlzLnJ1bm5lcnNfID0gQXJyYXkucHJvdG90eXBlLm1hcFxuICAgICAgICAuY2FsbChcbiAgICAgICAgICBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHRoaXMucGFnZV8sIEFOSU1BVEFCTEVfRUxFTUVOVFNfU0VMRUNUT1IpLFxuICAgICAgICAgIChlbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJlc2V0ID0gdGhpcy5nZXRQcmVzZXRfKGVsKTtcbiAgICAgICAgICAgIGlmICghcHJlc2V0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlUnVubmVyXyh7XG4gICAgICAgICAgICAgIHByZXNldCxcbiAgICAgICAgICAgICAgc291cmNlOiBlbCxcbiAgICAgICAgICAgICAgc3RhcnRBZnRlcklkOiBnZXRTZXF1ZW5jaW5nU3RhcnRBZnRlcklkKHRoaXMucGFnZV8sIGVsKSxcbiAgICAgICAgICAgICAga2V5ZnJhbWVPcHRpb25zOiB0aGlzLmdldEtleWZyYW1lT3B0aW9uc18oZWwpLFxuICAgICAgICAgICAgICBzcGVjOiB0aGlzLnBhcnRpYWxBbmltYXRpb25TcGVjRnJvbVByZXNldF8oZWwsIHByZXNldCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgLmNvbmNhdChcbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoXG4gICAgICAgICAgICB0aGlzLnBhZ2VfLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICdhbXAtc3RvcnktYW5pbWF0aW9uW3RyaWdnZXI9dmlzaWJpbGl0eV0nXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgKGVsKSA9PlxuICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVJ1bm5lcl8oe1xuICAgICAgICAgICAgICAgIHNvdXJjZTogZWwsXG4gICAgICAgICAgICAgICAgc3RhcnRBZnRlcklkOiBnZXRTZXF1ZW5jaW5nU3RhcnRBZnRlcklkKHRoaXMucGFnZV8sIGVsKSxcbiAgICAgICAgICAgICAgICAvLyBDYXN0aW5nIHNpbmNlIHdlJ3JlIGdldHRpbmcgYSBKc29uT2JqZWN0LiBUaGlzIHdpbGwgYmVcbiAgICAgICAgICAgICAgICAvLyB2YWxpZGF0ZWQgZHVyaW5nIHByZXBhcmF0aW9uIHBoYXNlLlxuICAgICAgICAgICAgICAgIHNwZWM6IC8qKiBAdHlwZSB7IVdlYkFuaW1hdGlvbkRlZn0gKi8gKGdldENoaWxkSnNvbkNvbmZpZyhlbCkpLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pO1xuICAgIH1cbiAgICByZXR1cm4gZGV2QXNzZXJ0KHRoaXMucnVubmVyc18pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVN0b3J5QW5pbWF0aW9uQ29uZmlnRGVmfSBjb25maWdcbiAgICogQHJldHVybiB7IUFuaW1hdGlvblJ1bm5lcn1cbiAgICovXG4gIGNyZWF0ZVJ1bm5lcl8oY29uZmlnKSB7XG4gICAgcmV0dXJuIEFuaW1hdGlvblJ1bm5lci5jcmVhdGUoXG4gICAgICB0aGlzLnBhZ2VfLFxuICAgICAgY29uZmlnLFxuICAgICAgZGV2QXNzZXJ0KHRoaXMuYnVpbGRlclByb21pc2VfKSxcbiAgICAgIHRoaXMudnN5bmNfLFxuICAgICAgdGhpcy5zZXF1ZW5jZV9cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7IVN0b3J5QW5pbWF0aW9uUHJlc2V0RGVmfSBwcmVzZXRcbiAgICogQHJldHVybiB7IVdlYkFuaW1hdGlvbkRlZn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHBhcnRpYWxBbmltYXRpb25TcGVjRnJvbVByZXNldF8oZWwsIHByZXNldCkge1xuICAgIGNvbnN0IGFuaW1hdGlvbkRlZiA9IHtcbiAgICAgIHRhcmdldDogZWwsXG4gICAgICBkZWxheTogcHJlc2V0LmRlbGF5IHx8IDAsXG4gICAgICBkdXJhdGlvbjogcHJlc2V0LmR1cmF0aW9uIHx8IDAsXG4gICAgICBlYXNpbmc6IHByZXNldC5lYXNpbmcgfHwgREVGQVVMVF9FQVNJTkcsXG5cbiAgICAgIC8vIFRoaXMgZmllbGQgaXMgc28gdGhhdCB3ZSB0eXBlIHRoaXMgYXMgYSBXZWJBbmltYXRpb25EZWYsIGJ1dCBpdCdzXG4gICAgICAvLyByZXBsYWNlZCB3aGVuIHBhc3NlZCB0byBhbiBBbmltYXRpb25SdW5uZXIuXG4gICAgICBrZXlmcmFtZXM6IFtdLFxuICAgIH07XG5cbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKEFOSU1BVEVfSU5fRFVSQVRJT05fQVRUUklCVVRFX05BTUUpKSB7XG4gICAgICBhbmltYXRpb25EZWYuZHVyYXRpb24gPSB0aW1lU3RyVG9NaWxsaXMoXG4gICAgICAgIGVsLmdldEF0dHJpYnV0ZShBTklNQVRFX0lOX0RVUkFUSU9OX0FUVFJJQlVURV9OQU1FKSxcbiAgICAgICAgYW5pbWF0aW9uRGVmLmR1cmF0aW9uXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoQU5JTUFURV9JTl9ERUxBWV9BVFRSSUJVVEVfTkFNRSkpIHtcbiAgICAgIGFuaW1hdGlvbkRlZi5kZWxheSA9IHRpbWVTdHJUb01pbGxpcyhcbiAgICAgICAgZWwuZ2V0QXR0cmlidXRlKEFOSU1BVEVfSU5fREVMQVlfQVRUUklCVVRFX05BTUUpLFxuICAgICAgICBhbmltYXRpb25EZWYuZGVsYXlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGVsLmhhc0F0dHJpYnV0ZShBTklNQVRFX0lOX1RJTUlOR19GVU5DVElPTl9BVFRSSUJVVEVfTkFNRSkpIHtcbiAgICAgIGFuaW1hdGlvbkRlZi5lYXNpbmcgPSBlbC5nZXRBdHRyaWJ1dGUoXG4gICAgICAgIEFOSU1BVEVfSU5fVElNSU5HX0ZVTkNUSU9OX0FUVFJJQlVURV9OQU1FXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBhbmltYXRpb25EZWY7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IVByb21pc2U8IS4uLy4uL2FtcC1hbmltYXRpb24vMC4xL3dlYi1hbmltYXRpb25zLkJ1aWxkZXI+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY3JlYXRlQW5pbWF0aW9uQnVpbGRlclByb21pc2VfKCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKHRoaXMuYW1wZG9jXy53aW4pXG4gICAgICAuaW5zdGFsbEV4dGVuc2lvbkZvckRvYyh0aGlzLmFtcGRvY18sICdhbXAtYW5pbWF0aW9uJylcbiAgICAgIC50aGVuKCgpID0+IFNlcnZpY2VzLndlYkFuaW1hdGlvblNlcnZpY2VGb3IodGhpcy5wYWdlXykpXG4gICAgICAudGhlbigod2ViQW5pbWF0aW9uU2VydmljZSkgPT5cbiAgICAgICAgd2ViQW5pbWF0aW9uU2VydmljZS5jcmVhdGVCdWlsZGVyKHtcbiAgICAgICAgICBzY29wZTogdGhpcy5wYWdlXyxcbiAgICAgICAgICBzY2FsZUJ5U2NvcGU6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEByZXR1cm4gez9TdG9yeUFuaW1hdGlvblByZXNldERlZn1cbiAgICovXG4gIGdldFByZXNldF8oZWwpIHtcbiAgICBjb25zdCBuYW1lID0gZWwuZ2V0QXR0cmlidXRlKEFOSU1BVEVfSU5fQVRUUklCVVRFX05BTUUpO1xuXG4gICAgaWYgKCFwcmVzZXRzW25hbWVdKSB7XG4gICAgICB1c2VyKCkud2FybihcbiAgICAgICAgVEFHLFxuICAgICAgICAnSW52YWxpZCcsXG4gICAgICAgIEFOSU1BVEVfSU5fQVRUUklCVVRFX05BTUUsXG4gICAgICAgICdwcmVzZXQnLFxuICAgICAgICBuYW1lLFxuICAgICAgICAnZm9yIGVsZW1lbnQnLFxuICAgICAgICBlbFxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFRPRE8oYWxhbm9yb3pjbyk6IFRoaXMgc2hvdWxkIGJlIHBhcnQgb2YgYSBtdXRhdGUgY3ljbGUuXG4gICAgc2V0U3R5bGVGb3JQcmVzZXQoZWwsIG5hbWUpO1xuXG4gICAgcmV0dXJuIHByZXNldHNbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsICo+fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0S2V5ZnJhbWVPcHRpb25zXyhlbCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICAgIFBSRVNFVF9PUFRJT05fQVRUUklCVVRFUy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBpZiAoIWVsLmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoZWwuZ2V0QXR0cmlidXRlKG5hbWUpKTtcblxuICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8PSAwKSB7XG4gICAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICAgIFRBRyxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgICdhdHRyaWJ1dGUgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlci4gRm91bmQgbmVnYXRpdmUgb3IgemVybyBpbiBlbGVtZW50JyxcbiAgICAgICAgICBlbFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnNbbmFtZV0gPSB2YWx1ZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG59XG5cbi8qKiBCdXMgZm9yIGFuaW1hdGlvbiBzZXF1ZW5jaW5nLiAqL1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvblNlcXVlbmNlIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAhUHJvbWlzZT59ICovXG4gICAgdGhpcy5zdWJzY3JpcHRpb25Qcm9taXNlc18gPSBtYXAoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAhRnVuY3Rpb24+fSAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uUmVzb2x2ZXJzXyA9IG1hcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY291cGxlcyBjb25zdHJ1Y3RvciBmb3IgdGVzdGluZy5cbiAgICpcbiAgICogQHJldHVybiB7IUFuaW1hdGlvblNlcXVlbmNlfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IEFuaW1hdGlvblNlcXVlbmNlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZpZXMgZGVwZW5kZW50IGVsZW1lbnRzIHRoYXQgYW5pbWF0aW9uIGhhcyBmaW5pc2hlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gICAqL1xuICBub3RpZnlGaW5pc2goaWQpIHtcbiAgICBpZiAoaWQgaW4gdGhpcy5zdWJzY3JpcHRpb25Qcm9taXNlc18pIHtcbiAgICAgIGRldkFzc2VydCh0aGlzLnN1YnNjcmlwdGlvblJlc29sdmVyc19baWRdKSgpO1xuXG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25Qcm9taXNlc19baWRdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgYW5vdGhlciBlbGVtZW50IHRvIGZpbmlzaCBhbmltYXRpbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIHdhaXRGb3IoaWQpIHtcbiAgICBpZiAoIShpZCBpbiB0aGlzLnN1YnNjcmlwdGlvblByb21pc2VzXykpIHtcbiAgICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvblByb21pc2VzX1tpZF0gPSBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25SZXNvbHZlcnNfW2lkXSA9IGRlZmVycmVkLnJlc29sdmU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN1YnNjcmlwdGlvblByb21pc2VzX1tpZF07XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/animation.js