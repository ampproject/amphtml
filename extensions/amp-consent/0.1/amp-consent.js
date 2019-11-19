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
  getConsentItemStateForValue,
  getConsentStateValue,
  hasStoredValue,
} from './consent-info';
import {CSS} from '../../../build/amp-consent-0.1.css';
import {ConsentConfig, expandPolicyConfig} from './consent-config';
import {ConsentPolicyManager} from './consent-policy-manager';
import {ConsentStateManager} from './consent-state-manager';
import {ConsentUI} from './consent-ui';
import {Deferred} from '../../../src/utils/promise';
import {GEO_IN_GROUP} from '../../amp-geo/0.1/amp-geo-in-group';
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
import {isEnumValue} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
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

    this.isPromptUIOn_ = false;

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

    /** @private {?boolean} */
    this.promptShown_ = false;
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

    const expOn = isExperimentOn(this.win, 'amp-consent-ccpa');
    if (expOn) {
      console.log('CCPA flag is on');
    } else {
      console.log('nope not on');
    }

    const config = new ConsentConfig(this.element);

    this.consentConfig_ = config.getConsentConfig();

    // ConsentConfig has verified that there's one and only one consent instance
    this.consentId_ = this.consentConfig_['consentInstanceId'];

    this.consentUI_ = new ConsentUI(
      this,
      /** @type {!JsonObject} */ (devAssert(
        this.consentConfig_,
        'consent config not found'
      ))
    );

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
    ).then(manager => {
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
    ).then(manager => {
      manager.registerConsentInstance(this.consentId_, this.consentConfig_);
      this.consentStateManager_ = /** @type {!ConsentStateManager} */ (manager);
    });

    const notificationUiManagerPromise = getServicePromiseForDoc(
      this.getAmpDoc(),
      NOTIFICATION_UI_MANAGER
    ).then(manager => {
      this.notificationUiManager_ = /** @type {!NotificationUiManager} */ (manager);
    });

    // (TODO): Assert that if we're using new version we have consentRequired
    // otherwise we're using old version and we should migrate to new
    // version here.
    // E.g: promptIfUnknownForGeo: geoGroup -> geoOverride: {geoGroup: {consentRequired: true}}

    // Iterate through geoGroups, and override toplevel `checkConsentHref` and `consentRequire` if we are in the group
    const geoServicePromise = this.consentConfig_['geoOverride']
      ? Services.geoForDocOrNull(this.element).then(geo => {
          userAssert(
            geo,
            'requires <amp-geo> to use promptIfUnknownForGeoGroup'
          );
          const geoGroups = Object.keys(this.consentConfig_['geoOverride']);
          for (let i = 0; i < geoGroups.length; i++) {
            // Maybe I should be using merge configs here?
            if (geo.isInCountryGroup(geoGroups[i]) == GEO_IN_GROUP.IN) {
              this.consentConfig_['consentRequired'] =
                this.consentConfig_['geoOverride'][geoGroups[i]][
                  'consentRequired'
                ] || this.consentConfig_['consentRequired'];
              this.consentConfig_['checkConsentHref'] =
                this.consentConfig_['geoOverride'][geoGroups[i]][
                  'checkConsentHref'
                ] || this.consentConfig_['checkConsentHref'];
              this.matchedGeoGroup_ = geoGroups[i];
            }
            delete this.consentConfig_['geoOverride'][geoGroups[i]][
              'consentRequired'
            ];
            delete this.consentConfig_['geoOverride'][geoGroups[i]][
              'checkConsentHref'
            ];
          }
        })
      : Promise.resolve();

    Promise.all([
      consentStateManagerPromise,
      notificationUiManagerPromise,
      consentPolicyManagerPromise,
      geoServicePromise,
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

    this.registerAction('prompt', () => {
      this.scheduleDisplay_(true);
    });

    this.enableExternalInteractions_();
  }

  /**
   * Listen to external consent flow iframe's response
   */
  enableExternalInteractions_() {
    this.win.addEventListener('message', event => {
      if (!this.isPromptUIOn_) {
        return;
      }

      let consentString;
      const data = getData(event);

      if (!data || data['type'] != 'consent-response') {
        return;
      }

      if (!data['action']) {
        user().error(TAG, 'consent-response message missing required info');
        return;
      }
      if (
        isExperimentOn(this.win, 'amp-consent-v2') &&
        data['info'] !== undefined
      ) {
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
              consentString
            );
          }
          data['info'] = undefined;
        }
        consentString = data['info'];
      }

      const iframes = this.element.querySelectorAll('iframe');

      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === event.source) {
          const action = data['action'];
          this.handleAction_(action, consentString);
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
   * @param {string} action
   * @param {string=} consentString
   */
  handleAction_(action, consentString) {
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

    if (action == ACTION_TYPE.ACCEPT) {
      //accept
      this.consentStateManager_.updateConsentInstanceState(
        CONSENT_ITEM_STATE.ACCEPTED,
        consentString
      );
    } else if (action == ACTION_TYPE.REJECT) {
      // reject
      this.consentStateManager_.updateConsentInstanceState(
        CONSENT_ITEM_STATE.REJECTED,
        consentString
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
   * Init the amp-consent by registering and initiate consent instance.
   * 1.) Get local storage values
   * 2.) Maybe prompt
   * 3.) Sync server data with local storage
   * 4.) Maybe prompt post ui
   * 5.) Enable timeout and interactions
   */
  init_() {
    this.consentStateManager_
      .getConsentInstanceInfo()
      .then(info => {
        const localStorageValue = hasStoredValue(info);
        return this.showPromptOrNot_(localStorageValue);
      })
      .then(() => this.syncServerData_())
      .then(() => {
        if (this.promptShown_) {
          this.handlePostPromptUI_();
        }
        this.consentPolicyManager_.enableTimeout();
      })
      .catch(unusedError => {
        // TODO: Handle errors
      });

    this.enableInteractions_();
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
      this.remoteConfigPromise_ = storeConsentPromise.then(storedInfo => {
        // Note: Expect the request to look different in following versions.
        const request = /** @type {!JsonObject} */ ({
          'consentInstanceId': this.consentId_,
          'consentStateValue': getConsentStateValue(storedInfo['consentState']),
          'consentString': storedInfo['consentString'],
          // isDirty will be deprecated
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
        return ampdoc.whenFirstVisible().then(() => {
          return Services.xhrFor(this.win)
            .fetchJson(resolvedHref, init)
            .then(res => res.json());
        });
      });
    }
    return this.remoteConfigPromise_;
  }

  /**
   * @param {string} hasLocalStorageValue
   * @return {Promise<boolean>}
   */
  showPromptOrNot_(hasLocalStorageValue) {
    // Remote case
    if (this.consentConfig_['consentRequired'] === 'remote') {
      userAssert(
        this.consentConfig_['checkConsentHref'],
        'checkConsentHref must be a valid endpoint, when using remote'
      );
      // If no local storage, then wait for this to tell us if consent is required
      if (!hasLocalStorageValue) {
        // Get remote consent using `checkConsentHref`
        this.getConsentRemote_().then(consentInfo => {
          const constentRequiredResponse = consentInfo['consentRequired'];
          const consentStateValueResponse = getConsentItemStateForValue(
            consentInfo['consentStateValue']
          );

          // check if consentRequired and no previous consent state stored
          if (
            constentRequiredResponse === true &&
            consentStateValueResponse === CONSENT_ITEM_STATE.UNKNOWN
          ) {
            // Prompt (and eligible for postPromptUi)
            this.scheduleDisplay_(false);
            this.promptShown_ = true;
          }
          // last case is if consent is required but there `consentStateValueResponse` is not `unknown`
          // then we don't do anything.
        });
      }
    } else if (this.consentConfig_['consentRequired']) {
      if (!hasLocalStorageValue) {
        // Prompt (and eligible for postPromptUi)
        this.scheduleDisplay_(false);
        this.promptShown_ = true;
        // TODO(@zhouyx):
        // Race condition on consent state change between schedule to
        // display and display. Add one more check before display
      }
    }
  }

  /**
   * Attempts to sync with the server endpoint if there is one.
   */
  syncServerData_() {
    // This is where passSharedData and clearCache will be as well as syncing with the cache
    this.getConsentRemote_().then(response => {
      // Pass shared data
      this.passSharedData_(response);

      // sync values and clean up cache
      this.updateCache();
    });
  }

  /**
   * Blindly pass sharedData
   *
   * @param {?Object} response
   */
  passSharedData_(response) {
    const sharedDataPromise =
      !response || response['sharedData'] === undefined
        ? null
        : response['sharedData'];

    this.consentStateManager_.setConsentInstanceSharedData(sharedDataPromise);
  }

  /**
   * Sync client side storage with server response, if applicable.
   *
   * @param {?Object} response
   */
  updateCache(response) {
    // If we do prompt then we should NOT sync with server (except to clear cache).
    if (response) {
      // Need to set dirty bit first, so that updated state will also include it
      if (!!response['expireCache']) {
        this.consentStateManager_.setDirtyBit();
      }

      if (!this.promptShown_) {
        this.consentStateManager_.updateConsentInstanceState(
          getConsentItemStateForValue(response['consentStateValue']),
          response['consentString']
        );
      }
    }
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
}

AMP.extension('amp-consent', '0.1', AMP => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANAGER, ConsentPolicyManager);
});
