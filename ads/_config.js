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
  // Keep the list in alphabetic order
  a9: 'https://c.amazon-adsystem.com/aax2/assoc.js',
  adblade: 'https://web.adblade.com/js/ads/async/show.js',
  adgeneration: 'https://i.socdm.com/sdk/js/adg-script-loader.js',
  // TODO: Remove this once we switch over to the direct request version of adsense.js.
  adsense: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  adstir: 'https://js.ad-stir.com/js/adstir_async.js',
  adtech: 'http://s.aolcdn.com/os/ads/adsWrapper3.js',
  aduptech: 'https://s.d.adup-tech.com/jsapi',
  amoad: 'https://j.amoad.com/js/a.js',
  appnexus: 'https://acdn.adnxs.com/ast/ast.js',
  colombia: 'https://static.clmbtech.com/ad/commons/js/colombia-amp.js',
  criteo: 'https://static.criteo.net/js/ld/publishertag.js',
  dotandads: 'https://amp.ad.dotandad.com/dotandadsAmp.js',
  doubleclick: [
    'https://www.googletagservices.com/tag/js/gpt.js',
    'https://securepubads.g.doubleclick.net/static/glade.js',
  ],
  eplanning: 'https://us.img.e-planning.net/layers/epl-amp.js',
  ezoic: [
    'https://www.googletagservices.com/tag/js/gpt.js',
    'https://g.ezoic.net/ezoic/ampad.js',
  ],
  genieessp: 'https://js.gsspcln.jp/l/amp.js',
  gmossp: 'https://cdn.gmossp-sp.jp/ads/amp.js',
  imobile: 'https://spamp.i-mobile.co.jp/script/amp.js',
  industrybrains: 'https://web.industrybrains.com/js/ads/async/show.js',
  mads: 'https://eu2.madsone.com/js/tags.js',
  'mantis-display': 'https://assets.mantisadnetwork.com/mantodea.min.js',
  'mantis-recommend': 'https://assets.mantisadnetwork.com/recommend.min.js',
  mediaimpact: 'https://ec-ns.sascdn.com/diff/251/divscripte/amp.js',
  microad: 'https://j.microad.net/js/camp.js',
  nativo: 'https://s.ntv.io/serve/load.js',
  nend: 'https://js1.nend.net/js/amp.js',
  openx: 'https://www.googletagservices.com/tag/js/gpt.js',
  pubmatic: 'https://ads.pubmatic.com/AdServer/js/amp.js',
  pulsepoint: 'https://ads.contextweb.com/TagPublish/getjs.static.js',
  revcontent: 'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js',
  smartadserver: 'https://ec-ns.sascdn.com/diff/js/smart.js',
  sortable: 'https://www.googletagservices.com/tag/js/gpt.js',
  sovrn: 'https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js',
  teads: 'https://cdn.teads.tv/media/format/v3/teads-format.min.js',
  'weborama-display': [
    'https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js',
    'https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js',
  ],
  yahoojp: [
    'https://s.yimg.jp/images/listing/tool/yads/ydn/amp/amp.js',
    'https://yads.c.yimg.jp/js/yads.js',
  ],
  yieldbot: [
    'https://cdn.yldbt.com/js/yieldbot.intent.amp.js',
    'https://msg.yldbt.com/js/ybmsg.html',
  ],
  yieldmo: 'https://static.yieldmo.com/ym.amp1.js',
  yieldone: 'https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js',
};

/**
 * URLs to connect to for a given ad type.
 * No need to add URLs that have same hosts as in the adPrefetch.
 * This MUST be kept in sync with actual implementation.
 *
 * @const {!Object<string, (string|!Array<string>)>}
 */
export const adPreconnect = {
  // Keep the list in alphabetic order
  adblade: [
    'https://staticd.cdn.adblade.com',
    'https://static.adblade.com',
  ],
  adform: 'https://track.adform.net',
  adition: 'https://imagesrv.adition.com',
  adreactor: 'https://adserver.adreactor.com',
  adsense: 'https://googleads.g.doubleclick.net',
  adstir: 'https://ad.ad-stir.com',
  adtech: [
    'https://mads.at.atwola.com',
    'https://aka-cdn.adtechus.com',
  ],
  amoad: [
    'https://d.amoad.com',
    'https://i.amoad.com',
    'https://m.amoad.com',
    'https://v.amoad.com',
  ],
  appnexus: 'https://ib.adnxs.com',
  chargeads: [
    'https://www.chargeplatform.com',
  ],
  criteo: [
    'https://cas.criteo.com',
  ],
  dotandads: 'https://bal.ad.dotandad.com',
  doubleclick: [
    'https://partner.googleadservices.com',
    'https://tpc.googlesyndication.com',
  ],
  imobile: 'https://spad.i-mobile.co.jp',
  improvedigital: 'https://ad.360yield.com/',
  industrybrains: [
    'https://staticd.cdn.industrybrains.com',
    'https://static.industrybrains.com',
  ],
  kargo: [
    'https://storage.cloud.kargo.com',
    'https://pubads.g.doubleclick.net',
    'https://prg.kargo.com',
  ],
  'mantis-display': [
    'https://mantodea.mantisadnetwork.com',
    'https://res.cloudinary.com',
    'https://resize.mantisadnetwork.com',
  ],
  'mantis-recommend': [
    'https://mantodea.mantisadnetwork.com',
    'https://resize.mantisadnetwork.com',
  ],
  microad: [
    'https://s-rtb.send.microad.jp',
    'https://s-rtb.send.microadinc.com',
    'https://cache.send.microad.jp',
    'https://cache.send.microadinc.com',
    'https://deb.send.microad.jp',
  ],
  nend: [
    'https://output.nend.net',
    'https://img1.nend.net',
  ],
  openx: [
    'https://partner.googleadservices.com',
    'https://securepubads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
  ],
  pulsepoint: 'https://tag.contextweb.com',
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
  taboola: [
    'https://cdn.taboola.com',
    'https://trc.taboola.com',
    'https://images.taboola.com',
  ],
  teads: [
    'https://cdn2.teads.tv',
    'https://a.teads.tv',
    'https://t.teads.tv',
  ],
  triplelift: [
    'https://ib.3lift.com',
    'https://dynamic.3lift.com',
    'https://img.3lift.com',
    'https://eb2.3lift.com',
  ],
  webediads: [
    'https://eu1.wbdds.com',
  ],
  widespace: 'https://engine.widespace.com',
  yahoojp: [
    'https://yads.yahoo.co.jp',
  ],
  yieldbot: 'https://i.yldbt.com',
  yieldmo: [
    'https://s.yieldmo.com',
    'https://ads.yieldmo.com',
  ],
  zergnet: [
    'https://www.zergnet.com',
    'https://zergnet.com',
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
