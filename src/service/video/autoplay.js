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

import {Services} from '../../services';
import {VideoServiceSignals} from '../video-service-interface';
import {VideoUtils} from '../../utils/video';
import {getMode} from '../../mode';
import {getServiceForDoc} from '../../service';
import {htmlFor, htmlRefs} from '../../static-template';
import {
  installPositionObserverServiceForDoc,
} from '../position-observer/position-observer-impl';
import {listen, listenOnce} from '../../event-helper';
import {once} from '../../utils/function';
import {removeElement} from '../../dom';


/**
 * Minimum visibility ratio required to trigger autoplay.
 * @private @const {number}
 */
const MIN_RATIO = 0.75;


/**
 * @param {!Node} node
 * @return {!Node}
 */
function cloneDeep(node) {
  return node.cloneNode(/* deep */ true);
}


/**
 * @param {function(!Window, !Node):!Node} renderFn
 * @return {function(!Window, !Node):!Node}
 */
function renderOrClone(renderFn) {
  const seedFn = once(renderFn);
  return (win, doc) => cloneDeep(seedFn(win, doc));
}


/**
 * @param {!Window} win
 * @param {!Node} doc
 * @return {!Element}
 */
const renderInteractionOverlay = renderOrClone((win, doc) => {
  const el = htmlFor(doc)`<i-amphtml-video-mask class="i-amphtml-fill-content">
    <i-amphtml-video-icon class="amp-video-eq" ref="icon">
      <div class="amp-video-eq-col">
        <div class="amp-video-eq-filler"></div>
        <div class="amp-video-eq-filler"></div>
      </div>
    </i-amphtml-video-icon>
  </i-amphtml-video-mask>`;

  // Not using `htmlRefs` in this context as that is a destructive operation.
  const icon = el.firstElementChild;

  // Copy equalizer column 4x and annotate filler positions for animation.
  const firstCol = icon.firstElementChild;
  for (let i = 0; i < 4; i++) {
    const col = cloneDeep(firstCol);
    const fillers = col.children;
    for (let j = 0; j < fillers.length; j++) {
      const filler = fillers[j];
      filler.classList.add(`amp-video-eq-${i + 1}-${j + 1}`);
    }
    icon.appendChild(col);
  }

  // Remove seed column.
  removeElement(firstCol);

  if (Services.platformFor(win).isIos()) {
    // iOS is unable to pause hardware accelerated animations.
    icon.setAttribute('unpausable', '');
  }

  return el;
});


/** @private @enum {string} */
const AutoplayEvents = {PLAY: 'amp:autoplay', PAUSE: 'amp:autopause'};


/** Manages autoplay video. */
export class Autoplay {

  /** @param {!../../ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    /** @private @const {!../../ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /**
     * @return {!../../service/position-observer-impl.PositionObserver}
     * @private
     */
    this.getPositionObserver_ = once(() => this.installPositionObserver_());

    /**
     * @private @const {!Array<{element: !Element, entry: !AutoplayEntry}>}
     */
    this.entries_ = [];

    /**
     * @return {!Promise<boolean>}
     * @private
     */
    this.isSupported_ = once(() => {
      // Can't destructure as the compiler expects direct member access for
      // `getMode`.
      const isLite = getMode(win).lite;
      const {win} = this.ampdoc_;
      return VideoUtils.isAutoplaySupported(win, /* isLiteMode */ isLite);
    });
  }

  /** @private */
  installPositionObserver_() {
    installPositionObserverServiceForDoc(this.ampdoc_);
    // No getter in services.js.
    return /** @type {!PositionObserver} */ (
      getServiceForDoc(this.ampdoc_, 'position-observer'));
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @return {?AutoplayEntry} `null` when unsupported.
   */
  register(video) {
    // Controls are hidden before support is determined to prevent visual jump
    // for the common case where autoplay is supported.
    if (video.isInteractive()) {
      video.hideControls();
    }

    return this.isSupported_().then(isSupported => {
      if (!isSupported) {
        // Disable autoplay
        if (video.isInteractive()) {
          video.showControls();
        }
        return null;
      }
      const entry =
        new AutoplayEntry(this.ampdoc_, this.getPositionObserver_(), video);
      this.entries_.push(entry);
      return entry;
    });
  }

  /**
   * @param {!Element} element
   * @param {!../../observable.Observable<boolean>} observable
   */
  delegate(element, observable) {
    const entry = this.getEntryFor_(element);
    if (!entry) {
      return;
    }
    entry.delegateTo(observable);
  }

  getEntryFor_(element) {
    return this.entries_.find(entry => entry.video.element == element);
  }
}


/** @visibleForTesting */
export class AutoplayEntry {

  /**
   * @param {!../../ampdoc-impl.AmpDoc} ampdoc
   * @param {!../position-observer-impl.PositionObserver} positionObserver
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   */
  constructor(ampdoc, positionObserver, video) {

    this.ampdoc_ = ampdoc;

    /** @const {!../../video-interface.VideoOrBaseElementDef} */
    this.video = video;

    /** @private @const {!AmpElement}  */
    this.element_ = video.element;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private @const {!UnlistenDef} */
    this.unlistener_ = this.observeOn_(positionObserver);

    // Only muted videos are allowed to autoplay
    video.mute();
    video.hideControls();

    this.attachInteractionOverlay_();
  }

  /**
   * @param {!../position-observer-impl.PositionObserver} positionObserver
   * @private
   */
  observeOn_(positionObserver) {
    return positionObserver.observe(
        this.element_,
        /* fidelity = HIGH */ 1,
        () => this.onPositionChange_());
  }

  /**
   * @param {!../../observable.Observable<boolean>} playbackObservable
   * @public
   */
  delegateTo(playbackObservable) {
    if (this.unlistener_) {
      this.unlistener_();
    }
    this.unlistener_ =
        playbackObservable.add(isPlaying => this.trigger_(isPlaying));
  }

  /** @private */
  onPositionChange_() {
    const {intersectionRatio} = this.element_.getIntersectionChangeEntry();
    const isVisible = intersectionRatio >= MIN_RATIO;
    if (this.isVisible_ == isVisible) {
      return;
    }
    this.isVisible_ = isVisible;
    this.trigger_(/* isPlaying */ isVisible);
  }

  /**
   * @param {boolean} isPlaying
   * @private
   */
  trigger_(isPlaying) {
    this.element_.dispatchCustomEvent(
        isPlaying ? AutoplayEvents.PLAY : AutoplayEvents.PAUSE);
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  // TODO(alanorozco): AD_START, AD_END
  attachInteractionOverlay_() {
    const {video} = this;
    const signals = video.signals();
    const userInteracted = VideoServiceSignals.USER_INTERACTED;

    if (signals.get(userInteracted) != null) {
      return;
    }

    const overlay = renderInteractionOverlay(this.ampdoc_.win, this.element_);
    const {icon} = /** @type {{icon: !Element}} */ htmlRefs(overlay);

    const {element} = video;

    const playOrPauseIconAnim = this.playOrPauseIconAnim_.bind(this, icon);

    const unlisteners = [
      listen(element, 'playing', () => playOrPauseIconAnim(true)),
      listen(element, 'pause', () => playOrPauseIconAnim(false)),
    ];

    listenOnce(overlay, 'click', () => signals.signal(userInteracted));

    signals.whenSignal(userInteracted).then(() => {
      unlisteners.forEach(unlisten => unlisten());
      this.onInteraction_();
    });

    video.mutateElement(() => {
      this.element_.appendChild(overlay);
    });
  }

  /** @private */
  onInteraction_() {
    const mask = this.element_.querySelector('i-amphtml-video-mask');
    if (mask) {
      removeElement(mask);
    }
    if (this.video.isInteractive()) {
      this.video.showControls();
    }
    this.video.unmute();
  }

  /**
   * @param {!Element} icon
   * @param {boolean} isPlaying
   * @private
   */
  playOrPauseIconAnim_(icon, isPlaying) {
    this.video.mutateElement(() =>
      icon.classList.toggle('amp-video-eq-play', isPlaying));
  }
}
