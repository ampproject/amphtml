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

import {validateData, writeScript} from '../../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function amplified(global, data) {
  validateData(data, ['amplified_id']);

  // const {document} = global;
  const adUnitId = data['amplified_id'];
  const params = data['amplified_params'];

  global.adUnitId = adUnitId;
  global.params = JSON.parse(params);

  const container = global.document.getElementById('c');
  const ad = global.document.createElement('div');

  ad.setAttribute('id', 'amplified_' + adUnitId);

  container.appendChild(ad);

  //writeScript(global, 'https://srv.clickfuse.com/ads/ads.js');

  const adParams = {
    id: adUnitId,
    song: global.params.song ? global.params.song : '',
    artist: global.params.artist ? global.params.artist : '',
    alb: global.params.album ? global.params.album : '',
    alb_is: global.params.album_is_soundtrack
      ? global.params.album_is_soundtrack
      : false,
    tvt: global.params.tv_term ? global.params.tv_term : '',
    url: global.context.sourceUrl,
    t: Date.now(),
  };
  global.adParams = adParams;

  global.queryString = new URLSearchParams(global.adParams).toString();

  writeScript(
    global,
    'http://srv.clickfuse.local/ads/ampsrv.php?' + global.queryString
  );
}

// function runScripts(container) {
//   const cont = document.getElementById(container);
//   const scripts = cont.getElementsByTagName('script');

//   // scripts.forEach((script) => {
//   //   const newScript = document.createElement('script');
//   //   newScript.text = script.innerText;
//   //   document.body.appendChild(newScript);
//   // });
//   for (const script of scripts) {
//     const newScript = document.createElement('script');
//     newScript.text = script.innerText;
//     document.body.appendChild(newScript);
//   }
// }

// function observeMutations() {
//   const container = document.getElementById('c');
//   const config = {childList: true, subtree: true};
//   const callback = function (mutationsList, observer) {
//     console.warn(mutationsList);
//     mutationsList.forEach((mutation) => {
//       runScripts(mutation.target.id);
//     });
//     observer.disconnect();
//   };
//   const observer = new MutationObserver(callback);
//   observer.observe(container, config);
// }
