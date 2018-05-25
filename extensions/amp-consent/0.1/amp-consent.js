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
<<<<<<< HEAD
=======
import {Layout} from '../../../src/layout';
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
<<<<<<< HEAD
const CONSENT_POLICY_MANAGER = 'consentPolicyManager';
=======
const CONSENT_POLICY_MANGER = 'consentPolicyManager';
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
<<<<<<< HEAD
    this.consentRequired_ = map();
=======
    this.consentUIRequired_ = map();
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d

    /** @private {boolean} */
    this.uiInit_ = false;

    /** @private {?string} */
    this.currentDisplayInstance_ = null;

    /** @private {?Element} */
<<<<<<< HEAD
    this.postPromptUI_ = null;
=======
    this.revokeUI_ = null;
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d

    /** @private {!Object<string, function()>} */
    this.dialogResolver_ = map();

    /** @private {!Object<string, boolean>} */
    this.consentUIPendingMap_ = map();

    /** @private {boolean} */
    this.isMultiSupported_ = false;
<<<<<<< HEAD

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();
=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
<<<<<<< HEAD
=======
    user().assert(consentId, 'revoke must specify a consent instance id');
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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

<<<<<<< HEAD
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
=======
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
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d

    const consentStateManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), CONSENT_STATE_MANAGER)
            .then(manager => {
              this.consentStateManager_ = manager;
            });
<<<<<<< HEAD

=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    const notificationUiManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), NOTIFICATION_UI_MANAGER)
            .then(manager => {
              this.notificationUiManager_ = manager;
            });

<<<<<<< HEAD
    Promise.all([
      consentStateManagerPromise,
      notificationUiManagerPromise,
      consentPolicyManagerPromise])
=======
    Promise.all([consentStateManagerPromise, notificationUiManagerPromise])
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
<<<<<<< HEAD
      let consentId = args && args['consent'];
      if (!this.isMultiSupported_) {
        consentId = Object.keys(this.consentConfig_)[0];
      }
      this.handlePostPrompt_(consentId || '');
=======
      const consentId = args && args['consent'];
      this.handlePostPrompt_(consentId);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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

<<<<<<< HEAD
=======
    if (!this.consentUIRequired_[instanceId]) {
      // If consent not required.
      // TODO(@zhouyx): Need to fix this
      // We still need to show management UI even consent not required.
      return;
    }

>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
<<<<<<< HEAD
    this.vsync_.mutate(() => {
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
    });

=======


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
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    return new Promise(resolve => {
      this.dialogResolver_[instanceId] = resolve;
    });
  }

  /**
   * Hide current prompt UI
   */
  hide_() {
<<<<<<< HEAD
    const uiToHide = this.currentDisplayInstance_ &&
        this.consentUI_[this.currentDisplayInstance_];
    this.vsync_.mutate(() => {
      this.element.classList.add('amp-hidden');
      this.element.classList.remove('amp-active');
      // Do not remove from fixed layer because of invoke button
      // this.getViewport().removeFromFixedLayer(this.element);
      dev().assert(uiToHide, 'no consent UI to hide');

      toggle(uiToHide, false);
    });
=======
    this.element.classList.add('amp-hidden');
    this.element.classList.remove('amp-active');
    // Do not remove from fixed layer because of invoke button
    // this.getViewport().removeFromFixedLayer(this.element);
    dev().assert(this.currentDisplayInstance_
        && this.consentUI_[this.currentDisplayInstance_],
    'no consent UI to hide');

    toggle(this.consentUI_[this.currentDisplayInstance_], false);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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

<<<<<<< HEAD
=======
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  /**
   * Init the amp-consent by registering and initiate consent instance.
   */
  init_() {
    const instanceKeys = Object.keys(this.consentConfig_);
<<<<<<< HEAD
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
=======
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
      setImportantStyles(this.revokeUI_, {display: 'block'});
    });

    this.notificationUiManager_.onQueueNotEmpty(() => {
      if (!this.revokeUI_) {
        return;
      }
      this.element.classList.add('amp-hidden');
      this.element.classList.remove('amp-active');
      toggle(this.revokeUI_, false);
    });

    this.enableInteractions_();
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
<<<<<<< HEAD
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    return viewer.whenFirstVisible().then(() => {
      return Services.xhrFor(this.win)
          .fetchJson(href, init)
          .then(res => res.json());
    });
=======
    return Services.xhrFor(this.win)
        .fetchJson(href, init)
        .then(res => res.json());
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
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
<<<<<<< HEAD
    user().assert(Object.keys(consents).length != 0,
        `${TAG}: can't find consent instance`);
=======

>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    if (!this.isMultiSupported_) {
      // Assert single consent instance
      user().assert(Object.keys(consents).length <= 1,
          `${TAG}: only single consent instance is supported`);
      if (config['policy']) {
<<<<<<< HEAD
        // Only respect 'default' consent policy;
        const keys = Object.keys(config['policy']);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] != 'default') {
            user().warn(TAG, `policy ${keys[i]} is currently not supported` +
              'and will be ignored');
            delete config['policy'][keys[i]];
          }
        }
=======
        // Ignore policy setting, and only have default policy.
        user().warn(TAG, 'policy is not supported, and will be ignored');
        delete config['policy'];
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
      }
    }

    this.consentConfig_ = consents;
<<<<<<< HEAD
    if (config['postPromptUI']) {
      this.postPromptUI_ = this.getAmpDoc().getElementById(
          config['postPromptUI']);
    }
=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
    this.policyConfig_ = config['policy'] || this.policyConfig_;
  }

  /**
   * Parse response from server endpoint
   * The response format example:
   * {
<<<<<<< HEAD
   *   "promptIfUnknown": true/false
=======
   *   "consentRequired": true/false
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
   * }
   * TODO: Support vendor lists
   * @param {string} instanceId
   * @param {?JsonObject} response
<<<<<<< HEAD
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
=======
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
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d

    const promptUI = this.consentConfig_[instanceId]['promptUI'];
    const element = this.getAmpDoc().getElementById(promptUI);
    this.consentUI_[instanceId] = element;

<<<<<<< HEAD
    // Get current consent state
    return this.consentStateManager_.getConsentInstanceState(instanceId)
        .then(state => {
          if (state == CONSENT_ITEM_STATE.UNKNOWN) {
            if (!this.consentRequired_[instanceId]) {
              this.consentStateManager_.updateConsentInstanceState(
                  instanceId, CONSENT_ITEM_STATE.NOT_REQUIRED);
              return;
            }
=======
    if (!this.revokeUI_ && this.consentConfig_[instanceId]['revokeUI']) {
      this.revokeUI_ = this.getAmpDoc().getElementById(
          this.consentConfig_[instanceId]['revokeUI']);
    }

    // Get current consent state
    this.consentStateManager_.getConsentInstanceState(instanceId)
        .then(state => {
          if (state == CONSENT_ITEM_STATE.UNKNOWN) {
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
            // TODO(@zhouyx):
            // 1. Race condition on consent state change between
            // schedule to display and display. Add one more check before display
            // 2. Should not schedule display with DISMISSED UNKNOWN state
            this.scheduleDisplay_(instanceId);
          }
        });
  }
<<<<<<< HEAD

  /**
   * Handles the display of postPromptUI
   */
  handlePostPromptUI_() {
    this.notificationUiManager_.onQueueEmpty(() => {
      if (!this.postPromptUI_) {
        return;
      }
      this.vsync_.mutate(() => {
        if (!this.uiInit_) {
          this.uiInit_ = true;
          toggle(this.element, true);
          this.getViewport().addToFixedLayer(this.element);
        }
        this.element.classList.add('amp-active');
        this.element.classList.remove('amp-hidden');
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
          this.element.classList.add('amp-hidden');
          this.element.classList.remove('amp-active');
        }
        toggle(dev().assertElement(this.postPromptUI_), false);
      });
    });
  }
=======
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
}

AMP.extension('amp-consent', '0.1', AMP => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
<<<<<<< HEAD
  AMP.registerServiceForDoc(CONSENT_POLICY_MANAGER, ConsentPolicyManager);
=======
  AMP.registerServiceForDoc(CONSENT_POLICY_MANGER, ConsentPolicyManager);
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
});
