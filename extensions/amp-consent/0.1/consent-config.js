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

import {CMP_CONFIG} from './cmps';
import {CONSENT_POLICY_STATE} from '../../../src/consent-state';
import {deepMerge} from '../../../src/utils/object';
import {devAssert, user, userAssert} from '../../../src/log';
import {getChildJsonConfig} from '../../../src/json';
import {isExperimentOn} from '../../../src/experiments';
import {toWin} from '../../../src/types';

const TAG = 'amp-consent/consent-config';

const ALLOWED_DEPR_CONSENTINSTANCE_ATTRS = {
  'promptUI': true,
  'checkConsentHref': true,
  'promptIfUnknownForGeoGroup': true,
  'onUpdateHref': true,
};

export class ConsentConfig {

  /** @param {!Element} element */
  constructor(element) {
    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Window} */
    this.win_ = toWin(element.ownerDocument.defaultView);

    /** @private {?JsonObject} */
    this.config_ = null;
  }

  /**
   * Read validate and return the config
   * @return {!JsonObject}
   */
  getConsentConfig() {
    if (!this.config_) {
      this.config_ = this.validateAndParseConfig_();
    }
    return this.config_;
  }

  /**
   * Convert the inline config to new format
   * @param {!JsonObject} config
   */
  convertInlineConfigFormat_(config) {
    const consentsConfigDepr = config['consents'];
    if (!isExperimentOn(this.win_, 'amp-consent-v2')) {
      userAssert(consentsConfigDepr, '%s: consents config is required', TAG);
      userAssert(Object.keys(consentsConfigDepr).length != 0,
          '%s: can\'t find consent instance', TAG);
    }

    if (!config['consents']) {
      // New format, return
      return config;
    }
    // Assert single consent instance
    const keys = Object.keys(consentsConfigDepr);

    userAssert(keys.length <= 1,
        '%s: only single consent instance is supported', TAG);

    if (keys.length > 0) {
      config['consentInstanceId'] = keys[0];
      // Copy config['consents']['key'] to config
      const consentInstanceConfigDepr = config['consents'][keys[0]];
      const attrs = Object.keys(consentInstanceConfigDepr);
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (!config[attr] && ALLOWED_DEPR_CONSENTINSTANCE_ATTRS[attr]) {
          // Do not override if has been specified, or the attr is not supported
          // in consent instance before
          config[attrs[i]] = consentInstanceConfigDepr[attrs[i]];
        }
      }
    }

    delete config['consents'];
    return config;
  }

  /**
   * Read and parse consent config
   * An example valid config json looks like
   * {
   *  "consentInstanceId": "ABC",
   *  "checkConsentHref": "https://fake.com"
   * }
   * @return {!JsonObject}
   */
  validateAndParseConfig_() {
    const inlineConfig = this.convertInlineConfigFormat_(
        /** @type {!JsonObject} */ (
          userAssert(this.getInlineConfig_(), '%s: Inline config not found')));

    const cmpConfig = this.getCMPConfig_();

    const config = /** @type {!JsonObject} */ (
        deepMerge(cmpConfig || {}, inlineConfig || {}, 1));

    userAssert(config['consentInstanceId'],
        '%s: consentInstanceId to store consent info is required', TAG);

    if (config['policy']) {
      // Only respect 'default' consent policy;
      const keys = Object.keys(config['policy']);
      // TODO (@zhouyx): Validate waitFor value
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] != 'default') {
          user().warn(TAG, 'policy %s is currently not supported ' +
            'and will be ignored', keys[i]);
          delete config['policy'][keys[i]];
        }
      }
    }

    return config;
  }

  /**
   * Read the inline config from publisher
   * @return {?JsonObject}
   */
  getInlineConfig_() {
    // All consent config within the amp-consent component. There will be only
    // one single amp-consent allowed in page.
    try {
      return getChildJsonConfig(this.element_);
    } catch (e) {
      throw user(this.element_).createError('%s: %s', TAG, e);
    }
  }

  /**
   * Read and format the CMP config
   * The returned CMP config should looks like
   * {
   *  "consentInstanceId": "foo",
   *  "checkConsentHref": "https://fake.com",
   *  "promptUISrc": "https://fake.com/promptUI.html",
   *  "uiConfig": {
   *    "overlay": true
   *   }
   * }
   * @return {?JsonObject}
   */
  getCMPConfig_() {
    if (!isExperimentOn(this.win_, 'amp-consent-v2')) {
      return null;
    }

    const type = this.element_.getAttribute('type');
    if (!type) {
      return null;
    }
    userAssert(CMP_CONFIG[type], '%s: invalid CMP type %s', TAG, type);
    const importConfig = CMP_CONFIG[type];
    this.validateCMPConfig_(importConfig);
    return importConfig;
  }

  /**
   * Check if the CMP config is valid
   * @param {!JsonObject} config
   */
  validateCMPConfig_(config) {
    const assertValues =
        ['consentInstanceId', 'checkConsentHref', 'promptUISrc'];
    for (let i = 0; i < assertValues.length; i++) {
      const attribute = assertValues[i];
      devAssert(config[attribute], 'CMP config must specify %s', attribute);
    }
  }
}

/**
 * Expand the passed in policyConfig and generate predefined policy entires
 * @param {!JsonObject} policyConfig
 * @param {string} consentId
 * @return {!JsonObject}
 */
export function expandPolicyConfig(policyConfig, consentId) {
  // Generate default policy
  const defaultWaitForItems = {};

  defaultWaitForItems[consentId] = undefined;

  const defaultPolicy = {
    'waitFor': defaultWaitForItems,
  };

  // TODO(@zhouyx): unblockOn is internal now.
  const unblockOnAll = [
    CONSENT_POLICY_STATE.UNKNOWN,
    CONSENT_POLICY_STATE.SUFFICIENT,
    CONSENT_POLICY_STATE.INSUFFICIENT,
    CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
  ];

  const predefinedNone = {
    'waitFor': defaultWaitForItems,
    // Experimental config, do not expose
    'unblockOn': unblockOnAll,
  };

  const rejectAllOnZero = {
    'waitFor': defaultWaitForItems,
    'timeout': {
      'seconds': 0,
      'fallbackAction': 'reject',
    },
    'unblockOn': unblockOnAll,
  };

  policyConfig['_till_responded'] = predefinedNone;

  policyConfig['_till_accepted'] = defaultPolicy;

  policyConfig['_auto_reject'] = rejectAllOnZero;

  if (policyConfig && policyConfig['default']) {
    return policyConfig;
  }

  policyConfig['default'] = defaultPolicy;

  return policyConfig;
}
