import {CommonSignals} from '../../../src/common-signals';
import {buildUrl} from '../../../ads/google/a4a/shared/url-builder';
import {insertAnalyticsElement} from '../../../src/extension-analytics';

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const ANALYTICS_URL = 'https://v2.denakop.com/api.php?';
const API_URL = 'https://v2.denakop.com/api.js';
import {hasOwn} from './../../../src/utils/object';

/**
 * @param {JsonObject} obj
 * @param {JsonObject} src
 *
 * @return {JsonObject}
 */
function extend_(obj, src) {
  for (const key in src) {
    if (hasOwn(src, key)) {
      obj[key] = src[key];
    }
  }
  return obj;
}

/**
 * Determines if the element is valid.
 * @param {Element} el
 *
 * @return {boolean}
 */
export function denakopElementIsValid(el) {
  const tagId = el.getAttribute('data-tag-id');
  const publisherId = el.getAttribute('data-publisher-id');

  return !((tagId === null || tagId === '') ||
    (publisherId === null || publisherId === ''));
}

/**
 * @param {JsonObject} params
 *
 * @return {string}
 */
export function getConfigUrl(params) {
  return buildUrl(API_URL, params, 4096);
}

/**
 * @return {number}
 */
export function rand() {
  return Math.floor(Math.random() * 9999999999) + 1000000000;
}

/**
 * @param {!Element} ampAd
 * @param {JsonObject} adAnalyticsAuthorizedConfig
 * @param {JsonObject} adAnalyticsViewConfig
 */
export function analyticAd(ampAd, adAnalyticsAuthorizedConfig,
  adAnalyticsViewConfig) {
  insertAnalyticsElement(ampAd, adAnalyticsAuthorizedConfig, false);

  /**
   * Wait for the ad render
   */
  const signals = ampAd.signals();
  Promise.race([
    signals.whenSignal(CommonSignals.RENDER_START),
    signals.whenSignal(CommonSignals.LOAD_END),
  ]).then(() => {
    insertAnalyticsElement(ampAd, adAnalyticsViewConfig, false);
  });
}

/**
 * @param {JsonObject} attributes
 *
 * @return {JsonObject}
 */
export function getStickyAdAttributes(attributes = /** @type {JsonObject} */ {}) {
  return extend_(/** @type {JsonObject} */{'layout': 'nodisplay'}, attributes);
}

/**
 * @param {JsonObject} adUnit
 *
 * @return {JsonObject}
 */
export function getAdAttributes(adUnit) {
  /**
   * Ad unit sizes ordered by sizes
   */
  const wH = adUnit['adUnitSizes'].map(function(v) {
    return v.join('x');
  }).sort(function(a, b) {
    return b - a;
  });

  const widthHeightH = wH[0].split('x');

  const obj = {
    'width': widthHeightH[0],
    'height': widthHeightH[1],
    'layout': 'fixed',
    'type': 'doubleclick',
    'data-slot': adUnit['adUnitCode'],
    'data-multi-size': wH.join(','),
    'data-multi-size-validation': 'false',
    // eslint-disable-next-line max-len
    'rtc-config': '{"vendors": {"prebidappnexus": {"PLACEMENT_ID": "15348791"}}}',
  };

  if (obj['reload']) {
    obj['data-enable-refresh'] = '45';
  }

  return /** @type {JsonObject} */ obj;
}

/**
 * @param {string|number} publisherId
 * @param {string|number} tagId
 * @param {JsonObject} config
 * @param {JsonObject} adUnit
 *
 * @return {JsonObject}
 */
export function getExtraUrlParams(publisherId, tagId, config, adUnit) {
  const wS = (window.screen.width || 0) + 'x' + (window.screen.height || 0);

  return {
    'pid': publisherId,
    'device': config['user']['device'],
    'os': config['user']['operationalSystem'],
    'browser': config['user']['browser'],
    'tag': tagId,
    'dkUser': config['user']['dkUser'],
    'uxid': config['user']['uxid'],
    'windowSize': wS,
    'path': config['user']['url']['path'],
    'host': config['user']['url']['host'],
    'scheme': config['user']['url']['scheme'],
    'country': config['user']['location']['country'],
    'city': config['user']['location']['city'],
    'state': config['user']['location']['stateprov'],
    'isp': config['user']['location']['isp_name'],
    'tz': Date.now(),
    'format': adUnit['format'],
    'cid': adUnit['cid'],
    'cpm': adUnit['cpm'],
    'aid': adUnit['aid'],
    'f': adUnit['f'].join(','),
  };
}

/**
 * @param {JsonObject} extraUrlParams
 *
 * @return {JsonObject}
 */
export function getAmpAdAnalyticsAuthorizedConfig(extraUrlParams) {
  return {
    'requests': {
      'denakop': ANALYTICS_URL,
    },
    'transport': {
      'xhrpost': false,
    },
    'triggers': {
      'adRequestStart': {
        'on': 'ad-request-start',
        'request': 'denakop',
        'selector': 'amp-ad',
        'selectionMethod': 'closest',
        'extraUrlParams': {
          'action': 'authorized',
        },
      },
    },
    'extraUrlParams': extraUrlParams,
  };
}

/**
 * @param {JsonObject} extraUrlParams
 *
 * @return {JsonObject}
 */
export function getAmpAdAnalyticsViewConfig(extraUrlParams) {
  return {
    'requests': {
      'denakop': ANALYTICS_URL,
    },
    'transport': {
      'beacon': false,
      'xhrpost': false,
    },
    'triggers': {
      'continuousVisible': {
        'on': 'visible',
        'visibilitySpec': {
          'selector': 'amp-ad',
          'selectionMethod': 'closest',
          'visiblePercentageMin': 50,
          'continuousTimeMin': 1000,
        },
        'extraUrlParams': {
          'action': 'view',
          'firstLoad': 'true',
        },
        'request': 'denakop',
      },
      'adRefresh': {
        'on': 'ad-refresh',
        'visibilitySpec': {
          'selector': 'amp-ad',
          'selectionMethod': 'closest',
          'visiblePercentageMin': 50,
          'continuousTimeMin': 1000,
        },
        'extraUrlParams': {
          'action': 'view',
          'firstLoad': 'false',
        },
        'request': 'denakop',
      },
    },
    'extraUrlParams': extraUrlParams,
  };
}
