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
 * @fileoverview Registers all known ad network factories and then executes
 * one of them.
 *
 * This files gets minified and published to
 * https://3p.ampproject.net/$version/f.js
 */

// src/polyfills.js must be the first import.
import './polyfills'; // eslint-disable-line sort-imports-es6-autofix/sort-imports-es6

import {IntegrationAmpContext} from './ampcontext-integration';
import {dict} from '../src/utils/object.js';
import {endsWith} from '../src/string';
import {getAmpConfig, getEmbedType, getLocation} from './frame-metadata';
import {getMode} from '../src/mode';
import {getSourceUrl, isProxyOrigin, parseUrlDeprecated} from '../src/url';
import {
  initLogConstructor,
  isUserErrorMessage,
  setReportError,
  userAssert,
} from '../src/log';
import {installEmbedStateListener, manageWin} from './environment';
import {internalRuntimeVersion} from '../src/internal-version';
import {parseJson} from '../src/json';
import {register, run, setExperimentToggles} from './3p';
import {startsWith} from '../src/string.js';
import {urls} from '../src/config';

// 3P - please keep in alphabetic order
import {beopinion} from './beopinion';
import {bodymovinanimation} from './bodymovinanimation';
import {embedly} from './embedly';
import {facebook} from './facebook';
import {github} from './github';
import {gltfViewer} from './3d-gltf/index';
import {mathml} from './mathml';
import {reddit} from './reddit';
import {twitter} from './twitter';
import {viqeoplayer} from './viqeoplayer';
import {yotpo} from './yotpo';

import {_ping_} from '../ads/_ping_';

// 3P Ad Networks - please keep in alphabetic order
import {_1wo} from '../ads/1wo';
import {_24smi} from '../ads/24smi';
import {a8} from '../ads/a8';
import {a9} from '../ads/a9';
import {accesstrade} from '../ads/accesstrade';
import {adagio} from '../ads/adagio';
import {adblade, industrybrains} from '../ads/adblade';
import {adbutler} from '../ads/adbutler';
import {adform} from '../ads/adform';
import {adfox} from '../ads/adfox';
import {adgeneration} from '../ads/adgeneration';
import {adglare} from '../ads/adglare';
import {adhese} from '../ads/adhese';
import {adincube} from '../ads/adincube';
import {adition} from '../ads/adition';
import {adman} from '../ads/adman';
import {admanmedia} from '../ads/admanmedia';
import {admixer} from '../ads/admixer';
import {adocean} from '../ads/adocean';
import {adop} from '../ads/adop';
import {adpicker} from '../ads/adpicker';
import {adplugg} from '../ads/adplugg';
import {adpon} from '../ads/adpon';
import {adreactor} from '../ads/adreactor';
import {adsensor} from '../ads/adsensor';
import {adservsolutions} from '../ads/adservsolutions';
import {adsloom} from '../ads/adsloom';
import {adsnative} from '../ads/adsnative';
import {adspeed} from '../ads/adspeed';
import {adspirit} from '../ads/adspirit';
import {adstir} from '../ads/adstir';
import {adstyle} from '../ads/adstyle';
import {adtech} from '../ads/adtech';
import {adthrive} from '../ads/adthrive';
import {adunity} from '../ads/adunity';
import {aduptech} from '../ads/aduptech';
import {adventive} from '../ads/adventive';
import {adverline} from '../ads/adverline';
import {adverticum} from '../ads/adverticum';
import {advertserve} from '../ads/advertserve';
import {adyoulike} from '../ads/adyoulike';
import {affiliateb} from '../ads/affiliateb';
import {aja} from '../ads/aja';
import {amoad} from '../ads/amoad';
import {aniview} from '../ads/aniview';
import {anyclip} from '../ads/anyclip';
import {appnexus} from '../ads/appnexus';
import {appvador} from '../ads/appvador';
import {atomx} from '../ads/atomx';
import {baidu} from '../ads/baidu';
import {beaverads} from '../ads/beaverads';
import {bidtellect} from '../ads/bidtellect';
import {blade} from '../ads/blade';
import {brainy} from '../ads/brainy';
import {bringhub} from '../ads/bringhub';
import {broadstreetads} from '../ads/broadstreetads';
import {byplay} from '../ads/byplay';
import {caajainfeed} from '../ads/caajainfeed';
import {capirs} from '../ads/capirs';
import {caprofitx} from '../ads/caprofitx';
import {cedato} from '../ads/cedato';
import {chargeads, nws} from '../ads/nws';
import {colombia} from '../ads/colombia';
import {conative} from '../ads/conative';
import {connatix} from '../ads/connatix';
import {contentad} from '../ads/contentad';
import {criteo} from '../ads/criteo';
import {csa} from '../ads/google/csa';
import {dable} from '../ads/dable';
import {directadvert} from '../ads/directadvert';
import {distroscale} from '../ads/distroscale';
import {dotandads} from '../ads/dotandads';
import {dynad} from '../ads/dynad';
import {eadv} from '../ads/eadv';
import {eas} from '../ads/eas';
import {empower} from '../ads/empower';
import {engageya} from '../ads/engageya';
import {epeex} from '../ads/epeex';
import {eplanning} from '../ads/eplanning';
import {ezoic} from '../ads/ezoic';
import {f1e} from '../ads/f1e';
import {f1h} from '../ads/f1h';
import {felmat} from '../ads/felmat';
import {firstimpression} from '../ads/firstimpression';
import {flite} from '../ads/flite';
import {fluct} from '../ads/fluct';
import {forkmedia} from '../ads/forkmedia';
import {freewheel} from '../ads/freewheel';
import {fusion} from '../ads/fusion';
import {genieessp} from '../ads/genieessp';
import {giraff} from '../ads/giraff';
import {glomex} from '../ads/glomex';
import {gmossp} from '../ads/gmossp';
import {gumgum} from '../ads/gumgum';
import {holder} from '../ads/holder';
import {ibillboard} from '../ads/ibillboard';
import {idealmedia} from '../ads/idealmedia';
import {imaVideo} from '../ads/google/imaVideo';
import {imedia} from '../ads/imedia';
import {imobile} from '../ads/imobile';
import {imonomy} from '../ads/imonomy';
import {improvedigital} from '../ads/improvedigital';
import {inmobi} from '../ads/inmobi';
import {innity} from '../ads/innity';
import {insticator} from '../ads/insticator';
import {invibes} from '../ads/invibes';
import {iprom} from '../ads/iprom';
import {ix} from '../ads/ix';
import {jubna} from '../ads/jubna';
import {kargo} from '../ads/kargo';
import {kiosked} from '../ads/kiosked';
import {kixer} from '../ads/kixer';
import {kuadio} from '../ads/kuadio';
import {lentainform} from '../ads/lentainform';
import {ligatus} from '../ads/ligatus';
import {lockerdome} from '../ads/lockerdome';
import {logly} from '../ads/logly';
import {loka} from '../ads/loka';
import {macaw} from '../ads/macaw';
import {mads} from '../ads/mads';
import {mantisDisplay, mantisRecommend} from '../ads/mantis';
import {marfeel} from '../ads/marfeel';
import {mediaad} from '../ads/mediaad';
import {medianet} from '../ads/medianet';
import {mediavine} from '../ads/mediavine';
import {medyanet} from '../ads/medyanet';
import {meg} from '../ads/meg';
import {mgid} from '../ads/mgid';
import {microad} from '../ads/microad';
import {miximedia} from '../ads/miximedia';
import {mixpo} from '../ads/mixpo';
import {monetizer101} from '../ads/monetizer101';
import {mox} from '../ads/mox';
import {my6sense} from '../ads/my6sense';
import {mytarget} from '../ads/mytarget';
import {mywidget} from '../ads/mywidget';
import {nativeroll} from '../ads/nativeroll';
import {nativery} from '../ads/nativery';
import {nativo} from '../ads/nativo';
import {navegg} from '../ads/navegg';
import {nend} from '../ads/nend';
import {netletix} from '../ads/netletix';
import {noddus} from '../ads/noddus';
import {nokta} from '../ads/nokta';
import {oblivki} from '../ads/oblivki';
import {onead} from '../ads/onead';
import {onnetwork} from '../ads/onnetwork';
import {openadstream} from '../ads/openadstream';
import {openx} from '../ads/openx';
import {opinary} from '../ads/opinary';
import {outbrain} from '../ads/outbrain';
import {pixels} from '../ads/pixels';
import {playstream} from '../ads/playstream';
import {plista} from '../ads/plista';
import {polymorphicads} from '../ads/polymorphicads';
import {popin} from '../ads/popin';
import {postquare} from '../ads/postquare';
import {ppstudio} from '../ads/ppstudio';
import {pressboard} from '../ads/pressboard';
import {promoteiq} from '../ads/promoteiq';
import {pubexchange} from '../ads/pubexchange';
import {pubguru} from '../ads/pubguru';
import {pubmatic} from '../ads/pubmatic';
import {pubmine} from '../ads/pubmine';
import {puffnetwork} from '../ads/puffnetwork';
import {pulsepoint} from '../ads/pulsepoint';
import {purch} from '../ads/purch';
import {quoraad} from '../ads/quoraad';
import {rakutenunifiedads} from '../ads/rakutenunifiedads';
import {rbinfox} from '../ads/rbinfox';
import {readmo} from '../ads/readmo';
import {realclick} from '../ads/realclick';
import {recomad} from '../ads/recomad';
import {recreativ} from '../ads/recreativ';
import {relap} from '../ads/relap';
import {relappro} from '../ads/relappro';
import {revcontent} from '../ads/revcontent';
import {revjet} from '../ads/revjet';
import {rfp} from '../ads/rfp';
import {rnetplus} from '../ads/rnetplus';
import {rubicon} from '../ads/rubicon';
import {runative} from '../ads/runative';
import {sas} from '../ads/sas';
import {seedingalliance} from '../ads/seedingalliance';
import {sekindo} from '../ads/sekindo';
import {sharethrough} from '../ads/sharethrough';
import {shemedia} from '../ads/shemedia';
import {sklik} from '../ads/sklik';
import {slimcutmedia} from '../ads/slimcutmedia';
import {smartadserver} from '../ads/smartadserver';
import {smartclip} from '../ads/smartclip';
import {smi2} from '../ads/smi2';
import {smilewanted} from '../ads/smilewanted';
import {sogouad} from '../ads/sogouad';
import {sona} from '../ads/sona';
import {sortable} from '../ads/sortable';
import {sovrn} from '../ads/sovrn';
import {speakol} from '../ads/speakol';
import {spotx} from '../ads/spotx';
import {springAds} from '../ads/springAds';
import {ssp} from '../ads/ssp';
import {strossle} from '../ads/strossle';
import {sulvo} from '../ads/sulvo';
import {sunmedia} from '../ads/sunmedia';
import {svknative} from '../ads/svknative';
import {swoop} from '../ads/swoop';
import {taboola} from '../ads/taboola';
import {tcsemotion} from '../ads/tcsemotion';
import {teads} from '../ads/teads';
import {temedya} from '../ads/temedya';
import {torimochi} from '../ads/torimochi';
import {tracdelight} from '../ads/tracdelight';
import {triplelift} from '../ads/triplelift';
import {trugaze} from '../ads/trugaze';
import {uas} from '../ads/uas';
import {ucfunnel} from '../ads/ucfunnel';
import {unruly} from '../ads/unruly';
import {uzou} from '../ads/uzou';
import {valuecommerce} from '../ads/valuecommerce';
import {vdoai} from '../ads/vdoai';
import {videointelligence} from '../ads/videointelligence';
import {videonow} from '../ads/videonow';
import {viralize} from '../ads/viralize';
import {vmfive} from '../ads/vmfive';
import {webediads} from '../ads/webediads';
import {weboramaDisplay} from '../ads/weborama';
import {whopainfeed} from '../ads/whopainfeed';
import {widespace} from '../ads/widespace';
import {wisteria} from '../ads/wisteria';
import {wpmedia} from '../ads/wpmedia';
import {xlift} from '../ads/xlift';
import {yahoo} from '../ads/yahoo';
import {yahoofedads} from '../ads/yahoofedads';
import {yahoojp} from '../ads/yahoojp';
import {yahoonativeads} from '../ads/yahoonativeads';
import {yandex} from '../ads/yandex';
import {yektanet} from '../ads/yektanet';
import {yengo} from '../ads/yengo';
import {yieldbot} from '../ads/yieldbot';
import {yieldmo} from '../ads/yieldmo';
import {yieldone} from '../ads/yieldone';
import {yieldpro} from '../ads/yieldpro';
import {zedo} from '../ads/zedo';
import {zen} from '../ads/zen';
import {zergnet} from '../ads/zergnet';
import {zucks} from '../ads/zucks';

/**
 * Whether the embed type may be used with amp-embed tag.
 * @const {!Object<string, boolean>}
 */
const AMP_EMBED_ALLOWED = {
  _ping_: true,
  '1wo': true,
  '24smi': true,
  adsloom: true,
  adstyle: true,
  bringhub: true,
  dable: true,
  engageya: true,
  epeex: true,
  firstimpression: true,
  forkmedia: true,
  glomex: true,
  idealmedia: true,
  insticator: true,
  jubna: true,
  kuadio: true,
  'mantis-recommend': true,
  mediaad: true,
  mgid: true,
  miximedia: true,
  mywidget: true,
  nativery: true,
  lentainform: true,
  opinary: true,
  outbrain: true,
  plista: true,
  postquare: true,
  ppstudio: true,
  pubexchange: true,
  rbinfox: true,
  readmo: true,
  recreativ: true,
  runative: true,
  smartclip: true,
  smi2: true,
  speakol: true,
  strossle: true,
  svknative: true,
  strossle: true,
  taboola: true,
  temedya: true,
  whopainfeed: true,
  yahoofedads: true,
  yahoonativeads: true,
  yektanet: true,
  zen: true,
  zergnet: true,
};

init(window);

if (getMode().test || getMode().localDev) {
  register('_ping_', _ping_);
}

// Keep the list in alphabetic order
register('1wo', _1wo);
register('24smi', _24smi);
register('3d-gltf', gltfViewer);
register('a8', a8);
register('a9', a9);
register('accesstrade', accesstrade);
register('adagio', adagio);
register('adblade', adblade);
register('adbutler', adbutler);
register('adform', adform);
register('adfox', adfox);
register('adgeneration', adgeneration);
register('adglare', adglare);
register('adhese', adhese);
register('adincube', adincube);
register('adition', adition);
register('adman', adman);
register('admanmedia', admanmedia);
register('admixer', admixer);
register('adocean', adocean);
register('adop', adop);
register('adpicker', adpicker);
register('adplugg', adplugg);
register('adpon', adpon);
register('adreactor', adreactor);
register('adsensor', adsensor);
register('adservsolutions', adservsolutions);
register('adsloom', adsloom);
register('adsnative', adsnative);
register('adspeed', adspeed);
register('adspirit', adspirit);
register('adstir', adstir);
register('adstyle', adstyle);
register('adtech', adtech);
register('adthrive', adthrive);
register('adunity', adunity);
register('aduptech', aduptech);
register('adventive', adventive);
register('adverline', adverline);
register('adverticum', adverticum);
register('advertserve', advertserve);
register('adyoulike', adyoulike);
register('affiliateb', affiliateb);
register('aja', aja);
register('amoad', amoad);
register('aniview', aniview);
register('anyclip', anyclip);
register('appnexus', appnexus);
register('appvador', appvador);
register('atomx', atomx);
register('baidu', baidu);
register('beaverads', beaverads);
register('beopinion', beopinion);
register('bidtellect', bidtellect);
register('blade', blade);
register('bodymovinanimation', bodymovinanimation);
register('brainy', brainy);
register('bringhub', bringhub);
register('broadstreetads', broadstreetads);
register('byplay', byplay);
register('caajainfeed', caajainfeed);
register('capirs', capirs);
register('caprofitx', caprofitx);
register('cedato', cedato);
register('chargeads', chargeads);
register('colombia', colombia);
register('conative', conative);
register('connatix', connatix);
register('contentad', contentad);
register('criteo', criteo);
register('csa', csa);
register('dable', dable);
register('directadvert', directadvert);
register('distroscale', distroscale);
register('dotandads', dotandads);
register('dynad', dynad);
register('eadv', eadv);
register('eas', eas);
register('embedly', embedly);
register('empower', empower);
register('engageya', engageya);
register('epeex', epeex);
register('eplanning', eplanning);
register('ezoic', ezoic);
register('f1e', f1e);
register('f1h', f1h);
register('facebook', facebook);
register('felmat', felmat);
register('firstimpression', firstimpression);
register('flite', flite);
register('fluct', fluct);
register('forkmedia', forkmedia);
register('freewheel', freewheel);
register('fusion', fusion);
register('genieessp', genieessp);
register('giraff', giraff);
register('github', github);
register('glomex', glomex);
register('gmossp', gmossp);
register('gumgum', gumgum);
register('holder', holder);
register('ibillboard', ibillboard);
register('idealmedia', idealmedia);
register('ima-video', imaVideo);
register('imedia', imedia);
register('imobile', imobile);
register('imonomy', imonomy);
register('improvedigital', improvedigital);
register('industrybrains', industrybrains);
register('inmobi', inmobi);
register('innity', innity);
register('insticator', insticator);
register('invibes', invibes);
register('iprom', iprom);
register('ix', ix);
register('jubna', jubna);
register('kargo', kargo);
register('kiosked', kiosked);
register('kixer', kixer);
register('kuadio', kuadio);
register('lentainform', lentainform);
register('ligatus', ligatus);
register('lockerdome', lockerdome);
register('logly', logly);
register('loka', loka);
register('macaw', macaw);
register('mads', mads);
register('mantis-display', mantisDisplay);
register('mantis-recommend', mantisRecommend);
register('marfeel', marfeel);
register('mathml', mathml);
register('mediaad', mediaad);
register('medianet', medianet);
register('mediavine', mediavine);
register('medyanet', medyanet);
register('meg', meg);
register('mgid', mgid);
register('microad', microad);
register('miximedia', miximedia);
register('mixpo', mixpo);
register('monetizer101', monetizer101);
register('mox', mox);
register('my6sense', my6sense);
register('mytarget', mytarget);
register('mywidget', mywidget);
register('nativeroll', nativeroll);
register('nativery', nativery);
register('nativo', nativo);
register('navegg', navegg);
register('nend', nend);
register('netletix', netletix);
register('noddus', noddus);
register('nokta', nokta);
register('nws', nws);
register('oblivki', oblivki);
register('onead', onead);
register('onnetwork', onnetwork);
register('openadstream', openadstream);
register('openx', openx);
register('opinary', opinary);
register('outbrain', outbrain);
register('pixels', pixels);
register('playstream', playstream);
register('plista', plista);
register('polymorphicads', polymorphicads);
register('popin', popin);
register('postquare', postquare);
register('ppstudio', ppstudio);
register('pressboard', pressboard);
register('promoteiq', promoteiq);
register('pubexchange', pubexchange);
register('pubguru', pubguru);
register('pubmatic', pubmatic);
register('pubmine', pubmine);
register('puffnetwork', puffnetwork);
register('pulsepoint', pulsepoint);
register('purch', purch);
register('quoraad', quoraad);
register('rakutenunifiedads', rakutenunifiedads);
register('rbinfox', rbinfox);
register('readmo', readmo);
register('realclick', realclick);
register('reddit', reddit);
register('recomad', recomad);
register('recreativ', recreativ);
register('relap', relap);
register('relappro', relappro);
register('revcontent', revcontent);
register('revjet', revjet);
register('rfp', rfp);
register('rnetplus', rnetplus);
register('rubicon', rubicon);
register('runative', runative);
register('sas', sas);
register('seedingalliance', seedingalliance);
register('sekindo', sekindo);
register('sharethrough', sharethrough);
register('shemedia', shemedia);
register('sklik', sklik);
register('ssp', ssp);
register('slimcutmedia', slimcutmedia);
register('smartadserver', smartadserver);
register('smartclip', smartclip);
register('smi2', smi2);
register('smilewanted', smilewanted);
register('sogouad', sogouad);
register('sortable', sortable);
register('sona', sona);
register('sovrn', sovrn);
register('spotx', spotx);
register('springAds', springAds);
register('strossle', strossle);
register('sulvo', sulvo);
register('sunmedia', sunmedia);
register('svknative', svknative);
register('swoop', swoop);
register('taboola', taboola);
register('tcsemotion', tcsemotion);
register('teads', teads);
register('temedya', temedya);
register('torimochi', torimochi);
register('tracdelight', tracdelight);
register('triplelift', triplelift);
register('trugaze', trugaze);
register('twitter', twitter);
register('uas', uas);
register('ucfunnel', ucfunnel);
register('unruly', unruly);
register('uzou', uzou);
register('valuecommerce', valuecommerce);
register('vdoai', vdoai);
register('videointelligence', videointelligence);
register('videonow', videonow);
register('viqeoplayer', viqeoplayer);
register('viralize', viralize);
register('vmfive', vmfive);
register('webediads', webediads);
register('weborama-display', weboramaDisplay);
register('whopainfeed', whopainfeed);
register('widespace', widespace);
register('wisteria', wisteria);
register('wpmedia', wpmedia);
register('xlift', xlift);
register('yahoo', yahoo);
register('yahoofedads', yahoofedads);
register('yahoojp', yahoojp);
register('yahoonativeads', yahoonativeads);
register('yandex', yandex);
register('yektanet', yektanet);
register('yengo', yengo);
register('yieldbot', yieldbot);
register('yieldmo', yieldmo);
register('yieldone', yieldone);
register('yieldpro', yieldpro);
register('yotpo', yotpo);
register('zedo', zedo);
register('zen', zen);
register('zergnet', zergnet);
register('zucks', zucks);
register('speakol', speakol);

// For backward compat, we always allow these types without the iframe
// opting in.
const defaultAllowedTypesInCustomFrame = [
  // Entries must be reasonably safe and not allow overriding the injected
  // JS URL.
  // Each custom iframe can override this through the second argument to
  // draw3p. See amp-ad docs.
  'facebook',
  'twitter',
  'doubleclick',
  'yieldbot',
  '_ping_',
];

/**
 * Initialize 3p frame.
 * @param {!Window} win
 */
function init(win) {
  initLogConstructor();
  const config = getAmpConfig();

  // Overriding to short-circuit src/mode#getMode()
  win.__AMP_MODE = config.mode;

  setReportError(console.error.bind(console));

  setExperimentToggles(config.experimentToggles);
}

/**
 * Visible for testing.
 * Draws a 3p embed to the window. Expects the data to include the 3p type.
 * @param {!Window} win
 * @param {!Object} data
 * @param {function(!Object, function(!Object))|undefined} configCallback
 *     Optional callback that allows user code to manipulate the incoming
 *     configuration. See
 *     https://github.com/ampproject/amphtml/issues/1210 for some context
 *     on this.
 */
export function draw3p(win, data, configCallback) {
  const type = data['type'];

  userAssert(
    isTagNameAllowed(type, win.context.tagName),
    'Embed type %s not allowed with tag %s',
    type,
    win.context.tagName
  );
  if (configCallback) {
    configCallback(data, (data) => {
      userAssert(data, 'Expected configuration to be passed as first argument');
      run(type, win, data);
    });
  } else {
    run(type, win, data);
  }
}

/**
 * Draws an embed, optionally synchronously, to the DOM.
 * @param {function(!Object, function(!Object))} opt_configCallback If provided
 *     will be invoked with two arguments:
 *     1. The configuration parameters supplied to this embed.
 *     2. A callback that MUST be called for rendering to proceed. It takes
 *        no arguments. Configuration is expected to be modified in-place.
 * @param {!Array<string>=} opt_allowed3pTypes List of advertising network
 *     types you expect.
 * @param {!Array<string>=} opt_allowedEmbeddingOrigins List of domain suffixes
 *     that are allowed to embed this frame.
 */
window.draw3p = function (
  opt_configCallback,
  opt_allowed3pTypes,
  opt_allowedEmbeddingOrigins
) {
  try {
    const location = getLocation();

    ensureFramed(window);
    validateParentOrigin(window, location);
    validateAllowedTypes(window, getEmbedType(), opt_allowed3pTypes);
    if (opt_allowedEmbeddingOrigins) {
      validateAllowedEmbeddingOrigins(window, opt_allowedEmbeddingOrigins);
    }
    window.context = new IntegrationAmpContext(window);
    manageWin(window);
    installEmbedStateListener();

    // Ugly type annotation is due to Event.prototype.data being denylisted
    // and the compiler not being able to discern otherwise
    // TODO(alanorozco): Do this more elegantly once old impl is cleaned up.
    draw3p(
      window,
      /** @type {!IntegrationAmpContext} */ (window.context).data || {},
      opt_configCallback
    );

    window.context.bootstrapLoaded();
  } catch (e) {
    if (window.context && window.context.report3pError) {
      // window.context has initiated yet
      if (e.message && isUserErrorMessage(e.message)) {
        // report user error to parent window
        window.context.report3pError(e);
      }
    }

    const c = window.context || {mode: {test: false}};
    if (!c.mode.test) {
      lightweightErrorReport(e, c.canary);
      throw e;
    }
  }
};

/**
 * Throws if the current frame's parent origin is not equal to
 * the claimed origin.
 * Only check for browsers that support ancestorOrigins
 * @param {!Window} window
 * @param {!Location} parentLocation
 * @visibleForTesting
 */
export function validateParentOrigin(window, parentLocation) {
  const ancestors = window.location.ancestorOrigins;
  // Currently only webkit and blink based browsers support
  // ancestorOrigins. In that case we proceed but mark the origin
  // as non-validated.
  if (!ancestors || !ancestors.length) {
    return;
  }
  userAssert(
    ancestors[0] == parentLocation.origin,
    'Parent origin mismatch: %s, %s',
    ancestors[0],
    parentLocation.origin
  );
}

/**
 * Check that this iframe intended this particular ad type to run.
 * @param {!Window} window
 * @param {string} type 3p type
 * @param {!Array<string>|undefined} allowedTypes May be undefined.
 * @visibleForTesting
 */
export function validateAllowedTypes(window, type, allowedTypes) {
  const thirdPartyHost = parseUrlDeprecated(urls.thirdParty).hostname;

  // Everything allowed in default iframe.
  if (window.location.hostname == thirdPartyHost) {
    return;
  }
  if (urls.thirdPartyFrameRegex.test(window.location.hostname)) {
    return;
  }
  if (window.location.hostname == 'ads.localhost') {
    return;
  }
  if (defaultAllowedTypesInCustomFrame.indexOf(type) != -1) {
    return;
  }
  userAssert(
    allowedTypes && allowedTypes.indexOf(type) != -1,
    '3p type for custom iframe not allowed: %s',
    type
  );
}

/**
 * Check that parent host name was allowed.
 * @param {!Window} window
 * @param {!Array<string>} allowedHostnames Suffixes of allowed host names.
 * @visibleForTesting
 */
export function validateAllowedEmbeddingOrigins(window, allowedHostnames) {
  if (!window.document.referrer) {
    throw new Error('Referrer expected: ' + window.location.href);
  }
  const ancestors = window.location.ancestorOrigins;
  // We prefer the unforgable ancestorOrigins, but referrer is better than
  // nothing.
  const ancestor = ancestors ? ancestors[0] : window.document.referrer;
  let {hostname} = parseUrlDeprecated(ancestor);
  if (isProxyOrigin(ancestor)) {
    // If we are on the cache domain, parse the source hostname from
    // the referrer. The referrer is used because it should be
    // trustable.
    hostname = parseUrlDeprecated(getSourceUrl(window.document.referrer))
      .hostname;
  }
  for (let i = 0; i < allowedHostnames.length; i++) {
    // Either the hostname is allowed
    if (allowedHostnames[i] == hostname) {
      return;
    }
    // Or it ends in .$hostname (aka is a sub domain of an allowed domain.
    if (endsWith(hostname, '.' + allowedHostnames[i])) {
      return;
    }
  }
  throw new Error(
    'Invalid embedding hostname: ' + hostname + ' not in ' + allowedHostnames
  );
}

/**
 * Throws if this window is a top level window.
 * @param {!Window} window
 * @visibleForTesting
 */
export function ensureFramed(window) {
  if (window == window.parent) {
    throw new Error('Must be framed: ' + window.location.href);
  }
}

/**
 * Expects the fragment to contain JSON.
 * @param {string} fragment Value of location.fragment
 * @return {?JsonObject}
 * @visibleForTesting
 */
export function parseFragment(fragment) {
  try {
    let json = fragment.substr(1);
    // Some browser, notably Firefox produce an encoded version of the fragment
    // while most don't. Since we know how the string should start, this is easy
    // to detect.
    if (startsWith(json, '{%22')) {
      json = decodeURIComponent(json);
    }
    return /** @type {!JsonObject} */ (json ? parseJson(json) : dict());
  } catch (err) {
    return null;
  }
}

/**
 * Not all types of embeds are allowed to be used with all tag names on the
 * AMP side. This function checks whether the current usage is permissible.
 * @param {string} type
 * @param {string|undefined} tagName The tagName that was used to embed this
 *     3p-frame.
 * @return {boolean}
 */
export function isTagNameAllowed(type, tagName) {
  if (tagName == 'AMP-EMBED') {
    return !!AMP_EMBED_ALLOWED[type];
  }
  return true;
}

/**
 * Reports an error to the server. Must only be called once per page.
 * Not for use in event handlers.
 *
 * We don't use the default error in error.js handler because it has
 * too many deps for this small JS binary.
 *
 * @param {!Error} e
 * @param {boolean} isCanary
 */
function lightweightErrorReport(e, isCanary) {
  new Image().src =
    urls.errorReporting +
    '?3p=1&v=' +
    encodeURIComponent(internalRuntimeVersion()) +
    '&m=' +
    encodeURIComponent(e.message) +
    '&ca=' +
    (isCanary ? 1 : 0) +
    '&r=' +
    encodeURIComponent(document.referrer) +
    '&s=' +
    encodeURIComponent(e.stack || '');
}
