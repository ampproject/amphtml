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

/** @externs */

// HACK. Define application types used in default AMP externs
// that are not in the 3p code.
/** @constructor */
function BaseElement$$module$src$base_element() {};
/** @constructor */
function AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler() {};
/** @constructor */
function AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl() {};
/** @constructor */
function AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a() {};
/** @constructor */
function AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui() {};

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
data.tweetid

//mathml.js
data.formula
var mathjax
mathjax.Hub
mathjax.Hub.Queue
window.MathJax

//3d-gltf/index.js
var THREE;

THREE.LoaderUtils
THREE.LoaderUtils.decodeText
THREE.LoaderUtils.extractUrlBase

/** @constructor 
 * @param {JsonObject=} opts
 * */
THREE.WebGLRenderer = function WebGLRenderer(opts) {};
THREE.WebGLRenderer.prototype.domElement
THREE.WebGLRenderer.prototype.setSize
THREE.WebGLRenderer.prototype.setPixelRatio

THREE.Light = class extends THREE.Object3D {};
THREE.Light.prototype.distance
THREE.Light.prototype.decay
THREE.Light.prototype.angle
THREE.Light.prototype.intensity
THREE.PointLight = class extends THREE.Light {};
THREE.SpotLight = class extends THREE.Light {};
THREE.DirectionalLight = class extends THREE.Light {};
THREE.AmbientLight = class extends THREE.Light {};

THREE.Box3 = class {};
THREE.Box3.prototype.getSize
THREE.Box3.prototype.getCenter
THREE.Box3.prototype.setFromObject
THREE.Box3.prototype.min
THREE.Box3.prototype.max

THREE.EventDispatcher = class {};
THREE.EventDispatcher.prototype.dispatchEvent;

THREE.Quaternion = class {};
THREE.Quaternion.prototype.copy
THREE.Quaternion.prototype.dot
THREE.Quaternion.prototype.setFromUnitVectors

THREE.MOUSE
THREE.MOUSE.LEFT
THREE.MOUSE.RIGHT
THREE.MOUSE.MIDDLE

THREE.Vector3 = class {
  /** @param {number=} opt_x
   * @param {number=} opt_y
   * @param {number=} opt_z */
  constructor(opt_x, opt_y, opt_z) {}
};
THREE.Vector3.prototype.lerpVectors
THREE.Vector3.prototype.copy
THREE.Vector3.prototype.clone
THREE.Vector3.prototype.subVectors
THREE.Vector3.prototype.multiplyScalar
THREE.Vector3.prototype.setFromMatrixColumn
THREE.Vector3.prototype.add
THREE.Vector3.prototype.set
THREE.Vector3.prototype.applyQuaternion
THREE.Vector3.prototype.setFromSpherical
THREE.Vector3.prototype.distanceToSquared
THREE.Vector3.prototype.length
THREE.Vector3.prototype.fromArray

THREE.ShaderLib;

THREE.Spherical = class {};
THREE.Spherical.prototype.phi
THREE.Spherical.prototype.theta
THREE.Spherical.prototype.radius

THREE.Spherical.prototype.set
THREE.Spherical.prototype.setFromVector3
THREE.Spherical.prototype.makeSafe

THREE.Vector2 = class {};
THREE.Vector2.prototype.copy
THREE.Vector2.prototype.x
THREE.Vector2.prototype.y
THREE.Vector2.prototype.set
THREE.Vector2.prototype.subVectors

THREE.Object3D = class {
  constructor() {
    this.name = '';
    this.uuid = '';
    this.matrix = new THREE.Matrix4();
    this.matrixWorld = new THREE.Matrix4();
    this.position = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(0, 0, 0);
    this.quaternion = new THREE.Quaternion();
    this.up = new THREE.Vector3();
    this.material = new THREE.Material();
    this.isMesh = false;
    this.isGroup = false;
    this.children = [];
    this.onBeforeRender = () => {};}};

THREE.Object3D.prototype.applyMatrix
THREE.Object3D.prototype.add
THREE.Object3D.prototype.updateMatrixWorld
THREE.Object3D.prototype.lookAt
THREE.Object3D.prototype.clone

THREE.Scene = class extends THREE.Object3D {};
THREE.Group = class extends THREE.Object3D {};
THREE.Points = class extends THREE.Object3D {};

THREE.Mesh = class extends THREE.Object3D {
  constructor(opt_geom, opt_mat) {
    super();
    /** @type {Array<number>} */
    this.morphTargetInfluences = [];
    /** @type {Object.<string, number>} */
    this.morphTargetDictionary = {};
    this.geometry = new THREE.BufferGeometry();}};
THREE.Mesh.prototype.updateMorphTargets;
THREE.SkinnedMesh = class extends THREE.Mesh {};

THREE.BufferGeometry = class {
  constructor() {
    /** @type {Object.<string, THREE.BufferAttribute>} */ this.attributes = {};
    /** @type {Object.<string, THREE.BufferAttribute>} */ this.morphAttributes = {};}};
THREE.BufferGeometry.prototype.addAttribute
THREE.BufferGeometry.prototype.setIndex

THREE.BufferAttribute = class {
  constructor() {
    this.count = 0;
    this.itemSize = 0;
    this.array = [];
    this.normalized = false;
    this.isInterleavedBufferAttribute = false;}};
THREE.BufferAttribute.prototype.setXYZ
THREE.BufferAttribute.prototype.setArray
THREE.BufferAttribute.prototype.getX
THREE.BufferAttribute.prototype.setX
THREE.BufferAttribute.prototype.getY
THREE.BufferAttribute.prototype.setY
THREE.BufferAttribute.prototype.getZ
THREE.BufferAttribute.prototype.setZ
THREE.BufferAttribute.prototype.getW
THREE.BufferAttribute.prototype.setW
THREE.BufferAttribute.prototype.clone

THREE.InterleavedBuffer = class {};
THREE.InterleavedBufferAttribute = class extends THREE.BufferAttribute {};

THREE.Uniform = class {};
THREE.Uniform.prototype.value

THREE.AnimationClip
THREE.Bone
THREE.Skeleton

THREE.Camera = class extends THREE.Object3D {
  constructor() {
    super();
    this.fov = 0;
    this.aspect = 0;
    this.zoom = 0;}
  updateProjectionMatrix() {}};

THREE.Camera.prototype.setFromUnitVectors

THREE.PerspectiveCamera = class extends THREE.Camera {};
THREE.OrthographicCamera = class extends THREE.Camera {};

THREE.Material = class {
  constructor() {
    this.morphTargets = false;
    this.morphNormals = false;
    this.isGLTFSpecularGlossinessMaterial = false;}};
THREE.PointsMaterial = class extends THREE.Material {};
THREE.MeshBasicMaterial = class extends THREE.Material {};
THREE.MeshStandardMaterial = class extends THREE.Material {};
THREE.ShaderMaterial = class extends THREE.Material {};
THREE.LineBasicMaterial = class extends THREE.Material {};

THREE.LineLoop = class {};
THREE.Line = class {};
THREE.LineSegments = class {};

THREE.NufferGeometry = class {};

THREE.Color = class {};
THREE.Color.prototype.fromArray
THREE.Color.prototype.setHex

THREE.VertexColors
THREE.TriangleStripDrawMode
THREE.TriangleFanDrawMode

THREE.PropertyBinding
THREE.PropertyBinding.sanitizeNodeName

THREE.Skeleton
THREE.Matrix4

THREE.DefaultLoadingManager
THREE.Loader
THREE.Loader.Handlers
THREE.FileLoader = class {};
THREE.FileLoader.prototype.setResponseType
THREE.TextureLoader = class extends THREE.FileLoader {};

THREE.NearestFilter
THREE.LinearFilter
THREE.NearestMipMapFilter
THREE.NearestMipMapLinearFilter
THREE.NearestMipMapNearestFilter
THREE.LinearMipMapNearestFilter
THREE.LinearMipMapLinearFilter

THREE.ClampToEdgeWrapping
THREE.MirroredRepeatWrapping
THREE.RepeatWrapping

THREE.AlphaFormat
THREE.RGBAFormat
THREE.RGBFormat
THREE.LuminanceFormat
THREE.LuminanceAlphaFormat

THREE.UnsignedByteType
THREE.UnsignedShort4444Type
THREE.UnsignedShort5551Type
THREE.UnsignedShort565Type

THREE.InterpolateLinear
THREE.InterpolateDiscrete

THREE.sRGBEncoding

THREE.FrontSide
THREE.BackSide
THREE.DoubleSide

THREE.KeyframeTrack = class {
  constructor() {
    this.times = 0;}};
THREE.KeyframeTrack.prototype.getValueSize;
THREE.VectorKeyframeTrack = class extends THREE.KeyframeTrack {};
THREE.QuaternionKeyframeTrack = class extends THREE.KeyframeTrack {};
THREE.NumberKeyframeTrack = class extends THREE.KeyframeTrack {};

THREE.AnimationUtils
THREE.AnimationUtils.arraySlice

THREE.Math
THREE.Math.radToDeg

THREE.UniformsUtils
THREE.UniformsUtils.clone

THREE.Interpolant = class {
  constructor() {
    this.sampleValues = [];
  }};
THREE.Interpolant.prototype.resultBuffer
THREE.Interpolant.prototype.valueSize

THREE.InterpolateSmooth

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
data.categoryExclusions.length;;
data.cookieOptions;
data.tagForChildDirectedTreatment;
data.targeting;
data.slot;

// imaVideo.js
var google;
google.ima;
google.ima.AdDisplayContainer;
google.ima.AdDisplayContainer.initialize;
google.ima.ImaSdkSettings;
google.ima.ImaSdkSettings.setPlayerType;
google.ima.ImaSdkSettings.setPlayerVersion;
google.ima.AdsLoader;
google.ima.AdsLoader.getSettings;
google.ima.AdsLoader.requestAds;
google.ima.AdsManagerLoadedEvent;
google.ima.AdsManagerLoadedEvent.Type
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
google.ima.AdEvent.Type;
google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED;
google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED;
google.ima.AdsManager;
google.ima.AdsManager.setVolume;
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
data.responsive;
data.onAds;
data.onNoAds;

// amoad.js
data.sid;

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
Criteo.Log.Debug;
Criteo.CallRTA;
Criteo.ComputeDFPTargetingForAMP;
Criteo.PubTag = {};
Criteo.PubTag.Adapters = {};
Criteo.PubTag.Adapters.AMP = {};
Criteo.PubTag.Adapters.AMP.Standalone;
Criteo.PubTag.RTA = {};
Criteo.PubTag.RTA.DefaultCrtgContentName;
Criteo.PubTag.RTA.DefaultCrtgRtaCookieName
data.tagtype;
data.networkid;
data.cookiename;
data.varname;
data.zone;
data.adserver;

// distroscale.js
data.tid;

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
window.EzoicAmpAd = function(global, data) {};
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
data.positions

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

// mediaimpact.js
var asmi;
asmi.sas;
asmi.sas.call;
asmi.sas.setup;
data.site;
data.page;
data.format;
data.slot.replace;

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

// openadstream.js
data.adhost
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
var Swoop
Swoop.announcePlace

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

// zergnet.js
window.zergnetWidgetId;
data.zergid;

// _ping_.js
window.networkIntegrationDataParamForTesting;
