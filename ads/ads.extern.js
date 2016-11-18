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
data.cid;
data.bn;
data.mid;
data.ws;
data.s;
data.sid;
data.client;
data.zid;
data.pid;
data.custom3;
window.uAd = {};
window.uAd.embed;
data.pageOpts;
data.adUnits;
data.clmb_slot;
data.clmb_position;
data.clmb_divid;
data.clmb_section;
data.epl_si;
data.epl_isv;
data.epl_sv;
data.epl_sec;
data.epl_ksv;
data.epl_kvs;
data.epl_e;
data.guid;
data.adslot;

var Criteo;
Criteo.DisplayAd;
Criteo.Log.Debug;
Criteo.CallRTA;
Criteo.ComputeDFPTargetingForAMP;
Criteo.PubTag = {};
Criteo.PubTag.RTA = {};
Criteo.PubTag.RTA.DefaultCrtgContentName;
Criteo.PubTag.RTA.DefaultCrtgRtaCookieName
data.varname;
data.tagtype;
data.cookiename;;
data.networkid;;
data.zone;
data.adserver;
data.slot;
data.width;
data.height;

var googletag;
window.googletag;
googletag.cmd;
googletag.cmd.push;
googletag.pubads;
googletag.defineSlot
data.slot;

var _inmobi;
window._inmobi;
_inmobi.getNewAd;
data.siteid;
data.slotid;

var pubads;
pubads.addService;
pubads.markAsGladeOptOut;
pubads.markAsAmp;
pubads.setCorrelator;
pubads.markAsGladeControl;
googletag.enableServices;
data.slot.setCategoryExclusion;
pubads.setCookieOptions;
pubads.setTagForChildDirectedTreatment;
data.slot.setTargeting;
data.slot.setAttribute;
data.optin;
data.keyvalue;
var asmi;
asmi.sas;
asmi.sas.call;
asmi.sas.setup;
data.spot;
var MicroAd;
MicroAd.Compass;
MicroAd.Compass.showAd;
data.adhost
data.pos;
var dfpData;
dfpData.dfp;
var OX;
OX._requestArgs;
var oxRequest;
oxRequest.addAdUnit;
oxRequest.setAdSizes;
oxRequest.getOrCreateAdUnit;
data.zone;
data.sitepage;
data.auid;
data.widgetname;
data.urlprefix;
var rubicontag;
rubicontag.setFPV;
rubicontag.setFPI;
rubicontag.getSlot;
rubicontag.getAdServerTargeting;
data.account;
rubicontag.addKW;
rubicontag.setUrl;
rubicontag.setIntegration;
data.account;
data.kw;
data.visitor;
data.inventory;
data.callback;
var wads;
wads.init;
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
data.psn;
var yieldbot;
yieldbot.psn;
yieldbot.enableAsync;
yieldbot.defineSlot;
yieldbot.go;
data.ybSlot;
yieldbot.nextPageview;
yieldbot.getSlotCriteria;
data.ymid;
var PostRelease;
PostRelease.Start;
PostRelease.checkIsAdVisible;
var _prx;
data.delayByTime;
window.PulsePointHeaderTag;
data.tagid;
data.tagtype;
data.zergid;
window.zergnetWidgetId;
data.ankv;
data.ancat;
data.annid;
data.anwid;
data.antid;
data.anapiid;
window.MADSAdrequest = {};
window.MADSAdrequest.adrequest;
data.divid;
/**
 * @constructor
 * @param {!Window} global
 * @param {!Object} data
 */
window.EzoicAmpAd = function(global, data) {};
window.EzoicAmpAd.prototype.createAd;
data.id;
data.d;
data.wid;
data.url;
data.customtarget;
data.dynclickthrough;
data.viewtracking;
data.customcss;
data.enablemraid;
data.jsplayer;
var sas;
sas.callAmpAd;
data.uuid;
data.embedcreated;
data.embedparent
data.embedlive
var ZGTag;
var geckoTag;
var placement;
data.superId;
data.network;
geckoTag.setAMP;
geckoTag.addPlacement;
data.placementId;
data.channel;
data.publisher;
data.dim;
placement.includeRenderer;
geckoTag.loadAds;
geckoTag.placementReady;
data.plc;
data.sz;
data.extra;
