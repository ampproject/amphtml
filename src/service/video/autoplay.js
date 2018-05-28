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
import {VideoUtils} from '../../../src/utils/video';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {getServiceForDoc} from '../../../src/service';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {listen, listenOnce} from '../../../src/event-helper';
import {once} from '../../../src/utils/function';
import {removeElement} from '../../../src/dom';


/**
 * Minimum visibility ratio required to tirgger autoplay.
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
  const el = htmlFor(doc)`
    <i-amphtml-video-mask class="i-amphtml-fill-content">
      <i-amphtml-video-icon class="amp-video-eq" ref="icon">
        <div class="amp-video-eq-col">
          <div class="amp-video-eq-filler"></div>
          <div class="amp-video-eq-filler"></div>
        </div>
      </i-amphtml-video-icon>
    </i-amphtml-video-mask>`;

  // Not using `htmlRefs` in this context as that is a destructive operation.
  const icon = el.firstElementChild;

  // Copy equalizer column 3x and annotate filler positions for animation.
  const firstCol = icon.firstElementChild;
  for (let i = 0; i < 4; i++) {
    const col = i == 0 ? firstCol : cloneDeep(firstCol);
    const fillers = col.children;
    for (let j = 0; j < fillers.length; j++) {
      const filler = fillers[j];
      filler.classList.add(`amp-video-eq-${i + 1}-${j + 1}`);
    }
    if (i != 0) {
      icon.appendChild(col);
    }
  }

  if (Services.platformFor(win).isIos()) {
    // iOS is unable to pause hardware accelerated animations.
    icon.setAttribute('unpausable', '');
  }

  return el;
});


/** @private @const {string} */
const AUTOPLAYED_PROP = '__AMP_AUTOPLAYED__';


/**
 * @implements {../video-analytics-provider.VideoAnalyticsProviderInterface}
 * @private
 */
class AutoplayEntry {
  /** @param {!AmpElement} element */
  constructor(element) {
    this.element_ = element;
  }

  /** @override */
  getAnalyticsDetails() {
    return {'autoplay': !!this.element_[AUTOPLAYED_PROP]};
  }
}

export class Autoplay {
  constructor(ampdoc, manager) {
    /** @private @const {!../../../src/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../../../src/video-manager-impl.VideoService} */
    this.manager_ = manager;

    /**
     * @return {!../../../src/service/position-observer-impl.PositionObserver]
     * @private
     */
    this.getPositionObserver_ = once(() => this.installPositionObserver_());

    /**
     * @return {!Promise<boolean>}
     * @private
     */
    this.isSupported_ = once(() => {
      // Can't destructure as the compiler expects direct member access for
      // `getMode`:
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
   * @param {!VideoOrBaseElementDef} video
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
        this.disableFor_(video);
        return null;
      }
      return this.registerInternal_(video);
    });
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @private
   */
  registerInternal_(video) {
    this.getPositionObserver_().observe(video.element, /* fidelity = HIGH */ 1,
        () => this.onIntersectionChange_(video));

    video.hideControls();

    // Only muted videos are allowed to autoplay
    video.mute();

    this.attachInteractionOverlay_(video);

    return new AutoplayEntry(video.element);
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  // TODO(alanorozco): AD_START, AD_END
  attachInteractionOverlay_(video) {
    const overlay = renderInteractionOverlay(this.ampdoc_.win, video.element);
    const {icon} = htmlRefs(overlay);

    const {element} = video;
    // TODO: Use constants

    const playOrPauseIconAnim =
        this.playOrPauseIconAnim_.bind(this, video, icon);

    const unlisteners = [
      listen(element, 'playing', () => playOrPauseIconAnim(true)),
      listen(element, 'pause', () => playOrPauseIconAnim(false)),
    ];

    listenOnce(overlay, 'click', () => {
      unlisteners.forEach(unlisten => unlisten());
      this.onInteraction_(video, overlay);
    });

    video.mutateElement(() => {
      video.element.appendChild(overlay);
    });
  }

  /**[onInteraction_ description]
   * @param  {[type]} video   [description]
   * @param  {[type]} overlay [description]
   * @return {[type]}         [description]
   */
  onInteraction_(video, overlay) {
    const {element} = video;
    if (video.isInteractive()) {
      video.showControls();
    }
    element[AUTOPLAYED_PROP] = false;
    video.unmute();
    removeElement(overlay);
  }

  playOrPauseIconAnim_(video, icon, isPlaying) {
    video.mutateElement(() =>
      icon.classList.toggle('amp-video-eq-play', isPlaying));
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  disableFor_(video) {
    if (!video.isInteractive) {
      return;
    }
    video.showControls();
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!Observable<boolean>} observable
   * @return {!UnlistenDef}
   */
  delegate(video, observable) {
    try {
      this.getPositionObserver_().unobserve(video.element);
    } catch (e) {
      // When unobserving an already unobserved element, PositionObserver will
      // complain. From this perspective we don't care, as we expect such a case
      // to be a NO-OP.
      dev().warn('POSITION-OBSERVER-COMPLAINT', 'On unobserve', e);
    }
    return observable.add(isVisible => this.onVisibilityChange_(isVisible));
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  onIntersectionChange_(video) {
    const {intersectionRatio} = video.element.getIntersectionChangeEntry();
    this.onVisibilityChange_(video, intersectionRatio >= MIN_RATIO);
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {number} ratio
   * @private
   */
  onVisibilityChange_(video, isVisible) {
    if (isVisible) {
      this.play_(video);
    } else {
      this.pause_(video);
    }
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  play_(video) {
    const {element} = video;
    if (!(AUTOPLAYED_PROP in element)) {
      element[AUTOPLAYED_PROP] = true;
    }
    video.play(/* isAuto */ true);
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  pause_(video) {
    video.pause();
  }
}

