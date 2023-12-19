/** @externs */

// HACK. Define application types used in default AMP externs
// that are not in the 3p code.
/** @constructor */
function BaseElement$$module$src$base_element() {}
/** @constructor */
function AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler() {}
/** @constructor */
function AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl() {}
/** @constructor */
function AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a() {}
/** @constructor */
function AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui() {}

// Long list of, uhm, stuff the ads code needs to compile.
// All unquoted external properties need to be added here.

// Under 3p folder

// beopinion.js
data.account;
data.content;
data.name;
//data['my-content'];
window.BeOpinionSDK;

// facebook.js
data.embedAs;
data.href;

// reddit.js
data.uuid;
data.embedcreated;
data.embedparent;
data.embedlive;
data.embedtype;
data.src;

//twitter.js
data.tweetid;

//mathml.js
data.formula;
var mathjax;
mathjax.Hub;
mathjax.Hub.Config;
mathjax.Hub.Queue;
window.MathJax;

//3d-gltf/index.js
var THREE;

THREE.LoaderUtils;
THREE.LoaderUtils.extractUrlBase;

THREE.WebGLRenderer = class {
  /** @param {!JsonObject} opts */
  constructor(opts) {
    /** @type {?Element} */ this.domElement = null;
  }
};
THREE.WebGLRenderer.prototype.setSize;
THREE.WebGLRenderer.prototype.setPixelRatio;
THREE.WebGLRenderer.prototype.setClearColor;
THREE.WebGLRenderer.prototype.render;
/** @type {boolean} */
THREE.WebGLRenderer.prototype.gammaOutput;
/** @type {number} */
THREE.WebGLRenderer.prototype.gammaFactor;

THREE.Light = class extends THREE.Object3D {};
THREE.DirectionalLight = class extends THREE.Light {};
THREE.AmbientLight = class extends THREE.Light {};

THREE.Box3 = class {};
THREE.Box3.prototype.getSize;
THREE.Box3.prototype.getCenter;
THREE.Box3.prototype.setFromObject;
THREE.Box3.prototype.min;
THREE.Box3.prototype.max;

THREE.Vector3 = class {
  /** @param {number=} opt_x
   * @param {number=} opt_y
   * @param {number=} opt_z */
  constructor(opt_x, opt_y, opt_z) {}
};
THREE.Vector3.prototype.lerpVectors;
THREE.Vector3.prototype.copy;
THREE.Vector3.prototype.clone;
THREE.Vector3.prototype.subVectors;
THREE.Vector3.prototype.multiplyScalar;
THREE.Vector3.prototype.setFromMatrixColumn;
THREE.Vector3.prototype.add;
THREE.Vector3.prototype.set;
THREE.Vector3.prototype.applyQuaternion;
THREE.Vector3.prototype.setFromSpherical;
THREE.Vector3.prototype.distanceToSquared;
THREE.Vector3.prototype.length;
THREE.Vector3.prototype.fromArray;

THREE.Euler = class {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
};

THREE.Euler.prototype.set;

THREE.Object3D = class {
  constructor() {
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler();
    this.children = [];
  }
};

THREE.Object3D.prototype.applyMatrix;
THREE.Object3D.prototype.add;
THREE.Object3D.prototype.updateMatrixWorld;
THREE.Object3D.prototype.lookAt;
THREE.Object3D.prototype.clone;

THREE.OrbitControls = class {
  /** @param {THREE.Camera} camera
   * @param {Element} domElement */
  constructor(camera, domElement) {
    this.target = new THREE.Vector3();
  }
};
THREE.OrbitControls.prototype.update;
THREE.OrbitControls.prototype.addEventListener;

THREE.Scene = class extends THREE.Object3D {};
THREE.Group = class extends THREE.Object3D {};

THREE.Camera = class extends THREE.Object3D {
  constructor() {
    super();
    this.fov = 0;
    this.far = 0;
    this.near = 0;
    this.aspect = 0;
    this.zoom = 0;
  }
};
THREE.Camera.prototype.updateProjectionMatrix;
THREE.Camera.prototype.setFromUnitVectors;

THREE.PerspectiveCamera = class extends THREE.Camera {};

THREE.GLTFLoader = class {
  constructor() {
    this.crossOrigin = false;
  }
};
THREE.GLTFLoader.prototype.load;

// Under ads/google folder

// adsense.js

// csa.js
var _googCsa;
window._googCsa;

// doubleclick.js
var googletag;
window.googletag;
googletag.cmd;
googletag.cmd.push;
googletag.pubads;
googletag.defineSlot;
var pubads;
pubads.addService;
pubads.markAsGladeOptOut;
pubads.markAsAmp;
pubads.setCorrelator;
pubads.markAsGladeControl;
googletag.enableServices;
pubads.setCookieOptions;
pubads.setTagForChildDirectedTreatment;
data.slot.setCategoryExclusion;
data.slot.setTargeting;
data.slot.setAttribute;
data.useSameDomainRenderingUntilDeprecated;
data.multiSize;
data.overrideWidth;
data.width;
data.overrideHeight;
data.height;
data.multiSizeValidation;
data.categoryExclusions;
data.categoryExclusions.length;
data.cookieOptions;
data.tagForChildDirectedTreatment;
data.targeting;
data.slot;

// imaVideo.js
var google;
google.ima;
google.ima.Ad;
google.ima.Ad.getSkipTimeOffset;
google.ima.Ad.getAdPodInfo;
google.ima.AdPodInfo;
google.ima.AdPodInfo.getAdPosition;
google.ima.AdPodInfo.getTotalAds;
google.ima.AdDisplayContainer;
google.ima.AdDisplayContainer.initialize;
google.ima.ImaSdkSettings;
google.ima.ImaSdkSettings.setPlayerType;
google.ima.ImaSdkSettings.setPlayerVersion;
google.ima.AdsLoader;
google.ima.AdsLoader.getSettings;
google.ima.AdsLoader.requestAds;
google.ima.AdsManagerLoadedEvent;
google.ima.AdsManagerLoadedEvent.Type;
google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED;
google.ima.AdsManagerLoadedEvent.getAdsManager;
google.ima.AdErrorEvent;
google.ima.AdErrorEvent.Type;
google.ima.AdErrorEvent.Type.AD_ERROR;
google.ima.AdsRequest;
google.ima.ViewMode;
google.ima.ViewMode.NORMAL;
google.ima.ViewMode.FULLSCREEN;
google.ima.AdsRenderingSettings;
google.ima.UiElements;
google.ima.UiElements.AD_ATTRIBUTION;
google.ima.UiElements.COUNTDOWN;
google.ima.AdEvent;
google.ima.AdEvent.getAd;
google.ima.AdEvent.getAdData;
google.ima.AdEvent.Type;
google.ima.AdEvent.Type.AD_PROGRESS;
google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED;
google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED;
google.ima.AdEvent.Type.LOADED;
google.ima.AdEvent.Type.PAUSED;
google.ima.AdEvent.Type.RESUMED;
google.ima.AdEvent.Type.ALL_ADS_COMPLETED;
google.ima.AdsManager;
google.ima.AdsManager.getRemainingTime;
google.ima.AdsManager.setVolume;
google.ima.AdProgressData;
google.ima.AdProgressData.adPosition;
google.ima.AdProgressData.totalAds;
google.ima.settings;
google.ima.settings.setLocale;
google.ima.settings.setVpaidMode;

// 3P ads
// Please sort by alphabetic order of the ad server name to avoid conflict

// a9.js
data.aax_size;
data.aax_pubname;
data.aax_src;

// adblade.js
data.cid;

// adform.js
data.bn;
data.mid;

// adfox.js
data.bundleName;
data.adfoxParams;
data.bundleParams;
data.bundleParams.blockId;
data.bundleParams.data;

// adgeneration.js
data.option;
data.id;
data.adtype;
data.adtype.toUpperCase;
data.async;
data.async.toLowerCase;
data.displayid;
data.targetid;

// adman.js
data.ws;
data.host;
data.s;

// adpicker.js
data.ph;

// adpushup.js
window.adpushup = {};
window.adpushup.initAmp = function (
  global,
  width,
  height,
  siteid,
  slotpath,
  totalampslots,
  jsontargeting,
  extras
) {};

// andbeyond.js
window.andbeyond = {};
window.andbeyond.initAmp = function (
  global,
  width,
  height,
  siteid,
  slotpath,
  totalampslots,
  jsontargeting,
  extras
) {};

// affinity.js
window.affinity = {};
window.affinity.initAMP = function (global, data) {};
data.width;
data.height;
data.adtype;
data.adslot;
data.slot;
data.affLayout;
data.multiSize;
data.jsontargeting;
data.affSticky;
data.affTitle;
data.affJson;
data.affRtcConfig;
data.extras;

// adreactor.js
data.zid;
data.pid;
data.custom3;

// adsnative.js
data.ankv;
data.ankv.split;
data.ancat;
data.ancat.split;
data.anapiid;
data.annid;
data.anwid;
data.antid;

// adtech.js
data.atwco;
data.atwdiv;
data.atwheight;
data.atwhtnmat;
data.atwmn;
data.atwmoat;
data.atwnetid;
data.atwothat;
data.atwplid;
data.atwpolar;
data.atwsizes;
data.atwwidth;

// adthrive.js
data.siteId;

// aduptech.js
window.uAd = {};
window.uAd.embed;
data.amp;
data.responsive;
data.placementkey;
data.mincpc;
data.query;
data.pageurl;
data.gdpr;
data.gdpr_consent;
data.adtest;
data.onAds;
data.onNoAds;

// amoad.js
data.sid;

// amplified.js
data.amplified_id;
data.amplified_params;

// appnexus.js
data.tagid;
data.member;
data.code;
data.pageOpts;
data.debug;
data.adUnits;
data.target;

// adventive.js
const adventive = {};
adventive.Ad;
adventive.addArgs = () => {};
adventive.addInstance = () => {};
adventive.ads;
adventive.args;
adventive.instances;
adventive.isLibLoaded;
adventive.modes;
adventive.Plugin;
adventive.plugins;
adventive.utility;
window.adventive = adventive;

// colombia.js
data.clmb_slot;
data.clmb_position;
data.clmb_section;
data.clmb_divid;

// contentad.js
data.d;
data.wid;
data.url;

// criteo.js
var Criteo;
Criteo.DisplayAd;
data.tagtype;
data.zone;

// distroscale.js
data.tid;

// empower.js
data.category;
data.site;
data.zone;

// eplanning.js
data.epl_si;
data.epl_isv;
data.epl_sv;
data.epl_sec;
data.epl_kvs;
data.epl_e;

// ezoic.js
/**
 * @constructor
 * @param {!Window} global
 * @param {!Object} data
 */
window.EzoicAmpAd = function (global, data) {};
window.EzoicAmpAd.prototype.createAd;

// flite.js
data.guid;
data.mixins;

// fusion.js
var ev;
ev.msg;
var Fusion;
Fusion.on;
Fusion.on.warning;
Fusion.loadAds;
data.mediaZone;
data.layout;
data.space;
data.parameters;

// holder.js
data.queue;

// imedia.js
data.positions;

// imonomy.js
data.pid;
data.subId;

// improvedigital.js
data.placement;
data.optin;
data.keyvalue;

// inmobi.js
var _inmobi;
window._inmobi;
_inmobi.getNewAd;
data.siteid;
data.slotid;

// innity.js
var innity_adZone;
var innityAMPZone;
var innityAMPTag;
data.pub;
data.zone;
data.channel;

// ix.js
data.ixId;
data.ixId;
data.ixSlot;
data.ixSlot;

// kargo.js
data.options;
data.slot;

// kixer.js
data.adslot;

// mads.js
window.MADSAdrequest = {};
window.MADSAdrequest.adrequest;
data.adrequest;

// marfeel.js
data.tenant;
data.version;

// medianet.js
data.crid;
data.hasOwnProperty;
data.requrl;
data.refurl;
data.versionId;
data.timeout;

// microad.js
var MicroAd;
MicroAd.Compass;
MicroAd.Compass.showAd;
data.spot;

// mixpo.js
data.subdomain;
data.guid;
data.embedv;
data.clicktag;
data.customtarget;
data.dynclickthrough;
data.viewtracking;
data.customcss;
data.local;
data.enablemraid;
data.jsplayer;

// nativo.js
var PostRelease;
PostRelease.Start;
PostRelease.checkIsAdVisible;
var _prx;
data.delayByTime;
data.delayByTime;

// nokta.js
data.category;

// onead.js
var Guoshi;
Guoshi.queryAd;
Guoshi.queryAd.amp;
Guoshi.queryAd.amp.setup;

// openadstream.js
data.adhost;
data.sitepage;
data.pos;
data.query;

// openx.js
var OX;
OX._requestArgs;
var OX_bidder_options;
OX_bidder_options.bidderType;
OX_bidder_options.callback;
var OX_bidder_ads;
var oxRequest;
oxRequest.addAdUnit;
oxRequest.addVariable;
oxRequest.setAdSizes;
oxRequest.getOrCreateAdUnit;
var dfpData;
dfpData.dfp;
dfpData.targeting;
data.dfpSlot;
data.nc;
data.auid;

// pixels.js
var pixelsAd;
var pixelsAMPAd;
var pixelsAMPTag;
pixelsAMPTag.renderAmp;
data.origin;
data.sid;
data.tag;
data.clickTracker;
data.viewability;

// plista.js
data.widgetname;
data.publickey;
data.urlprefix;
data.item;
data.geo;
data.categories;

// pressboard.js
data.media;
data.baseUrl;

// pubguru.js
data.height;
data.publisher;
data.slot;
data.width;

// pubmatic.js
data.kadpageurl;

// pubmine.js
data.adsafe;
data.wordads;
data.section;

// pulsepoint.js
window.PulsePointHeaderTag;

// r9x.js
window.r9x = {};
window.r9x.initAmp = function (
  global,
  width,
  height,
  siteid,
  slotpath,
  totalampslots,
  jsontargeting,
  extras
) {};

// rubicon.js
data.method;
data.width;
data.height;
data.account;
data.kw;
data.visitor;
data.inventory;
data.size;
data.site;
data.zone;
data.callback;

// seedtag.js
data.adunitId;

// sharethrough.js
data.pkey;

// sklik.js
data.elm;

// smartadserver.js
var sas;
sas.callAmpAd;

// smartclip.js
data.plc;
data.sz;
data.extra;

// sortable.js
data.name;

// sovrn.js
data.domain;
data.u;
data.iid;
data.aid;
data.z;
data.tf;

// swoop.js
var Swoop;
Swoop.announcePlace;

// taboola.js
data.referrer;
data.publisher;
data.mode;

// teads.js
data.tag;
data.tag;
data.tag.tta;
data.tag.ttp;

// uas.js
var Phoenix;
window.Phoenix;
Phoenix.EQ;
Phoenix.EQ.push;
Phoenix.enableSingleRequestCallMode;
Phoenix.setInfo;
Phoenix.defineAdSlot;
Phoenix.display;
data.accId;
data.adUnit;
data.targetings;
data.extraParams;
data.slot.setVisibility;
data.slot.setTargeting;
data.slot.setExtraParameters;

// webediads.js
var wads;
wads.init;
data.position;

// weborama.js
data.wbo_account_id;
data.wbo_customparameter;
data.wbo_tracking_element_id;
data.wbo_host;
data.wbo_fullhost;
data.wbo_bid_price;
data.wbo_price_paid;
data.wbo_random;
data.wbo_debug;
data.wbo_publisherclick;
data.wbo_disable_unload_event;
data.wbo_donottrack;
data.wbo_script_variant;
data.wbo_is_mobile;
data.wbo_vars;
data.wbo_weak_encoding;

// yandex.js
var Ya;
Ya.Context;
Ya.Context.AdvManager;
Ya.Context.AdvManager.render;
Ya.adfoxCode;
Ya.adfoxCode.onRender;
data.isAdfox;

// yieldbot.js
var yieldbot;
yieldbot.psn;
yieldbot.enableAsync;
yieldbot.defineSlot;
yieldbot.go;
yieldbot.nextPageview;
yieldbot.getSlotCriteria;
data.psn;
data.ybSlot;

// yieldmo.js
data.ymid;

// zedo.js
var ZGTag;
var geckoTag;
var placement;
geckoTag.setAMP;
geckoTag.addPlacement;
placement.includeRenderer;
geckoTag.loadAds;
geckoTag.placementReady;
data.charset;
data.superId;
data.network;
data.placementId;
data.channel;
data.publisher;
data.dim;
data.renderer;

// zen.js
var YandexZen;
YandexZen.renderWidget;
data.clid;
data.successCalback;
data.failCallback;

// zergnet.js
window.zergnetWidgetId;
data.zergid;

// _ping_.js
window.networkIntegrationDataParamForTesting;
