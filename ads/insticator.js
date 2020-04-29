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

import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function insticator(global, data) {
  // validate passed data attributes
  validateData(data, ['siteId', 'embedId']);

  // create insticator markup
  global.document
    .getElementById('c')
    .appendChild(createTemplate(data['embedId']));

  // create ads and embed
  createAdsAndEmbed(data['siteId'], data['embedId']);
}

/**
 * Create HTML template to be populated later
 * @param {string} embedId The Unique Identifier of this particular Embed
 * @return {Element} HTML template
 */
function createTemplate(embedId) {
  const template = document.createElement('template');
  template./*OK*/ innerHTML = `
    <div id="insticator-container">
      <div id="div-insticator-ad-1"></div>
      <div id="insticator-embed" embed-id="${embedId}"></div>
      <div id="div-insticator-ad-2"></div>
    </div>
  `;
  return template.content;
}

/**
 * Generates Ads and Embed
 * @param {string} siteId Used to grab the ads file
 * @param {string} embedId Used to grab the unique embed requested
 */
function createAdsAndEmbed(siteId, embedId) {
  // helper vars
  const a = window;
  const c = document;
  const s = 'script';
  const u = `//d3lcz8vpax4lo2.cloudfront.net/ads-code/${siteId}.js`; // vars from preconnect urls and data attributes on amp-embed tag

  // create insticator object on the window
  'Insticator' in a ||
    (a.Insticator = {
      ad: {
        loadAd: function (b) {
          a.Insticator.ad.q.push(b);
        },
        q: [],
      },
      helper: {},
      embed: {},
      version: '4.0',
      q: [],
      amp: null, // this will get set to window.context which is the AMP API so we can access from our ads code
      load: function (t, o) {
        a.Insticator.amp = window.context; // set the Insticator object property amp to window.context which is the AMP API so we can access from our ads code
        a.Insticator.q.push({t, o});
      },
    });

  // load ads code
  const b = c.createElement(s);
  b.src = u;
  b.async = !0;
  const d = c.getElementsByTagName(s)[0];
  d.parentNode.insertBefore(b, d);

  // execute functions of insticator object on the window (load ads and embed)
  a.Insticator.ad.loadAd('div-insticator-ad-1');
  a.Insticator.ad.loadAd('div-insticator-ad-2');
  a.Insticator.load('em', {id: embedId});

  // now tell AMP runtime to start rendering ads
  window.context.renderStart();
}
