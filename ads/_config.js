import {jsonConfiguration} from '#core/types/object/json';

/**
 * @typedef {{
 *   prefetch: (string|undefined),
 *   preconnect: (string|undefined),
 *   renderStartImplemented: (boolean|undefined),
 *   clientIdScope: (string|undefined),
 *   clientIdCookieName: (string|undefined),
 *   consentHandlingOverride: (boolean|undefined),
 *   fullWidthHeightRatio: (number|undefined),
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
 *   // The cookie name to store the CID. In absence, `clientIdScope` is used.
 *   clientIdCookieName: string
 *
 *   // If the ad network is willing to override the consent handling, which
 *   // by default is blocking ad load until the consent is accepted.
 *   consentHandlingOverride: boolean
 *
 *   // Whether render-start API has been implemented
 *   // We highly recommend all networks to implement the API,
 *   // see details in the README.md
 *   renderStartImplemented: boolean
 *
 *   // The width / height ratio for full width ad units.
 *   // If absent, it means the network does not support full width ad units.
 *   // Example value: 1.2
 *   fullWidthHeightRatio: number
 * }
 *
 * @const {!{[key: string]: !JsonObject}}
 */
const adConfig = jsonConfiguration({
  '_ping_': {
    renderStartImplemented: true,
    clientIdScope: '_PING_',
    consentHandlingOverride: true,
  },

  '1wo': {},

  '24smi': {
    prefetch: 'https://jsn.24smi.net/smi.js',
    preconnect: 'https://data.24smi.net',
  },

  '4wmarketplace': {
    renderStartImplemented: true,
  },

  'a8': {
    prefetch: 'https://statics.a8.net/amp/ad.js',
    renderStartImplemented: true,
  },

  'a9': {
    prefetch: 'https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US',
  },

  'accesstrade': {
    prefetch: 'https://h.accesstrade.net/js/amp/amp.js',
  },

  'adagio': {
    prefetch: 'https://js-ssl.neodatagroup.com/adagio_amp.js',
    preconnect: [
      'https://ad-aws-it.neodatagroup.com',
      'https://tracker.neodatagroup.com',
    ],
    renderStartImplemented: true,
  },

  'adblade': {
    prefetch: 'https://web.adblade.com/js/ads/async/show.js',
    preconnect: [
      'https://staticd.cdn.adblade.com',
      'https://static.adblade.com',
    ],
    renderStartImplemented: true,
  },

  'adbutler': {
    prefetch: 'https://servedbyadbutler.com/app.js',
  },

  'adenza': {
    renderStartImplemented: true,
  },

  'adform': {},

  'adfox': {
    prefetch: 'https://yandex.ru/ads/system/context.js',
    preconnect: ['https://yastatic.net/'],
    renderStartImplemented: true,
  },

  'adgeneration': {
    prefetch: 'https://i.socdm.com/sdk/js/adg-script-loader.js',
  },

  'adglare': {
    renderStartImplemented: true,
  },

  'adhese': {
    renderStartImplemented: true,
  },

  'adincube': {
    renderStartImplemented: true,
  },

  'adition': {},

  'adman': {},

  'admanmedia': {
    renderStartImplemented: true,
  },

  'admixer': {
    renderStartImplemented: true,
    preconnect: ['https://inv-nets.admixer.net', 'https://cdn.admixer.net'],
  },

  'adnuntius': {
    prefetch: 'https://cdn.adnuntius.com/adn.js',
    renderStartImplemented: true,
  },

  'adocean': {
    consentHandlingOverride: true,
  },

  'adop': {},

  'adpicker': {
    renderStartImplemented: true,
  },

  'adplugg': {
    prefetch: 'https://www.adplugg.com/serve/js/ad.js',
    renderStartImplemented: true,
  },

  'adpon': {
    prefetch: 'https://ad.adpon.jp/amp.js',
    clientIdScope: 'AMP_ECID_ADPON',
  },

  'adpushup': {
    prefetch: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    preconnect: 'https://cdn.adpushup.com',
  },

  'adreactor': {},

  'ads2bid': {
    renderStartImplemented: true,
  },

  'adsensor': {
    prefetch: 'https://wfpscripts.webspectator.com/amp/adsensor-amp.js',
    clientIdScope: 'amp_ecid_adensor',
    renderStartImplemented: true,
  },

  'adservsolutions': {},

  'adskeeper': {
    renderStartImplemented: true,
    preconnect: [
      'https://jsc.adskeeper.com',
      'https://servicer.adskeeper.com',
      'https://s-img.adskeeper.com',
    ],
  },

  'adsloom': {
    clientIdScope: 'AMP_ECID_ADSLOOM',
  },
  'adsnative': {
    prefetch: 'https://static.adsnative.com/static/js/render.v1.js',
    preconnect: 'https://api.adsnative.com',
  },

  'adspeed': {
    preconnect: 'https://g.adspeed.net',
    renderStartImplemented: true,
  },

  'adspirit': {},

  'adstir': {
    prefetch: 'https://js.ad-stir.com/js/adstir_async.js',
    preconnect: 'https://ad.ad-stir.com',
  },

  'adstyle': {
    prefetch: 'https://widgets.ad.style/amp.js',
    preconnect: ['https://w.ad.style'],
  },

  'adtech': {
    prefetch: 'https://s.aolcdn.com/os/ads/adsWrapper3.js',
    preconnect: ['https://mads.at.atwola.com', 'https://aka-cdn.adtechus.com'],
  },

  'adtelligent': {
    preconnect: ['https://s.adtelligent.com'],
    renderStartImplemented: true,
  },

  'adthrive': {
    prefetch: ['https://www.googletagservices.com/tag/js/gpt.js'],
    preconnect: [
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
    renderStartImplemented: true,
  },

  'adsviu': {
    prefetch: 'https://widget.adsviu.com/adsviuAMP.js',
    preconnect: ['https://api.adsviu.com'],
  },

  'adunity': {
    preconnect: ['https://content.adunity.com'],
    renderStartImplemented: true,
  },

  'aduptech': {
    prefetch: 'https://s.d.adup-tech.com/jsapi',
    preconnect: [
      'https://d.adup-tech.com',
      'https://m.adup-tech.com',
      'https://v.adup-tech.com',
    ],
    renderStartImplemented: true,
    consentHandlingOverride: true,
  },

  'adventive': {
    preconnect: ['https://ads.adventive.com', 'https://amp.adventivedev.com'],
    renderStartImplemented: true,
  },

  'adverline': {
    prefetch: 'https://ads.adverline.com/richmedias/amp.js',
    preconnect: ['https://adnext.fr'],
    renderStartImplemented: true,
  },

  'adverticum': {},

  'advertserve': {
    renderStartImplemented: true,
  },

  'adyoulike': {
    consentHandlingOverride: true,
    prefetch: 'https://fo-static.omnitagjs.com/amp.js',
    renderStartImplemented: true,
  },

  'adzerk': {},

  'affiliateb': {
    prefetch: 'https://track.affiliate-b.com/amp/a.js',
    renderStartImplemented: true,
  },

  'affinity': {
    prefetch: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    preconnect: 'https://cdn4-hbs.affinitymatrix.com',
  },

  'aja': {
    prefetch: [
      'https://cdn.as.amanad.adtdp.com/sdk/asot-amp.js',
      'https://cdn.as.amanad.adtdp.com/sdk/asot-v2.js',
    ],
    preconnect: ['https://ad.as.amanad.adtdp.com'],
  },

  'appvador': {
    prefetch: [
      'https://cdn.apvdr.com/js/VastAdUnit.min.js',
      'https://cdn.apvdr.com/js/VideoAd.min.js',
      'https://cdn.apvdr.com/js/VideoAd3PAS.min.js',
      'https://cdn.apvdr.com/js/VideoAdAutoPlay.min.js',
      'https://cdn.apvdr.com/js/VideoAdNative.min.js',
    ],
    renderStartImplemented: true,
  },

  'amoad': {
    prefetch: ['https://j.amoad.com/js/a.js', 'https://j.amoad.com/js/n.js'],
    preconnect: [
      'https://d.amoad.com',
      'https://i.amoad.com',
      'https://m.amoad.com',
      'https://v.amoad.com',
    ],
  },
  'amplified': {
    preconnect: 'https://srv.clickfuse.com',
    renderStartImplemented: true,
  },

  'andbeyond': {
    prefetch: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    preconnect: 'https://cdn.andbeyond.media',
  },

  'aniview': {
    renderStartImplemented: true,
  },

  'anyclip': {
    prefetch:
      'https://player.anyclip.com/anyclip-widget/lre-widget/prod/v1/src/lre.js',
    preconnect: [
      'https://trafficmanager.anyclip.com',
      'https://lreprx-server.anyclip.com',
    ],
    renderStartImplemented: true,
  },

  'appnexus': {
    prefetch: 'https://acdn.adnxs.com/ast/ast.js',
    preconnect: 'https://ib.adnxs.com',
    renderStartImplemented: true,
  },

  'atomx': {
    prefetch: 'https://s.ato.mx/p.js',
  },

  'avantisvideo': {
    renderStartImplemented: true,
  },

  'beaverads': {
    renderStartImplemented: true,
  },

  'beopinion': {
    prefetch: 'https://widget.beop.io/sdk.js',
    preconnect: [
      'https://t.beop.io',
      'https://s.beop.io',
      'https://data.beop.io',
    ],
    renderStartImplemented: true,
  },

  'bidtellect': {},

  'blade': {
    prefetch: 'https://sdk.streamrail.com/blade/sr.blade.js',
    renderStartImplemented: true,
  },

  'brainy': {},

  'bringhub': {
    renderStartImplemented: true,
    preconnect: ['https://static.bh-cdn.com', 'https://core-api.bringhub.io'],
  },

  'broadbandy': {
    renderStartImplemented: true,
  },

  'broadstreetads': {
    prefetch: 'https://cdn.broadstreetads.com/init-2.min.js',
    renderStartImplemented: true,
  },

  'byplay': {},

  'caajainfeed': {
    prefetch: ['https://cdn.amanad.adtdp.com/sdk/ajaamp.js'],
    preconnect: ['https://ad.amanad.adtdp.com'],
  },

  'capirs': {
    renderStartImplemented: true,
  },

  'caprofitx': {
    prefetch: [
      'https://cdn.caprofitx.com/pfx.min.js',
      'https://cdn.caprofitx.com/tags/amp/profitx_amp.js',
    ],
    preconnect: 'https://ad.caprofitx.adtdp.com',
  },

  'cedato': {
    renderStartImplemented: true,
  },

  'chargeads': {}, // Deprecated, to be removed on 2019-05-23

  'cognativex': {},

  'colombia': {
    prefetch: 'https://static.clmbtech.com/ad/commons/js/colombia-amp.js',
  },

  'colombiafeed': {
    prefetch:
      'https://static.clmbtech.com/c1e/static/themes/js/colombiafeed-amp.js',
  },

  'conative': {
    renderStartImplemented: true,
  },

  'connatix': {
    renderStartImplemented: true,
  },

  'contentad': {},

  'criteo': {
    prefetch: 'https://static.criteo.net/js/ld/publishertag.js',
    preconnect: 'https://cas.criteo.com',
  },

  'csa': {
    prefetch: 'https://www.google.com/adsense/search/ads.js',
  },

  'clever': {
    renderStartImplemented: true,
  },

  'dable': {
    preconnect: [
      'https://static.dable.io',
      'https://api.dable.io',
      'https://images.dable.io',
    ],
    renderStartImplemented: true,
  },

  'dex': {
    renderStartImplemented: true,
  },

  'digiteka': {
    renderStartImplemented: true,
  },

  'directadvert': {
    renderStartImplemented: true,
  },

  'distroscale': {
    preconnect: [
      'https://c.jsrdn.com',
      'https://s.jsrdn.com',
      'https://i.jsrdn.com',
    ],
    renderStartImplemented: true,
  },

  'dotandads': {
    prefetch: 'https://amp.ad.dotandad.com/dotandadsAmp.js',
    preconnect: 'https://bal.ad.dotandad.com',
  },
  'dynad': {
    preconnect: ['https://t.dynad.net', 'https://tm.jsuol.com.br'],
  },
  'eadv': {
    renderStartImplemented: true,
    clientIdScope: 'AMP_ECID_EADV',
    prefetch: [
      'https://www.eadv.it/track/esr.min.js',
      'https://www.eadv.it/track/ead.min.js',
    ],
  },

  'empower': {
    prefetch: 'https://cdn.empower.net/sdk/amp-ad.min.js',
    renderStartImplemented: true,
  },

  'engageya': {},

  'epeex': {},

  'eplanning': {
    prefetch: 'https://us.img.e-planning.net/layers/epl-amp.js',
  },

  'exco': {
    renderStartImplemented: true,
  },

  'ezoic': {
    prefetch: [
      'https://www.googletagservices.com/tag/js/gpt.js',
      'https://g.ezoic.net/ezoic/ampad.js',
    ],
    clientIdScope: 'AMP_ECID_EZOIC',
    consentHandlingOverride: true,
    renderStartImplemented: true,
  },

  'f1e': {
    prefetch: 'https://img.ak.impact-ad.jp/util/f1e_amp.min.js',
  },

  'f1h': {
    preconnect: 'https://img.ak.impact-ad.jp',
    renderStartImplemented: true,
  },

  'fairground': {},

  'fake': {},

  'fake-delayed': {
    renderStartImplemented: true,
  },

  'feedad': {
    clientIdScope: '__fa_amp',
    prefetch: 'https://web.feedad.com/sdk/feedad-async.js',
    renderStartImplemented: true,
    fullWidthHeightRatio: 16 / 9,
    consentHandlingOverride: true,
  },

  'felmat': {
    prefetch: 'https://t.felmat.net/js/fmamp.js',
    renderStartImplemented: true,
  },

  'finative': {},

  'firstimpression': {
    prefetch: 'https://ecdn.firstimpression.io/static/js/fiamp.js',
    preconnect: 'https://cdn.firstimpression.io',
    renderStartImplemented: true,
    consentHandlingOverride: true,
  },

  'flite': {},

  'fluct': {
    prefetch: ['https://pdn.adingo.jp/p.js'],
    preconnect: [
      'https://cdn-fluct.sh.adingo.jp',
      'https://sh.adingo.jp',
      'https://i.adingo.jp',
    ],
  },

  'forkmedia': {
    renderStartImplemented: true,
  },

  'freewheel': {
    prefetch: 'https://cdn.stickyadstv.com/prime-time/fw-amp.min.js',
    renderStartImplemented: true,
  },

  'fusion': {
    prefetch: 'https://assets.adtomafusion.net/fusion/latest/fusion-amp.min.js',
  },

  'gecko': {},

  'genieessp': {
    prefetch: 'https://js.gsspcln.jp/l/amp.js',
  },

  'geozo': {
    renderStartImplemented: true,
  },

  'giraff': {
    renderStartImplemented: true,
  },

  'glomex': {
    prefetch: 'https://player.glomex.com/integration/1/amp-embed.js',
  },

  'gmossp': {
    prefetch: 'https://cdn.gmossp-sp.jp/ads/amp.js',
  },

  'gumgum': {
    prefetch: 'https://js.gumgum.com/slot.js',
    renderStartImplemented: true,
  },

  'holder': {
    prefetch: 'https://i.holder.com.ua/js2/holder/ajax/ampv1.js',
    preconnect: 'https://h.holder.com.ua',
    renderStartImplemented: true,
  },

  'ibillboard': {},

  'idealmedia': {
    renderStartImplemented: true,
    preconnect: [
      'https://jsc.idealmedia.io',
      'https://servicer.idealmedia.io',
      'https://s-img.idealmedia.io/',
    ],
  },

  'imedia': {
    prefetch: 'https://i.imedia.cz/js/im3.js',
    renderStartImplemented: true,
  },

  'imobile': {
    prefetch: 'https://spamp.i-mobile.co.jp/script/amp.js',
    preconnect: 'https://spad.i-mobile.co.jp',
  },
  'imonomy': {
    renderStartImplemented: true,
  },
  'improvedigital': {},

  'incrementx': {
    prefetch: 'https://cdn.incrementxserv.com/ixamp.js',
    renderStartImplemented: true,
  },

  'industrybrains': {
    prefetch: 'https://web.industrybrains.com/js/ads/async/show.js',
    preconnect: [
      'https://staticd.cdn.industrybrains.com',
      'https://static.industrybrains.com',
    ],
    renderStartImplemented: true,
  },

  'inmobi': {
    prefetch: 'https://cf.cdn.inmobi.com/ad/inmobi.secure.js',
    renderStartImplemented: true,
  },

  'innity': {
    prefetch: 'https://cdn.innity.net/admanager.js',
    preconnect: 'https://as.innity.com',
    renderStartImplemented: true,
  },

  'insticator': {
    preconnect: 'https://d3lcz8vpax4lo2.cloudfront.net', // can also be array if more than one URL needed
    renderStartImplemented: true,
  },

  'insurads': {
    prefetch: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    preconnect: [
      'https://tpc.googlesyndication.com',
      'https://cdn.insurads.com',
      'https://services.insurads.com',
      'https://messaging.insurads.com',
    ],
    renderStartImplemented: true,
    consentHandlingOverride: true,
  },

  'invibes': {
    prefetch: 'https://k.r66net.com/GetAmpLink',
    renderStartImplemented: true,
    consentHandlingOverride: true,
  },

  'iprom': {
    prefetch: 'https://cdn.ipromcloud.com/ipromNS.js',
  },

  'ix': {
    prefetch: ['https://js-sec.indexww.com/apl/amp.js'],
    preconnect: 'https://as-sec.casalemedia.com',
    renderStartImplemented: true,
  },

  'jubna': {},

  'kargo': {},

  'ketshwa': {},

  'kiosked': {
    renderStartImplemented: true,
  },
  'jioads': {
    renderStartImplemented: true,
  },
  'jixie': {
    prefetch: ['https://scripts.jixie.media/jxamp.min.js'],
    clientIdScope: '__jxamp',
    clientIdCookieName: '_jxx',
    renderStartImplemented: true,
  },

  'kixer': {
    prefetch: 'https://cdn.kixer.com/ad/load.js',
    renderStartImplemented: true,
  },

  'kuadio': {},

  'lentainform': {
    renderStartImplemented: true,
    preconnect: [
      'https://jsc.lentainform.com',
      'https://servicer.lentainform.com',
      'https://s-img.lentainform.com',
    ],
  },

  'ligatus': {
    prefetch: 'https://ssl.ligatus.com/render/ligrend.js',
    renderStartImplemented: true,
  },

  'lockerdome': {
    prefetch: 'https://cdn2.lockerdomecdn.com/_js/amp.js',
    renderStartImplemented: true,
  },

  'logly': {
    preconnect: ['https://l.logly.co.jp', 'https://cdn.logly.co.jp'],
    renderStartImplemented: true,
  },

  'loka': {
    prefetch: 'https://loka-cdn.akamaized.net/scene/amp.js',
    preconnect: [
      'https://scene-front.lokaplatform.com',
      'https://loka-materials.akamaized.net',
    ],
    renderStartImplemented: true,
  },

  'luckyads': {
    renderStartImplemented: true,
  },

  'macaw': {
    renderStartImplemented: true,
  },

  'mads': {
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

  'marfeel': {
    prefetch: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    preconnect: [
      'https://live.mrf.io',
      'https://tpc.googlesyndication.com',
      'https://fastlane.rubiconproject.com',
      'https://htlb.casalemedia.com',
      'https://prg.smartadserver.com',
      'https://ib.adnxs.com',
      'https://bidder.criteo.com',
      'https://marfeel-d.openx.net',
      'https://ice.360yield.com',
      'https://mbid.marfeelrev.com',
    ],
    consentHandlingOverride: true,
  },

  'mantis-recommend': {
    prefetch: 'https://assets.mantisadnetwork.com/recommend.min.js',
    preconnect: [
      'https://mantodea.mantisadnetwork.com',
      'https://resize.mantisadnetwork.com',
    ],
  },

  'mediaad': {},

  'medianet': {
    preconnect: 'https://contextual.media.net',
    renderStartImplemented: true,
  },

  'mediavine': {
    prefetch: 'https://amp.mediavine.com/wrapper.min.js',
    preconnect: [
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
    renderStartImplemented: true,
    consentHandlingOverride: true,
  },

  'medyanet': {
    renderStartImplemented: true,
  },

  'meg': {
    renderStartImplemented: true,
  },

  'mgid': {
    renderStartImplemented: true,
    preconnect: [
      'https://jsc.mgid.com',
      'https://servicer.mgid.com',
      'https://s-img.mgid.com',
    ],
  },

  'microad': {
    prefetch: 'https://j.microad.net/js/camp.js',
    preconnect: [
      'https://s-rtb.send.microad.jp',
      'https://s-rtb.send.microadinc.com',
      'https://cache.send.microad.jp',
      'https://cache.send.microadinc.com',
      'https://deb.send.microad.jp',
    ],
  },

  'miximedia': {
    renderStartImplemented: true,
  },

  'mixpo': {
    prefetch: 'https://cdn.mixpo.com/js/loader.js',
    preconnect: ['https://player1.mixpo.com', 'https://player2.mixpo.com'],
  },

  'monetizer101': {
    renderStartImplemented: true,
  },

  'mox': {
    prefetch: [
      'https://ad.mox.tv/js/amp.min.js',
      'https://ad.mox.tv/mox/mwayss_invocation.min.js',
    ],
    renderStartImplemented: true,
  },

  'my6sense': {
    renderStartImplemented: true,
  },

  'myfinance': {
    preconnect: [
      'https://a.myfidevs.io',
      'https://static.myfinance.com',
      'https://www.myfinance.com',
    ],
    renderStartImplemented: true,
    clientIdScope: 'AMP_ECID_GOOGLE',
  },

  'myoffrz': {
    renderStartImplemented: true,
  },

  'mytarget': {
    prefetch: 'https://ad.mail.ru/static/ads-async.js',
    renderStartImplemented: true,
  },

  'myua': {
    renderStartImplemented: true,
  },

  'mywidget': {
    preconnect: 'https://likemore-fe.go.mail.ru',
    prefetch: 'https://likemore-go.imgsmail.ru/widget_amp.js',
    renderStartImplemented: true,
  },

  'nativeroll': {
    prefetch: 'https://cdn01.nativeroll.tv/js/seedr-player.min.js',
  },

  'nativery': {
    preconnect: 'https://cdn.nativery.com',
  },

  'nativo': {
    prefetch: 'https://s.ntv.io/serve/load.js',
  },

  'navegg': {
    renderStartImplemented: true,
  },

  'nend': {
    prefetch: 'https://js1.nend.net/js/amp.js',
    preconnect: ['https://output.nend.net', 'https://img1.nend.net'],
  },

  'netletix': {
    preconnect: ['https://call.netzathleten-media.de'],
    renderStartImplemented: true,
  },

  'noddus': {
    prefetch: 'https://noddus.com/amp_loader.js',
    renderStartImplemented: true,
  },

  'nokta': {
    prefetch: 'https://static.virgul.com/theme/mockups/noktaamp/ampjs.js',
    renderStartImplemented: true,
  },

  'nws': {},

  'oblivki': {
    renderStartImplemented: true,
  },

  'onead': {
    prefetch: 'https://ad-specs.guoshipartners.com/static/js/onead-amp.min.js',
    renderStartImplemented: true,
  },

  'onnetwork': {
    renderStartImplemented: true,
  },

  'openadstream': {},

  'openx': {
    prefetch: 'https://www.googletagservices.com/tag/js/gpt.js',
    preconnect: [
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
    renderStartImplemented: true,
  },

  'opinary': {
    renderStartImplemented: true,
  },

  'outbrain': {
    renderStartImplemented: true,
    prefetch: 'https://widgets.outbrain.com/widgetAMP/outbrainAMP.min.js',
    preconnect: ['https://odb.outbrain.com'],
    consentHandlingOverride: true,
  },

  'pixels': {
    prefetch: 'https://cdn.adsfactor.net/amp/pixels-amp.min.js',
    clientIdCookieName: '__AF',
    renderStartImplemented: true,
  },

  'playstream': {
    prefetch: 'https://app.playstream.media/js/amp.js',
    renderStartImplemented: true,
  },

  'plista': {},

  'polymorphicads': {
    prefetch: 'https://www.polymorphicads.jp/js/amp.js',
    preconnect: [
      'https://img.polymorphicads.jp',
      'https://ad.polymorphicads.jp',
    ],
    renderStartImplemented: true,
  },

  'popin': {
    renderStartImplemented: true,
  },

  'postquare': {},

  'ppstudio': {
    renderStartImplemented: true,
  },

  'pressboard': {
    renderStartImplemented: true,
  },

  'promoteiq': {},

  'pubexchange': {},

  'pubfuture': {
    renderStartImplemented: true,
  },

  'pubguru': {
    renderStartImplemented: true,
  },

  'pubmatic': {
    prefetch: 'https://ads.pubmatic.com/AdServer/js/amp.js',
  },

  'pubmine': {
    prefetch: ['https://s.pubmine.com/head.js'],
    preconnect: 'https://delivery.g.switchadhub.com',
    renderStartImplemented: true,
  },

  'pubscale': {
    renderStartImplemented: true,
  },

  'puffnetwork': {
    prefetch: 'https://static.puffnetwork.com/amp_ad.js',
    renderStartImplemented: true,
  },

  'pulse': {
    prefetch: 'https://static.pulse.mail.ru/pulse-widget-amp.js',
    renderStartImplemented: true,
  },

  'pulsepoint': {
    prefetch: 'https://ads.contextweb.com/TagPublish/getjs.static.js',
    preconnect: 'https://tag.contextweb.com',
  },

  'purch': {
    prefetch: 'https://ramp.purch.com/serve/creative_amp.js',
    renderStartImplemented: true,
  },

  'quoraad': {
    prefetch: 'https://a.quora.com/amp_ad.js',
    preconnect: 'https://ampad.quora.com',
    renderStartImplemented: true,
  },

  'r9x': {
    prefetch: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    preconnect: 'https://cdn.r9x.in',
  },

  'rakutenunifiedads': {
    prefetch: 'https://s-cdn.rmp.rakuten.co.jp/js/amp.js',
    renderStartImplemented: true,
  },

  'rbinfox': {
    renderStartImplemented: true,
  },

  'rcmwidget': {
    prefetch: 'https://rcmjs.rambler.ru/static/rcmw/rcmw-amp.js',
    renderStartImplemented: true,
    clientIdScope: '__rcmw_amp',
  },

  'readmo': {
    renderStartImplemented: true,
  },

  'realclick': {
    renderStartImplemented: true,
  },

  'recomad': {
    renderStartImplemented: true,
  },

  'recreativ': {
    prefetch: 'https://go.rcvlink.com/static/amp.js',
    renderStartImplemented: true,
  },

  'relap': {
    renderStartImplemented: true,
  },

  'relappro': {
    prefetch: 'https://cdn.relappro.com/adservices/amp/relappro.amp.min.js',
    preconnect: 'https://tags.relappro.com',
    renderStartImplemented: true,
  },

  'remixd': {
    preconnect: 'https://tags.remixd.com',
    renderStartImplemented: true,
  },

  'revcontent': {
    prefetch:
      'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js',
    preconnect: [
      'https://trends.revcontent.com',
      'https://cdn.revcontent.com',
      'https://img.revcontent.com',
    ],
    renderStartImplemented: true,
  },

  'revjet': {
    prefetch: 'https://cdn.revjet.com/~cdn/JS/03/amp.js',
    renderStartImplemented: true,
  },

  'rfp': {
    prefetch: 'https://js.rfp.fout.jp/rfp-amp.js',
    preconnect: 'https://ad.rfp.fout.jp',
    renderStartImplemented: true,
  },

  'rnetplus': {},

  'rubicon': {},

  'runative': {
    prefetch: 'https://cdn.run-syndicate.com/sdk/v1/n.js',
    renderStartImplemented: true,
  },

  'sabavision': {
    renderStartImplemented: true,
  },

  'sas': {
    renderStartImplemented: true,
  },

  'seedingalliance': {},

  'seedtag': {
    prefetch: 'https://t.seedtag.com/c/loader.js',
    preconnect: ['https://s.seedtag.com'],
    consentHandlingOverride: true,
    renderStartImplemented: true,
  },

  'sekindo': {
    renderStartImplemented: true,
  },

  'sharethrough': {
    renderStartImplemented: true,
  },

  'shemedia': {
    prefetch: [
      'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
      'https://ads.shemedia.com/static/amp.js',
    ],
    preconnect: [
      'https://partner.googleadservices.com',
      'https://tpc.googlesyndication.com',
      'https://ads.blogherads.com',
    ],
    renderStartImplemented: true,
  },

  'sklik': {
    prefetch: 'https://c.imedia.cz/js/amp.js',
  },

  'skoiy': {
    preconnect: ['https://svas.skoiy.xyz'],
  },

  'slimcutmedia': {
    preconnect: [
      'https://sb.freeskreen.com',
      'https://static.freeskreen.com',
      'https://video.freeskreen.com',
    ],
    renderStartImplemented: true,
  },

  'smartads': {
    prefetch: 'https://smart-ads.biz/amp.js',
  },

  'smartadserver': {
    prefetch: 'https://ec-ns.sascdn.com/diff/js/amp.v0.js',
    preconnect: 'https://static.sascdn.com',
    renderStartImplemented: true,
  },

  'smartclip': {
    prefetch: 'https://cdn.smartclip.net/amp/amp.v0.js',
    preconnect: 'https://des.smartclip.net',
    renderStartImplemented: true,
  },

  'smi2': {
    renderStartImplemented: true,
  },

  'smilewanted': {
    prefetch: 'https://prebid.smilewanted.com/amp/amp.js',
    preconnect: 'https://static.smilewanted.com',
    renderStartImplemented: true,
  },

  'sogouad': {
    prefetch: 'https://theta.sogoucdn.com/wap/js/aw.js',
    renderStartImplemented: true,
  },

  'sortable': {
    prefetch: 'https://www.googletagservices.com/tag/js/gpt.js',
    preconnect: [
      'https://tags-cdn.deployads.com',
      'https://partner.googleadservices.com',
      'https://securepubads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
    ],
    renderStartImplemented: true,
  },

  'sona': {
    renderStartImplemented: true,
  },

  'sovrn': {
    prefetch: 'https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js',
  },

  'speakol': {
    renderStartImplemented: true,
  },

  'spotx': {
    preconnect: 'https://js.spotx.tv',
    renderStartImplemented: true,
  },

  'springAds': {
    preconnect: ['https://ib.adnxs.com'],
    renderStartImplemented: true,
  },

  'ssp': {
    prefetch: 'https://ssp.imedia.cz/static/js/ssp.js',
    renderStartImplemented: true,
    consentHandlingOverride: true,
  },

  'strossle': {
    preconnect: [
      'https://amp.spklw.com',
      'https://widgets.sprinklecontent.com',
      'https://images.sprinklecontent.com',
    ],
  },

  'sunmedia': {
    preconnect: [
      'https://static.sunmedia.tv',
      'https://services.sunmedia.tv',
      'https://creative.sunmedia.tv',
      'https://vod.sunmedia.tv',
      'https://mx-sunmedia.videoplaza.tv',
      'https://es-sunicontent.videoplaza.tv',
      'https://es-sunelespanol.videoplaza.tv',
      'https://es-suncopperland.videoplaza.tv',
      'https://search.spotxchange.com',
      'https://tpc.googlesyndication.com',
    ],
    clientIdScope: 'AMP_ECID_SUNMEDIA',
    fullWidthHeightRatio: 1 / 1,
    renderStartImplemented: true,
  },

  'svknative': {
    renderStartImplemented: true,
    prefetch: 'https://widget.svk-native.ru/js/embed.js',
  },

  'swoop': {
    prefetch: 'https://www.swoop-amp.com/amp.js',
    preconnect: ['https://www.swpsvc.com', 'https://client.swpcld.com'],
    renderStartImplemented: true,
  },

  'taboola': {},

  'tagon': {
    prefetch: 'https://js.tagon.co/tagon-amp.min.js',
  },

  'tail': {
    renderStartImplemented: true,
  },

  'tcsemotion': {
    prefetch: 'https://ads.tcsemotion.com/www/delivery/amphb.js',
    renderStartImplemented: true,
  },

  'teads': {
    prefetch: 'https://a.teads.tv/media/format/v3/teads-format.min.js',
    preconnect: [
      'https://cdn2.teads.tv',
      'https://t.teads.tv',
      'https://r.teads.tv',
    ],
    consentHandlingOverride: true,
  },

  'temedya': {
    prefetch: [
      'https://widget.cdn.vidyome.com/builds/loader-amp.js',
      'https://vidyome-com.cdn.vidyome.com/vidyome/builds/widgets.js',
    ],
    renderStartImplemented: true,
  },

  'torimochi': {
    renderStartImplemented: true,
  },

  'tracdelight': {
    prefetch: 'https://scripts.tracdelight.io/amp.js',
    renderStartImplemented: true,
  },

  'trafficstars': {
    prefetch: 'https://cdn.tsyndicate.com/sdk/v1/master.spot.js',
    renderStartImplemented: true,
  },

  'triplelift': {},

  'trugaze': {
    clientIdScope: '__tg_amp',
    renderStartImplemented: true,
  },

  'uas': {
    prefetch: 'https://ads.pubmatic.com/AdServer/js/phoenix.js',
  },

  'ucfunnel': {
    renderStartImplemented: true,
  },

  'uzou': {
    preconnect: ['https://speee-ad.akamaized.net'],
    renderStartImplemented: true,
  },

  'unruly': {
    prefetch: 'https://video.unrulymedia.com/native/native-loader.js',
    renderStartImplemented: true,
  },

  'valuecommerce': {
    prefetch: 'https://amp.valuecommerce.com/amp_bridge.js',
    preconnect: ['https://ad.jp.ap.valuecommerce.com'],
    renderStartImplemented: true,
  },

  'vdoai': {
    prefetch: 'https://a.vdo.ai/core/dependencies_amp/vdo.min.js',
    renderStartImplemented: true,
  },

  'videointelligence': {
    preconnect: 'https://s.vi-serve.com',
    renderStartImplemented: true,
  },

  'videonow': {
    renderStartImplemented: true,
  },

  'viralize': {
    renderStartImplemented: true,
  },

  'vlyby': {
    prefetch: 'https://cdn.vlyby.com/amp/qad/qad-outer2.js',
  },

  'vmfive': {
    prefetch: 'https://man.vm5apis.com/dist/adn-web-sdk.js',
    preconnect: ['https://vawpro.vm5apis.com', 'https://vahfront.vm5apis.com'],
    renderStartImplemented: true,
  },

  'vox': {
    renderStartImplemented: true,
  },

  'webediads': {
    prefetch: 'https://eu1.wbdds.com/amp.min.js',
    preconnect: ['https://goutee.top', 'https://mediaathay.org.uk'],
    renderStartImplemented: true,
  },

  'weborama-display': {
    prefetch: [
      'https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js',
      'https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js',
    ],
  },

  'whopainfeed': {
    prefetch: 'https://widget.infeed.com.ar/widget/widget-amp.js',
  },

  'widespace': {},

  'wisteria': {
    renderStartImplemented: true,
  },

  'wpmedia': {
    prefetch: 'https://std.wpcdn.pl/wpjslib/wpjslib-amp.js',
    preconnect: ['https://www.wp.pl', 'https://v.wpimg.pl'],
    renderStartImplemented: true,
  },

  'wunderkind': {
    preconnect: ['https://tag.wknd.ai', 'https://api.bounceexchange.com'],
    renderStartImplemented: true,
    fullWidthHeightRatio: 4 / 3,
  },

  'xlift': {
    prefetch: 'https://cdn.x-lift.jp/resources/common/xlift_amp.js',
    renderStartImplemented: true,
  },

  'yahoo': {
    prefetch: 'https://s.yimg.com/aaq/ampad/display.js',
    preconnect: 'https://us.adserver.yahoo.com',
  },

  'yahoofedads': {
    renderStartImplemented: true,
  },

  'yahoojp': {
    prefetch: [
      'https://s.yimg.jp/images/listing/tool/yads/ydn/amp/amp.js',
      'https://yads.c.yimg.jp/js/yads.js',
    ],
    preconnect: 'https://yads.yahoo.co.jp',
  },

  'yahoonativeads': {
    renderStartImplemented: true,
  },

  'yandex': {
    prefetch: 'https://yandex.ru/ads/system/context.js',
    preconnect: ['https://yastatic.net/'],
    renderStartImplemented: true,
  },

  'yektanet': {
    preconnect: [
      'https://cdn.yektanet.com',
      'https://cg-sc.yektanet.com',
      'https://native.yektanet.com',
      'https://nfetch.yektanet.net',
      'https://rfetch.yektanet.net',
      'https://scrapper.yektanet.com',
      'https://ua.yektanet.com',
      'https://bfetch.yektanet.com',
      'https://mostatil.cdn.yektanet.com',
    ],
    renderStartImplemented: true,
  },

  'yengo': {
    renderStartImplemented: true,
  },

  'yieldbot': {
    prefetch: [
      'https://cdn.yldbt.com/js/yieldbot.intent.amp.js',
      'https://msg.yldbt.com/js/ybmsg.html',
    ],
    preconnect: 'https://i.yldbt.com',
  },

  'yieldmo': {
    prefetch: 'https://static.yieldmo.com/ym.1.js',
    preconnect: ['https://s.yieldmo.com', 'https://ads.yieldmo.com'],
    renderStartImplemented: true,
  },

  'yieldone': {
    prefetch: 'https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js',
  },

  'yieldpro': {
    preconnect: 'https://creatives.yieldpro.eu',
    renderStartImplemented: true,
  },

  'zedo': {
    prefetch: 'https://ss3.zedo.com/gecko/tag/Gecko.amp.min.js',
    renderStartImplemented: true,
  },

  'zen': {
    prefetch: 'https://zen.yandex.ru/widget-loader',
    preconnect: ['https://yastatic.net/'],
    renderStartImplemented: true,
  },

  'zergnet': {},

  'zucks': {
    preconnect: [
      'https://j.zucks.net.zimg.jp',
      'https://sh.zucks.net',
      'https://k.zucks.net',
      'https://static.zucks.net.zimg.jp',
    ],
  },

  'baidu': {
    prefetch: 'https://dup.baidustatic.com/js/dm.js',
    renderStartImplemented: true,
  },

  'sulvo': {},
});

export {adConfig};
