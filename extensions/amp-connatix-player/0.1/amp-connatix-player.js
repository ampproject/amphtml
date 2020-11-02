/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '../../../src/consent-state';
import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';
import {getData} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {setIsMediaComponent} from '../../../src/video-interface';
import {tryParseJson} from '../../../src/json';
import {userAssert} from '../../../src/log';

/**
 * @param {!Array<T>} promises
 * @return {!Promise<!Array<{
 *  status: string,
 *  value: (T|undefined),
 *  reason: *,
 * }>>}
 * @template T
 */
export function allSettled(promises) {
  /**
   * @param {*} value
   * @return {{status: string, value: *}}
   */
  function onFulfilled(value) {
    return {status: 'fulfilled', value};
  }
  /**
   * @param {*} reason
   * @return {{status: string, reason: *}}
   */
  function onRejected(reason) {
    return {status: 'rejected', reason};
  }
  return Promise.all(
    promises.map((promise) => {
      return promise.then(onFulfilled, onRejected);
    })
  );
}

export class AmpConnatixPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.playerId_ = '';

    /** @private {string} */
    this.mediaId_ = '';

    /** @private {string} */
    this.iframeDomain_ = 'https://cdm.connatix.com';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;
  }

  /**
   * Sends a post message to the iframe where the connatix player
   * is embedded. Used for giving external commands to the player
   * (play/pause etc)
   * @private
   * @param {string} command
   * @param {Object=} opt_args
   */
  sendCommand_(command, opt_args) {
    if (!this.playerReadyPromise_) {
      return;
    }

    this.playerReadyPromise_.then((iframe) => {
      if (!iframe) {
        return;
      }

      if (iframe.contentWindow) {
        iframe.contentWindow./*OK*/ postMessage(
          JSON.stringify(
            dict({
              'event': 'command',
              'func': command,
              'args': opt_args || '',
            })
          ),
          this.iframeDomain_
        );
      }
    });
  }

  /**
   * Binds to player events from iframe. In this case
   * it is used for binding to the close event which
   * triggers when a user clicks on the close button
   * on the player
   * @private
   */
  bindToPlayerCommands_() {
    this.win.addEventListener('message', (e) => {
      if (!this.iframe_ || e.source !== this.iframe_.contentWindow) {
        // Ignore messages from other iframes.
        return;
      }
      const dataString = getData(e);
      const dataJSON = tryParseJson(dataString);

      if (!dataJSON || dataJSON['event'] !== 'command') {
        return;
      }

      switch (dataJSON['func']) {
        // Player wants to close because the user interacted on its close button
        case 'cnxClose': {
          this.destroyPlayerFrame_();
          this.attemptCollapse();
          break;
        }
        // Player rendered
        case 'cnxPlayerRendered': {
          this.playerReadyResolver_(this.iframe_);
          break;
        }
      }
    });
  }

  /**
   * Binds to amp-consent
   * @private
   */
  bindToAmpConsent_() {
    const consentPolicyId = super.getConsentPolicy() || 'default';
    const consentPolicyStatePromise = getConsentPolicyState(
      this.element,
      consentPolicyId
    );
    const consentPolicyInfoPromise = getConsentPolicyInfo(
      this.element,
      consentPolicyId
    );
    const consentPolicySharedDataPromise = getConsentPolicySharedData(
      this.element,
      consentPolicyId
    );
    const consentMetadataPromise = getConsentMetadata(
      this.element,
      consentPolicyId
    );

    allSettled([
      consentPolicyStatePromise,
      consentPolicyInfoPromise,
      consentPolicySharedDataPromise,
      consentMetadataPromise,
    ]).then((values) => {
      if (values && values.length === 4) {
        const consentPolicyState = values[0];
        const consentPolicyInfo = values[1];
        const consentPolicySharedData = values[2];
        const consentMetadata = values[3];
        const ampConsentInfo = {
          'consentPolicyStateEnum': CONSENT_POLICY_STATE,
          'consentStringTypeEnum': CONSENT_STRING_TYPE,
          'consentPolicyState': {
            'error': consentPolicyState.reason,
            'value': consentPolicyState.value,
          },
          'rawConsentString': {
            'error': consentPolicyInfo.reason,
            'value': consentPolicyInfo.value,
          },
          'consentSharedData': {
            'error': consentPolicySharedData.reason,
            'value': consentPolicySharedData.value,
          },
          'consentMetadata': {
            'error': consentMetadata.reason,
            'value': consentMetadata.value,
          },
        };
        this.sendCommand_('ampConsentInfo', ampConsentInfo);
      }
    });
  }

  /**
   * Removes the player iframe
   * @private
   */
  destroyPlayerFrame_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    setIsMediaComponent(element);

    // Player id is mandatory
    this.playerId_ = userAssert(
      element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-connatix-player> %s',
      element
    );

    // Media id is optional
    this.mediaId_ = element.getAttribute('data-media-id') || '';

    // will be used by sendCommand in order to send only after the player is rendered
    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Serves the player assets
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.iframeDomain_,
      onLayout
    );
  }

  /** @override */
  layoutCallback() {
    const {element} = this;
    // Url Params for iframe source
    const urlParams = dict({
      'playerId': this.playerId_ || undefined,
      'mediaId': this.mediaId_ || undefined,
    });
    const iframeUrl = this.iframeDomain_ + '/amp-embed/index.html';
    const src = addParamsToUrl(iframeUrl, urlParams);

    const iframe = element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;

    // applyFillContent so that frame covers the entire component.
    this.applyFillContent(iframe, /* replacedContent */ true);

    // append child iframe for element
    element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    // bind to player events (playerRendered after we can send commands to player and other)
    this.bindToPlayerCommands_();
    // bind to amp consent and send consent info to the iframe content and propagate to player
    this.bindToAmpConsent_();

    return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  onLayoutMeasure() {
    if (!this.iframe_) {
      return;
    }
    const {width, height} = this.getLayoutBox();
    this.sendCommand_('ampResize', {'width': width, 'height': height});
  }

  /** @override */
  pauseCallback() {
    this.sendCommand_('ampPause');
  }

  /** @override */
  unlayoutCallback() {
    this.destroyPlayerFrame_();

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    return true;
  }
}

AMP.extension('amp-connatix-player', '0.1', (AMP) => {
  AMP.registerElement('amp-connatix-player', AmpConnatixPlayer);
});
