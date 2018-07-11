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

import {
  MIN_VISIBILITY_RATIO_FOR_AUTOPLAY,
  VideoEvents,
} from '../../video-interface';
import {
  PositionObserverFidelity,
} from '../position-observer/position-observer-worker';
import {Services} from '../../services';
import {VideoServiceSignals} from '../video-service-interface';
import {VideoUtils} from '../../utils/video';
import {dev} from '../../log';
import {getData, listen, listenOnce} from '../../event-helper';
import {getMode} from '../../mode';
import {getServiceForDoc} from '../../service';
import {htmlFor} from '../../static-template';
import {installAutoplayStylesForDoc} from './install-autoplay-styles';
import {
  installPositionObserverServiceForDoc,
} from '../position-observer/position-observer-impl';
import {isFiniteNumber} from '../../types';
import {once} from '../../utils/function';
import {removeElement} from '../../dom';


/** @private @enum {string} */
export const AutoplayEvents = {
  PLAY: 'amp:autoplay',
  PAUSE: 'amp:autopause',
};

/**
 * @param {!Element} node
 * @return {!Element}
 */
function cloneDeep(node) {
  return dev().assertElement(node.cloneNode(/* deep */ true));
}


/**
 * @param {function(!Window, !Element):!Element} renderFn
 * @return {function(!Window, !Element):!Element}
 */
function renderOrClone(renderFn) {
  const seedFn = once(renderFn);
  return (win, doc) => cloneDeep(seedFn(win, doc));
}


/**
 * @param {!Window} unusedWin
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */
export function renderInteractionOverlay(unusedWin, elOrDoc) {
  const html = htmlFor(elOrDoc);
  return html`<i-amphtml-video-mask class="i-amphtml-fill-content" role=button>
    </i-amphtml-video-mask>`;
}


/**
 * @param {!Window} win
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */
export function renderIcon(win, elOrDoc) {
  const icon = htmlFor(elOrDoc)`<i-amphtml-video-icon class="amp-video-eq">
    <div class="amp-video-eq-col">
      <div class="amp-video-eq-filler"></div>
      <div class="amp-video-eq-filler"></div>
    </div>
  </i-amphtml-video-icon>`;

  // Copy equalizer column 4x and annotate filler positions for animation.
  const firstCol = dev().assertElement(icon.firstElementChild);
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

  return icon;
}


/**
 * @param {!Window} unusedWin
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */
const renderOrCloneInteractionOverlay = renderOrClone(renderInteractionOverlay);


/**
 * @param {!Window} unusedWin
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */
const renderOrCloneIcon = renderOrClone(renderIcon);


/** Manages autoplay video. */
export class Autoplay {

  /** @param {!../ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    /** @private @const {!../ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /**
     * @return {!../position-observer/position-observer-impl.PositionObserver}
     * @restricted
     */
    this.getPositionObserver_ = once(() => this.installPositionObserver_());

    /** @private @const {!Array<!AutoplayEntry>} */
    this.entries_ = [];

    /**
     * @return {!Promise<boolean>}
     * @private
     */
    this.isSupported_ = once(() => {
      // Can't destructure as the compiler expects direct member access for
      // `getMode`.
      const {win} = this.ampdoc_;
      const isLite = getMode(win).lite;
      return VideoUtils.isAutoplaySupported(win, /* isLiteMode */ isLite);
    });

    installAutoplayStylesForDoc(this.ampdoc_);
  }

  /** @private */
  installPositionObserver_() {
    installPositionObserverServiceForDoc(this.ampdoc_);
    // No getter in services.js.
    return (
      /** @type {
       *   !../position-observer/position-observer-impl.PositionObserver
       * } */ (getServiceForDoc(this.ampdoc_, 'position-observer')));
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @return {!Promise<?AutoplayEntry>} `null` when unsupported.
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
      const entry = AutoplayEntry.create(this, video);
      this.entries_.push(entry);
      return entry;
    });
  }

  /**
   * @param {!Element} element
   */
  delegate(element) {
    const entry = this.getEntryFor_(element);
    if (!entry) {
      return;
    }
    entry.delegate();
  }

  /**
   * @param {!Element} element
   * @return {?AutoplayEntry}
   * @private
   */
  getEntryFor_(element) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (entry.video.element == element) {
        return entry;
      }
    }
    return null;
  }
}


/** @visibleForTesting */
export class AutoplayEntry {

  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @param {
   *   !../position-observer/position-observer-impl.PositionObserver
   * } positionObserver
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   */
  constructor(ampdoc, positionObserver, video) {

    /** @const {!../../video-interface.VideoOrBaseElementDef} */
    this.video = video;

    /** @private {!../ampdoc-impl.AmpDoc} ampdoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!AmpElement}  */
    this.element_ = video.element;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {?Array<!UnlistenDef>} */
    this.visibilityUnlisteners_ = [
      this.observeOn_(positionObserver),
      this.listenToVisibilityChange_(),
    ];

    // Only muted videos are allowed to autoplay
    video.mute();
    video.hideControls();

    this.attachArtifacts_();
  }

  /**
   * @param {!Autoplay} manager
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   */
  static create(manager, video) {
    return new AutoplayEntry(
        manager.ampdoc_, manager.getPositionObserver_(), video);
  }

  /**
   * @param {
   *   !../position-observer/position-observer-impl.PositionObserver
   * } positionObserver
   * @return {!UnlistenDef}
   * @private
   */
  observeOn_(positionObserver) {
    return positionObserver.observe(
        this.element_,
        PositionObserverFidelity.HIGH,
        () => this.onPositionChange_());
  }

  /**
   * @return {!UnlistenDef}
   * @private
   */
  listenToVisibilityChange_() {
    return listen(this.element_, VideoEvents.VISIBILITY, e => {
      const data = getData(e);
      const enforcedByEvent = data && data['visible'];
      if (enforcedByEvent && !this.isVisible_) {
        this.isVisible_ = enforcedByEvent;
        this.trigger_(/* isPlaying */ enforcedByEvent);
        return;
      }
      this.triggerByVisibility_();
    });
  }

  /**
   * Delegates autoplay so that it's triggered by a different module.
   * @public
   */
  delegate() {
    this.disableTriggerByVisibility_();
    this.video.pause();
  }

  /** @private */
  onPositionChange_() {
    this.triggerByVisibility_();
  }

  /** @private */
  triggerByVisibility_() {
    const ratio = this.element_.getIntersectionChangeEntry().intersectionRatio;
    const isVisible = (!isFiniteNumber(ratio) ? 0 : ratio) >=
        MIN_VISIBILITY_RATIO_FOR_AUTOPLAY;
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

  /** @private */
  attachArtifacts_() {
    // TODO(alanorozco): AD_START, AD_END
    const {video} = this;
    const signals = video.signals();
    const userInteracted = VideoServiceSignals.USER_INTERACTED;

    if (signals.get(userInteracted) != null) {
      return;
    }

    const {win} = this.ampdoc_;

    const icon = renderOrCloneIcon(win, this.element_);

    video.mutateElement(() => {
      this.element_.appendChild(icon);
    });

    const {element} = video;
    const playOrPauseIconAnim = this.playOrPauseIconAnim_.bind(this, icon);

    const unlisteners = [
      listen(element, VideoEvents.PLAYING, () => playOrPauseIconAnim(true)),
      listen(element, VideoEvents.PAUSE, () => playOrPauseIconAnim(false)),
    ];

    signals.whenSignal(userInteracted).then(() => {
      unlisteners.forEach(unlisten => unlisten());
      this.onInteraction_();
    });

    if (!this.video.isInteractive()) {
      return;
    }

    const overlay = renderOrCloneInteractionOverlay(win, this.element_);

    listenOnce(overlay, 'click', () => signals.signal(userInteracted));

    video.mutateElement(() => {
      this.element_.appendChild(overlay);
    });
  }

  /** @private */
  onInteraction_() {
    const mask = this.element_.querySelector('i-amphtml-video-mask');
    this.disableTriggerByVisibility_();
    if (mask) {
      removeElement(mask);
    }
    if (this.video.isInteractive()) {
      this.video.showControls();
    }
    this.video.unmute();
  }

  /** @private */
  disableTriggerByVisibility_() {
    if (!this.visibilityUnlisteners_) {
      return;
    }
    this.visibilityUnlisteners_.forEach(unlistener => unlistener());
    this.visibilityUnlisteners_ = null; // GC
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
