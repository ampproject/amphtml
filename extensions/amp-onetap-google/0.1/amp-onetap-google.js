/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Embeds Google One Tap
 *
 * Example:
 * <code>
 * <amp-onetap-google
 *   layout="nodisplay"
 *   data-iframe_url="https://www.example.com/onetap-login"
 * </amp-onetap-google>
 * </code>
 */

import {CSS} from '../../../build/amp-onetap-google-0.1.css';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {
  assertDoesNotContainDisplay,
  setStyle,
  setStyles,
  toggle,
} from '../../../src/style';
import {assertHttpsUrl} from '../../../src/url';
import {isExperimentOn} from '../../../src/experiments';
import {toWin} from '../../../src/types';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-onetap-google';

/** @const {string} */
const IFRAME_ID = 'amp-onetap-google-intermediate-iframe';

/** @const {string} */
const SENTINEL = 'onetap_google';

/** @const {string} */
const ATTRIBUTE_IFRAME_URL = 'data-iframe-url';

/** @const {Object} */
const ACTIONS = {
  READY: 'intermediate_iframe_ready',
  RESIZE: 'intermediate_iframe_resize',
  CLOSE: 'intermediate_iframe_close',
  DONE: 'intermediate_iframe_done',
  SET_UI_MODE: 'set_ui_mode',
  SET_TAP_OUTSIDE_MODE: 'set_tap_outside_mode',
};

/** @const {Object} */
const UI_MODES = {
  BOTTOM_SHEET: 'bottom_sheet',
  CARD: 'card',
};

/** @const {Object} */
const cardIframeStyle = {
  border: 'none',
  padding: 0,
  width: '391px',
};

/** @const {Object} */
const bottomsheetIframeStyle = {
  border: 'none',
  margin: 0,
  padding: 0,
  position: 'fixed',
  right: 'auto',
  left: '0',
  top: 'auto',
  bottom: '0',
  width: '100%',
};

/** @const {Object} */
const elementStyle = {
  height: '0',
  width: '0',
  'z-index': 2147483647,
  border: 'none',
  position: 'fixed',
  left: '0',
  bottom: '0',
};

export class AmpOnetapGoogle extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.checkExperimentEnabled_();

    /** @private @const {string} */
    this.intermediateIframeUrl_ = assertHttpsUrl(
      this.element.getAttribute(ATTRIBUTE_IFRAME_URL),
      ATTRIBUTE_IFRAME_URL
    );

    /** @private @const {string} */
    this.intermediateIframeOrigin_ = new URL(
      this.intermediateIframeUrl_
    ).origin;

    /** @private {!Element} */
    this.doc_ = this.element.ownerDocument;

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(
      toWin(this.element.ownerDocument.defaultView)
    );

    /** @private {?boolean} */
    this.isBottomSheetUiMode_ = null;

    /** @private {?Element} */
    this.intermediateIframe_ = null;

    /** @private {boolean} */
    this.isIntermediateIframeVisible_ = false;

    /** @private {boolean} */
    this.cancelOnTapOutside_ = true;

    /** @private */
    this.onClickOutside_ = () => {
      if (this.cancelOnTapOutside_ && this.isIntermediateIframeVisible_) {
        this.doc_.removeEventListener('click', this.onClickOutside_);
        this.removeIntermediateIframe_();
      }
    };
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    this.win.addEventListener('message', (event) => {
      // Make sure the postMessage comes from the iframe origin
      if (this.validateMessageOrigin_(event.origin)) {
        this.handleIntermediateIframeMessage_(event);
      }
    });
    this.getAmpDoc()
      .whenFirstVisible()
      .then(() => {
        this.loadIntermediateIframe_();
      });
  }

  /**
   * @private
   * @param {string} origin
   * @return {boolean} if the origin is valid.
   */
  validateMessageOrigin_(origin) {
    return origin === this.intermediateIframeOrigin_;
  }

  /**
   * @private
   * @param {Event} event
   */
  handleIntermediateIframeMessage_(event) {
    if (!this.intermediateIframe_) {
      return;
    }
    if (!event.data || event.data['sentinel'] != SENTINEL) {
      return;
    }
    switch (event.data['command']) {
      case ACTIONS.READY:
        const nonce = event.data['nonce'];
        if (!nonce) {
          return;
        }
        event.source.postMessage(
          {
            sentinel: SENTINEL,
            command: 'parent_frame_ready',
            nonce,
          },
          event.origin
        );
        break;
      case ACTIONS.RESIZE:
        const height = event.data['height'];
        if (typeof height === 'number' && !isNaN(height) && height > 0) {
          this.vsync_.mutate(() => {
            if (height > 0) {
              setStyle(
                this.intermediateIframe_,
                'height',
                event.data['height'] + 'px'
              );
              setStyle(this.element, 'height', event.data['height'] + 'px');
              this.showAmpElement_();
            } else {
              this.showAmpElement_();
            }
          });
        }
        break;
      case ACTIONS.CLOSE:
        this.doc_.removeEventListener('click', this.onClickOutside_);
        this.vsync_.mutate(() => {
          this.removeIntermediateIframe_();
        });
        break;
      case ACTIONS.DONE:
        this.vsync_.mutate(() => {
          this.removeIntermediateIframe_();
          window.location.reload();
        });
        break;
      case ACTIONS.SET_UI_MODE:
        if (this.isBottomSheetUiMode_ !== null) {
          return;
        }
        const uiMode = event.data['mode'];
        if (!uiMode) {
          return;
        }
        if (uiMode === UI_MODES.BOTTOM_SHEET) {
          this.setBottomSheetUiMode_();
          this.isBottomSheetUiMode_ = true;
        } else if (uiMode === UI_MODES.CARD) {
          this.setCardUiMode_();
          this.isBottomSheetUiMode_ = false;
        } else {
          throw new Error(`Unknown UI mode: ${event.data.mode}`);
        }
        break;
      case ACTIONS.SET_TAP_OUTSIDE_MODE:
        this.cancelOnTapOutside_ = !!event.data['cancel'];
        break;
      default:
        throw new Error(`Unknown action type: ${event.data.action}`);
    }
  }

  /** @private */
  setBottomSheetUiMode_() {
    setStyles(
      this.intermediateIframe_,
      assertDoesNotContainDisplay(bottomsheetIframeStyle)
    );
    setStyles(this.element, assertDoesNotContainDisplay(elementStyle));
  }

  /** @private */
  setCardUiMode_() {
    this.intermediateIframe_.classList.add('intermediate-iframe-card-mode');
    setStyles(
      this.intermediateIframe_,
      assertDoesNotContainDisplay(cardIframeStyle)
    );
    setStyles(this.element, assertDoesNotContainDisplay(elementStyle));
  }

  /** @private */
  showAmpElement_() {
    if (this.isIntermediateIframeVisible_) {
      return;
    }
    toggle(this.element, true);
    this.isIntermediateIframeVisible_ = true;
  }

  /** @private */
  hideAmpElement_() {
    if (!this.isIntermediateIframeVisible_) {
      return;
    }
    toggle(this.element, false);
    this.isIntermediateIframeVisible_ = false;
  }

  /**
   * @return {boolean}
   * @private
   */
  loadIntermediateIframe_() {
    if (!this.intermediateIframe_) {
      this.hideAmpElement_();
      this.intermediateIframe_ = this.doc_.createElement('iframe');
      this.intermediateIframe_.src = this.intermediateIframeUrl_;
      this.intermediateIframe_.id = IFRAME_ID;
      this.element.appendChild(this.intermediateIframe_);
      this.doc_.addEventListener('click', this.onClickOutside_, false);
      this.setCardUiMode_();
      return true;
    }
    return false;
  }

  /** @private */
  removeIntermediateIframe_() {
    if (this.intermediateIframe_) {
      this.hideAmpElement_();
      this.element.removeChild(this.intermediateIframe_);
      this.intermediateIframe_ = null;
    }
  }

  /** @private */
  checkExperimentEnabled_() {
    userAssert(
      isExperimentOn(this.win, 'amp-onetap-google'),
      `Experiment amp-onetap-google is not turned on.`
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpOnetapGoogle, CSS);
});
