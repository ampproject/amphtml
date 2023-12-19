import {Deferred} from '#core/data-structures/promise';
import {realChildElements} from '#core/dom/query';
import {toggle} from '#core/dom/style';
import {isArray, isEnumValue, isObject} from '#core/types';
import {hasOwn} from '#core/types/object';

import {Services} from '#service';
import {
  NOTIFICATION_UI_MANAGER,
  NotificationUiManager,
} from '#service/notification-ui-manager';

import {getData} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {
  ConsentConfig,
  expandConsentEndpointUrl,
  expandPolicyConfig,
} from './consent-config';
import {
  CONSENT_ITEM_STATE,
  ConsentMetadataDef,
  assertMetadataValues,
  constructMetadata,
  convertEnumValueToState,
  getConsentStateValue,
  hasStoredValue,
} from './consent-info';
import {ConsentPolicyManager} from './consent-policy-manager';
import {ConsentStateManager} from './consent-state-manager';
import {ConsentUI} from './consent-ui';
import {CookieWriter} from './cookie-writer';
import {TcfApiCommandManager} from './tcf-api-command-manager';

import {CSS} from '../../../build/amp-consent-0.1.css';
import {getServicePromiseForDoc} from '../../../src/service-helpers';
import {
  assertHttpsUrl,
  getSourceUrl,
  resolveRelativeUrl,
} from '../../../src/url';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const CONSENT_POLICY_MANAGER = 'consentPolicyManager';
const TCF_API_LOCATOR = '__tcfapiLocator';
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

    /** @private {?TcfApiCommandManager} */
    this.tcfApiCommandManager_ = null;

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
    this.isPromptUiOn_ = false;

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

    /** @private {?Promise<?Array>} */
    this.purposeConsentRequired_ = null;
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

  /** @override */
  pauseCallback() {
    if (this.consentUI_) {
      this.consentUI_.pause();
    }
  }

  /** @override */
  resumeCallback() {
    if (this.consentUI_) {
      this.consentUI_.resume();
    }
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
        {},
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
    const policyConfig = this.consentConfig_['policy'] || {};

    this.policyConfig_ = expandPolicyConfig(
      policyConfig,
      /** @type {string} */ (this.consentId_)
    );

    const children = realChildElements(this.element);
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
      this.consentPolicyManager_ = /** @type {!ConsentPolicyManager} */ (
        manager
      );
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
      this.notificationUiManager_ = /** @type {!NotificationUiManager} */ (
        manager
      );
    });

    const cookieWriterPromise = this.consentConfig_['cookies']
      ? new CookieWriter(this.win, this.element, this.consentConfig_).write()
      : Promise.resolve();

    Promise.all([
      consentStateManagerPromise,
      notificationUiManagerPromise,
      consentPolicyManagerPromise,
      cookieWriterPromise,
    ]).then(() => {
      this.init_();
    });
  }

  /**
   * Register a list of user action functions
   */
  enableInteractions_() {
    this.registerAction('accept', (invocation) => {
      this.handleClosingUiAction_(ACTION_TYPE.ACCEPT, invocation);
    });

    this.registerAction('reject', (invocation) => {
      this.handleClosingUiAction_(ACTION_TYPE.REJECT, invocation);
    });

    this.registerAction('dismiss', () => {
      this.handleClosingUiAction_(ACTION_TYPE.DISMISS);
    });

    this.registerAction('setPurpose', (invocation) => {
      this.handleSetPurpose_(invocation);
    });

    this.registerAction('prompt', (invocation) =>
      this.handleReprompt_(invocation)
    );

    this.enableExternalInteractions_();
  }

  /**
   * For actions that close the PromptUI, validate state
   * and do some preprocessing, then handle action.
   * @param {string} action
   * @param {../../../src/service/action-impl.ActionInvocation=} opt_invocation
   */
  handleClosingUiAction_(action, opt_invocation) {
    if (!this.isReadyToHandleAction_()) {
      return;
    }
    // Set default for purpose map
    this.maybeSetConsentPurposeDefaults_(action, opt_invocation).then(() => {
      this.handleAction_(action);
    });
  }

  /**
   * Listen to external consent flow iframe's response
   * with consent string and metadata.
   */
  enableExternalInteractions_() {
    this.win.addEventListener('message', (event) => {
      if (!this.isPromptUiOn_) {
        return;
      }

      let consentString;
      let tcfPolicyVersion;
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
        tcfPolicyVersion = this.validateTCFPolicyVersion_(
          data['tcfPolicyVersion']
        );
        metadata = this.validateMetadata_(data['consentMetadata']);
      }

      const iframes = this.element.querySelectorAll('iframe');

      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === event.source) {
          const {action, purposeConsents} = data;
          // Check if we have a valid action and valid state
          if (
            !isEnumValue(ACTION_TYPE, action) ||
            !this.isReadyToHandleAction_()
          ) {
            continue;
          }
          if (
            purposeConsents &&
            Object.keys(purposeConsents).length &&
            action !== ACTION_TYPE.DISMISS
          ) {
            this.validatePurposeConsents_(purposeConsents);
            this.consentStateManager_.updateConsentInstancePurposes(
              purposeConsents
            );
          }
          this.handleAction_(action, consentString, metadata, tcfPolicyVersion);
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
    if (this.isPromptUiOn_) {
      dev().error(TAG, 'Attempt to show an already displayed prompt UI');
    }

    this.vsync_.mutate(() => {
      this.consentUI_.show(isActionPromptTrigger);
      this.isPromptUiOn_ = true;
    });

    const deferred = new Deferred();
    this.dialogResolver_ = deferred.resolve;
    return deferred.promise;
  }

  /**
   * Hide current prompt UI
   */
  hide_() {
    if (!this.isPromptUiOn_) {
      dev().error(TAG, '%s no consent ui to hide');
    }

    this.consentUI_.hide();
    this.isPromptUiOn_ = false;

    if (this.dialogResolver_) {
      this.dialogResolver_();
      this.dialogResolver_ = null;
    }

    this.consentUIPending_ = false;
  }

  /**
   * Checks if we are in a valid state to handle user actions.
   * @return {boolean}
   */
  isReadyToHandleAction_() {
    if (!this.consentStateManager_) {
      dev().error(TAG, 'No consent state manager');
      return false;
    }
    return this.isPromptUiOn_;
  }

  /**
   * Handler User action. Should call isReadyToHandleAction_ before.
   *
   * @param {string} action
   * @param {string=} consentString
   * @param {!ConsentMetadataDef=} opt_consentMetadata
   * @param {number=} opt_tcfPolicyVersion
   */
  handleAction_(
    action,
    consentString,
    opt_consentMetadata,
    opt_tcfPolicyVersion
  ) {
    const setDirtyBitPromise =
      isEnumValue(ACTION_TYPE, action) &&
      this.consentConfig_['clearDirtyBitOnResponse_dontUseThisItMightBeRemoved']
        ? this.consentStateManager_.setDirtyBit(false)
        : Promise.resolve();
    setDirtyBitPromise.then(() => {
      this.handleActionAfterClearingDirtyBit_(
        action,
        consentString,
        opt_consentMetadata,
        opt_tcfPolicyVersion
      );
    });
  }

  /**
   * @param {string} action
   * @param {string=} consentString
   * @param {!ConsentMetadataDef=} opt_consentMetadata
   * @param {number=} opt_tcfPolicyVersion
   */
  handleActionAfterClearingDirtyBit_(
    action,
    consentString,
    opt_consentMetadata,
    opt_tcfPolicyVersion
  ) {
    this.consentStateChangedViaPromptUI_ = true;

    if (action == ACTION_TYPE.ACCEPT) {
      //accept
      this.consentStateManager_.updateConsentInstanceState(
        CONSENT_ITEM_STATE.ACCEPTED,
        consentString,
        opt_consentMetadata,
        opt_tcfPolicyVersion
      );
    } else if (action == ACTION_TYPE.REJECT) {
      // reject
      this.consentStateManager_.updateConsentInstanceState(
        CONSENT_ITEM_STATE.REJECTED,
        consentString,
        opt_consentMetadata,
        opt_tcfPolicyVersion
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
   * Maybe set the consent purpose map with default values.
   * If not, resolve instantly.
   * @param {string} action
   * @param {../../../src/service/action-impl.ActionInvocation=} opt_invocation
   * @return {!Promise}
   */
  maybeSetConsentPurposeDefaults_(action, opt_invocation) {
    if (typeof opt_invocation?.args?.purposeConsentDefault !== 'boolean') {
      return Promise.resolve();
    }
    if (action === ACTION_TYPE.DISMISS) {
      dev.warn(TAG, 'Dismiss cannot have a `purposeConsentDefault` parameter.');
      return Promise.resolve();
    }

    // At this point, this.getPurposeConsentRequired_()
    // should always be resolved, so no need to worry about
    // a race here.
    return this.getPurposeConsentRequired_().then((purposeConsentRequired) => {
      if (!purposeConsentRequired || !purposeConsentRequired.length) {
        return;
      }
      const defaultPurposes = {};
      const purposeValue = opt_invocation['args']['purposeConsentDefault'];
      purposeConsentRequired.forEach((purpose) => {
        defaultPurposes[purpose] = purposeValue;
      });
      this.consentStateManager_.updateConsentInstancePurposes(
        defaultPurposes,
        true
      );
    });
  }

  /**
   * Handle the prompt action to re-prompt.
   * Accpet arg expireCache=true
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  handleReprompt_(invocation) {
    const {args} = invocation;
    const setDirtyBitPromise =
      args?.['expireCache'] === true
        ? this.consentStateManager_.setDirtyBit()
        : Promise.resolve();
    setDirtyBitPromise.then(() => {
      this.scheduleDisplay_(true);
    });
  }

  /**
   * Handle the setting a purpose in the state manager.
   * Accpet all args with booleans as values.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  handleSetPurpose_(invocation) {
    if (
      !invocation ||
      !invocation['args'] ||
      !Object.keys(invocation['args']).length
    ) {
      dev().error(TAG, 'Must have arugments for `setPurpose`.');
      return;
    }
    const {args} = invocation;
    if (this.isReadyToHandleAction_()) {
      this.validatePurposeConsents_(args);
      this.consentStateManager_.updateConsentInstancePurposes(args);
    }
  }

  /**
   * Init the amp-consent by registering and initiate consent instance.
   */
  init_() {
    this.passSharedData_();
    this.syncRemoteConsentState_();
    this.maybeSetUpTcfPostMessageProxy_();

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
          response['consentMetadata'],
          response['purposeConsents'],
          response['tcfPolicyVersion']
        );
      }
    });
  }

  /**
   * Sync with local storage if consentRequired is true.
   *
   * @param {?string=} responseStateValue
   * @param {?string=} responseConsentString
   * @param {?JsonObject=} responseMetadata
   * @param {?JsonObject=} responsePurposeConsents
   * @param {number=} responseTcfPolicyVersion
   */
  updateCacheIfNotNull_(
    responseStateValue,
    responseConsentString,
    responseMetadata,
    responsePurposeConsents,
    responseTcfPolicyVersion
  ) {
    const consentStateValue = convertEnumValueToState(responseStateValue);
    // consentStateValue and consentString are treated as a pair that will update together
    if (consentStateValue !== null) {
      if (
        responsePurposeConsents &&
        isObject(responsePurposeConsents) &&
        Object.keys(responsePurposeConsents).length
      ) {
        this.validatePurposeConsents_(responsePurposeConsents);
        this.consentStateManager_.updateConsentInstancePurposes(
          responsePurposeConsents
        );
      }

      this.consentStateManager_.updateConsentInstanceState(
        consentStateValue,
        responseConsentString,
        this.validateMetadata_(responseMetadata),
        responseTcfPolicyVersion
      );
    }
  }

  /**
   * Get localStored consent info, and send request to get consent from endpoint
   * if there is checkConsentHref specified.
   * @return {!Promise<?JsonObject>}
   */
  getConsentRemote_() {
    // TODO(alanorozco): once() this instead of using an instance property.
    if (this.remoteConfigPromise_) {
      return this.remoteConfigPromise_;
    }
    const {'checkConsentHref': checkConsentHref} = this.consentConfig_;
    if (!checkConsentHref) {
      this.remoteConfigPromise_ = Promise.resolve(null);
    } else {
      const storeConsentPromise =
        this.consentStateManager_.getLastConsentInstanceInfo();
      this.remoteConfigPromise_ = storeConsentPromise.then((storedInfo) => {
        // Note: Expect the request to look different in following versions.
        const body = {
          'consentInstanceId': this.consentId_,
          'consentStateValue': getConsentStateValue(storedInfo['consentState']),
          'consentMetadata': storedInfo['consentMetadata'],
          'consentString': storedInfo['consentString'],
          'tcfPolicyVersion': storedInfo['tcfPolicyVersion'],
          'isDirty': !!storedInfo['isDirty'],
          'matchedGeoGroup': this.matchedGeoGroup_,
          'purposeConsents': storedInfo['purposeConsents'],
          'clientConfig': this.consentConfig_['clientConfig'],
        };
        const init = {
          credentials: 'include',
          method: 'POST',
          body,
        };
        assertHttpsUrl(checkConsentHref, this.element);
        const ampdoc = this.getAmpDoc();
        const sourceBase = getSourceUrl(ampdoc.getUrl());
        const resolvedHref = resolveRelativeUrl(checkConsentHref, sourceBase);
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
   * Returns true if we have stored the granular consent values
   * for the required purposes.
   * @param {ConsentInfoDef} consentInfo
   * @return {!Promise<boolean>}
   */
  checkGranularConsentRequired_(consentInfo) {
    return this.getPurposeConsentRequired_().then((purposeConsentRequired) => {
      // True if there are no required purposes
      if (!purposeConsentRequired?.length) {
        this.consentStateManager_.hasAllPurposeConsents();
        return true;
      }
      const storedPurposeConsents = consentInfo['purposeConsents'];
      // False if there are no stored purposes
      if (
        !storedPurposeConsents ||
        Object.keys(storedPurposeConsents).length <
          purposeConsentRequired.length
      ) {
        return false;
      }
      // Check if we have a stored consent for each purpose required
      for (let i = 0; i < purposeConsentRequired.length; i++) {
        const purpose = purposeConsentRequired[i];
        if (!hasOwn(storedPurposeConsents, purpose)) {
          return false;
        }
      }
      this.consentStateManager_.hasAllPurposeConsents();
      return true;
    });
  }

  /**
   * Get `purposeConsentRequired` from consent config,
   * or from `checkConsentHref` response.
   * @return {!Promise<?Array>}
   */
  getPurposeConsentRequired_() {
    // TODO(alanorozco): once() this instead of using an instance property.
    if (this.purposeConsentRequired_) {
      return this.purposeConsentRequired_;
    }
    const inlinePurposes = this.consentConfig_['purposeConsentRequired'];
    if (isArray(inlinePurposes)) {
      this.purposeConsentRequired_ = Promise.resolve(inlinePurposes);
    } else {
      this.purposeConsentRequired_ = this.getConsentRemote_().then(
        (response) => {
          if (!response || !isArray(response['purposeConsentRequired'])) {
            return null;
          }
          return response['purposeConsentRequired'];
        }
      );
    }
    return this.purposeConsentRequired_;
  }

  /**
   * Determines if we should show UI based on our stored consent values.
   * @return {!Promise<boolean>}
   */
  hasRequiredConsents_() {
    return this.consentStateManager_.getConsentInstanceInfo().then((info) => {
      // Check that we have global consent
      if (hasStoredValue(info)) {
        // Then check granular consent
        return this.checkGranularConsentRequired_(info);
      }
      return Promise.resolve(false);
    });
  }

  /**
   * Handle Prompt UI.
   * @param {boolean} isConsentRequired
   * @return {Promise<boolean>}
   */
  initPromptUI_(isConsentRequired) {
    this.consentUI_ = new ConsentUI(
      this,
      /** @type {!JsonObject} */ (
        devAssert(this.consentConfig_, 'consent config not found')
      )
    );

    // Get current consent state
    return this.hasRequiredConsents_().then((hasConsents) => {
      if (hasConsents) {
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
    return this.isPromptUiOn_;
  }

  /**
   * Ensure purpose consents to be set are valid.
   *
   * @param {!Object} purposeObj
   */
  validatePurposeConsents_(purposeObj) {
    const purposeKeys = Object.keys(purposeObj);
    purposeKeys.forEach((purposeKey) => {
      dev().assertBoolean(
        purposeObj[purposeKey],
        '`setPurpose` values must be booleans.'
      );
    });
  }

  /**
   * Check if the opt_tcfPolicyVersion provided is a valid number to use.
   * @param {number=} opt_tcfPolicyVersion
   * @return {number|undefined}
   */
  validateTCFPolicyVersion_(opt_tcfPolicyVersion) {
    if (typeof opt_tcfPolicyVersion !== 'number') {
      return;
    }

    if (
      isNaN(opt_tcfPolicyVersion) ||
      !isFinite(opt_tcfPolicyVersion) ||
      opt_tcfPolicyVersion.toString().split('.').length > 1
    ) {
      user().error(
        TAG,
        'CMP tcfPolicyVersion must be a valid number (integer).'
      );
      return;
    }

    return opt_tcfPolicyVersion;
  }

  /**
   * Convert valid opt_metadata into ConsentMetadataDef
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
      opt_metadata['gdprApplies'],
      opt_metadata['purposeOne']
    );
  }

  /**
   * Maybe set up the __tfcApiLocator window and listeners.
   *
   * The window is a dummy iframe that signals to 3p iframes
   * that the document supports the tcfPostMessage API.
   */
  maybeSetUpTcfPostMessageProxy_() {
    if (!this.consentConfig_['exposesTcfApi']) {
      return;
    }
    // Bail if __tcfApiLocator API already exists (dirty AMP)
    if (this.win.frames[TCF_API_LOCATOR]) {
      return;
    }
    this.tcfApiCommandManager_ = new TcfApiCommandManager(
      this.consentPolicyManager_
    );
    // Add window listener for 3p iframe postMessages
    this.win.addEventListener('message', (e) => this.handleTcfMessage_(e));

    // Set up the __tcfApiLocator window to signal postMessage support
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('name', TCF_API_LOCATOR);
    iframe.setAttribute('aria-hidden', 'true');
    toggle(iframe, false);
    this.element.appendChild(dev().assertElement(iframe));
  }

  /**
   * Listen to iframe messages and handle events.
   *
   * The listeners will listen for post messages from 3p
   * iframes that have the following structure:
   * {
   *  "__tcfapiCall": {
   *    "command": cmd,
   *    "parameter": arg,
   *    "version": v,
   *    "callId": id,
   *  }
   * }
   *
   * @param {!Event} event
   */
  handleTcfMessage_(event) {
    const data = getData(event);

    if (!data || !data['__tcfapiCall']) {
      return;
    }
    this.tcfApiCommandManager_.handleTcfCommand(data, event.source);
  }
}

AMP.extension('amp-consent', '0.1', (AMP) => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANAGER, ConsentPolicyManager);
});
