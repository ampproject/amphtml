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

import {HtmlLiteralTagDef} from './html';
import {
  PlayingStates,
  VideoEvents,
} from '../../../src/video-interface';
import {Services} from '../../../src/services';
import {Timeout} from './timeout';
import {VideoDockingEvents, pointerCoords} from './events';
import {applyBreakpointClassname} from './breakpoints';
import {closestAncestorElementBySelector} from '../../../src/dom';
import {createCustomEvent, listen} from '../../../src/event-helper';
import {dev, devAssert} from '../../../src/log';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {once} from '../../../src/utils/function';
import {
  resetStyles,
  setImportantStyles,
  toggle,
  translate,
} from '../../../src/style';


const TAG = 'amp-video-docking-controls';


/** @private @const {!Array<!./breakpoints.SyntheticBreakpointDef>} */
const BREAKPOINTS = [
  {
    className: 'amp-small',
    minWidth: 0,
  },
  {
    className: 'amp-large',
    minWidth: 300,
  },
];


const TIMEOUT = 1200;
const TIMEOUT_AFTER_INTERACTION = 800;


/**
 * @param {!Element} a
 * @param {!Element} b
 * @private
 */
function swap(a, b) {
  toggle(a, false);
  toggle(b, true);
}


/**
 * @param {!HtmlLiteralTagDef} html
 * @return {!Element}
 * @private
 */
const renderDockedOverlay = html =>
  html`<div class="i-amphtml-video-docked-overlay" hidden></div>`;


/**
 * @param {!HtmlLiteralTagDef} html
 * @return {!Element}
 * @private
 */
const renderControls = html =>
  html`<div class="amp-video-docked-controls" hidden>
  <div class="amp-video-docked-main-button-group">
    <div class="amp-video-docked-button-group">
      <div role="button"
          ref="playButton"
          class="amp-video-docked-play">
      </div>
      <div role="button"
          ref="pauseButton"
          class="amp-video-docked-pause">
      </div>
    </div>
    <div class="amp-video-docked-button-group">
      <div role="button"
          ref="muteButton"
          class="amp-video-docked-mute">
      </div>
      <div role="button"
          ref="unmuteButton"
          class="amp-video-docked-unmute">
      </div>
    </div>
    <div class="amp-video-docked-button-group">
      <div role="button"
          ref="fullscreenButton"
          class="amp-video-docked-fullscreen">
      </div>
    </div>
  </div>
  <div class="amp-video-docked-button-dismiss-group"
      ref="dismissContainer">
    <div role="button"
        ref="dismissButton"
        class="amp-video-docked-dismiss">
    </div>
  </div>
</div>`;


export class Controls {

  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    // TODO(alanorozco): `htmlFor` should work with `ShadowRoot`
    const html = htmlFor(dev().assertElement(ampdoc.getBody()));

    /** @public @const {!Element}  */
    this.container = renderControls(html);

    /** @public @const {!Element} */
    this.overlay = renderDockedOverlay(html);

    /** @private @const */
    this.manager_ = once(() => Services.videoManagerForDoc(ampdoc));

    const refs = htmlRefs(this.container);
    const assertRef = ref => dev().assertElement(refs[ref]);

    /** @private @const {!Element} */
    this.dismissButton_ = assertRef('dismissButton');

    /** @private @const {!Element} */
    this.playButton_ = assertRef('playButton');

    /** @private @const {!Element} */
    this.pauseButton_ = assertRef('pauseButton');

    /** @private @const {!Element} */
    this.muteButton_ = assertRef('muteButton');

    /** @private @const {!Element} */
    this.unmuteButton_ = assertRef('unmuteButton');

    /** @private @const {!Element} */
    this.fullscreenButton_ = assertRef('fullscreenButton');

    /** @private @const {!Element} */
    this.dismissContainer_ = assertRef('dismissContainer'); // eslint-disable-line

    /** @private {boolean} */
    this.isDisabled_ = false;

    /** @private {boolean} */
    this.isSticky_ = false;

    /** @private {function():!Timeout} */
    this.getHideTimeout_ = once(() => new Timeout(this.ampdoc_.win, () => {
      this.hide(/* respectSticky */ true);
    }));

    /** @private @const {!Array<!UnlistenDef>} */
    this.videoUnlisteners_ = [];

    /** @private {?UnlistenDef} */
    this.mouseMoveUnlistener_ = null;

    /** @private {?UnlistenDef} */
    this.mouseOutUnlistener_ = null;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.area_ = null;

    /** @private {?../../../src/video-interface.VideoOrBaseElementDef} */
    this.video_ = null;

    this.hideOnTapOutside_();
    this.showOnTapOrHover_();
  }

  /** @public */
  disable() {
    dev().info(TAG, 'disable');
    this.isDisabled_ = true;
  }

  /** @public */
  enable() {
    dev().info(TAG, 'enable');
    this.isDisabled_ = false;
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {!../../../src/layout-rect.LayoutRectDef} area
   */
  setVideo(video, area) {
    this.area_ = area;

    if (this.video_ != video) {
      this.video_ = video;
      this.listen_(video);
    }
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @private
   */
  listen_(video) {
    this.unlisten_();

    const click = 'click';

    const {element} = video;

    this.videoUnlisteners_.push(
        this.listenWhenEnabled_(this.dismissButton_, click, () => {
          this.container.dispatchEvent(
              createCustomEvent(this.ampdoc_.win,
                  VideoDockingEvents.DISMISS_ON_TAP, /* detail */ undefined));
        }),

        this.listenWhenEnabled_(this.playButton_, click, () => {
          video.play(/* auto */ false);
        }),

        this.listenWhenEnabled_(this.pauseButton_, click, () => {
          video.pause();
        }),

        this.listenWhenEnabled_(this.muteButton_, click, () => {
          video.mute();
        }),

        this.listenWhenEnabled_(this.unmuteButton_, click, () => {
          video.unmute();
        }),

        this.listenWhenEnabled_(this.fullscreenButton_, click, () => {
          video.fullscreenEnter();
        }),

        listen(this.container, 'mouseup', () =>
          this.hideOnTimeout(TIMEOUT_AFTER_INTERACTION)),

        listen(element, VideoEvents.PLAYING, () => this.onPlay_()),
        listen(element, VideoEvents.PAUSE, () => this.onPause_()),
        listen(element, VideoEvents.MUTED, () => this.onMute_()),
        listen(element, VideoEvents.UNMUTED, () => this.onUnmute_()));
  }

  /**
   * @return {boolean}
   * @private
   */
  isPlaying_() {
    devAssert(this.video_);
    return this.manager_().getPlayingState(this.video_) != PlayingStates.PAUSED;
  }

  /** @private */
  onPlay_() {
    const {playButton_, pauseButton_} = this;
    this.isSticky_ = false;
    swap(playButton_, pauseButton_);
  }

  /** @private */
  onPause_() {
    const {pauseButton_, playButton_} = this;
    this.isSticky_ = true;
    swap(pauseButton_, playButton_);
  }

  /** @private */
  onMute_() {
    const {muteButton_, unmuteButton_} = this;
    swap(muteButton_, unmuteButton_);
  }

  /** @private */
  onUnmute_() {
    const {unmuteButton_, muteButton_} = this;
    swap(unmuteButton_, muteButton_);
  }

  /**
   * @param {!Element} element
   * @param {string} eventType
   * @param {function()} callback
   * @return {!UnlistenDef}
   * @private
   */
  listenWhenEnabled_(element, eventType, callback) {
    return listen(element, eventType, () => {
      if (this.isDisabled_) {
        return;
      }
      callback();
    });
  }

  /** @private */
  unlisten_() {
    while (this.videoUnlisteners_.length > 0) {
      this.videoUnlisteners_.pop().call();
    }
  }

  /** @param {number=} timeout */
  hideOnTimeout(timeout = TIMEOUT) {
    this.getHideTimeout_().trigger(timeout);
  }

  /** @private */
  showOnTapOrHover_() {
    const {overlay} = this;
    const boundShow = () => this.show_();

    this.listenWhenEnabled_(overlay, 'click', boundShow);
    this.listenWhenEnabled_(overlay, 'mouseover', boundShow);
  }

  /** @private */
  show_() {
    // Delay by one animation frame to stop mouseover-click sequence mistrigger.
    // See https://jsbin.com/rohesijowi/1/edit?output on Chrome (Blink) on a
    // touch device/device mode.
    this.ampdoc_.win.requestAnimationFrame(() => {
      this.showOnNextAnimationFrame_();
    });
  }

  /** @private */
  showOnNextAnimationFrame_() {
    const {
      container,
      overlay,
      playButton_: playButton,
      pauseButton_: pauseButton,
      muteButton_: muteButton,
      unmuteButton_: unmuteButton,
    } = this;

    toggle(container, true);
    container.classList.add('amp-video-docked-controls-shown');
    overlay.classList.add('amp-video-docked-controls-bg');

    this.listenToMouseMove_();

    if (this.isPlaying_()) {
      swap(playButton, pauseButton);
    } else {
      swap(pauseButton, playButton);
    }

    if (this.manager_().isMuted(this.video_)) {
      swap(muteButton, unmuteButton);
    } else {
      swap(unmuteButton, muteButton);
    }

    this.hideOnTimeout();
  }

  /**
   * @param {number} scale
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  positionOnVsync(scale, x, y, width, height) {
    const {
      container,
      dismissContainer_: dismissContainer,
    } = this;
    const halfScale = scale / 2;
    const centerX = x + (width * halfScale);
    const centerY = y + (height * halfScale);

    applyBreakpointClassname(container, scale * width, BREAKPOINTS);

    setImportantStyles(container, {
      'transform': translate(centerX, centerY),
    });

    const dismissMargin = 4;
    const dismissWidth = 40;
    const dismissX = width * halfScale - dismissMargin - dismissWidth;
    const dismissY = -(height * halfScale - dismissMargin - dismissWidth);
    setImportantStyles(dismissContainer, {
      'transform': translate(dismissX, dismissY),
    });
  }

  /** @private */
  hideOnTapOutside_() {
    listen(this.ampdoc_.getRootNode(), 'mousedown', e => {
      if (this.isControlsTarget_(dev().assertElement(e.target))) {
        return;
      }
      this.hide(/* respectSticky */ true);
    });
  }

  /**
   * @param {!Element} target
   * @return {boolean}
   * @private
   */
  isControlsTarget_(target) {
    return target == this.overlay ||
      !!closestAncestorElementBySelector(target, '.amp-video-docked-controls');
  }

  /**
   * @param {boolean=} opt_respectSticky
   * @param {boolean=} opt_immediately Disables transition
   * @public
   */
  hide(opt_respectSticky, opt_immediately) {
    const ampVideoDockedControlsShown = 'amp-video-docked-controls-shown';
    const {container, overlay} = this;
    if (!container.classList.contains(ampVideoDockedControlsShown)) {
      return;
    }
    if (opt_respectSticky && this.isSticky_) {
      return;
    }
    if (opt_immediately) {
      toggle(container, false);
      toggle(overlay, false);
    }
    overlay.classList.remove('amp-video-docked-controls-bg');
    container.classList.remove(ampVideoDockedControlsShown);
  }

  /** @private */
  listenToMouseMove_() {
    if (this.mouseMoveUnlistener_) {
      return;
    }

    this.mouseMoveUnlistener_ = listen(this.overlay, 'mousemove', () => {
      this.show_();
    });

    this.mouseOutUnlistener_ = listen(this.overlay, 'mouseout', e => {
      devAssert(this.area_);

      const {x, y} = pointerCoords(/** @type {!MouseEvent} */ (e));
      const {left, top, right, bottom} = this.area_;

      // check bounding box as not to trigger this while mouse hovers over
      // buttons
      if (!(x < left || x > right || y < top || y > bottom)) {
        return;
      }

      this.hide(/* respectSticky */ true);
      this.unlistenToMouseMovement_();
    });
  }

  /** @private */
  unlistenToMouseMovement_() {
    if (this.mouseMoveUnlistener_) {
      this.mouseMoveUnlistener_();
      this.mouseMoveUnlistener_ = null;
    }
    if (this.mouseOutUnlistener_) {
      this.mouseOutUnlistener_();
      this.mouseOutUnlistener_ = null;
    }
  }

  /** @public */
  reset() {
    const {overlay, container} = this;
    const els = [overlay, container];

    toggle(overlay, false);

    this.hide();

    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      resetStyles(el, [
        'transform',
        'transition',
        'width',
        'height',
      ]);
    }
  }
}
