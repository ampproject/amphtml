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
import {EventType, dispatch} from './events';
import {createElementWithAttributes} from '../../../src/dom';
import {dev} from '../../../src/log';
import {Services} from '../../../src/services';
import {ProgressBar} from './progress-bar';


/**
 * @param {!../../../src/service/vsync-impl.Vsync} vsync
 * @param {!Element} el
 * @param {boolean} isHidden
 */
function toggleHiddenAttribute(vsync, el, isHidden) {
  vsync.mutate(() => {
    if (isHidden) {
      el.setAttribute('hidden', 'hidden');
    } else {
      el.removeAttribute('hidden');
    }
  });
}


/**
 * @param {!Document} doc
 * @param {string} className
 * @param {boolean=} opt_hidden
 * @return {!Element}
 */
function buildButton(doc, className, opt_hidden) {
  const button = createElementWithAttributes(doc, 'div',
      /** @type {!JsonObject} */ ({
        class: `i-amphtml-story-button ${className}`,
        role: `button`,
      }));

  if (opt_hidden) {
    button.setAttribute('hidden', true);
  }

  return button;
}


/**
 * System Layer (i.e. UI Chrome) for <amp-story>.
 * Chrome contains:
 *   - mute/unmute button
 *   - fullscreen button
 *   - story progress bar
 *   - bookend close butotn
 */
export class SystemLayer {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.exitFullScreenBtn_ = null;

    /** @private {?Element} */
    this.closeBookendBtn_ = null;

    /** @private {?Element} */
    this.muteAudioBtn_ = null;

    /** @private {?Element} */
    this.unmuteAudioBtn_ = null;

    /** @private @const {!ProgressBar} */
    this.progressBar_ = ProgressBar.create(win);
  }

  /**
   * @param {number} pageCount The number of pages in the story.
   * @return {!Element}
   */
  build(pageCount) {
    if (this.isBuilt_) {
      return this.getRoot();
    }

    const fragment = this.win_.document.createDocumentFragment();

    const rightSectionButtons =
        createElementWithAttributes(this.win_.document, 'div',
            /** @type {!JsonObject} */ ({
              class: 'i-amphtml-story-ui-right',
            }));

    this.isBuilt_ = true;

    this.unmuteAudioBtn_ = buildButton(this.win_.document,
        'i-amphtml-story-unmute-audio-control');

    this.muteAudioBtn_ = buildButton(this.win_.document,
        'i-amphtml-story-mute-audio-control');

    this.exitFullScreenBtn_ = buildButton(this.win_.document,
        'i-amphtml-story-exit-fullscreen',
        /* opt_hidden */ true);

    this.closeBookendBtn_ = buildButton(this.win_.document,
        'i-amphtml-story-bookend-close',
        /* opt_hidden */ true);

    rightSectionButtons.appendChild(this.unmuteAudioBtn_);
    rightSectionButtons.appendChild(this.muteAudioBtn_);
    rightSectionButtons.appendChild(this.exitFullScreenBtn_);
    rightSectionButtons.appendChild(this.closeBookendBtn_);

    fragment.appendChild(this.progressBar_.build(pageCount));
    fragment.appendChild(rightSectionButtons);

    this.root_ = this.win_.document.createElement('aside');
    this.root_.classList.add('i-amphtml-story-system-layer');

    this.root_.appendChild(fragment);

    this.addEventHandlers_();

    return this.getRoot();
  }

  /**
   * @private
   */
  addEventHandlers_() {
    // TODO(alanorozco): Listen to tap event properly (i.e. fastclick)
    this.exitFullScreenBtn_.addEventListener(
        'click', e => this.onExitFullScreenClick_(e));

    this.closeBookendBtn_.addEventListener(
        'click', e => this.onCloseBookendClick_(e));

    this.muteAudioBtn_.addEventListener(
        'click', e => this.onMuteAudioClick_(e));

    this.unmuteAudioBtn_.addEventListener(
        'click', e => this.onUnmuteAudioClick_(e));
  }

  /**
   * @return {!Element}
   */
  getRoot() {
    return dev().assertElement(this.root_);
  }

  /**
   * @param {boolean} inFullScreen
   */
  setInFullScreen(inFullScreen) {
    this.toggleExitFullScreenBtn_(inFullScreen);
  }

  /**
   * @param {boolean} isEnabled
   * @private
   */
  toggleExitFullScreenBtn_(isEnabled) {
    toggleHiddenAttribute(
        Services.vsyncFor(this.win_),
        dev().assertElement(this.exitFullScreenBtn_),
        /* opt_isHidden */ !isEnabled);
  }

  /**
   * @param {boolean} isEnabled
   */
  toggleCloseBookendButton(isEnabled) {
    toggleHiddenAttribute(
        Services.vsyncFor(this.win_),
        dev().assertElement(this.closeBookendBtn_),
        /* opt_isHidden */ !isEnabled);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onExitFullScreenClick_(e) {
    this.dispatch_(EventType.EXIT_FULLSCREEN, e);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onCloseBookendClick_(e) {
    this.dispatch_(EventType.CLOSE_BOOKEND, e);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onMuteAudioClick_(e) {
    this.dispatch_(EventType.MUTE, e);
  }

  /**
   * @param {!Event} e
   * @private
   */
  onUnmuteAudioClick_(e) {
    this.dispatch_(EventType.UNMUTE, e);
  }

  /**
   * @param {string} eventType
   * @param {!Event=} opt_event
   * @private
   */
  dispatch_(eventType, opt_event) {
    if (opt_event) {
      dev().assert(opt_event).stopPropagation();
    }

    dispatch(this.getRoot(), eventType, /* opt_bubbles */ true);
  }

  /**
   * @param {number} pageIndex The index of the new active page.
   * @public
   */
  setActivePageIndex(pageIndex) {
    this.progressBar_.setActivePageIndex(pageIndex);
  }
}
