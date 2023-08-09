import {Deferred} from '#core/data-structures/promise';
import {getChildJsonConfig} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {prefersReducedMotion} from '#core/dom/media-query-props';
import {
  matches,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '#core/dom/query';
import {assertDoesNotContainDisplay, setStyles} from '#core/dom/style';
import {map, omit} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {
  PRESET_OPTION_ATTRIBUTES,
  presets,
  setStyleForPreset,
} from './animation-presets';
import {
  StoryAnimationConfigDef,
  StoryAnimationDimsDef,
  StoryAnimationPresetDef,
  WebAnimationDef,
  WebAnimationPlayState,
  WebAnimationSelectorDef,
  WebAnimationTimingDef,
  WebKeyframesCreateFnDef,
  WebKeyframesDef,
} from './animation-types';
import {isPreviewMode} from './embed-mode';
import {isTransformed, timeStrToMillis, unscaledClientRect} from './utils';

const TAG = 'AMP-STORY';

/** @const {string} */
export const ANIMATE_IN_ATTRIBUTE_NAME = 'animate-in';
/** @const {string} */
const ANIMATE_IN_DURATION_ATTRIBUTE_NAME = 'animate-in-duration';
/** @const {string} */
const ANIMATE_IN_DELAY_ATTRIBUTE_NAME = 'animate-in-delay';
/** @const {string} */
const ANIMATE_IN_AFTER_ATTRIBUTE_NAME = 'animate-in-after';
/** @const {string} */
const ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME = 'animate-in-timing-function';
/** @const {string} */
const ANIMATABLE_ELEMENTS_SELECTOR = `[${ANIMATE_IN_ATTRIBUTE_NAME}]`;

/** @const {string} */
const DEFAULT_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';

/**
 * @param {!Element} element
 * @return {boolean}
 * TODO(alanorozco): maybe memoize?
 */
export function hasAnimations(element) {
  const selector = `${ANIMATABLE_ELEMENTS_SELECTOR},>amp-story-animation,amp-bodymovin-animation`;
  return !!scopedQuerySelector(element, selector);
}

/** @enum {number} */
const PlaybackActivity = {
  START: 0,
  FINISH: 1,
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
  const dependencyId = element.getAttribute(ANIMATE_IN_AFTER_ATTRIBUTE_NAME);

  if (!root.querySelector(`#${escapeCssSelectorIdent(dependencyId)}`)) {
    user().warn(
      TAG,
      `The attribute '${ANIMATE_IN_AFTER_ATTRIBUTE_NAME}' in tag ` +
        `'${element.tagName}' is set to the invalid value ` +
        `'${dependencyId}'. No children of parenting 'amp-story-page' ` +
        `exist with id ${dependencyId}.`
    );
    return null;
  }

  return dependencyId;
}

/** Wraps WebAnimationRunner for story page elements. */
export class AnimationRunner {
  /**
   * @param {!Element} page
   * @param {!StoryAnimationConfigDef} config
   * @param {!Promise<!../../amp-animation/0.1/web-animations.Builder>} webAnimationBuilderPromise
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!AnimationSequence} sequence
   */
  constructor(page, config, webAnimationBuilderPromise, vsync, sequence) {
    const {preset, source, spec, startAfterId} = config;

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
    this.runnerPromise_ = this.resolvedSpecPromise_.then((webAnimDef) =>
      webAnimationBuilderPromise.then((builder) =>
        builder.createRunner(webAnimDef)
      )
    );

    /**
     * Evaluated set of CSS properties for first animation frame.
     * @private @const {!Promise<?{[key: string]: *}>}
     */
    this.firstFrameProps_ = this.resolvedSpecPromise_.then((spec) => {
      const {keyframes} = spec;
      if (!this.presetTarget_) {
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
        !keyframes[0].offset,
        'First keyframe offset for animation preset should be 0 or undefined'
      );
      return omit(keyframes[0], ['offset']);
    });

    /** @private {?../../amp-animation/0.1/runners/animation-runner.AnimationRunner} */
    this.runner_ = null;

    /** @private {?PlaybackActivity} */
    this.scheduledActivity_ = null;

    /** @private {?Promise} */
    this.scheduledWait_ = null;

    if (this.presetTarget_) {
      const {delay} = /** @type {!WebAnimationTimingDef} */ (spec);
      userAssert(
        dev().assertNumber(delay) >= 0,
        'Negative delays are not allowed in amp-story "animate-in" animations.'
      );
    }

    this.runnerPromise_.then((runner) => this.onRunnerReady_(runner));
  }

  /**
   * @param {!Element} page
   * @param {!StoryAnimationConfigDef} config
   * @param {!Promise<!../../amp-animation/0.1/web-animations.Builder>} webAnimationBuilderPromise
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!AnimationSequence} sequence
   * @return {!AnimationRunner}
   */
  static create(page, config, webAnimationBuilderPromise, vsync, sequence) {
    return new AnimationRunner(
      page,
      config,
      webAnimationBuilderPromise,
      vsync,
      sequence
    );
  }

  /**
   * @return {!Promise<!StoryAnimationDimsDef>}
   * @visibleForTesting
   */
  getDims() {
    return this.vsync_.measurePromise(() => {
      const target = dev().assertElement(this.presetTarget_);
      const targetRect = unscaledClientRect(target);
      const pageRect = unscaledClientRect(this.page_);

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
      return /** @type {!StoryAnimationDimsDef} */ ({
        pageWidth: pageRect.width,
        pageHeight: pageRect.height,
        targetWidth: targetRect.width,
        targetHeight: targetRect.height,
        targetX: targetRect.left - pageRect.left,
        targetY: targetRect.top - pageRect.top,
      });
    });
  }

  /**
   * Evaluates a preset's keyframes function using dimensions.
   * @param {!WebKeyframesDef|!WebKeyframesCreateFnDef} keyframesOrCreateFn
   * @param {!{[key: string]: *}=} keyframeOptions
   * @return {!Promise<!WebKeyframesDef>}
   * @private
   */
  resolvePresetKeyframes_(keyframesOrCreateFn, keyframeOptions) {
    if (typeof keyframesOrCreateFn === 'function') {
      return this.getDims().then((dimensions) => {
        const fn = /** @type {!WebKeyframesCreateFnDef} */ (
          keyframesOrCreateFn
        );
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
  resolveSpec_(config) {
    const {keyframeOptions, preset, spec} = config;
    if (!preset) {
      // This is an amp-animation config, so it's already formed how the
      // WebAnimations Builder wants it.
      return Promise.resolve(/** @type {!WebAnimationDef} */ (spec));
    }
    // The need for this cast is an unfortunate result of using @mixes in
    // WebAnimationDef. Otherwise Closure will not understand the timing props
    // mixed in from another type.
    const {delay, duration, easing} = /** @type {!WebAnimationTimingDef} */ (
      spec
    );
    const {target} = /** @type {!WebAnimationSelectorDef} */ (spec);
    return this.resolvePresetKeyframes_(preset.keyframes, keyframeOptions).then(
      (keyframes) => ({
        keyframes,
        target,
        delay,
        duration,
        easing,
        fill: 'forwards',
      })
    );
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
  applyFirstFrame() {
    if (this.hasStarted()) {
      return Promise.resolve();
    }

    if (this.runner_) {
      this.runner_.cancel();
    }

    return this.firstFrameProps_.then((firstFrameProps) => {
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
      return this.vsync_.mutatePromise(() => {
        setStyles(
          dev().assertElement(this.presetTarget_),
          assertDoesNotContainDisplay(devAssert(firstFrameProps))
        );
      });
    });
  }

  /**
   * Applies the last animation frame.
   * @return {!Promise<void>}
   */
  applyLastFrame() {
    if (this.presetTarget_) {
      return Promise.resolve();
    }
    this.runnerPromise_.then((runner) => {
      runner.init();
      runner.finish(/* pauseOnError */ true);
    });
  }

  /** Starts or resumes the animation. */
  start() {
    if (this.hasStarted()) {
      return;
    }

    this.playback_(PlaybackActivity.START, this.getStartWaitPromise_());
  }

  /**
   * @return {!Promise}
   * @private
   */
  getStartWaitPromise_() {
    if (this.startAfterId_) {
      return this.sequence_.waitFor(this.startAfterId_);
    }
    return Promise.resolve();
  }

  /**
   * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
   * @private
   */
  startWhenReady_(runner) {
    runner.start();
  }

  /** @return {boolean} */
  hasStarted() {
    return (
      this.isActivityScheduled_(PlaybackActivity.START) ||
      (!!this.runner_ &&
        devAssert(this.runner_).getPlayState() == WebAnimationPlayState.RUNNING)
    );
  }

  /** Force-finishes all animations. */
  finish() {
    if (!this.runner_) {
      this.notifyFinish_();
    }
    this.playback_(PlaybackActivity.FINISH);
  }

  /** Pauses the animation. */
  pause() {
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

  /** Resumes the animation. */
  resume() {
    // Animation hasn't started yet since it's waiting for a sequenced
    // animation.
    if (this.scheduledWait_ !== null) {
      return;
    }

    if (this.runner_) {
      try {
        this.runner_.resume();
      } catch (e) {
        // This fails when the story animations are not initialized and resume is called. Context on #35987.
      }
    }
  }

  /**
   * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
   * @private
   */
  finishWhenReady_(runner) {
    if (this.runner_) {
      // Init or no-op if the runner was already running.
      runner.start();
      runner.finish();
    }
  }

  /** Cancels animation. */
  cancel() {
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
  playback_(activity, opt_wait) {
    const wait = opt_wait || null;

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
  playbackWhenReady_(activity, wait) {
    const runner =
      /**
       * @type {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner}
       */
      (
        devAssert(
          this.runner_,
          'Tried to execute playbackWhenReady_ before runner was resolved.'
        )
      );

    (wait || Promise.resolve()).then(() => {
      if (!this.isActivityScheduled_(activity)) {
        return;
      }

      this.scheduledActivity_ = null;
      this.scheduledWait_ = null;

      switch (activity) {
        case PlaybackActivity.START:
          return this.startWhenReady_(runner);
        case PlaybackActivity.FINISH:
          return this.finishWhenReady_(runner);
      }
    });
  }

  /**
   * Marks runner as ready and executes playback activity if needed.
   * @param {!../../amp-animation/0.1/runners/animation-runner.AnimationRunner} runner
   * @private
   */
  onRunnerReady_(runner) {
    this.runner_ = runner;

    runner.onPlayStateChanged((state) => {
      if (state == WebAnimationPlayState.FINISHED) {
        this.notifyFinish_();
      }
    });

    if (!this.isActivityScheduled_()) {
      return;
    }

    this.playbackWhenReady_(
      /** @type {!PlaybackActivity} */ (this.scheduledActivity_),
      this.scheduledWait_
    );
  }

  /**
   * @param {!PlaybackActivity=} opt_activity
   * @return {boolean}
   * @private
   */
  isActivityScheduled_(opt_activity) {
    if (!opt_activity) {
      return this.scheduledActivity_ !== null;
    }
    return this.scheduledActivity_ === opt_activity;
  }

  /** @private */
  notifyFinish_() {
    if (this.source_.id) {
      this.sequence_.notifyFinish(this.source_.id);
    }
  }
}

// TODO(alanorozco): Looping animations
/** Manager for animations in story pages. */
export class AnimationManager {
  /**
   * @param {!Element} page
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(page, ampdoc) {
    /** @private @const */
    this.page_ = page;

    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(this.ampdoc_.win);

    /** @private @const */
    this.builderPromise_ = this.createAnimationBuilderPromise_();

    const firstPageAnimationDisabled =
      isExperimentOn(ampdoc.win, 'story-disable-animations-first-page') ||
      isPreviewMode(ampdoc.win) ||
      isTransformed(ampdoc);

    /** @private @const {bool} */
    this.skipAnimations_ =
      prefersReducedMotion(ampdoc.win) ||
      (firstPageAnimationDisabled &&
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
   */
  static create(page, ampdoc, unusedBaseUrl) {
    return new AnimationManager(page, ampdoc);
  }

  /**
   * Applies first frame to target element before starting animation.
   * @return {!Promise}
   */
  applyFirstFrameOrFinish() {
    return Promise.all(
      this.getOrCreateRunners_().map((runner) =>
        this.skipAnimations_
          ? runner.applyLastFrame()
          : runner.applyFirstFrame()
      )
    );
  }

  /**
   * Applies last frame to target element before starting animation.
   * @return {!Promise}
   */
  applyLastFrame() {
    return Promise.all(
      this.getOrCreateRunners_().map((runner) => runner.applyLastFrame())
    );
  }

  /** Starts all entrance animations for the page. */
  animateIn() {
    if (this.skipAnimations_) {
      return;
    }
    this.getRunners_().forEach((runner) => runner.start());
  }

  /** Skips all entrance animations for the page. */
  finishAll() {
    this.getRunners_().forEach((runner) => runner.finish());
  }

  /** Cancels all entrance animations for the page. */
  cancelAll() {
    if (!this.runners_) {
      // nothing to cancel when the first frame has not been applied yet.
      return;
    }
    this.getRunners_().forEach((runner) => runner.cancel());
  }

  /** Pauses all animations in the page. */
  pauseAll() {
    if (!this.runners_ || this.skipAnimations_) {
      return;
    }
    this.getRunners_().forEach((runner) => runner.pause());
  }

  /** Resumes all animations in the page. */
  resumeAll() {
    if (!this.runners_ || this.skipAnimations_) {
      return;
    }
    this.getRunners_().forEach((runner) => runner.resume());
  }

  /**
   * Determines if there is an animation running.
   * @return {boolean}
   */
  hasAnimationStarted() {
    return this.getRunners_().some((runner) => runner.hasStarted());
  }

  /**
   * @return {!Array<!AnimationRunner>}
   * @private
   */
  getRunners_() {
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
  getOrCreateRunners_() {
    if (!this.runners_) {
      this.runners_ = Array.prototype.map
        .call(
          scopedQuerySelectorAll(this.page_, ANIMATABLE_ELEMENTS_SELECTOR),
          (el) => {
            const preset = this.getPreset_(el);
            if (!preset) {
              return null;
            }
            return this.createRunner_({
              preset,
              source: el,
              startAfterId: getSequencingStartAfterId(this.page_, el),
              keyframeOptions: this.getKeyframeOptions_(el),
              spec: this.partialAnimationSpecFromPreset_(el, preset),
            });
          }
        )
        .concat(
          Array.prototype.map.call(
            this.page_.querySelectorAll(
              'amp-story-animation[trigger=visibility]'
            ),
            (el) =>
              this.createRunner_({
                source: el,
                startAfterId: getSequencingStartAfterId(this.page_, el),
                // Casting since we're getting a JsonObject. This will be
                // validated during preparation phase.
                spec: /** @type {!WebAnimationDef} */ (getChildJsonConfig(el)),
              })
          )
        )
        .concat(
          Array.prototype.map.call(
            this.page_.querySelectorAll('amp-bodymovin-animation'),
            (el) => new BodymovinAnimationRunner(el)
          )
        )
        .filter(Boolean);
    }
    return devAssert(this.runners_);
  }

  /**
   * @param {!StoryAnimationConfigDef} config
   * @return {!AnimationRunner}
   */
  createRunner_(config) {
    return AnimationRunner.create(
      this.page_,
      config,
      devAssert(this.builderPromise_),
      this.vsync_,
      this.sequence_
    );
  }

  /**
   * @param {!Element} el
   * @param {!StoryAnimationPresetDef} preset
   * @return {!WebAnimationDef}
   * @private
   */
  partialAnimationSpecFromPreset_(el, preset) {
    const animationDef = {
      target: el,
      delay: preset.delay || 0,
      duration: preset.duration || 0,
      easing: preset.easing || DEFAULT_EASING,

      // This field is so that we type this as a WebAnimationDef, but it's
      // replaced when passed to an AnimationRunner.
      keyframes: [],
    };

    if (el.hasAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME)) {
      animationDef.duration = timeStrToMillis(
        el.getAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME),
        animationDef.duration
      );
    }

    if (el.hasAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME)) {
      animationDef.delay = timeStrToMillis(
        el.getAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME),
        animationDef.delay
      );
    }

    if (el.hasAttribute(ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME)) {
      animationDef.easing = el.getAttribute(
        ANIMATE_IN_TIMING_FUNCTION_ATTRIBUTE_NAME
      );
    }

    return animationDef;
  }

  /**
   * @return {!Promise<!../../amp-animation/0.1/web-animations.Builder>}
   * @private
   */
  createAnimationBuilderPromise_() {
    return Services.extensionsFor(this.ampdoc_.win)
      .installExtensionForDoc(this.ampdoc_, 'amp-animation')
      .then(() => Services.webAnimationServiceFor(this.page_))
      .then((webAnimationService) =>
        webAnimationService.createBuilder({
          scope: this.page_,
          scaleByScope: true,
        })
      );
  }

  /**
   * @param {!Element} el
   * @return {?StoryAnimationPresetDef}
   */
  getPreset_(el) {
    const name = el.getAttribute(ANIMATE_IN_ATTRIBUTE_NAME);

    if (!presets[name]) {
      user().warn(
        TAG,
        'Invalid',
        ANIMATE_IN_ATTRIBUTE_NAME,
        'preset',
        name,
        'for element',
        el
      );
      return null;
    }

    // TODO(alanorozco): This should be part of a mutate cycle.
    setStyleForPreset(el, name);

    return presets[name];
  }

  /**
   * @param {!Element} el
   * @return {!{[key: string]: *}}
   * @private
   */
  getKeyframeOptions_(el) {
    const options = {};

    PRESET_OPTION_ATTRIBUTES.forEach((name) => {
      if (!el.hasAttribute(name)) {
        return;
      }
      const value = parseFloat(el.getAttribute(name));

      if (isNaN(value) || value <= 0) {
        user().warn(
          TAG,
          name,
          'attribute must be a positive number. Found negative or zero in element',
          el
        );
        return;
      }

      options[name] = value;
    });

    return options;
  }
}

/** Bus for animation sequencing. */
export class AnimationSequence {
  /**
   * @public
   */
  constructor() {
    /** @private @const {!{[key: string]: !Promise}} */
    this.subscriptionPromises_ = map();

    /** @private @const {!{[key: string]: !Function}} */
    this.subscriptionResolvers_ = map();
  }

  /**
   * Decouples constructor for testing.
   *
   * @return {!AnimationSequence}
   */
  static create() {
    return new AnimationSequence();
  }

  /**
   * Notifies dependent elements that animation has finished.
   * @param {string} id
   */
  notifyFinish(id) {
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
  waitFor(id) {
    if (!(id in this.subscriptionPromises_)) {
      const deferred = new Deferred();
      this.subscriptionPromises_[id] = deferred.promise;
      this.subscriptionResolvers_[id] = deferred.resolve;
    }
    return this.subscriptionPromises_[id];
  }
}

export class BodymovinAnimationRunner {
  /**
   * @param {!Element} bodymovinAnimationEl
   */
  constructor(bodymovinAnimationEl) {
    this.bodymovinAnimationEl_ = bodymovinAnimationEl;
    this.pause();
  }

  /**
   * Pauses the bodymovin animation.
   */
  pause() {
    this.executeAction_('pause');
  }

  /**
   * Plays the bodymovin animation.
   */
  resume() {
    this.executeAction_('play');
  }

  /**
   * Starts the bodymovin animation.
   */
  start() {
    this.applyFirstFrame();
    this.resume();
  }

  /**
   * Seeks the bodymovin animation to the first frame.
   */
  applyFirstFrame() {
    this.executeAction_('seekTo', {
      percent: 0,
    });
  }

  /**
   * Seeks the bodymovin animation to the last frame.
   */
  applyLastFrame() {
    this.executeAction_('seekTo', {
      percent: 1,
    });
  }

  /**
   * Cancels the bodymovin animation by pausing it.
   */
  cancel() {
    this.pause();
  }

  /**
   * @param {string} method
   * @param {=any} args
   * @private
   */
  executeAction_(method, args = null) {
    this.bodymovinAnimationEl_.getImpl().then((impl) => {
      impl.executeAction({
        method,
        args,
        satisfiesTrust: () => true,
      });
    });
  }
}
