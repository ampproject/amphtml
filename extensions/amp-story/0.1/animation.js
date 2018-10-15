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

import {Deferred} from '../../../src/utils/promise';
import {
  KeyframesDef,
  KeyframesOrFilterFnDef,
  StoryAnimationDef,
  StoryAnimationDimsDef,
  StoryAnimationPresetDef,
} from './animation-types';
import {PRESETS, setStyleForPreset} from './animation-presets';
import {Services} from '../../../src/services';
import {
  WebAnimationPlayState,
} from '../../amp-animation/0.1/web-animation-types';
import {assertDoesNotContainDisplay, setStyles} from '../../../src/style';
import {dev, user} from '../../../src/log';
import {
  escapeCssSelectorIdent,
  scopedQuerySelector,
  scopedQuerySelectorAll,
} from '../../../src/dom';
import {map, omit} from '../../../src/utils/object';
import {timeStrToMillis, unscaledClientRect} from './utils';

/** const {string} */
export const ANIMATE_IN_ATTRIBUTE_NAME = 'animate-in';
/** const {string} */
const ANIMATE_IN_DURATION_ATTRIBUTE_NAME = 'animate-in-duration';
/** const {string} */
const ANIMATE_IN_DELAY_ATTRIBUTE_NAME = 'animate-in-delay';
/** const {string} */
const ANIMATE_IN_AFTER_ATTRIBUTE_NAME = 'animate-in-after';
/** const {string} */
const ANIMATABLE_ELEMENTS_SELECTOR = `[${ANIMATE_IN_ATTRIBUTE_NAME}]`;


/**
 * @param {!Element} element
 * @return {boolean}
 * TODO(alanorozco): maybe memoize?
 */
export function hasAnimations(element) {
  return !!scopedQuerySelector(element, ANIMATABLE_ELEMENTS_SELECTOR);
}


/** @enum {number} */
const PlaybackActivity = {
  START: 0,
  FINISH: 1,
};


/** Wraps WebAnimationRunner for story page elements. */
class AnimationRunner {
  /**
   * @param {!Element} page
   * @param {!StoryAnimationDef} animationDef
   * @param {!Promise<
   *    !../../amp-animation/0.1/web-animations.Builder
   * >} webAnimationBuilderPromise
   * @param {!../../../src/service/vsync-impl.Vsync} vsync
   * @param {!../../../src/service/timer-impl.Timer} timer
   * @param {!AnimationSequence} sequence
   */
  constructor(
    page, animationDef, webAnimationBuilderPromise, vsync, timer, sequence) {
    /** @private @const */
    this.page_ = page;

    /** @private @const */
    this.timer_ = timer;

    /** @private @const */
    this.vsync_ = vsync;

    /** @private @const */
    this.target_ = dev().assertElement(animationDef.target);

    /** @private @const */
    this.sequence_ = sequence;

    /** @private @const */
    this.animationDef_ = animationDef;

    /** @private @const */
    this.presetDef_ = animationDef.preset;

    /** @private @const */
    this.keyframes_ = this.filterKeyframes_(animationDef.preset.keyframes);

    /** @private @const */
    this.delay_ = animationDef.delay || this.presetDef_.delay || 0;

    /** @private @const */
    this.duration_ = animationDef.duration || this.presetDef_.duration || 0;

    /**
     * @private @const {!Promise<
     *    !../../amp-animation/0.1/web-animations.WebAnimationRunner>}
     */
    this.runnerPromise_ = this.getWebAnimationDef_().then(webAnimDef =>
      webAnimationBuilderPromise.then(builder =>
        builder.createRunner(webAnimDef)));

    /** @private @const {!Promise<!Object<string, *>>} */
    this.firstFrameProps_ =
        this.keyframes_.then(keyframes => omit(keyframes[0], ['offset']));

    /** @private {?../../amp-animation/0.1/web-animations.WebAnimationRunner} */
    this.runner_ = null;

    /** @private {?PlaybackActivity} */
    this.scheduledActivity_ = null;

    /** @private {?Promise} */
    this.scheduledWait_ = null;

    this.keyframes_.then(keyframes => dev().assert(
        !keyframes[0].offset,
        'First keyframe offset for animation preset should be 0 or undefined'));

    user().assert(
        this.delay_ >= 0,
        'Negative delays are not allowed in amp-story entrance animations.');

    this.runnerPromise_.then(runner => this.onRunnerReady_(runner));
  }

  /**
   * @return {!Promise<!StoryAnimationDimsDef>}
   * @visibleForTesting
   */
  getDims() {
    return this.vsync_.measurePromise(() => {
      const targetRect = unscaledClientRect(this.target_);
      const pageRect = unscaledClientRect(this.page_);

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
   * @param {!KeyframesOrFilterFnDef} keyframesArrayOrFn
   * @return {!Promise<!KeyframesDef>}
   * @private
   */
  filterKeyframes_(keyframesArrayOrFn) {
    if (Array.isArray(keyframesArrayOrFn)) {
      return Promise.resolve(keyframesArrayOrFn);
    }
    return this.getDims().then(keyframesArrayOrFn);
  }

  /**
   * @return {!Promise<
   *   !../../amp-animation/0.1/web-animation-types.WebKeyframeAnimationDef>}
   * @private
   */
  getWebAnimationDef_() {
    return this.keyframes_.then(keyframes => ({
      keyframes,
      target: this.target_,
      duration: `${this.duration_}ms`,
      easing: this.presetDef_.easing,
      fill: 'forwards',
    }));
  }

  /** @return {!Promise<void>} */
  applyFirstFrame() {
    if (this.hasStarted()) {
      return Promise.resolve();
    }

    if (this.runner_) {
      this.runner_.cancel();
    }

    return this.firstFrameProps_.then(firstFrameProps =>
      this.vsync_.mutatePromise(() => {
        setStyles(this.target_, assertDoesNotContainDisplay(firstFrameProps));
      }));
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
    let promise = Promise.resolve();

    if (this.animationDef_.startAfterId) {
      const startAfterId = /** @type {string} */(
        this.animationDef_.startAfterId);
      promise = promise.then(() => this.sequence_.waitFor(startAfterId));
    }

    if (this.delay_) {
      promise = promise.then(() => this.timer_.promise(this.delay_));
    }

    return promise;
  }

  /**
   * @param {!../../amp-animation/0.1/web-animations.WebAnimationRunner} runner
   * @private
   */
  startWhenReady_(runner) {
    runner.start();
  }

  /** @return {boolean} */
  hasStarted() {
    return this.isActivityScheduled_(PlaybackActivity.START) ||
        (!!this.runner_ && dev().assert(this.runner_)
            .getPlayState() == WebAnimationPlayState.RUNNING);
  }

  /** Force-finishes all animations. */
  finish() {
    if (!this.runner_) {
      this.notifyFinish_();
    }
    this.playback_(PlaybackActivity.FINISH);
  }

  /**
   * @param {!../../amp-animation/0.1/web-animations.WebAnimationRunner} runner
   * @private
   */
  finishWhenReady_(runner) {
    if (runner.getPlayState() == WebAnimationPlayState.RUNNING) {
      runner.finish();
    }
  }

  /** Cancels animation. */
  cancel() {
    this.scheduledActivity_ = null;
    this.scheduledWait_ = null;

    if (this.runner_) {
      dev().assert(this.runner_).cancel();
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
         * @type {!../../amp-animation/0.1/web-animations.WebAnimationRunner}
         */
        (dev().assert(
            this.runner_,
            'Tried to execute playbackWhenReady_ before runner was resolved.'));

    (wait || Promise.resolve()).then(() => {
      if (!this.isActivityScheduled_(activity)) {
        return;
      }

      this.scheduledActivity_ = null;
      this.scheduledWait_ = null;

      switch (activity) {
        case PlaybackActivity.START: return this.startWhenReady_(runner);
        case PlaybackActivity.FINISH: return this.finishWhenReady_(runner);
      }
    });
  }

  /**
   * Marks runner as ready and executes playback activity if needed.
   * @param {!../../amp-animation/0.1/web-animations.WebAnimationRunner} runner
   * @private
   */
  onRunnerReady_(runner) {
    this.runner_ = runner;

    runner.onPlayStateChanged(state => {
      if (state == WebAnimationPlayState.FINISHED) {
        this.notifyFinish_();
      }
    });

    if (!this.isActivityScheduled_()) {
      return;
    }

    this.playbackWhenReady_(
        /** @type {!PlaybackActivity} */ (this.scheduledActivity_),
        this.scheduledWait_);
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
    if (this.target_.id) {
      this.sequence_.notifyFinish(this.target_.id);
    }
  }
}


// TODO(alanorozco): Looping animations
/** Manager for animations in story pages. */
export class AnimationManager {
  /**
   * @param {!Element} root
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(root, ampdoc) {
    dev().assert(hasAnimations(root));

    /** @private @const */
    this.root_ = root;

    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(this.ampdoc_.win);

    /** @private @const */
    this.timer_ = Services.timerFor(this.ampdoc_.win);

    /** @private @const */
    this.builderPromise_ = this.createAnimationBuilderPromise_();

    /** @private {?Array<!Promise<!AnimationRunner>>} */
    this.runners_ = null;

    /** @private */
    this.sequence_ = AnimationSequence.create();
  }

  /**
   * Decouples constructor so it can be stubbed in tests.
   * @param {!Element} root
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} unusedBaseUrl
   * @return {!AnimationManager}
   */
  static create(root, ampdoc, unusedBaseUrl) {
    return new AnimationManager(root, ampdoc);
  }

  /**
   * Applies first frame to target element before starting animation.
   * @return {!Promise}
   */
  applyFirstFrame() {
    return Promise.all(
        this.getOrCreateRunners_().map(runner => runner.applyFirstFrame()));
  }

  /** Starts all entrance animations for the page. */
  animateIn() {
    this.getRunners_().forEach(runner => runner.start());
  }

  /** Skips all entrance animations for the page. */
  finishAll() {
    this.getRunners_().forEach(runner => runner.finish());
  }

  /** Cancels all entrance animations for the page. */
  cancelAll() {
    if (!this.runners_) {
      // nothing to cancel when the first frame has not been applied yet.
      return;
    }
    this.getRunners_().forEach(runner => runner.cancel());
  }

  /** Determines if there is an entrance animation running. */
  hasAnimationStarted() {
    return this.getRunners_().some(runner => runner.hasStarted());
  }

  /** @private */
  getRunners_() {
    return dev().assert(this.runners_, 'Executed before applyFirstFrame');
  }

  /**
   * @return {!Array<!AnimationRunner>}
   * @private
   */
  getOrCreateRunners_() {
    if (!this.runners_) {
      this.runners_ = Array.prototype.map.call(
          scopedQuerySelectorAll(this.root_, ANIMATABLE_ELEMENTS_SELECTOR),
          el => this.createRunner_(el));
    }
    return dev().assert(this.runners_);
  }

  /**
   * @param {!Element} el
   * @return {!AnimationRunner}
   */
  createRunner_(el) {
    const preset = this.getPreset_(el);
    const animationDef = this.createAnimationDef(el, preset);

    return new AnimationRunner(
        this.root_,
        animationDef,
        dev().assert(this.builderPromise_),
        this.vsync_,
        this.timer_,
        this.sequence_);
  }

  /**
   * @param {!Element} el
   * @param {!StoryAnimationPresetDef} preset
   * @return {!StoryAnimationDef}
   */
  createAnimationDef(el, preset) {
    const animationDef = {target: el, preset};

    if (el.hasAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME)) {
      animationDef.duration =
          timeStrToMillis(el.getAttribute(ANIMATE_IN_DURATION_ATTRIBUTE_NAME));
    }

    if (el.hasAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME)) {
      animationDef.delay =
          timeStrToMillis(el.getAttribute(ANIMATE_IN_DELAY_ATTRIBUTE_NAME));
    }

    if (el.hasAttribute(ANIMATE_IN_AFTER_ATTRIBUTE_NAME)) {
      const dependencyId = el.getAttribute(ANIMATE_IN_AFTER_ATTRIBUTE_NAME);

      user().assertElement(
          this.root_.querySelector(`#${escapeCssSelectorIdent(dependencyId)}`),
          `The attribute '${ANIMATE_IN_AFTER_ATTRIBUTE_NAME}' in tag ` +
              `'${el.tagName}' is set to the invalid value ` +
              `'${dependencyId}'. No children of parenting 'amp-story-page' ` +
              `exist with id ${dependencyId}.`);

      animationDef.startAfterId =
          el.getAttribute(ANIMATE_IN_AFTER_ATTRIBUTE_NAME);
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
        .then(() => Services.webAnimationServiceFor(this.ampdoc_))
        .then(webAnimationService => webAnimationService.createBuilder());
  }

  /**
   * @param {!Element} el
   * @return {!StoryAnimationPresetDef}
   */
  getPreset_(el) {
    const name = el.getAttribute(ANIMATE_IN_ATTRIBUTE_NAME);
    setStyleForPreset(el, name);

    return user().assert(
        PRESETS[name],
        'Invalid %s preset "%s" for element %s',
        ANIMATE_IN_ATTRIBUTE_NAME,
        name,
        el);
  }
}


/** Bus for animation sequencing. */
class AnimationSequence {
  /**
   * @public
   */
  constructor() {
    /** @private @const {!Object<string, !Promise>} */
    this.subscriptionPromises_ = map();

    /** @private @const {!Object<string, !Function>} */
    this.subscriptionResolvers_ = map();
  }

  /** Decouples constructor for testing. */
  static create() {
    return new AnimationSequence();
  }

  /**
   * Notifies dependent elements that animation has finished.
   * @param {string} id
   */
  notifyFinish(id) {
    if (id in this.subscriptionPromises_) {
      dev().assert(this.subscriptionResolvers_[id])();

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
