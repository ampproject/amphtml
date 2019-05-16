/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {hasOwn} from '../src/utils/object';
import {loadScript, validateData, writeScript} from '../3p/3p';
import {parseJson} from '../src/json';

const mandatoryParams = [],
  optionalParams = [
    'ad_mode',
    'placement',
    'tracking_id',
    'ad_type',
    'marketplace',
    'region',
    'title',
    'default_search_phrase',
    'default_category',
    'linkid',
    'search_bar',
    'search_bar_position',
    'rows',
    'design',
    'asins',
    'debug',
    'aax_src_id',
    'header_style',
    'link_style',
    'link_hover_style',
    'text_style',
    'random_permute',
    'render_full_page',
    'axf_exp_name',
    'axf_treatment',
    'disable_borders',
    'attributes',
    'carousel',
    'feedback_enable',
    'max_ads_in_a_row',
    'list_price',
    'prime',
    'prime_position',
    'widget_padding',
    'strike_text_style',
    'brand_text_link',
    'brand_position',
    'large_rating',
    'rating_position',
    'max_title_height',
    'enable_swipe_on_mobile',
    'overrides',
    'ead',
    'force_win_bid',
    'fallback_mode',
    'url',
    'regionurl',
    'divid',
    'recomtype',
    'adinstanceid',
  ];
const prefix = 'amzn_assoc_';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function a9(global, data) {
  let i;
  for (i = 0; i < 46; i++) {
    optionalParams[i] = prefix + optionalParams[i];
  }

  validateData(data, mandatoryParams, optionalParams);

  const publisherUrl = global.context.canonicalUrl || global.context.sourceUrl;

  if (data.amzn_assoc_ad_mode) {
    if (data.amzn_assoc_ad_mode === 'auto') {
      if (data.adinstanceid && data.adinstanceid !== '') {
        loadRecTag(global, data, publisherUrl);
      } else {
        loadSearTag(global, data, publisherUrl);
      }
    } else if (
      data.amzn_assoc_ad_mode === 'search' ||
      data.amzn_assoc_ad_mode === 'manual'
    ) {
      loadSearTag(global, data, publisherUrl);
    }
  } else {
    loadSearTag(global, data, publisherUrl);
  }
}

/**
 * @param {!Object} data
 */
function getURL(data) {
  let url = 'https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US';
  if (data.regionurl && data.regionurl !== '') {
    url = data.regionurl;
  }

  return url;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @param {string} publisherUrl
 */
function loadRecTag(global, data, publisherUrl) {
  let url = getURL(data);
  url += '&adInstanceId=' + data['adinstanceid'];
  global['amzn_assoc_URL'] = publisherUrl;

  if (data['recomtype'] === 'sync') {
    writeScript(global, url);
  } else if (data['recomtype'] === 'async') {
    const d = global.document.createElement('div');
    d.setAttribute('id', data['divid']);
    global.document.getElementById('c').appendChild(d);
    loadScript(global, url);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @param {string} publisherUrl
 */
function loadSearTag(global, data, publisherUrl) {
  /**
   * Sets macro type.
   * @param {string} type
   */
  function setMacro(type) {
    if (!type) {
      return;
    }

    if (hasOwn(data, type)) {
      global[type] = data[type];
    }
  }

  /**
   * Sets the params.
   */
  function setParams() {
    const url = getURL(data);
    let i;

    for (i = 0; i < 44; i++) {
      setMacro(optionalParams[i]);
    }

    if (data.amzn_assoc_fallback_mode) {
      const str = data.amzn_assoc_fallback_mode.split(',');
      let types = str[0].split(':');
      let typev = str[1].split(':');
      types = parseJson(types[1]);
      typev = parseJson(typev[1]);
      global['amzn_assoc_fallback_mode'] = {
        'type': types,
        'value': typev,
      };
    }
    if (data.amzn_assoc_url) {
      global['amzn_assoc_URL'] = data['amzn_assoc_url'];
    } else {
      global['amzn_assoc_URL'] = publisherUrl;
    }

    writeScript(global, url);
  }

  /**
   * Initializer.
   */
  function init() {
    setParams();
  }

  init();
}
