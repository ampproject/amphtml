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
const CONSENT_POLICY_MANAGER = 'consentPolicyManager';
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
    this.consentRequired_ = map();

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

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();
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

    const consentPolicyManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), CONSENT_POLICY_MANAGER)
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

    Promise.all([
      consentStateManagerPromise,
      notificationUiManagerPromise,
      consentPolicyManagerPromise])
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
      let consentId = args && args['consent'];
      if (!this.isMultiSupported_) {
        consentId = Object.keys(this.consentConfig_)[0];
      }
      this.handlePostPrompt_(consentId || '');
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
    this.vsync_.mutate(() => {
      if (!this.uiInit_) {
        this.uiInit_ = true;
        toggle(this.element, true);
      }

      this.element.classList.remove('amp-hidden');
      this.element.classList.add('amp-active');
      this.getViewport().addToFixedLayer(this.element);

      // Display the current instance
      this.currentDisplayInstance_ = instanceId;
      setImportantStyles(this.consentUI_[this.currentDisplayInstance_],
          {display: 'block'});
    });

    return new Promise(resolve => {
      this.dialogResolver_[instanceId] = resolve;
    });
  }

  /**
   * Hide current prompt UI
   */
  hide_() {
    const uiToHide = this.currentDisplayInstance_ &&
        this.consentUI_[this.currentDisplayInstance_];
    this.vsync_.mutate(() => {
      this.element.classList.add('amp-hidden');
      this.element.classList.remove('amp-active');
      // Need to remove from fixed layer and add it back to update element's top
      this.getViewport().removeFromFixedLayer(this.element);
      dev().assert(uiToHide, 'no consent UI to hide');
      toggle(uiToHide, false);
    });
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

  /**
   * Init the amp-consent by registering and initiate consent instance.
   */
  init_() {
    const instanceKeys = Object.keys(this.consentConfig_);
    const initPromptPromises = [];
    for (let i = 0; i < instanceKeys.length; i++) {
      const instanceId = instanceKeys[i];
      this.consentStateManager_.registerConsentInstance(instanceId);

      const isConsentRequiredPromise = this.getConsentRequiredPromise_(
          instanceId, this.consentConfig_[instanceId]);

      const handlePromptPromise = isConsentRequiredPromise.then(() => {
        return this.initPromptUI_(instanceId);
      }).catch(unusedError => {
        // TODO: Handle errors
      });

      initPromptPromises.push(handlePromptPromise);
    }

    Promise.all(initPromptPromises).then(() => {
      this.handlePostPromptUI_();
      this.consentPolicyManager_.enableTimeout();
    });

    this.enableInteractions_();
  }

  /**
   * Returns a promise that resolve when amp-consent knows
   * if the consent is required.
   * @param {string} instanceId
   * @param {!JsonObject} config
   * @return {!Promise}
   */
  getConsentRequiredPromise_(instanceId, config) {
    user().assert(config['checkConsentHref'] ||
        config['promptIfUnknownForGeoGroup'],
    'neither checkConsentHref nor ' +
    'promptIfUnknownForGeoGroup is defined');
    let remoteConfigPromise = Promise.resolve(null);
    if (config['checkConsentHref']) {
      remoteConfigPromise = this.getConsentRemote_(instanceId);
      this.passSharedData_(instanceId, remoteConfigPromise);
    }
    let geoPromise = Promise.resolve();
    if (config['promptIfUnknownForGeoGroup']) {
      const geoGroup = config['promptIfUnknownForGeoGroup'];
      geoPromise = this.isConsentRequiredGeo_(geoGroup);
    }
    return geoPromise.then(promptIfUnknown => {
      return remoteConfigPromise.then(response => {
        this.consentRequired_[instanceId] =
            this.isPromptRequired_(instanceId, response, promptIfUnknown);
      });
    });
  }

  /**
   * Blindly pass sharedData
   * @param {string} instanceId
   * @param {!Promise<!JsonObject>} responsePromise
   */
  passSharedData_(instanceId, responsePromise) {
    const sharedDataPromise = responsePromise.then(response => {
      if (!response || response['sharedData'] === undefined) {
        return null;
      }
      return response['sharedData'];
    });

    this.consentStateManager_.setConsentInstanceSharedData(
        instanceId, sharedDataPromise);
  }

  /**
   * Returns a promise that if user is in the given geoGroup
   * @param {string} geoGroup
   * @return {Promise<boolean>}
   */
  isConsentRequiredGeo_(geoGroup) {
    return Services.geoForOrNull(this.win).then(geo => {
      user().assert(geo,
          'requires <amp-geo> to use promptIfUnknownForGeoGroup');
      return (geo.ISOCountryGroups.indexOf(geoGroup) >= 0);
    });
  }

  /**
   * Init consent policy instances
   */
  initConsentPolicy_() {
    const policyKeys = Object.keys(this.policyConfig_);
    for (let i = 0; i < policyKeys.length; i++) {
      this.consentPolicyManager_.registerConsentPolicyInstance(
          policyKeys[i], this.policyConfig_[policyKeys[i]]);
    }
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
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    return viewer.whenFirstVisible().then(() => {
      return Services.xhrFor(this.win)
          .fetchJson(href, init)
          .then(res => res.json());
    });
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
    user().assert(Object.keys(consents).length != 0,
        `${TAG}: can't find consent instance`);
    if (!this.isMultiSupported_) {
      // Assert single consent instance
      user().assert(Object.keys(consents).length <= 1,
          `${TAG}: only single consent instance is supported`);
      if (config['policy']) {
        // Only respect 'default' consent policy;
        const keys = Object.keys(config['policy']);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] != 'default') {
            user().warn(TAG, `policy ${keys[i]} is currently not supported` +
              'and will be ignored');
            delete config['policy'][keys[i]];
          }
        }
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
   *   "promptIfUnknown": true/false
   * }
   * TODO: Support vendor lists
   * @param {string} instanceId
   * @param {?JsonObject} response
   * @param {boolean=} opt_initValue
   * @return {boolean}
   */
  isPromptRequired_(instanceId, response, opt_initValue) {
    let promptIfUnknown = opt_initValue;
    if (response && response['promptIfUnknown'] == true) {
      promptIfUnknown = true;
    } else if (response && response['promptIfUnknown'] == false) {
      promptIfUnknown = false;
    } else if (promptIfUnknown == undefined) {
      // Set to false if not defined
      promptIfUnknown = false;
    }
    return promptIfUnknown;
  }

  /**
   * Handle Prompt UI.
   * @param {string} instanceId
   * @return {Promise}
   */
  initPromptUI_(instanceId) {

    const promptUI = this.consentConfig_[instanceId]['promptUI'];
    const element = this.getAmpDoc().getElementById(promptUI);
    this.consentUI_[instanceId] = element;

    // Get current consent state
    return this.consentStateManager_.getConsentInstanceState(instanceId)
        .then(state => {
          if (state == CONSENT_ITEM_STATE.UNKNOWN) {
            if (!this.consentRequired_[instanceId]) {
              this.consentStateManager_.updateConsentInstanceState(
                  instanceId, CONSENT_ITEM_STATE.NOT_REQUIRED);
              return;
            }
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
    const classList = this.element.classList;
    this.notificationUiManager_.onQueueEmpty(() => {
      if (!this.postPromptUI_) {
        return;
      }
      this.vsync_.mutate(() => {
        if (!this.uiInit_) {
          this.uiInit_ = true;
          toggle(this.element, true);
        }
        classList.add('amp-active');
        classList.remove('amp-hidden');
        this.getViewport().addToFixedLayer(this.element);
        setImportantStyles(dev().assertElement(this.postPromptUI_),
            {display: 'block'});
      });
    });

    this.notificationUiManager_.onQueueNotEmpty(() => {
      if (!this.postPromptUI_) {
        return;
      }
      this.vsync_.mutate(() => {
        if (!this.currentDisplayInstance_) {
          classList.add('amp-hidden');
          classList.remove('amp-active');
        }
        this.getViewport().removeFromFixedLayer(this.element);
        toggle(dev().assertElement(this.postPromptUI_), false);
      });
    });
  }
}

AMP.extension('amp-consent', '0.1', AMP => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANAGER, ConsentPolicyManager);
});
