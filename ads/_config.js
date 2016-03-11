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

/**
 * URLs to prefetch for a given ad type.
 *
 * This MUST be kept in sync with actual implementation.
 *
 * @const {!Object<string, (string|!Array<string>)>}
 */
export const adPrefetch = {
  doubleclick: [
    'https://www.googletagservices.com/tag/js/gpt.js',
    'https://securepubads.g.doubleclick.net/static/glade.js',
  ],
  a9: 'https://c.amazon-adsystem.com/aax2/assoc.js',
  adsense: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  dotandads: 'https://amp.ad.dotandad.com/dotandadsAmp.js',
  mediaimpact: 'https://ec-ns.sascdn.com/diff/251/divscripte/amp.js',
  smartadserver: 'https://ec-ns.sascdn.com/diff/js/smart.js',
  yieldmo: 'https://static.yieldmo.com/ym.amp1.js',
  revcontent: 'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js',
  teads: 'https://cdn.teads.tv/media/format/v3/teads-format.min.js',
};

/**
 * URLs to connect to for a given ad type.
 *
 * This MUST be kept in sync with actual implementation.
 *
 * @const {!Object<string, (string|!Array<string>)>}
 */
export const adPreconnect = {
  adform: 'https://track.adform.net',
  adreactor: 'https://adserver.adreactor.com',
  adsense: 'https://googleads.g.doubleclick.net',
  taboola: [
    'https://cdn.taboola.com',
    'https://trc.taboola.com',
    'https://images.taboola.com',
  ],
  teads: [
    'https://cdn.teads.tv',
    'https://cdn2.teads.tv',
    'https://a.teads.tv',
    'https://t.teads.tv',
  ],
  doubleclick: [
    'https://partner.googleadservices.com',
    'https://securepubads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
  ],
  dotandads: 'https://bal.ad.dotandad.com',
  yieldmo: [
    'https://static.yieldmo.com',
    'https://s.yieldmo.com',
    'https://ads.yieldmo.com',
  ],
  triplelift: [
    'https://ib.3lift.com',
    'https://dynamic.3lift.com',
    'https://img.3lift.com',
    'https://eb2.3lift.com',
  ],
  revcontent: [
    'https://trends.revcontent.com',
    'https://cdn.revcontent.com',
    'https://img.revcontent.com',
  ],
};

/**
 * The externalCidScope used to provide CIDs to ads of the given type.
 *
 * @const {!Object<string, string>}
 */
export const clientIdScope = {
  // Add a mapping like
  // adNetworkType: 'cidScope' here.
  adsense: 'AMP_ECID_GOOGLE',
  doubleclick: 'AMP_ECID_GOOGLE',
};
