/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 *   data-src="https://www.example.com/onetap-login"
 * </amp-onetap-google>
 * </code>
 */

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {removeElement} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {px, setStyle, toggle} from '#core/dom/style';
import {isObject} from '#core/types';

import {Services} from '#service';

import {getData, listen} from '#utils/event-helper';
import {dev, devAssert, user} from '#utils/log';

import {CSS} from '../../../build/amp-onetap-google-0.1.css';
import {assertHttpsUrl} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-onetap-google';

/** @const {string} */
export const SENTINEL = 'onetap_google';

/** @const {object} */
export const ACTIONS = {
  READY: 'intermediate_iframe_ready',
  RESIZE: 'intermediate_iframe_resize',
  CLOSE: 'intermediate_iframe_close',
  DONE: 'intermediate_iframe_done',
  SET_UI_MODE: 'set_ui_mode',
  SET_TAP_OUTSIDE_MODE: 'set_tap_outside_mode',
};

export class AmpOnetapGoogle extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {boolean} */
    this.shouldCancelOnTapOutside_ = true;

    /** @private {?Array<!UnlistenDef>} */
    this.unlisteners_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    this.getAmpDoc()
      .whenFirstVisible()
      .then(() => {
        this.createIframe_(
          assertHttpsUrl(this.element.dataset.src, this.element)
        );
      });
  }

  /**
   * @param {!MessageEventSource} source
   * @param {*} message
   * @param {string} origin
   * @private
   */
  postMessage_(source, message, origin) {
    source./*OK*/ postMessage(message, origin);
  }

  /**
   * @param {string} origin
   * @param {Event} event
   * @private
   */
  handleIntermediateIframeMessage_(origin, event) {
    if (!this.iframe_) {
      return;
    }
    if (event.source != this.iframe_.contentWindow || event.origin !== origin) {
      return;
    }
    const data = getData(event);
    if (!isObject(data) || data['sentinel'] != SENTINEL) {
      return;
    }
    switch (data['command']) {
      case ACTIONS.READY:
        const nonce = data['nonce'];
        if (!nonce) {
          return;
        }
        this.postMessage_(
          event.source,
          {
            'sentinel': SENTINEL,
            'command': 'parent_frame_ready',
            'nonce': nonce,
          },
          event.origin
        );
        break;
      case ACTIONS.RESIZE:
        const height = data['height'];
        if (typeof height === 'number' && !isNaN(height) && height > 0) {
          this.mutateElement(() => {
            toggle(this.element, height > 0);
            // We resize indiscriminately since the iframe is always
            // position: fixed
            setStyle(this.iframe_, 'height', px(data['height']));
          });
        }
        break;
      case ACTIONS.CLOSE:
        this.mutateElement(() => {
          this.removeIframe_();
        });
        break;
      case ACTIONS.DONE:
        this.mutateElement(() => {
          this.removeIframe_();
          this.refreshAccess_();
        });
        break;
      case ACTIONS.SET_UI_MODE:
        const uiMode = data['mode'];
        if (!uiMode) {
          return;
        }
        this.setUiMode_(uiMode);
        break;
      case ACTIONS.SET_TAP_OUTSIDE_MODE:
        this.shouldCancelOnTapOutside_ = !!data['cancel'];
        break;
      default:
        dev().warn(TAG, `Unknown action type: ${data['command']}`);
    }
  }

  /**
   * @param {string} mode
   * @private
   */
  setUiMode_(mode) {
    this.mutateElement(() => {
      this.iframe_.classList.add(`i-amphtml-onetap-google-ui-${mode}`);
    });
  }

  /** @private */
  refreshAccess_() {
    Promise.all([
      this.refreshAmpAccess_(),
      this.refreshAmpSubscriptions_(),
    ]).then((refreshed) => {
      if (!refreshed.reduce((a, b) => a || b)) {
        user().warn(
          TAG,
          'Sign-in was completed, but there were no entitlements to refresh. Please include amp-access or amp-subscriptions.'
        );
      }
    });
  }

  /**
   * @return {boolean}
   * @private
   */
  refreshAmpAccess_() {
    const accessElement = this.getAmpDoc().getElementById('amp-access');
    if (!accessElement) {
      return false;
    }
    Services.actionServiceForDoc(this.element).execute(
      accessElement,
      'refresh',
      /* args */ null,
      /* source */ null,
      /* caller */ null,
      /* event */ null,
      ActionTrust_Enum.DEFAULT
    );
    return true;
  }

  /**
   * @return {!Promise<boolean>}
   * @private
   */
  refreshAmpSubscriptions_() {
    return Services.subscriptionsServiceForDocOrNull(this.element).then(
      (subscriptions) => {
        if (!subscriptions) {
          return false;
        }
        subscriptions.resetPlatforms();
        return true;
      }
    );
  }

  /**
   * @param {string} srcUnexpanded
   * @private
   */
  createIframe_(srcUnexpanded) {
    if (this.iframe_) {
      return;
    }
    this.iframe_ = this.getAmpDoc().win.document.createElement('iframe');

    // Don't insert <iframe> until URL has been expanded.
    // Likewise, don't display the UI until then.
    Services.urlReplacementsForDoc(this.element)
      .expandUrlAsync(srcUnexpanded)
      .then((srcExpanded) => {
        if (!this.win) {
          return; // now detached
        }
        this.insertIframe_(srcExpanded);
      });
  }

  /**
   * @param {string} src
   * @private
   */
  insertIframe_(src) {
    devAssert(this.iframe_);
    toggle(this.element, false);

    const {origin} = Services.urlForDoc(this.element).parse(src);
    this.unlisteners_ = [
      listen(this.win, 'message', (event) => {
        this.handleIntermediateIframeMessage_(origin, event);
      }),
      listen(this.getAmpDoc().getRootNode(), 'click', () => {
        if (
          this.shouldCancelOnTapOutside_ &&
          !this.element.hasAttribute('hidden')
        ) {
          this.removeIframe_();
        }
      }),
    ];
    this.iframe_.classList.add('i-amphtml-onetap-google-iframe');
    this.iframe_.src = src;
    this.element.appendChild(this.iframe_);
    this.getViewport().addToFixedLayer(this.iframe_);
  }

  /** @private */
  removeIframe_() {
    if (!this.iframe_) {
      return;
    }
    toggle(this.element, false);
    removeElement(this.iframe_);
    this.iframe_ = null;
    if (this.unlisteners_) {
      while (this.unlisteners_.length > 0) {
        this.unlisteners_.pop()();
      }
    }
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpOnetapGoogle, CSS);
});
