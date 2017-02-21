/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  adblade: 'https://web.adblade.com/js/ads/async/show.js',
  adsense: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  aduptech: 'https://s.d.adup-tech.com/jsapi',
  criteo: 'https://static.criteo.net/js/ld/publishertag.js',
  dotandads: 'https://amp.ad.dotandad.com/dotandadsAmp.js',
  industrybrains: 'https://web.industrybrains.com/js/ads/async/show.js',
  mediaimpact: 'https://ec-ns.sascdn.com/diff/251/divscripte/amp.js',
  openx: 'https://www.googletagservices.com/tag/js/gpt.js',
  smartadserver: 'https://ec-ns.sascdn.com/diff/js/smart.js',
  sovrn: 'https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js',
  yieldmo: 'https://static.yieldmo.com/ym.amp1.js',
  revcontent: 'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js',
  teads: 'https://cdn.teads.tv/media/format/v3/teads-format.min.js',
  imobile: 'https://spamp.i-mobile.co.jp/script/amp.js',
  pubmatic: 'https://ads.pubmatic.com/AdServer/js/amp.js',
  sortable: 'https://www.googletagservices.com/tag/js/gpt.js',
  gmossp: 'https://cdn.gmossp-sp.jp/ads/amp.js',
  'weborama-display': [
    'https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js',
    'https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js',
  ],
  yieldbot: 'https://cdn.yldbt.com/js/yieldbot.intent.js',
  adstir: 'https://js.ad-stir.com/js/adstir_async.js',
  colombia: 'https://static.clmbtech.com/ctn/commons/js/colombia-amp.js',
};

/**
 * URLs to connect to for a given ad type.
 *
 * This MUST be kept in sync with actual implementation.
 *
 * @const {!Object<string, (string|!Array<string>)>}
 */
export const adPreconnect = {
  adblade: [
    'https://staticd.cdn.adblade.com',
    'https://static.adblade.com',
  ],
  industrybrains: [
    'https://staticd.cdn.industrybrains.com',
    'https://static.industrybrains.com',
  ],
  adform: 'https://track.adform.net',
  adreactor: 'https://adserver.adreactor.com',
  adsense: 'https://googleads.g.doubleclick.net',
  aduptech: 'https://s.d.adup-tech.com',
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
  criteo: [
    'https://cas.criteo.com',
  ],
  doubleclick: [
    'https://partner.googleadservices.com',
    'https://securepubads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
  ],
  dotandads: 'https://bal.ad.dotandad.com',
  improvedigital: 'https://ad.360yield.com/',
  openx: [
    'https://partner.googleadservices.com',
    'https://securepubads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
  ],
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
  rubicon: [
    'https://ads.rubiconproject.com',
    'https://optimized-by.rubiconproject.com',
  ],
  sortable: [
    'https://tags-cdn.deployads.com',
    'https://partner.googleadservices.com',
    'https://securepubads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
  ],
  imobile: 'https://spad.i-mobile.co.jp',
  webediads: [
    'https://eu1.wbdds.com',
  ],
  gmossp: 'https://cdn.gmossp-sp.jp',
  yieldbot: 'https://i.yldbt.com',
  adstir: 'https://ad.ad-stir.com',
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
