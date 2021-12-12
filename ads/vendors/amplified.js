/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function amplified(global, data) {
  validateData(data, ['amplified_id']);
  observeAmplified(global);

  const adUnitId = data['amplified_id'];
  const params = data['amplified_params'];

  global.adUnitId = adUnitId;
  global.params = JSON.parse(params);
  global.disconnectAmplified = disconnectAmplified;

  setAmplifiedParams(global);
  createAmplifiedContainer(global);
  buildAmplifiedQuery(global);

  writeScript(
    global,
    'https://srv.clickfuse.com/ads/ampsrv.php?' + global.queryString
  );
}

/**
 * Creates the container where the amplified script will inject the creative.
 * @param {!Window} global
 */
function createAmplifiedContainer(global) {
  const container = global.document.getElementById('c');
  const ad = global.document.createElement('div');
  const adUnitId = global.adUnitId || 0;
  ad.setAttribute('id', 'amplified_' + adUnitId);

  container.appendChild(ad);
}

/**
 * Sets the value of global.adParams.
 * @param {!Window} global
 */
function setAmplifiedParams(global) {
  const queryParams = new URLSearchParams(global.context.sourceUrl);
  const adUnitId = global.adUnitId || 0;
  const adParams = {
    id: adUnitId,
    subtag: global.params.subtag ? global.params.subtag : '',
    song: global.params.song ? global.params.song : '',
    artist: global.params.artist ? global.params.artist : '',
    alb: global.params.album ? global.params.album : '',
    'alb_is': global.params.album_is_soundtrack
      ? global.params.album_is_soundtrack
      : false,
    tvt: global.params.tv_term ? global.params.tv_term : '',
    url: global.context.sourceUrl,
    t: Date.now(),
    vpw: null,
    abf: 1,
    'bp_abf': 0,
    position: '',
    ps: 1,
    'if': 1,
    ii: 1,
    mo: false,
  };
  if (queryParams.cf_ad) {
    adParams.d = queryParams.cf_ad;
  }
  global.adParams = adParams;
}

/**
 * Sets the value of global.queryString.
 * @param {!Window} global
 */
function buildAmplifiedQuery(global) {
  global.queryString = new URLSearchParams(global.adParams).toString();
}

/**
 * Enable the amplified utils necessary for creatives.
 * @param {!Window} global
 */
function enableAmplifiedUtils(global) {
  const ampS = global.document.getElementById('amplified-script');
  const s = global.document.createElement('script');
  s.textContent = ampS.textContent;
  global.document.body.append(s);
}

/**
 * Watch for the js utils script to be available.
 * @param {!Window} global
 */
function observeAmplified(global) {
  const ampObserver = new MutationObserver((mutations, observer) => {
    if (!global.amplifiedObserver) {
      global.amplifiedObserver = observer;
    }
    mutations.forEach((mutation) => {
      if (!mutation.addedNodes) {
        return;
      }
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const node = mutation.addedNodes[i];
        if (
          node.id === 'amplified-script' ||
          node.id === 'disconnect-amplified'
        ) {
          if (node.id === 'amplified-script') {
            enableAmplifiedUtils(global);
          }
          observer.disconnect();
          global.amplifiedObserver = null;
        }
      }
    });
  });
  ampObserver.observe(global.document.body, {childList: true, subtree: true});
}

/**
 *
 * @param {!Window} global
 */
function disconnectAmplified(global) {
  const el = document.createElement('div');
  el.id = 'disconnect-amplified';
  global.document.body.append(el);
}
