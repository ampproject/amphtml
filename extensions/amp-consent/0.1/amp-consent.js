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
import {ConsentConfig, expandPolicyConfig} from './consent-config';
import {ConsentPolicyManager} from './consent-policy-manager';
import {ConsentUI} from './consent-ui';
import {Deferred} from '../../../src/utils/promise';
import {
  NOTIFICATION_UI_MANAGER,
  NotificationUiManager,
} from '../../../src/service/notification-ui-manager';
import {Services} from '../../../src/services';
import {
  assertHttpsUrl,
  getSourceUrl,
  resolveRelativeUrl,
} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {dict, hasOwn, map} from '../../../src/utils/object';
import {getData} from '../../../src/event-helper';
import {getServicePromiseForDoc} from '../../../src/service';

import {isEnumValue} from '../../../src/types';
import {toggle} from '../../../src/style';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const CONSENT_POLICY_MANAGER = 'consentPolicyManager';
const TAG = 'amp-consent';

/**
 * @enum {string}
 * @visibleForTesting
 */
export const ACTION_TYPE = {
  ACCEPT: 'accept',
  REJECT: 'reject',
  DISMISS: 'dismiss',
};


export class AmpConsent extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?ConsentStateManager} */
    this.consentStateManager_ = null;

    /** @private {?ConsentPolicyManager} */
    this.consentPolicyManager_ = null;

    /** @private {?NotificationUiManager} */
    this.notificationUiManager_ = null;

    /** @private {!Object<string, !ConsentUI>} */
    this.consentUI_ = map();

    /** @private {?JsonObject} */
    this.consentConfig_ = null;

    /** @private {?JsonObject} */
    this.policyConfig_ = null;

    /** @private {!Object} */
    this.consentRequired_ = map();

    /** @private {?string} */
    this.currentDisplayInstance_ = null;

    /** @private {?ConsentUI} */
    this.postPromptUI_ = null;

    /** @private {!Object<string, ?function()>} */
    this.dialogResolver_ = map();

    /** @private {!Object<string, boolean>} */
    this.consentUIPendingMap_ = map();

    /** @private {boolean} */
    this.isMultiSupported_ = false;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private {boolean} */
    this.isPostPromptUIRequired_ = false;

    /** @private {!Object<string, Promise<?JsonObject>>} */
    this.remoteConfigPromises_ = map();
  }

  /** @override */
  getConsentPolicy() {
    // amp-consent should not be blocked by itself
    return null;
  }

  /** @override */
  buildCallback() {
    this.isMultiSupported_ = ConsentPolicyManager.isMultiSupported(this.win);

    user().assert(this.element.getAttribute('id'),
        'amp-consent should have an id');

    const config = new ConsentConfig(this.element);

    if (config.getPostPromptUI()) {
      this.postPromptUI_ =
          new ConsentUI(this, dict({}), config.getPostPromptUI());
    }

    this.consentConfig_ = config.getConsentConfig();

    const policyConfig = config.getPolicyConfig();

    this.policyConfig_ = expandPolicyConfig(policyConfig, this.consentConfig_);

    const children = this.getRealChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      toggle(child, false);
      // <amp-consent> will manualy schedule layout for its children.
      this.setAsOwner(child);
    }

    const consentPolicyManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), CONSENT_POLICY_MANAGER)
            .then(manager => {
              this.consentPolicyManager_ = /** @type {!ConsentPolicyManager} */ (
                manager);
              const policyKeys =
                  Object.keys(/** @type {!Object} */ (this.policyConfig_));
              for (let i = 0; i < policyKeys.length; i++) {
                this.consentPolicyManager_.registerConsentPolicyInstance(
                    policyKeys[i], this.policyConfig_[policyKeys[i]]);
              }
            });

    const consentStateManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), CONSENT_STATE_MANAGER)
            .then(manager => {
              this.consentStateManager_ = /** @type {!ConsentStateManager} */ (
                manager);
            });

    const notificationUiManagerPromise =
        getServicePromiseForDoc(this.getAmpDoc(), NOTIFICATION_UI_MANAGER)
            .then(manager => {
              this.notificationUiManager_ = /** @type {!NotificationUiManager} */ (
                manager);
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
      const {args} = invocation;
      let consentId = args && args['consent'];
      if (!this.isMultiSupported_) {
        consentId =
            Object.keys(/** @type {!Object} */ (this.consentConfig_))[0];
      }
      this.handlePostPrompt_(consentId || '');
    });

    this.enableExternalInteractions_();
  }

  /**
   * Listen to external consent flow iframe's response
   */
  enableExternalInteractions_() {
    this.win.addEventListener('message', event => {
      if (!this.currentDisplayInstance_) {
        return;
      }

      const data = getData(event);

      if (!data || data['type'] != 'consent-response') {
        return;
      }

      if (!data['action']) {
        user().error(TAG, 'consent-response message missing required info');
        return;
      }

      const iframes = this.element.querySelectorAll('iframe');

      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === event.source) {
          const action = data['action'];
          this.handleAction_(action);
          return;
        }
      }
    });
  }

  /**
   * Returns a promise that attempt to show prompt UI for instanceId
   * @param {string} instanceId
   */
  scheduleDisplay_(instanceId) {
    if (!this.notificationUiManager_) {
      dev().error(TAG, 'notification ui manager not found');
    }

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
    if (this.currentDisplayInstance_) {
      dev().error(TAG,
          'other consent instance on display %s', this.currentDisplayInstance_);
    }

    this.vsync_.mutate(() => {
      this.currentDisplayInstance_ = instanceId;
      this.consentUI_[this.currentDisplayInstance_].show();
    });

    const deferred = new Deferred();
    this.dialogResolver_[instanceId] = deferred.resolve;
    return deferred.promise;
  }

  /**
   * Hide current prompt UI
   */
  hide_() {
    if (!this.currentDisplayInstance_ ||
        !this.consentUI_[this.currentDisplayInstance_]) {
      dev().error(TAG, '%s no consent ui to hide',
          this.currentDisplayInstance_);
    }

    const uiToHide = this.consentUI_[this.currentDisplayInstance_];

    this.vsync_.mutate(() => {
      uiToHide.hide();
    });

    const displayInstance = /** @type {string} */ (
      this.currentDisplayInstance_);
    if (this.dialogResolver_[displayInstance]) {
      this.dialogResolver_[displayInstance]();
      this.dialogResolver_[displayInstance] = null;
    }
    this.consentUIPendingMap_[displayInstance] = false;
    this.currentDisplayInstance_ = null;
  }

  /**
   * Handler User action
   * @param {string} action
   */
  handleAction_(action) {
    if (!isEnumValue(ACTION_TYPE, action)) {
      // Unrecognized action
      return;
    }

    if (!this.currentDisplayInstance_) {
      // No consent instance to act to
      return;
    }

    if (!this.consentStateManager_) {
      dev().error(TAG, 'No consent state manager');
      return;
    }
    if (action == ACTION_TYPE.ACCEPT) {
      //accept
      this.consentStateManager_.updateConsentInstanceState(
          this.currentDisplayInstance_, CONSENT_ITEM_STATE.ACCEPTED);
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
    const instanceKeys =
        Object.keys(/** @type {!Object} */ (this.consentConfig_));
    const initPromptPromises = [];
    for (let i = 0; i < instanceKeys.length; i++) {
      const instanceId = instanceKeys[i];
      this.consentStateManager_.registerConsentInstance(
          instanceId, this.consentConfig_[instanceId]);

      this.passSharedData_(instanceId);
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
    let promptPromise = null;
    if (config['promptIfUnknownForGeoGroup']) {
      const geoGroup = config['promptIfUnknownForGeoGroup'];
      promptPromise = this.isConsentRequiredGeo_(geoGroup);
    } else {
      promptPromise =
          this.getConsentRemote_(instanceId).then(remoteConfigResponse => {
            if (!remoteConfigResponse ||
                !hasOwn(remoteConfigResponse, 'promptIfUnknown')) {
              this.user().error(TAG, 'Expecting promptIfUnknown from ' +
                'checkConsentHref when promptIfUnknownForGeoGroup is not ' +
                'specified');
              // Set to false if not defined
              return false;
            }
            return !!remoteConfigResponse['promptIfUnknown'];
          });
    }
    return promptPromise.then(prompt => {
      this.consentRequired_[instanceId] = !!prompt;
    });
  }

  /**
   * Blindly pass sharedData
   * @param {string} instanceId
   */
  passSharedData_(instanceId) {
    const responsePromise = this.getConsentRemote_(instanceId);
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
    return Services.geoForDocOrNull(this.element).then(geo => {
      user().assert(geo,
          'requires <amp-geo> to use promptIfUnknownForGeoGroup');
      return (geo.ISOCountryGroups.indexOf(geoGroup) >= 0);
    });
  }

  /**
   * Get localStored consent info, and send request to get consent from endpoint
   * if there is checkConsentHref specified.
   * @param {string} instanceId
   * @return {!Promise<?JsonObject>}
   */
  getConsentRemote_(instanceId) {
    if (this.remoteConfigPromises_[instanceId]) {
      return this.remoteConfigPromises_[instanceId];
    }
    if (!this.consentConfig_[instanceId]['checkConsentHref']) {
      this.remoteConfigPromises_[instanceId] = Promise.resolve(null);
    } else {
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
      const ampdoc = this.getAmpDoc();
      const sourceBase = getSourceUrl(ampdoc.getUrl());
      const resolvedHref = resolveRelativeUrl(href, sourceBase);
      const viewer = Services.viewerForDoc(ampdoc);
      this.remoteConfigPromises_[instanceId] =
          viewer.whenFirstVisible().then(() => {
            return Services.xhrFor(this.win)
                .fetchJson(resolvedHref, init)
                .then(res => res.json());
          });
    }
    return this.remoteConfigPromises_[instanceId];
  }

  /**
   * Handles the revoke action.
   * Display consent UI.
   * @param {string} consentId
   */
  handlePostPrompt_(consentId) {
    user().assert(this.consentConfig_[consentId],
        'consent with id %s not found', consentId);
    // toggle the UI for this consent
    this.scheduleDisplay_(consentId);
  }

  /**
   * Handle Prompt UI.
   * @param {string} instanceId
   * @return {Promise}
   */
  initPromptUI_(instanceId) {
    const config = this.consentConfig_[instanceId];
    this.consentUI_[instanceId] =
        new ConsentUI(this, config);

    // Get current consent state
    return this.consentStateManager_.getConsentInstanceState(instanceId)
        .then(state => {
          if (state == CONSENT_ITEM_STATE.ACCEPTED ||
              state == CONSENT_ITEM_STATE.REJECTED) {
            // Need to display post prompt ui if user previous made a decision
            this.isPostPromptUIRequired_ = true;
          }
          if (state == CONSENT_ITEM_STATE.UNKNOWN) {
            if (!this.consentRequired_[instanceId]) {
              this.consentStateManager_.updateConsentInstanceState(
                  instanceId, CONSENT_ITEM_STATE.NOT_REQUIRED);
              return;
            }
            this.isPostPromptUIRequired_ = true;
            // TODO(@zhouyx):
            // 1. Race condition on consent state change between schedule to
            //    display and display. Add one more check before display
            // 2. Should not schedule display with DISMISSED UNKNOWN state
            this.scheduleDisplay_(instanceId);
          }
        });
  }

  /**
   * Handles the display of postPromptUI
   */
  handlePostPromptUI_() {
    if (!this.isPostPromptUIRequired_) {
      return;
    }

    if (!this.postPromptUI_) {
      return;
    }

    this.notificationUiManager_.onQueueEmpty(() => {
      this.vsync_.mutate(() => {
        this.postPromptUI_.show();
        // Will need to scheduleLayout for postPromptUI
        // upon request for using AMP component.
      });
    });

    this.notificationUiManager_.onQueueNotEmpty(() => {
      this.vsync_.mutate(() => {
        this.postPromptUI_.hide();
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
