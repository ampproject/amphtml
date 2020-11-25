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

import {
  CONSENT_ITEM_STATE,
  ConsentMetadataDef,
  assertMetadataValues,
  constructMetadata,
  convertEnumValueToState,
  getConsentStateValue,
  hasStoredValue,
} from './consent-info';
import {CSS} from '../../../build/amp-consent-0.1.css';
import {
  ConsentConfig,
  expandConsentEndpointUrl,
  expandPolicyConfig,
} from './consent-config';
import {ConsentPolicyManager} from './consent-policy-manager';
import {ConsentStateManager} from './consent-state-manager';
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
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getData} from '../../../src/event-helper';
import {getServicePromiseForDoc} from '../../../src/service';
import {isEnumValue, isObject} from '../../../src/types';
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

    /** @private {?ConsentUI} */
    this.consentUI_ = null;

    /** @private {?JsonObject} */
    this.consentConfig_ = null;

    /** @private {?JsonObject} */
    this.policyConfig_ = null;

    /** @private {?ConsentUI} */
    this.postPromptUI_ = null;

    /** @private {?function()} */
    this.dialogResolver_ = null;

    /** @private {boolean} */
    this.isPromptUIOn_ = false;

    /** @private {boolean} */
    this.consentStateChangedViaPromptUI_ = false;

    /** @private {boolean} */
    this.consentUIPending_ = false;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private {?Promise<?JsonObject>} */
    this.remoteConfigPromise_ = null;

    /** @private {?string} */
    this.consentId_ = null;

    /** @private {?string} */
    this.matchedGeoGroup_ = null;
  }

  /** @override */
  getConsentPolicy() {
    // amp-consent should not be blocked by itself
    return null;
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.getAttribute('id'),
      'amp-consent should have an id'
    );

    const configManager = new ConsentConfig(this.element);

    return configManager.getConsentConfigPromise().then((validatedConfig) => {
      this.matchedGeoGroup_ = configManager.getMatchedGeoGroup();
      this.initialize_(validatedConfig);
    });
  }

  /**
   *
   * @param {!JsonObject} validatedConfig
   */
  initialize_(validatedConfig) {
    this.consentConfig_ = validatedConfig;

    // ConsentConfig has verified that there's one and only one consent instance
    this.consentId_ = this.consentConfig_['consentInstanceId'];

    if (this.consentConfig_['postPromptUI']) {
      this.postPromptUI_ = new ConsentUI(
        this,
        dict({}),
        this.consentConfig_['postPromptUI']
      );
    }

    /**
     * Deprecated Format
     * {
     *   'consentInstanceId': {
     *     'checkConsentHref': ...,
     *     'promptUI': ...
     *   }
     * }
     *
     * New Format
     * {
     *   'consentInstanceId': ...
     *   'checkConsentHref': ...
     *   'promptUI': ...
     *   'postPromptUI': ...
     * }
     */
    const policyConfig = this.consentConfig_['policy'] || dict({});

    this.policyConfig_ = expandPolicyConfig(
      policyConfig,
      /** @type {string} */ (this.consentId_)
    );

    const children = this.getRealChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      toggle(child, false);
      // <amp-consent> will manually schedule layout for its children.
      Services.ownersForDoc(this.element).setOwner(child, this.element);
    }

    const consentPolicyManagerPromise = getServicePromiseForDoc(
      this.getAmpDoc(),
      CONSENT_POLICY_MANAGER
    ).then((manager) => {
      this.consentPolicyManager_ = /** @type {!ConsentPolicyManager} */ (manager);
      this.consentPolicyManager_.setLegacyConsentInstanceId(
        /** @type {string} */ (this.consentId_)
      );
      const policyKeys = Object.keys(
        /** @type {!Object} */ (this.policyConfig_)
      );
      for (let i = 0; i < policyKeys.length; i++) {
        this.consentPolicyManager_.registerConsentPolicyInstance(
          policyKeys[i],
          this.policyConfig_[policyKeys[i]]
        );
      }
    });

    const consentStateManagerPromise = getServicePromiseForDoc(
      this.getAmpDoc(),
      CONSENT_STATE_MANAGER
    ).then((manager) => {
      manager.registerConsentInstance(this.consentId_, this.consentConfig_);
      this.consentStateManager_ = /** @type {!ConsentStateManager} */ (manager);
    });

    const notificationUiManagerPromise = getServicePromiseForDoc(
      this.getAmpDoc(),
      NOTIFICATION_UI_MANAGER
    ).then((manager) => {
      this.notificationUiManager_ = /** @type {!NotificationUiManager} */ (manager);
    });

    Promise.all([
      consentStateManagerPromise,
      notificationUiManagerPromise,
      consentPolicyManagerPromise,
    ]).then(() => {
      this.init_();
    });
  }

  /**
   * Register a list of user action functions
   */
  enableInteractions_() {
    this.registerAction('accept', () => {
      this.handleAction_(ACTION_TYPE.ACCEPT);
    });

    this.registerAction('reject', () => {
      this.handleAction_(ACTION_TYPE.REJECT);
    });

    this.registerAction('dismiss', () => {
      this.handleAction_(ACTION_TYPE.DISMISS);
    });

    this.registerAction('prompt', (invocation) =>
      this.handleReprompt_(invocation)
    );

    this.enableExternalInteractions_();
  }

  /**
   * Listen to external consent flow iframe's response
   * with consent string and metadata.
   */
  enableExternalInteractions_() {
    this.win.addEventListener('message', (event) => {
      if (!this.isPromptUIOn_) {
        return;
      }

      let consentString;
      let metadata;
      const data = getData(event);

      if (!data || data['type'] != 'consent-response') {
        return;
      }

      if (!data['action']) {
        user().error(TAG, 'consent-response message missing required info');
        return;
      }
      if (data['info'] !== undefined) {
        if (typeof data['info'] != 'string') {
          user().error(
            TAG,
            'consent-response info only supports string, ' +
              '%s, treated as undefined',
            data['info']
          );
          data['info'] = undefined;
        }
        if (data['action'] === ACTION_TYPE.DISMISS) {
          if (data['info']) {
            this.user().error(
              TAG,
              'Consent string value %s not applicable on user dismiss, ' +
                'stored value will be kept and used',
              data['info']
            );
          }
          data['info'] = undefined;
        }
        consentString = data['info'];
        metadata = this.validateMetadata_(data['consentMetadata']);
      }

      const iframes = this.element.querySelectorAll('iframe');

      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === event.source) {
          const action = data['action'];
          this.handleAction_(action, consentString, metadata);
          return;
        }
      }
    });
  }

  /**
   * Returns a promise that attempt to show prompt UI
   * @param {boolean} isActionPromptTrigger
   */
  scheduleDisplay_(isActionPromptTrigger) {
    if (!this.notificationUiManager_) {
      dev().error(TAG, 'notification ui manager not found');
    }

    if (this.consentUIPending_) {
      // Already pending to be shown. Do nothing.
      // This is to prevent postPromptUI trying to prompt the dialog, while
      // the prompt is waiting for previous amp-user-notification prompt to be
      // resolved first.
      // So prompt window won't be added to notificationUI queue duplicately.
      return;
    }

    if (!this.consentUI_) {
      // If consent UI not found. Do nothing.
      return;
    }

    this.consentUIPending_ = true;
    this.notificationUiManager_.registerUI(
      this.show_.bind(this, isActionPromptTrigger)
    );
  }

  /**
   * Show prompt UI
   * Do not invoke the function except in scheduleDisplay_
   * @param {boolean} isActionPromptTrigger
   * @return {!Promise}
   */
  show_(isActionPromptTrigger) {
    if (this.isPromptUIOn_) {
      dev().error(TAG, 'Attempt to show an already displayed prompt UI');
    }

    this.vsync_.mutate(() => {
      this.consentUI_.show(isActionPromptTrigger);
      this.isPromptUIOn_ = true;
    });

    const deferred = new Deferred();
    this.dialogResolver_ = deferred.resolve;
    return deferred.promise;
  }

  /**
   * Hide current prompt UI
   */
  hide_() {
    if (!this.isPromptUIOn_) {
      dev().error(TAG, '%s no consent ui to hide');
    }

    this.consentUI_.hide();
    this.isPromptUIOn_ = false;

    if (this.dialogResolver_) {
      this.dialogResolver_();
      this.dialogResolver_ = null;
    }

    this.consentUIPending_ = false;
  }

  /**
   * Handler User action
   *
   * @param {string} action
   * @param {string=} consentString
   * @param {!ConsentMetadataDef=} opt_consentMetadata
   */
  handleAction_(action, consentString, opt_consentMetadata) {
    if (!isEnumValue(ACTION_TYPE, action)) {
      // Unrecognized action
      return;
    }

    if (!this.isPromptUIOn_) {
      // No consent prompt to act to
      return;
    }

    if (!this.consentStateManager_) {
      dev().error(TAG, 'No consent state manager');
      return;
    }

    this.consentStateChangedViaPromptUI_ = true;

    if (action == ACTION_TYPE.ACCEPT) {
      //accept
      this.consentStateManager_.updateConsentInstanceState(
        CONSENT_ITEM_STATE.ACCEPTED,
        consentString,
        opt_consentMetadata
      );
    } else if (action == ACTION_TYPE.REJECT) {
      // reject
      this.consentStateManager_.updateConsentInstanceState(
        CONSENT_ITEM_STATE.REJECTED,
        consentString,
        opt_consentMetadata
      );
    } else if (action == ACTION_TYPE.DISMISS) {
      this.consentStateManager_.updateConsentInstanceState(
        CONSENT_ITEM_STATE.DISMISSED
      );
    }

    // Hide current dialog
    this.hide_();
  }

  /**
   * Handle the prompt action to re-prompt.
   * Accpet arg expireCache=true
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  handleReprompt_(invocation) {
    const {args} = invocation;
    if (args && args['expireCache'] === true) {
      this.consentStateManager_.setDirtyBit();
    }
    this.scheduleDisplay_(true);
  }

  /**
   * Init the amp-consent by registering and initiate consent instance.
   */
  init_() {
    this.passSharedData_();
    this.syncRemoteConsentState_();

    this.getConsentRequiredPromise_()
      .then((isConsentRequired) => {
        return this.initPromptUI_(isConsentRequired);
      })
      .then((isPostPromptUIRequired) => {
        if (isPostPromptUIRequired) {
          this.handlePostPromptUI_();
        }
        this.consentPolicyManager_.enableTimeout();
      })
      .catch((unusedError) => {
        // TODO: Handle errors
      });

    this.enableInteractions_();
  }

  /**
   * Returns a promise that resolve when amp-consent knows
   * if the consent is required.
   * @return {!Promise<boolean>}
   */
  getConsentRequiredPromise_() {
    return this.consentStateManager_
      .getConsentInstanceInfo()
      .then((storedInfo) => {
        if (hasStoredValue(storedInfo)) {
          return Promise.resolve(true);
        }
        const consentRequired = this.consentConfig_['consentRequired'];
        if (typeof consentRequired === 'boolean') {
          return Promise.resolve(consentRequired);
        }
        return this.getConsentRemote_().then((consentResponse) => {
          if (!consentResponse) {
            return false;
          }
          // `promptIfUnknown` is a legacy field
          return consentResponse['consentRequired'] !== undefined
            ? !!consentResponse['consentRequired']
            : !!consentResponse['promptIfUnknown'];
        });
      });
  }

  /**
   * Blindly pass sharedData
   */
  passSharedData_() {
    const responsePromise = this.getConsentRemote_();
    const sharedDataPromise = responsePromise.then((response) => {
      if (!response || response['sharedData'] === undefined) {
        return null;
      }
      return response['sharedData'];
    });

    this.consentStateManager_.setConsentInstanceSharedData(sharedDataPromise);
  }

  /**
   * Clear cache for server side decision and then sync.
   */
  syncRemoteConsentState_() {
    this.getConsentRemote_().then((response) => {
      if (!response) {
        return;
      }
      // Ideally we should fallback to true if either are true.
      const expireCache =
        response['expireCache'] || response['forcePromptOnNext'];
      if (expireCache) {
        this.consentStateManager_.setDirtyBit();
      }

      // Decision from promptUI takes precedence over consent decision from response
      if (
        !!response['consentRequired'] &&
        !this.consentStateChangedViaPromptUI_
      ) {
        this.updateCacheIfNotNull_(
          response['consentStateValue'],
          response['consentString'] || undefined,
          response['consentMetadata'] || undefined
        );
      }
    });
  }

  /**
   * Sync with local storage if consentRequired is true.
   *
   * @param {string=} responseStateValue
   * @param {string=} responseConsentString
   * @param {JsonObject=} opt_responseMetadata
   */
  updateCacheIfNotNull_(
    responseStateValue,
    responseConsentString,
    opt_responseMetadata
  ) {
    const consentStateValue = convertEnumValueToState(responseStateValue);
    // consentStateValue and consentString are treated as a pair that will update together
    if (consentStateValue !== null) {
      this.consentStateManager_.updateConsentInstanceState(
        consentStateValue,
        responseConsentString,
        this.validateMetadata_(opt_responseMetadata)
      );
    }
  }

  /**
   * Get localStored consent info, and send request to get consent from endpoint
   * if there is checkConsentHref specified.
   * @return {!Promise<?JsonObject>}
   */
  getConsentRemote_() {
    if (this.remoteConfigPromise_) {
      return this.remoteConfigPromise_;
    }
    if (!this.consentConfig_['checkConsentHref']) {
      this.remoteConfigPromise_ = Promise.resolve(null);
    } else {
      const storeConsentPromise = this.consentStateManager_.getLastConsentInstanceInfo();
      this.remoteConfigPromise_ = storeConsentPromise.then((storedInfo) => {
        // Note: Expect the request to look different in following versions.
        const request = /** @type {!JsonObject} */ ({
          'consentInstanceId': this.consentId_,
          'consentStateValue': getConsentStateValue(storedInfo['consentState']),
          'consentMetadata': storedInfo['consentMetadata'],
          'consentString': storedInfo['consentString'],
          'isDirty': !!storedInfo['isDirty'],
          'matchedGeoGroup': this.matchedGeoGroup_,
        });
        if (this.consentConfig_['clientConfig']) {
          request['clientConfig'] = this.consentConfig_['clientConfig'];
        }
        const init = {
          credentials: 'include',
          method: 'POST',
          body: request,
        };
        const href = this.consentConfig_['checkConsentHref'];
        assertHttpsUrl(href, this.element);
        const ampdoc = this.getAmpDoc();
        const sourceBase = getSourceUrl(ampdoc.getUrl());
        const resolvedHref = resolveRelativeUrl(href, sourceBase);
        const xhrService = Services.xhrFor(this.win);
        return ampdoc.whenFirstVisible().then(() =>
          expandConsentEndpointUrl(this.element, resolvedHref).then(
            (expandedHref) =>
              xhrService.fetchJson(expandedHref, init).then((res) =>
                xhrService
                  .xssiJson(res, this.consentConfig_['xssiPrefix'])
                  .catch((e) => {
                    user().error(
                      TAG,
                      'Could not parse the `checkConsentHref` response.',
                      e
                    );
                  })
              )
          )
        );
      });
    }
    return this.remoteConfigPromise_;
  }

  /**
   * Handle Prompt UI.
   * @param {boolean} isConsentRequired
   * @return {Promise<boolean>}
   */
  initPromptUI_(isConsentRequired) {
    this.consentUI_ = new ConsentUI(
      this,
      /** @type {!JsonObject} */ (devAssert(
        this.consentConfig_,
        'consent config not found'
      ))
    );

    // Get current consent state
    return this.consentStateManager_.getConsentInstanceInfo().then((info) => {
      if (hasStoredValue(info)) {
        // Has user stored value, no need to prompt
        return true;
      }
      if (!isConsentRequired) {
        // no need to prompt if remote reponse say so
        // Also no need to display postPromptUI
        this.consentStateManager_.updateConsentInstanceState(
          CONSENT_ITEM_STATE.NOT_REQUIRED
        );
        return false;
      }
      // Prompt
      this.scheduleDisplay_(false);
      return true;
      // TODO(@zhouyx):
      // Race condition on consent state change between schedule to
      // display and display. Add one more check before display
    });
  }

  /**
   * Handles the display of postPromptUI
   */
  handlePostPromptUI_() {
    if (!this.postPromptUI_) {
      return;
    }

    this.notificationUiManager_.onQueueEmpty(() => {
      this.vsync_.mutate(() => {
        this.postPromptUI_.show(false);
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

  /**
   * @return {?ConsentStateManager}
   * @visibleForTesting
   */
  getConsentStateManagerForTesting() {
    return this.consentStateManager_;
  }

  /**
   * @return {!Promise<boolean>}
   * @visibleForTesting
   */
  getConsentRequiredPromiseForTesting() {
    return this.getConsentRequiredPromise_();
  }

  /**
   * @return {boolean}
   * @visibleForTesting
   */
  getIsPromptUiOnForTesting() {
    return this.isPromptUIOn_;
  }

  /**
   * Convert valid opt_metadta into ConsentMetadataDef
   * @param {JsonObject=} opt_metadata
   * @return {ConsentMetadataDef|undefined}
   */
  validateMetadata_(opt_metadata) {
    if (!opt_metadata) {
      return;
    }
    if (!isObject(opt_metadata)) {
      user().error(TAG, 'CMP metadata is not an object.');
      return;
    }
    assertMetadataValues(opt_metadata);
    return constructMetadata(
      opt_metadata['consentStringType'],
      opt_metadata['additionalConsent'],
      opt_metadata['gdprApplies']
    );
  }
}

AMP.extension('amp-consent', '0.1', (AMP) => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANAGER, ConsentPolicyManager);
});
