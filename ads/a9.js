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
      'regionurl', 'amzn_assoc_ad_mode', 'divid', 'recomtype',
      'amzn_assoc_placement', 'amzn_assoc_tracking_id', 'amzn_assoc_ad_type',
      'amzn_assoc_marketplace', 'amzn_assoc_region','amzn_assoc_title',
      'amzn_assoc_default_search_phrase', 'amzn_assoc_default_category',
      'amzn_assoc_linkid', 'amzn_assoc_search_bar',
      'amzn_assoc_search_bar_position', 'amzn_assoc_rows',
      'amzn_assoc_design', 'amzn_assoc_asins', 'adinstanceid',
      'amzn_assoc_debug', 'amzn_assoc_aax_src_id', 'amzn_assoc_header_style',
      'amzn_assoc_link_style', 'amzn_assoc_link_hover_style',
      'amzn_assoc_text_style', 'amzn_assoc_random_permute',
      'amzn_assoc_render_full_page', 'amzn_assoc_fallback_mode',
      'amzn_assoc_url', 'amzn_assoc_axf_exp_name',
      'amzn_assoc_axf_treatment',
      'amzn_assoc_disable_borders', 'amzn_assoc_attributes',
      'amzn_assoc_carousel', 'amzn_assoc_feedback_enable',
      'amzn_assoc_max_ads_in_a_row', 'amzn_assoc_list_price',
      'amzn_assoc_prime',
      'amzn_assoc_prime_position', 'amzn_assoc_widget_padding',
      'amzn_assoc_strike_text_style', 'amzn_assoc_brand_text_link',
      'amzn_assoc_brand_position', 'amzn_assoc_large_rating',
      'amzn_assoc_rating_position', 'amzn_assoc_max_title_height',
      'amzn_assoc_enable_swipe_on_mobile', 'amzn_assoc_overrides',
      'amzn_assoc_ead', 'amzn_assoc_force_win_bid',
    ];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function a9(global, data) {
  validateData(data, mandatoryParams, optionalParams);

  if (data.amzn_assoc_ad_mode) {
    if (data.amzn_assoc_ad_mode === 'auto') {
      if (data.adinstanceid &&
      (data.adinstanceid !== '')) {
        loadRecTag(global, data);
      }
      else {
        loadSearTag(global, data);
      }
    }
    else if ((data.amzn_assoc_ad_mode === 'search')
    || (data.amzn_assoc_ad_mode === 'manual')) {
      loadSearTag(global, data);
    }
  }
  else {
    loadSearTag(global, data);
  }
}

/**
 * @param {!Object} data
 */
function getURL(data) {
  let url = 'https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US';
  if (data.regionurl && (data.regionurl !== '')) {
    url = data.regionurl;
  }

  return url;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function loadRecTag(global, data) {
  let url = getURL(data);
  url += '&adInstanceId=' + data['adinstanceid'];
  if (data['recomtype'] === 'sync') {
    writeScript(global, url);
  }
  else if (data['recomtype'] === 'async') {
    const d = global.document.createElement('div');
    d.setAttribute('id', data['divid']);
    global.document.getElementById('c').appendChild(d);
    loadScript(global, url);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function loadSearTag(global, data) {
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

    setMacro('amzn_assoc_ad_mode');
    setMacro('amzn_assoc_placement');
    setMacro('amzn_assoc_tracking_id');
    setMacro('amzn_assoc_ad_type');
    setMacro('amzn_assoc_marketplace');
    setMacro('amzn_assoc_region');
    setMacro('amzn_assoc_title');
    setMacro('amzn_assoc_default_search_phrase');
    setMacro('amzn_assoc_default_category');
    setMacro('amzn_assoc_linkid');
    setMacro('amzn_assoc_search_bar');
    setMacro('amzn_assoc_search_bar_position');
    setMacro('amzn_assoc_rows');
    setMacro('amzn_assoc_design');
    setMacro('amzn_assoc_asins');
    setMacro('amzn_assoc_aax_src_id');
    setMacro('amzn_assoc_header_style');
    setMacro('amzn_assoc_link_style');
    setMacro('amzn_assoc_link_hover_style');
    setMacro('amzn_assoc_text_style');
    setMacro('amzn_assoc_random_permute');
    setMacro('amzn_assoc_render_full_page');
    setMacro('amzn_assoc_axf_exp_name');
    setMacro('amzn_assoc_axf_treatment');
    setMacro('amzn_assoc_disable_borders');
    setMacro('amzn_assoc_attributes');
    setMacro('amzn_assoc_carousel');
    setMacro('amzn_assoc_feedback_enable');
    setMacro('amzn_assoc_max_ads_in_a_row');
    setMacro('amzn_assoc_list_price');
    setMacro('amzn_assoc_prime');
    setMacro('amzn_assoc_prime_position');
    setMacro('amzn_assoc_widget_padding');
    setMacro('amzn_assoc_strike_text_style');
    setMacro('amzn_assoc_brand_text_link');
    setMacro('amzn_assoc_brand_position');
    setMacro('amzn_assoc_large_rating');
    setMacro('amzn_assoc_rating_position');
    setMacro('amzn_assoc_max_title_height');
    setMacro('amzn_assoc_enable_swipe_on_mobile');
    setMacro('amzn_assoc_overrides');
    setMacro('amzn_assoc_ead');
    setMacro('amzn_assoc_force_win_bid');

    if (data.amzn_assoc_fallback_mode) {
      const str = (data.amzn_assoc_fallback_mode).split(',');
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
