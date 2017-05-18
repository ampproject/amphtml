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
 * @typedef {{
 *   prefetch: (string|undefined),
 *   preconnect: (string|undefined),
 *   renderStartImplemented: (boolean|undefined),
 *   clientIdScope: (string|undefined),
 *   clientIdCookieName: (string|undefined),
 * }}
 */
let AdNetworkConfigDef;

/**
 * The config of each ad network.
 * Please keep the list alphabetic order.
 *
 * yourNetworkName: {  // This is the "type" attribute of <amp-ad>
 *
 *   // List of URLs for prefetch
 *   prefetch: string|array
 *
 *   // List of hosts for preconnect
 *   preconnect: string|array
 *
 *   // The scope used to provide CIDs to ads
 *   clientIdScope: string
 *
 *  // The cookie name to store the CID. In absence, `clientIdScope` is used.
 *   clientIdCookieName: string
 *
 *   // Whether render-start API has been implemented
 *   // We highly recommend all networks to implement the API,
 *   // see details in the README.md
 *   renderStartImplemented: boolean
 * }
 *
 * @const {!Object<string, !AdNetworkConfigDef>}}
 */
export const adConfig = {
  _ping_: {
    renderStartImplemented: true,
  },

  a8: {
    prefetch: 'https://statics.a8.net/amp/ad.js',
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
    renderStartImplemented: true,
  },

  adbutler: {
    prefetch: 'https://servedbyadbutler.com/app.js',
  },

  adform: {},

  adgeneration: {
    prefetch: 'https://i.socdm.com/sdk/js/adg-script-loader.js',
  },

  adhese: {
    renderStartImplemented: true,
  },

  adition: {},

  adman: {},

  admanmedia: {
    renderStartImplemented: true,
  },

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

  adspeed: {
    preconnect: 'https://g.adspeed.net',
    renderStartImplemented: true,
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

  adthrive: {
    prefetch: [
      'https://www.googletagservices.com/tag/js/gpt.js',
    ],
    preconnect: [
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
    renderStartImplemented: true,
  },

  aduptech: {
    prefetch: 'https://s.d.adup-tech.com/jsapi',
    preconnect: [
      'https://d.adup-tech.com',
      'https://m.adup-tech.com',
    ],
    renderStartImplemented: true,
  },

  adverline: {
    prefetch: 'https://ads.adverline.com/richmedias/amp.js',
    preconnect: [
      'https://adnext.fr',
    ],
    renderStartImplemented: true,
  },

  adverticum: {},

  advertserve: {
    renderStartImplemented: true,
  },

  affiliateb: {
    prefetch: 'https://track.affiliate-b.com/amp/a.js',
    renderStartImplemented: true,
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

  brainy: {},

  caajainfeed: {
    prefetch: [
      'https://cdn.amanad.adtdp.com/sdk/ajaamp.js',
    ],
    preconnect: [
      'https://ad.amanad.adtdp.com',
    ],
  },

  capirs: {
    renderStartImplemented: true,
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

  csa: {
    prefetch: 'https://www.google.com/adsense/search/ads.js',
  },

  distroscale: {
    preconnect: [
      'https://c.jsrdn.com',
      'https://s.jsrdn.com',
      'https://i.jsrdn.com',
    ],
    renderStartImplemented: true,
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

  eas: {
    prefetch: 'https://amp.emediate.eu/amp.v0.js',
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
    clientIdScope: 'AMP_ECID_EZOIC',
  },

  f1e: {
    prefetch: 'https://img.ak.impact-ad.jp/util/f1e_amp.min.js',
  },

  f1h: {
    preconnect: 'https://img.ak.impact-ad.jp',
    renderStartImplemented: true,
  },

  fake: {},

  felmat: {
    prefetch: 'https://t.felmat.net/js/fmamp.js',
    renderStartImplemented: true,
  },

  flite: {},

  fluct: {
    preconnect: [
      'https://cdn-fluct.sh.adingo.jp',
      'https://s.sh.adingo.jp',
      'https://i.adingo.jp',
    ],
  },

  fusion: {
    prefetch: 'https://assets.adtomafusion.net/fusion/latest/fusion-amp.min.js',
  },

  genieessp: {
    prefetch: 'https://js.gsspcln.jp/l/amp.js',
  },

  gmossp: {
    prefetch: 'https://cdn.gmossp-sp.jp/ads/amp.js',
  },

  gumgum: {
    prefetch: 'https://g2.gumgum.com/javascripts/ad.js',
    renderStartImplemented: true,
  },

  holder: {
    prefetch: 'https://i.holder.com.ua/js2/holder/ajax/ampv1.js',
    preconnect: 'https://h.holder.com.ua',
    renderStartImplemented: true,
  },

  ibillboard: {},

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
    renderStartImplemented: true,
  },

  inmobi: {
    prefetch: 'https://cf.cdn.inmobi.com/ad/inmobi.secure.js',
    renderStartImplemented: true,
  },

  ix: {
    prefetch: [
      'https://js-sec.indexww.com/apl/amp.js',
    ],
    preconnect: 'https://as-sec.casalemedia.com',
  },

  kargo: {},

  kiosked: {
    renderStartImplemented: true,
  },

  kixer: {
    prefetch: 'https://cdn.kixer.com/ad/load.js',
    renderStartImplemented: true,
  },

  ligatus: {
    prefetch: 'https://ssl.ligatus.com/render/ligrend.js',
    renderStartImplemented: true,
  },

  loka: {
    prefetch: 'https://loka-cdn.akamaized.net/scene/amp.js',
    preconnect: [
      'https://scene-front.lokaplatform.com',
      'https://loka-materials.akamaized.net',
    ],
    renderStartImplemented: true,
  },

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
    prefetch: 'https://ec-ns.sascdn.com/diff/251/pages/amp_default.js',
    preconnect: [
      'https://ww251.smartadserver.com',
      'https://static.sascdn.com/',
    ],
    renderStartImplemented: true,
  },

  medianet: {
    preconnect: 'https://contextual.media.net',
    renderStartImplemented: true,
  },

  mediavine: {
    prefetch: 'https://www.googletagservices.com/tag/js/gpt.js',
    preconnect: [
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
    renderStartImplemented: true,
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

  mixpo: {
    prefetch: 'https://cdn.mixpo.com/js/loader.js',
    preconnect: [
      'https://player1.mixpo.com',
      'https://player2.mixpo.com',
    ],
  },

  mywidget: {
    preconnect: 'https://likemore-fe.go.mail.ru',
    prefetch: 'https://likemore-go.imgsmail.ru/widget.amp.js',
    renderStartImplemented: true,
  },

  nativo: {
    prefetch: 'https://s.ntv.io/serve/load.js',
  },

  navegg: {
    renderStartImplemented: true,
  },

  nend: {
    prefetch: 'https://js1.nend.net/js/amp.js',
    preconnect: [
      'https://output.nend.net',
      'https://img1.nend.net',
    ],
  },

  netletix: {
    preconnect: [
      'https://call.netzathleten-media.de',
    ],
    renderStartImplemented: true,
  },

  nokta: {
    prefetch: 'https://static.virgul.com/theme/mockups/noktaamp/ampjs.js',
    renderStartImplemented: true,
  },

  openadstream: {},

  openx: {
    prefetch: 'https://www.googletagservices.com/tag/js/gpt.js',
    preconnect: [
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
    renderStartImplemented: true,
  },

  outbrain: {
    renderStartImplemented: true,
    prefetch: 'https://widgets.outbrain.com/widgetAMP/outbrainAMP.min.js',
    preconnect: [
      'https://odb.outbrain.com',
    ],
  },

  plista: {},

  polymorphicads: {
    prefetch: 'https://www.polymorphicads.jp/js/amp.js',
    preconnect: [
      'https://img.polymorphicads.jp',
      'https://ad.polymorphicads.jp',
    ],
    renderStartImplemented: true,
  },

  popin: {
    renderStartImplemented: true,
  },

  pubmatic: {
    prefetch: 'https://ads.pubmatic.com/AdServer/js/amp.js',
  },

  pubmine: {
    prefetch: [
      'https://s.pubmine.com/head.js',
      'https://s.pubmine.com/showad.js',
    ],
    preconnect: 'https://delivery.g.switchadhub.com',
    renderStartImplemented: true,
  },

  pulsepoint: {
    prefetch: 'https://ads.contextweb.com/TagPublish/getjs.static.js',
    preconnect: 'https://tag.contextweb.com',
  },

  purch: {
    prefetch: 'https://ramp.purch.com/serve/creative_amp.js',
    renderStartImplemented: true,
  },

  relap: {
    renderStartImplemented: true,
  },

  revcontent: {
    prefetch: 'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js',
    preconnect: [
      'https://trends.revcontent.com',
      'https://cdn.revcontent.com',
      'https://img.revcontent.com',
    ],
    renderStartImplemented: true,
  },

  rubicon: {},

  sharethrough: {
    renderStartImplemented: true,
  },

  sklik: {
    prefetch: 'https://c.imedia.cz/js/amp.js',
  },

  slimcutmedia: {
    preconnect: [
      'https://sb.freeskreen.com',
      'https://static.freeskreen.com',
      'https://video.freeskreen.com',
    ],
    renderStartImplemented: true,
  },

  smartadserver: {
    prefetch: 'https://ec-ns.sascdn.com/diff/js/amp.v0.js',
    preconnect: 'https://static.sascdn.com',
    renderStartImplemented: true,
  },

  smartclip: {
    prefetch: 'https://cdn.smartclip.net/amp/amp.v0.js',
    preconnect: 'https://des.smartclip.net',
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
    renderStartImplemented: true,
  },

  sovrn: {
    prefetch: 'https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js',
  },

  sunmedia: {
    prefetch: 'https://vod.addevweb.com/sunmedia/amp/ads/sunmedia.js',
    preconnect: 'https://static.addevweb.com',
    renderStartImplemented: true,
  },

  swoop: {
    prefetch: 'https://www.swoop-amp.com/amp.js',
    preconnect: [
      'https://www.swpsvc.com',
      'https://client.swpcld.com',
    ],
    renderStartImplemented: true,
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

  valuecommerce: {
    prefetch: 'https://amp.valuecommerce.com/amp_bridge.js',
    preconnect: [
      'https://ad.jp.ap.valuecommerce.com',
    ],
    renderStartImplemented: true,
  },

  webediads: {
    prefetch: 'https://eu1.wbdds.com/amp.min.js',
    preconnect: [
      'https://goutee.top',
      'https://mediaathay.org.uk',
    ],
    renderStartImplemented: true,
  },

  'weborama-display': {
    prefetch: [
      'https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js',
      'https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js',
    ],
  },

  widespace: {},

  xlift: {
    prefetch: 'https://cdn.x-lift.jp/resources/common/xlift_amp.js',
    renderStartImplemented: true,
  },

  yahoo: {
    prefetch: 'https://s.yimg.com/os/ampad/display.js',
    preconnect: 'https://us.adserver.yahoo.com',
  },

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
    renderStartImplemented: true,
  },

  yieldone: {
    prefetch: 'https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js',
  },

  zedo: {
    prefetch: 'https://ss3.zedo.com/gecko/tag/Gecko.amp.min.js',
    renderStartImplemented: true,
  },

  zergnet: {},

  zucks: {
    preconnect: [
      'https://j.zucks.net.zimg.jp',
      'https://sh.zucks.net',
      'https://k.zucks.net',
      'https://static.zucks.net.zimg.jp',
    ],
  },

};
