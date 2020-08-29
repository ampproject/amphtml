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

import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-onetap-google-0.1.css';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getData, listen} from '../../../src/event-helper';
import {isObject} from '../../../src/types';
import {px, setStyle, toggle} from '../../../src/style';
import {removeElement} from '../../../src/dom';

/** @const {string} */
const TAG = 'amp-onetap-google';

/** @const {string} */
const SENTINEL = 'onetap_google';

/** @const {Object} */
const ACTIONS = {
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

    /** @private @const {string} */
    this.iframeUrl_ = assertHttpsUrl(
      this.element.getAttribute('data-src'),
      this.element
    );

    /** @private @const {string} */
    this.iframeOrigin_ = new URL(this.iframeUrl_).origin;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {boolean} */
    this.shouldCancelOnTapOutside_ = true;

    /** @private {?Array<!UnlistenDef>} */
    this.unlisteners_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    this.getAmpDoc()
      .whenFirstVisible()
      .then(() => {
        this.loadIframe_();
      });
  }

  /**
   * @private
   * @param {Event} event
   */
  handleIntermediateIframeMessage_(event) {
    if (!this.iframe_) {
      return;
    }
    if (
      event.source != this.iframe_.contentWindow ||
      event.origin !== this.iframeOrigin_
    ) {
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
        event.source./*OK*/ postMessage(
          dict({
            'sentinel': SENTINEL,
            'command': 'parent_frame_ready',
            'nonce': nonce,
          }),
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
    const accessElement = this.getAmpDoc().getElementById('amp-access');
    if (!accessElement) {
      user().warn(TAG, 'No <script id="amp-access"> to refresh');
      return;
    }
    Services.actionServiceForDoc(this.element).execute(
      accessElement,
      'refresh',
      /* args */ null,
      /* source */ null,
      /* caller */ null,
      /* event */ null,
      ActionTrust.DEFAULT
    );
  }

  /**
   * @return {!HTMLIFrameElement}
   * @private
   */
  loadIframe_() {
    if (this.iframe_) {
      return;
    }
    toggle(this.element, false);
    this.unlisteners_ = [
      listen(this.win, 'message', (event) => {
        this.handleIntermediateIframeMessage_(event);
      }),
      listen(
        this.getAmpDoc().getRootNode(),
        'click',
        () => {
          if (
            this.shouldCancelOnTapOutside_ &&
            !this.element.hasAttribute('hidden')
          ) {
            this.removeIframe_();
          }
        },
        false
      ),
    ];
    this.iframe_ = this.getAmpDoc().getRootNode().createElement('iframe');
    this.iframe_.classList.add('i-amphtml-onetap-google-iframe');
    this.iframe_.src = this.iframeUrl_;
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
