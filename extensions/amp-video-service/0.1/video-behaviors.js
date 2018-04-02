/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {VideoAttributes} from '../../../src/video-interface';
import {VideoEvents} from '../../../src/video-interface';
import {VideoUtils} from '../../../src/utils/video';
import {
  createElementWithAttributes,
  removeElement,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {listen, listenOnce} from '../../../src/event-helper';
import {once} from '../../../src/utils/function';

/**
 * @fileoverview
 * `VideoBehaviors` exist throughout the lifetime of a video component. Each has
 * a spefic responsibility.
 */


/**
 * Subclasses are instantiated by {@see ./amp-video-service.VideoEntry}.
 *
 * These only need to be instantiated to override any of the optional methods.
 * If a behavior does not require overriding, consider using a simple function
 * instead.
 *
 * @abstract @package
 */
export class VideoBehavior {
  /**
   * Optionally provides analytics details to be appended in every event.
   * @return {?Promise<!JsonObject>}
   */
  getAnalyticsDetails() {
    return null;
  }

  /**
   * Optionally provides a `Promise` that will block autoplay triggers.
   * @return {?Promise}
   */
  delayAutoplay() {
    return null;
  }
}


// Small optimization to clone nodes after first creation.
let autoplayInteractionMaskSeed;


/**
 * @param {!Window} win
 * @param {!Document} doc
 * @return {!Element}
 */
// TODO(alanorozco): Good use case for #13906.
function createEqualizerIcon(win, doc) {
  const platform = Services.platformFor(/** @type {!Window} */ (win));

  const el = createElementWithAttributes(doc, 'i-amphtml-video-icon', dict({
    'class': 'amp-video-eq',
  }));

  // Equalizer columns.
  for (let i = 1; i <= 4; i++) {
    const column = createElementWithAttributes(doc, 'div', dict({
      'class': 'amp-video-eq-col',
    }));

    // Overlapping filler divs that animate at different rates.
    for (let j = 1; j <= 2; j++) {
      column.appendChild(createElementWithAttributes(doc, 'div', dict({
        'class': `amp-video-eq-${i}-${j}`,
      })));
    }

    el.appendChild(column);
  }

  // iOS is unable to pause hardware accelerated animations.
  if (platform.isIos()) {
    el.setAttribute('unpausable', '');
  }

  return el;
}


/** @visibleForTesting */
export class Autoplay extends VideoBehavior {

  /**
   * @param {!Window} win
   * @param {!../../../src/video-interface.VideoInterface} impl
   * @param {!../../../src/observable.ObservableInterface<boolean>} visibility
   */
  constructor(win, impl, visibility) {
    const {element} = impl;

    super();

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?../../../src/video-interface.VideoInterface} */
    this.impl_ = impl;

    /** @private {boolean} */
    this.isEnabled_ = false;

    /** @private {boolean} */
    this.userInteracted_ = false;

    /** @private {?Array<!UnlistenDef>} */
    this.unlisteners_ = null;

    /** @private {?AutoplayInteractionMask} */
    this.mask_ = null;

    /** @private {?../../../src/observable.ObservableInterface<boolean>} */
    this.triggerObservable_ = visibility;

    /** @private @const {!function():!Promise<boolean>} */
    this.isSupported_ = once(() => {
      const win = this.win_;
      const {lite} = getMode(win);
      return VideoUtils.isAutoplaySupported(win, /* isLiteMode */ lite);
    });

    /** @private {null|!UnlistenDef} */
    this.unlisten_ = null;
  }

  /**
   * @param {!Window} win
   * @param {!../../../src/video-interface.VideoInterface} impl
   */
  static create(win, impl, entry) {
    return new Autoplay(win, impl, entry.getAutoplayObservable());
  }

  /**
   * @param {!../../../src/video-interface.VideoInterface} impl
   * @return {boolean}
   */
  static shouldEnableFor(impl) {
    const {element} = impl;
    return element.hasAttribute(VideoAttributes.AUTOPLAY);
  }

  /** @return {!Promise<boolean>} */
  isSupported() {
    return this.isSupported_();
  }

  /** @public @return {!Promise<!UnlistenDef>}*/
  enable() {
    if (this.isEnabled_) {
      return Promise.resolve(this.unlisten_);
    }

    const impl = this.impl_;

    this.isEnabled_ = true;

    // Controls are hidden before support is determined to prevent visual jump
    // for the common case where autoplay is supported.
    if (impl.isInteractive()) {
      impl.hideControls();
    }

    return Promise.all([
      this.isSupported(),
      element.signals().whenSignal(CommonSin)
    ]).then(isSupported => {
      if (!isSupported && impl.isInteractive()) {
        impl.showControls();
        return null;
      }
      return this.enableInternal_();
    });
  }

  destroy() {
    // TODO(alanorozco): Implement
  }

  delayAutoplay() {
    return this.isSupported();
  }

  /** @private @return {!UnlistenDef} */
  enableInternal_() {
    this.unlisteners_ = [
      this.buildInteractionMask(),
      this.triggerObservable_.add(play => this.playOrPause_(play)),
    ];

    // Only muted videos are allowed to autoplay
    this.impl_.mute();

    this.unlisten_ = () => {
      this.unlisteners_.forEach(u => u());
    };

    return this.unlisten_;
  }

  /** @return {boolean} */
  occurred() {
    return this.autoplayOccurred_;
  }

  /**
   * Creates a mask overlay to intercept a tap event, as the video element
   * can be iframe-based or composed in any other way.
   * @return {!UnlistenDef}
   * @visibleForTesting
   */
  buildInteractionMask() {
    const win = this.win_;
    const {element} = this.impl_;
    const {ownerDocument} = element;

    const mask = new InteractionMaske(win, ownerDocument, element);

    const unlistenOnClick = listenOnce(mask.getRoot(), 'click',
        () => this.onMaskClick());

    this.mask_ = mask;

    return () => {
      unlistenOnClick();
      this.removeMask_();
    };
  }

  /** @visibleForTesting */
  onMaskClick() {
    this.removeMask_();
    this.onFirstInteraction_();
  }

  /** @private */
  onFirstInteraction_() {
    const impl = this.impl_;

    this.userInteracted_ = true;

    if (impl.isInteractive()) {
      // TODO(alanorozco): ?
      impl.showControls();
    }

    impl.unmute();
    this.removeMask_();
  }

  removeMask_() {
    if (!this.mask_) {
      return;
    }
    this.mask_.destroy();
    this.mask_ = null; // GC
  }

  /** @param {boolean} isVisible */
  playOrPause_(isVisible) {
    const {element} = this.impl_;
    const impl = this.impl_;

    if (!this.userInteracted_) {
      this.autoplayOccurred_ = true;
    }
    if (isVisible) {
      impl.play(/* isAutoplay */ true);
    } else {
      impl.pause();
    }
  }

  /** @override */
  getAnalyticsDetails() {
    const {element} = this.impl_;
    return this.isSupported().then(isSupported => dict({
      'autoplay': this.autoplayOccurred_,
    }));
  }

  delegate(observable) {
    this.delegated_ = true;
    this.observable_ = observable;

    if (this.isPlaying_) {
      // NOTE(alanorozco): This might be a useless check.
      this.video.pause();
    }

    // Assume that component to which autoplay is delegated implements its own
    // interaction model.
    this.removeMask_();
  }
}


class AutoplayInteractionMask {
  constructor(win, doc, container) {
    /** @private {!Document|!Window} */
    this.win_ = win;

    /** @private {!Document|!ShadowRoot} */
    this.doc_ = doc;

    /** @private {?Array<!Element>} */
    this.container_ = container;

    /** @private {?Array<!UnlistenDef>} */
    this.unlisteners_ = null;

    /** @private {?Array<!Element>} */
    this.elements_ = null;
  }

  /** @public */
  build() {
    const container = this.container_;
    const vsync = Services.vsyncFor(this.win_);

    const fragment = this.doc_.createDocumentFragment();

    const icon = createEqualizerIcon() ?
      equalizerIcon.cloneNode(/* deep */ true)
      (equalizerIcon = EqualizerIcon.create(this.win_, this.doc_));

    const playOrPauseIconAnim = isPlaying =>
      vsync.mutate(() => icon.classList.toggle('amp-video-eq-play', isPlaying));

    const mask = createElementWithAttributes(this.doc_,
        'i-amphtml-video-mask',
        dict({'class': 'i-amphtml-fill-content'}));

    const toggleMask = show => vsync.mutate(() => {
      if (show) {
        mask.removeAttribute('hidden');
        return;
      }
      mask.setAttribute('hidden', '');
    });

    this.unlisteners_ = [
      listen(container, VideoEvents.PAUSE, () => playOrPauseIconAnim(false)),
      listen(container, VideoEvents.PLAYING, () => playOrPauseIconAnim(true)),

      listenOnce(container, VideoEvents.AD_START, () => toggleMask(false)),
      listenOnce(container, VideoEvents.AD_END, () => toggleMask(true)),
    ];

    icon.classList.add();

    fragment.appendChild(icon);
    fragment.appendChild(mask);

    this.elements_ = this.elements_ || [];

    this.elements_.push(icon, mask);

    vsync.mutate(() =>
      container.appendChild(fragment));

    return mask;
  }

  destroy() {
    if (this.elements_) {
      this.elements_.forEach(removeElement);
    }
    this.unlisteners_.forEach(u => u());
    this.unlisteners_ = null; // GC
    this.elements_ = null; // GC
  }
}
