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
 * The config of each ad network.
 * Please keep the list alphabetic order.
 *
 * yourNetworkName: {  // This is the "type" attribute of <amp-ad>
 *
<<<<<<< HEAD
 *   // List of URLs for prefetch
 *   prefetch: string|array
 *
 *   // List of hosts for preconnect
 *   preconnect: string|array
=======
 * @const {!Object<string, (string|!Array<string>)>}
 */
export const adPrefetch = {
  // Keep the list in alphabetic order
  a9: 'https://c.amazon-adsystem.com/aax2/assoc.js',
  //adagio: 'https://js-ssl.neodatagroup.com/adagio_amp.js',
  adblade: 'https://web.adblade.com/js/ads/async/show.js',
  adgeneration: 'https://i.socdm.com/sdk/js/adg-script-loader.js',
  // TODO: Remove this once we switch over to the direct request version of adsense.js.
  adsense: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  adsnative: 'https://static.adsnative.com/static/js/render.v1.js',
  adstir: 'https://js.ad-stir.com/js/adstir_async.js',
  adtech: 'http://s.aolcdn.com/os/ads/adsWrapper3.js',
  aduptech: 'https://s.d.adup-tech.com/jsapi',
  amoad: [
    'https://j.amoad.com/js/a.js',
    'https://j.amoad.com/js/n.js',
  ],
  appnexus: 'https://acdn.adnxs.com/ast/ast.js',
  caprofitx: [
    'https://cdn.caprofitx.com/pfx.min.js',
    'https://cdn.caprofitx.com/tags/amp/profitx_amp.js',
  ],
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
  adagio: [
    'https://js-ssl.neodatagroup.com',
    'https://ad-aws-it.neodatagroup.com',
    'https://tracker.neodatagroup.com'
  ],
  adblade: [
    'https://staticd.cdn.adblade.com',
    'https://static.adblade.com',
  ],
  adform: 'https://track.adform.net',
  adition: 'https://imagesrv.adition.com',
  adreactor: 'https://adserver.adreactor.com',
  adsense: 'https://googleads.g.doubleclick.net',
  adsnative: 'https://api.adsnative.com',
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
  caprofitx: 'https://ad.caprofitx.adtdp.com',
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
  neo4w: 'https://js-ssl.neodatagroup.com',
  neo4wPPN: 'https://js-ssl.neodatagroup.com',
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
 *   clientIdScope: string
 *
 *   // Whether render-start API has been implemented
 *   // We highly recommend all networks to implement the API,
 *   // see details in the README.md
 *   renderStartImplemented: boolean
 * }
 */
export const adConfig = {
  _ping_: {
    renderStartImplemented: true,
  },

  a9: {
    prefetch: 'https://c.amazon-adsystem.com/aax2/assoc.js',
  },

  accesstrade: {
    prefetch: 'https://h.accesstrade.net/js/amp/amp.js',
  },

  adblade: {
    prefetch: 'https://web.adblade.com/js/ads/async/show.js',
    preconnect: [
      'https://staticd.cdn.adblade.com',
      'https://static.adblade.com',
    ],
  },

  adform: {},

  adgeneration: {
    prefetch: 'https://i.socdm.com/sdk/js/adg-script-loader.js',
  },

  adition: {},

  adman: {},

  adreactor: {},

  adsense: {
    prefetch: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    preconnect: 'https://googleads.g.doubleclick.net',
    clientIdScope: 'AMP_ECID_GOOGLE',
  },

  adsnative: {
    prefetch: 'https://static.adsnative.com/static/js/render.v1.js',
    preconnect: 'https://api.adsnative.com',
  },

  adspirit: {},

  adstir: {
    prefetch: 'https://js.ad-stir.com/js/adstir_async.js',
    preconnect: 'https://ad.ad-stir.com',
  },

  adtech: {
    prefetch: 'https://s.aolcdn.com/os/ads/adsWrapper3.js',
    preconnect: [
      'https://mads.at.atwola.com',
      'https://aka-cdn.adtechus.com',
    ],
  },

  aduptech: {
    prefetch: 'https://s.d.adup-tech.com/jsapi',
  },

  amoad: {
    prefetch: [
      'https://j.amoad.com/js/a.js',
      'https://j.amoad.com/js/n.js',
    ],
    preconnect: [
      'https://d.amoad.com',
      'https://i.amoad.com',
      'https://m.amoad.com',
      'https://v.amoad.com',
    ],
  },

  appnexus: {
    prefetch: 'https://acdn.adnxs.com/ast/ast.js',
    preconnect: 'https://ib.adnxs.com',
  },

  atomx: {
    prefetch: 'https://s.ato.mx/p.js',
  },

  caprofitx: {
    prefetch: [
      'https://cdn.caprofitx.com/pfx.min.js',
      'https://cdn.caprofitx.com/tags/amp/profitx_amp.js',
    ],
    preconnect: 'https://ad.caprofitx.adtdp.com',
  },

  chargeads: {},

  colombia: {
    prefetch: 'https://static.clmbtech.com/ad/commons/js/colombia-amp.js',
  },

  contentad: {},

  criteo: {
    prefetch: 'https://static.criteo.net/js/ld/publishertag.js',
    preconnect: 'https://cas.criteo.com',
  },

  dotandads: {
    prefetch: 'https://amp.ad.dotandad.com/dotandadsAmp.js',
    preconnect: 'https://bal.ad.dotandad.com',
  },

  doubleclick: {
    prefetch: [
      'https://www.googletagservices.com/tag/js/gpt.js',
      'https://securepubads.g.doubleclick.net/static/glade.js',
    ],
    preconnect: [
      'https://partner.googleadservices.com',
      'https://tpc.googlesyndication.com',
    ],
    clientIdScope: 'AMP_ECID_GOOGLE',
    renderStartImplemented: true,
  },

  eplanning: {
    prefetch: 'https://us.img.e-planning.net/layers/epl-amp.js',
  },

  ezoic: {
    prefetch: [
      'https://www.googletagservices.com/tag/js/gpt.js',
      'https://g.ezoic.net/ezoic/ampad.js',
    ],
  },

  flite: {},

  genieessp: {
    prefetch: 'https://js.gsspcln.jp/l/amp.js',
  },

  gmossp: {
    prefetch: 'https://cdn.gmossp-sp.jp/ads/amp.js',
  },

  imobile: {
    prefetch: 'https://spamp.i-mobile.co.jp/script/amp.js',
    preconnect: 'https://spad.i-mobile.co.jp',
  },

  improvedigital: {},

  industrybrains: {
    prefetch: 'https://web.industrybrains.com/js/ads/async/show.js',
    preconnect: [
      'https://staticd.cdn.industrybrains.com',
      'https://static.industrybrains.com',
    ],
  },

  inmobi: {
    prefetch: 'https://cf.cdn.inmobi.com/ad/inmobi.secure.js',
    renderStartImplemented: true,
  },

  kargo: {},

  mads: {
    prefetch: 'https://eu2.madsone.com/js/tags.js',
  },

  'mantis-display': {
    prefetch: 'https://assets.mantisadnetwork.com/mantodea.min.js',
    preconnect: [
      'https://mantodea.mantisadnetwork.com',
      'https://res.cloudinary.com',
      'https://resize.mantisadnetwork.com',
    ],
  },

  'mantis-recommend': {
    prefetch: 'https://assets.mantisadnetwork.com/recommend.min.js',
    preconnect: [
      'https://mantodea.mantisadnetwork.com',
      'https://resize.mantisadnetwork.com',
    ],
  },

  mediaimpact: {
    prefetch: 'https://ec-ns.sascdn.com/diff/251/divscripte/amp.js',
  },

  meg: {
    renderStartImplemented: true,
  },

  microad: {
    prefetch: 'https://j.microad.net/js/camp.js',
    preconnect: [
      'https://s-rtb.send.microad.jp',
      'https://s-rtb.send.microadinc.com',
      'https://cache.send.microad.jp',
      'https://cache.send.microadinc.com',
      'https://deb.send.microad.jp',
    ],
  },

  nativo: {
    prefetch: 'https://s.ntv.io/serve/load.js',
  },

  nend: {
    prefetch: 'https://js1.nend.net/js/amp.js',
    preconnect: [
      'https://output.nend.net',
      'https://img1.nend.net',
    ],
  },

  openadstream: {},

  openx: {
    prefetch: 'https://www.googletagservices.com/tag/js/gpt.js',
    preconnect: [
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
  },

  plista: {},

  pubmatic: {
    prefetch: 'https://ads.pubmatic.com/AdServer/js/amp.js',
  },

  pubmine: {
    prefetch: 'https://s.pubmine.com/showad.js',
  },

  pulsepoint: {
    prefetch: 'https://ads.contextweb.com/TagPublish/getjs.static.js',
    preconnect: 'https://tag.contextweb.com',
  },

  revcontent: {
    prefetch: 'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js',
    preconnect: [
      'https://trends.revcontent.com',
      'https://cdn.revcontent.com',
      'https://img.revcontent.com',
    ],
  },

  rubicon: {},

  sharethrough: {},

  smartadserver: {
    prefetch: 'https://ec-ns.sascdn.com/diff/js/amp.v0.js',
    preconnect: 'https://static.sascdn.com',
    renderStartImplemented: true,
  },

  sortable: {
    prefetch: 'https://www.googletagservices.com/tag/js/gpt.js',
    preconnect: [
      'https://tags-cdn.deployads.com',
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
  },

  sovrn: {
    prefetch: 'https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js',
  },

  taboola: {},

  teads: {
    prefetch: 'https://cdn.teads.tv/media/format/v3/teads-format.min.js',
    preconnect: [
      'https://cdn2.teads.tv',
      'https://a.teads.tv',
      'https://t.teads.tv',
    ],
  },

  triplelift: {},

  webediads: {},

  'weborama-display': {
    prefetch: [
      'https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js',
      'https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js',
    ],
  },

  widespace: {},

  yahoojp: {
    prefetch: [
      'https://s.yimg.jp/images/listing/tool/yads/ydn/amp/amp.js',
      'https://yads.c.yimg.jp/js/yads.js',
    ],
    preconnect: 'https://yads.yahoo.co.jp',
  },

  yieldbot: {
    prefetch: [
      'https://cdn.yldbt.com/js/yieldbot.intent.amp.js',
      'https://msg.yldbt.com/js/ybmsg.html',
    ],
    preconnect: 'https://i.yldbt.com',
  },

  yieldmo: {
    prefetch: 'https://static.yieldmo.com/ym.amp1.js',
    preconnect: [
      'https://s.yieldmo.com',
      'https://ads.yieldmo.com',
    ],
  },

  yieldone: {
    prefetch: 'https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js',
  },

  zergnet: {},
};
