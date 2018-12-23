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
import {deepMerge, dict} from '../../../src/utils/object';
import {devAssert, user, userAssert} from '../../../src/log';
import {getChildJsonConfig} from '../../../src/json';
import {isExperimentOn} from '../../../src/experiments';
import {toWin} from '../../../src/types';

const TAG = 'amp-consent/consent-config';

export class ConsentConfig {

  /** @param {!Element} element */
  constructor(element) {
    /** @private {!Element} */
    this.element_ = element;

    /** @private {!Window} */
    this.win_ = toWin(element.ownerDocument.defaultView);

    /** @private {boolean} */
    this.isMultiSupported_ = isExperimentOn(this.win_, 'multi-consent');

    /** @private {?JsonObject} */
    this.config_ = null;
  }

  /**
   * Return the consents config
   * @return {!JsonObject}
   */
  getConsentConfig() {
    return this.getConfig_()['consents'];
  }

  /**
   * Return the policy config
   * @return {!JsonObject}
   */
  getPolicyConfig() {
    return this.getConfig_()['policy'] || dict({});
  }

  /**
   * Return the postPromptUI config
   * @return {string|undefined}
   */
  getPostPromptUI() {
    return this.getConfig_()['postPromptUI'];
  }

  /**
   * Read validate and return the config
   * @return {!JsonObject}
   */
  getConfig_() {
    if (!this.config_) {
      this.config_ = this.validateAndParseConfig_();
    }
    return this.config_;
  }


  /**
   * Read and parse consent config
   * An example valid config json looks like
   * {
   *   "consents": {
   *     "consentABC": {
   *       "checkConsentHref": "https://fake.com"
   *     }
   *   }
   * }
   * @return {!JsonObject}
   */
  validateAndParseConfig_() {
    const inlineConfig = this.getInlineConfig_();

    const cmpConfig = this.getCMPConfig_();

    const config = /** @type {!JsonObject} */
        (deepMerge(cmpConfig || {}, inlineConfig || {}, 1));

    const consents = config['consents'];
    userAssert(consents, '%s: consents config is required', TAG);
    userAssert(Object.keys(consents).length != 0,
        '%s: can\'t find consent instance', TAG);
    if (!this.isMultiSupported_) {
      // Assert single consent instance
      userAssert(Object.keys(consents).length <= 1,
          '%s: only single consent instance is supported', TAG);
      if (config['policy']) {
        // Only respect 'default' consent policy;
        const keys = Object.keys(config['policy']);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] != 'default') {
            user().warn(TAG, 'policy %s is currently not supported ' +
              'and will be ignored', keys[i]);
            delete config['policy'][keys[i]];
          }
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
   *   "consents": {
   *     "foo": {
   *       "checkConsentHref": "https://fake.com",
   *       "promptUISrc": "https://fake.com/promptUI.html"
   *     }
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
    const constentInstance = importConfig['consentInstanceId'];

    const cmpConfig = dict({
      'consents': dict({}),
    });

    const config = Object.assign({}, importConfig);
    delete config['consentInstanceId'];

    cmpConfig['consents'][constentInstance] = config;
    return cmpConfig;
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
 * @param {!JsonObject} consentConfig
 * @return {!JsonObject}
 */
export function expandPolicyConfig(policyConfig, consentConfig) {
  // Generate default policy
  const instanceKeys = Object.keys(consentConfig);
  const defaultWaitForItems = {};
  for (let i = 0; i < instanceKeys.length; i++) {
    // TODO: Need to support an array.
    defaultWaitForItems[instanceKeys[i]] = undefined;
  }
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
