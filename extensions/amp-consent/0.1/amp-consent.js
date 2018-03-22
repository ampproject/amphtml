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

import {CONSENT_ITEM_STATE, ConsentStateManager} from './consent-state-manager';
import {CSS} from '../../../build/amp-consent-0.1.css';
import {ConsentPolicyManager} from './consent-policy-manager';
import {Layout} from '../../../src/layout';
import {
  NOTIFICATION_UI_MANAGER,
  NotificationUiManager,
} from '../../../src/service/notification-ui-manager';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {
  childElementsByTag,
  isJsonScriptTag,
} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getServicePromiseForDoc} from '../../../src/service';
import {isExperimentOn} from '../../../src/experiments';
import {parseJson} from '../../../src/json';
import {setStyle, toggle} from '../../../src/style';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const CONSENT_POLICY_MANGER = 'consentPolicyManager';
const AMP_CONSENT_EXPERIMENT = 'amp-consent';
const TAG = 'amp-consent';

/**
 * @enum {boolean}
 */
const ACTION_TYPE = {
  // We can support DISMISS if requested
  ACCEPT: true,
  REJECT: false,
};


export class AmpConsent extends AMP.BaseElement {
  constructor(element) {
    super(element);

    /** @private {?ConsentStateManager} */
    this.consentStateManager_ = null;

    /** @private {?ConsentPolicyManager} */
    this.consentPolicyManager_ = null;

    /** @private {?NotificationUiManager} */
    this.notificationUiManager_ = null;

    /** @private {!Object<string, Element>} */
    this.consentUI_ = {};

    /** @private {!JsonObject} */
    this.consentConfig_ = dict();

    /** @private {!JsonObject} */
    this.policyConfig_ = dict();

    /** @private {!Object} */
    this.consentUIRequired_ = {};

    /** @private {boolean} */
    this.uiInit_ = false;

    /** @private {?string} */
    this.currentDisplayInstance_ = null;

    /** @private {?Element} */
    this.revokeUI_ = null;

    /** @private {!Object<string, function()>} */
    this.dialogResolver_ = {};
  }

  buildCallback() {
    if (!isExperimentOn(this.win, AMP_CONSENT_EXPERIMENT)) {
      return;
    }

    if (!this.element.getAttribute('id')) {
      this.element.setAttribute('id', 'amp-consent');
    }

    this.registerAction('accept', () => this.handleAction_(ACTION_TYPE.ACCEPT));
    this.registerAction('reject', () => this.handleAction_(ACTION_TYPE.REJECT));

    // TODO: Decide what to do with incorrect configuration.
    this.assertAndParseConfig_();

    getServicePromiseForDoc(this.getAmpDoc(), CONSENT_POLICY_MANGER)
        .then(manager => {
          this.consentPolicyManager_ = manager;
          this.generateDefaultPolicy_();
          const policyKeys = Object.keys(this.policyConfig_);
          for (let i = 0; i < policyKeys.length; i++) {
            this.consentPolicyManager_.registerConsentPolicyInstance(
                policyKeys[i], this.policyConfig_[policyKeys[i]]);
          }
        });

    const consentStateManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), CONSENT_STATE_MANAGER)
            .then(manager => {
              this.consentStateManager_ = manager;
            });
    const notificationUiManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), NOTIFICATION_UI_MANAGER)
            .then(manager => {
              this.notificationUiManager_ = manager;
            });

    Promise.all([consentStateManagerPromise, notificationUiManagerPromise])
        .then(() => {
          this.init_();
        });
  }

  /**
   * To show prompt UI for instanceId
   * @param {string} instanceId
   * @return {!Promise}
   */
  show_(instanceId) {
    if (!this.consentUIRequired_[instanceId] || !this.consentUI_[instanceId]) {
      return Promise.resolve();
    }

    dev().assert(!this.currentDisplayInstance_,
        'Other consent instance on display');


    if (!this.uiInit_) {
      this.uiInit_ = true;
      toggle(this.element, true);
      this.getViewport().addToFixedLayer(this.element);
    }

    this.element.classList.remove('amp-hidden');
    this.element.classList.add('amp-active');

    // Display the current instance
    this.currentDisplayInstance_ = instanceId;
    setStyle(this.consentUI_[this.currentDisplayInstance_], 'display', 'block');
    return new Promise(resolve => {
      this.dialogResolver_[instanceId] = resolve;
    });
  }

  /**
   * Hide current prompt UI
   */
  hide_() {
    this.element.classList.add('amp-hidden');
    this.element.classList.remove('amp-active');
    // Do not remove from fixed layer because of invoke button
    // this.getViewport().removeFromFixedLayer(this.element);
    dev().assert(this.currentDisplayInstance_
        && this.consentUI_[this.currentDisplayInstance_],
    'no consent UI to hide');

    toggle(this.consentUI_[this.currentDisplayInstance_], false);
    if (this.dialogResolver_[this.currentDisplayInstance_]) {
      this.dialogResolver_[this.currentDisplayInstance_]();
      this.dialogResolver_[this.currentDisplayInstance_] = null;
    }
    this.currentDisplayInstance_ = null;
  }

  /**
   * Handler User action
   * @param {ACTION_TYPE} action
   */
  handleAction_(action) {
    dev().assert(this.currentDisplayInstance_, 'No consent is displaying');
    dev().assert(this.consentStateManager_, 'No consent state manager');
    if (action == ACTION_TYPE.ACCEPT) {
      //accept
      this.consentStateManager_.updateConsentInstanceState(
          this.currentDisplayInstance_, CONSENT_ITEM_STATE.GRANTED);
    } else if (action == ACTION_TYPE.REJECT) {
      // reject
      this.consentStateManager_.updateConsentInstanceState(
          this.currentDisplayInstance_, CONSENT_ITEM_STATE.REJECTED);
    }
    // Hide current dialog
    this.hide_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * Init the amp-consent by registering and initiate consent instance.
   */
  init_() {
    const instanceKeys = Object.keys(this.consentConfig_);
    for (let i = 0; i < instanceKeys.length; i++) {
      const instanceId = instanceKeys[i];
      this.consentStateManager_.registerConsentInstance(instanceId);
      this.getConsentRemote_(instanceId).then(response => {
        this.parseConsentResponse_(instanceId, response);
        this.handleUI_(instanceId);
      }).catch(unusedError => {
        // TODO: Handle errors
      });
    }
    this.notificationUiManager_.onQueueEmpty(() => {
      if (!this.revokeUI_) {
        return;
      }
      this.element.classList.add('amp-active');
      this.element.classList.remove('amp-hidden');
      setStyle(this.revokeUI_, 'display', 'block');
    });

    this.notificationUiManager_.onQueueNotEmpty(() => {
      if (!this.revokeUI_) {
        return;
      }
      this.element.classList.add('amp-hidden');
      this.element.classList.remove('amp-active');
      toggle(this.revokeUI_, false);
    });
  }

  /**
   * Generate default consent policy if not defined
   */
  generateDefaultPolicy_() {
    if (this.policyConfig_ && this.policyConfig_['default']) {
      return;
    }
    // Generate default policy
    const instanceKeys = Object.keys(this.consentConfig_);
    const defaultWaitForItems = {};
    for (let i = 0; i < instanceKeys.length; i++) {
      // TODO: Need to support an array.
      defaultWaitForItems[instanceKeys[i]] = undefined;
    }
    const defaultPolicy = {
      'waitFor': defaultWaitForItems,
    };
    this.policyConfig_['default'] = defaultPolicy;
  }

  /**
   * Get localStored consent info, and send request to get consent from endpoint
   * @param {string} instanceId
   * @return {!Promise<!JsonObject>}
   */
  getConsentRemote_(instanceId) {
    // Note: Expect the request to look different in following versions.
    const request = /** @type {!JsonObject} */ ({
      'consentInstanceId': instanceId,
    });
    const init = {
      credentials: 'include',
      method: 'POST',
      body: request,
      requireAmpResponseSourceOrigin: false,
    };
    const href =
        this.consentConfig_[instanceId]['checkConsentHref'];
    assertHttpsUrl(href, this.element);
    return Services.xhrFor(this.win)
        .fetchJson(href, init)
        .then(res => res.json());
  }


  /**
   * Read and parse consent instance config
   * An example valid config json looks like
   * {
   *   "consents": {
   *     "consentABC": {
   *       "checkConsentHref": "https://fake.com"
   *     }
   *   }
   * }
   * TODO: Add support for policy config
   */
  assertAndParseConfig_() {
    // All consent config within the amp-consent component. There will be only
    // one single amp-consent allowed in page.
    // TODO: Make this a shared helper method.
    const scripts = childElementsByTag(this.element, 'script');
    user().assert(scripts.length == 1,
        `${TAG} should have (only) one <script> child`);
    const script = scripts[0];
    user().assert(isJsonScriptTag(script),
        `${TAG} consent instance config should be put in a <script>` +
        'tag with type= "application/json"');
    const config = parseJson(script.textContent);
    const consents = config['consents'];
    user().assert(consents, `${TAG}: consents config is required`);
    this.consentConfig_ = consents;
  }

  /**
   * Parse response from server endpoint
   * The response format example:
   * {
   *   "consentRequired": true/false
   * }
   * TODO: Support vendor lists
   * @param {string} instanceId
   * @param {?JsonObject} response
   */
  parseConsentResponse_(instanceId, response) {
    if (!response || !response['consentRequired']) {
      //Do not need to block.
      this.consentUIRequired_[instanceId] = false;
      this.consentStateManager_.ignoreConsentInstance(instanceId);
      return;
    } else {
      // TODO: Check for current consent state and decide if UI is required.
      this.consentUIRequired_[instanceId] = true;
    }
  }

  /**
   * Handle UI.
   * @param {string} instanceId
   */
  handleUI_(instanceId) {
    // Prompt UI based on other UI on display and promptList for the instance.
    if (!this.consentUIRequired_[instanceId]) {
      return;
    }

    const promptUI = this.consentConfig_[instanceId]['promptUI'];
    const element = this.getAmpDoc().getElementById(promptUI);
    this.consentUI_[instanceId] = element;

    if (!this.revokeUI_ && this.consentConfig_[instanceId]['revokeUI']) {
      this.revokeUI_ = this.getAmpDoc().getElementById(
          this.consentConfig_[instanceId]['revokeUI']);
    }

    // Get current consent state
    this.consentStateManager_.getConsentInstanceState(instanceId)
        .then(state => {
          if (state == CONSENT_ITEM_STATE.UNKNOWN) {

            this.notificationUiManager_.registerUI(
                this.show_.bind(this, instanceId));
          }
        });
  }
}

AMP.extension('amp-consent', '0.1', AMP => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANGER, ConsentPolicyManager);
});
