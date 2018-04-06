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
import {
  ConsentPolicyManager,
  MULTI_CONSENT_EXPERIMENT,
} from './consent-policy-manager';
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
import {dict, map} from '../../../src/utils/object';
import {getServicePromiseForDoc} from '../../../src/service';
import {isExperimentOn} from '../../../src/experiments';
import {parseJson} from '../../../src/json';
import {setImportantStyles, toggle} from '../../../src/style';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const CONSENT_POLICY_MANGER = 'consentPolicyManager';
const TAG = 'amp-consent';

export const AMP_CONSENT_EXPERIMENT = 'amp-consent';

/**
 * @enum {number}
 * @visibleForTesting
 */
export const ACTION_TYPE = {
  ACCEPT: 0,
  REJECT: 1,
  DISMISS: 2,
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

    /** @private {!Object<string, !Element>} */
    this.consentUI_ = map();

    /** @private {!JsonObject} */
    this.consentConfig_ = dict();

    /** @private {!JsonObject} */
    this.policyConfig_ = dict();

    /** @private {!Object} */
    this.consentUIRequired_ = map();

    /** @private {boolean} */
    this.uiInit_ = false;

    /** @private {?string} */
    this.currentDisplayInstance_ = null;

    /** @private {?Element} */
    this.postPromptUI_ = null;

    /** @private {!Object<string, function()>} */
    this.dialogResolver_ = map();

    /** @private {!Object<string, boolean>} */
    this.consentUIPendingMap_ = map();

    /** @private {boolean} */
    this.isMultiSupported_ = false;
  }

  getConsentPolicy() {
    // amp-consent should not be blocked by itself
    return null;
  }

  /**
   * Handles the revoke action.
   * Display consent UI.
   * @param {string} consentId
   */
  handlePostPrompt_(consentId) {
    user().assert(consentId, 'revoke must specify a consent instance id');
    user().assert(this.consentConfig_[consentId],
        `consent with id ${consentId} not found`);
    // toggle the UI for this consent
    this.scheduleDisplay_(consentId);
  }

  buildCallback() {
    if (!isExperimentOn(this.win, AMP_CONSENT_EXPERIMENT)) {
      return;
    }

    this.isMultiSupported_ = isExperimentOn(this.win, MULTI_CONSENT_EXPERIMENT);

    user().assert(this.element.getAttribute('id'),
        'amp-consent should have an id');

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
   * Register a list of user action functions
   */
  enableInteractions_() {
    this.registerAction('accept', () => this.handleAction_(ACTION_TYPE.ACCEPT));
    this.registerAction('reject', () => this.handleAction_(ACTION_TYPE.REJECT));
    this.registerAction('dismiss',
        () => this.handleAction_(ACTION_TYPE.DISMISS));
    this.registerAction('prompt', invocation => {
      const args = invocation.args;
      const consentId = args && args['consent'];
      this.handlePostPrompt_(consentId);
    });
  }

  /**
   * Returns a promise that attempt to show prompt UI for instanceId
   * @param {string} instanceId
   */
  scheduleDisplay_(instanceId) {
    dev().assert(this.notificationUiManager_,
        'notification ui manager not found');

    if (this.consentUIPendingMap_[instanceId]) {
      // Already pending to be shown. Do nothing.
      return;
    }

    if (!this.consentUIRequired_[instanceId]) {
      // If consent not required.
      // TODO(@zhouyx): Need to fix this
      // We still need to show management UI even consent not required.
      return;
    }

    if (!this.consentUI_[instanceId]) {
      // If consent UI not found. Do nothing.
      return;
    }

    this.consentUIPendingMap_[instanceId] = true;
    this.notificationUiManager_.registerUI(this.show_.bind(this, instanceId));
  }

  /**
   * To show prompt UI for instanceId
   * @param {string} instanceId
   * @return {!Promise}
   */
  show_(instanceId) {
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
    setImportantStyles(this.consentUI_[this.currentDisplayInstance_],
        {display: 'block'});
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
    this.consentUIPendingMap_[this.currentDisplayInstance_] = false;
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
    } else if (action == ACTION_TYPE.DISMISS) {
      this.consentStateManager_.updateConsentInstanceState(
          this.currentDisplayInstance_, CONSENT_ITEM_STATE.DISMISSED);
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
        this.handlePromptUI_(instanceId);
      }).catch(unusedError => {
        // TODO: Handle errors
      });
    }

    // TODO(@zhouyx): Use setTimeout to make sure we handle postPromptUI
    // after all prompt UI registerd. Make handle PromptUI a promise instead.
    this.win.setTimeout(() => {
      this.handlePostPromptUI_();
    });

    this.enableInteractions_();
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

    if (!this.isMultiSupported_) {
      // Assert single consent instance
      user().assert(Object.keys(consents).length <= 1,
          `${TAG}: only single consent instance is supported`);
      if (config['policy']) {
        // Ignore policy setting, and only have default policy.
        user().warn(TAG, 'policy is not supported, and will be ignored');
        delete config['policy'];
      }
    }

    this.consentConfig_ = consents;
    if (config['postPromptUI']) {
      this.postPromptUI_ = this.getAmpDoc().getElementById(
          config['postPromptUI']);
    }
    this.policyConfig_ = config['policy'] || this.policyConfig_;
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
   * Handle Prompt UI.
   * @param {string} instanceId
   */
  handlePromptUI_(instanceId) {
    // Prompt UI based on other UI on display and promptList for the instance.
    if (!this.consentUIRequired_[instanceId]) {
      return;
    }

    const promptUI = this.consentConfig_[instanceId]['promptUI'];
    const element = this.getAmpDoc().getElementById(promptUI);
    this.consentUI_[instanceId] = element;

    // Get current consent state
    this.consentStateManager_.getConsentInstanceState(instanceId)
        .then(state => {
          if (state == CONSENT_ITEM_STATE.UNKNOWN) {
            // TODO(@zhouyx):
            // 1. Race condition on consent state change between
            // schedule to display and display. Add one more check before display
            // 2. Should not schedule display with DISMISSED UNKNOWN state
            this.scheduleDisplay_(instanceId);
          }
        });
  }

  /**
   * Handles the display of postPromptUI
   */
  handlePostPromptUI_() {
    this.notificationUiManager_.onQueueEmpty(() => {
      if (!this.postPromptUI_) {
        return;
      }
      if (!this.uiInit_) {
        this.uiInit_ = true;
        toggle(this.element, true);
        this.getViewport().addToFixedLayer(this.element);
      }
      this.element.classList.add('amp-active');
      this.element.classList.remove('amp-hidden');
      setImportantStyles(this.postPromptUI_, {display: 'block'});
    });

    this.notificationUiManager_.onQueueNotEmpty(() => {
      if (!this.postPromptUI_) {
        return;
      }
      this.element.classList.add('amp-hidden');
      this.element.classList.remove('amp-active');
      toggle(this.postPromptUI_, false);
    });
  }
}

AMP.extension('amp-consent', '0.1', AMP => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANGER, ConsentPolicyManager);
});
