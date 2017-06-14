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

/**
 * A type for Objects that can be JSON serialized or that come from
 * JSON serialization. Requires the objects fields to be accessed with
 * bracket notation object['name'] to make sure the fields do not get
 * obfuscated.
 * @constructor
 * @dict
 */
function JsonObject() {}

/**
 * - n is the name.
 * - f is the function body of the extension.
 * - p is the priority. Only supported value is "high".
 *   high means, that the extension is not subject to chunking.
 *   This should be used for work, that should always happen
 *   as early as possible. Currently this is primarily used
 *   for viewer communication setup.
 * - v is the release version
 * @constructor @struct
 */
function ExtensionPayload() {}

/** @type {string} */
ExtensionPayload.prototype.n;

/** @type {function(!Object)} */
ExtensionPayload.prototype.f;

/** @type {string|undefined} */
ExtensionPayload.prototype.p;

/** @type {string} */
ExtensionPayload.prototype.v;


/**
 * @typedef {?JsonObject|undefined|string|number|!Array<JsonValue>}
 */
var JsonValue;

// Node.js global
var process = {};
process.env;
process.env.NODE_ENV;
process.env.SERVE_MODE;

// Exposed to ads.
window.context = {};
window.context.sentinel;
window.context.clientId;
window.context.initialLayoutRect;
window.context.initialIntersection;
window.context.sourceUrl;
window.context.experimentToggles;
window.context.master;
window.context.isMaster;

// Service Holder
window.services;

// Safeframe
// TODO(bradfrizzell) Move to its own extern. Not relevant to all AMP.
/* @type {?Object} */
window.sf_ = {};
/* @type {?Object} */
window.sf_.cfg;

// Exposed to custom ad iframes.
/* @type {!Function} */
window.draw3p;

// AMP's globals
window.AMP_TEST;
window.AMP_TEST_IFRAME;
window.AMP_TAG;
window.AMP = {};

/** @constructor */
function AmpConfigType() {}

/* @public {string} */
AmpConfigType.prototype.thirdPartyUrl;
/* @public {string} */
AmpConfigType.prototype.thirdPartyFrameHost;
/* @public {string} */
AmpConfigType.prototype.thirdPartyFrameRegex;
/* @public {string} */
AmpConfigType.prototype.cdnUrl;
/* @public {string} */
AmpConfigType.prototype.errorReportingUrl;
/* @public {string} */
AmpConfigType.prototype.localDev;
/* @public {string} */
AmpConfigType.prototype.v;
/* @public {boolean} */
AmpConfigType.prototype.canary;

/** @type {!AmpConfigType}  */
window.AMP_CONFIG;

window.AMP_CONTEXT_DATA;

/** @constructor @struct */
function AmpViewerMessage() {}

/** @public {string}  */
AmpViewerMessage.prototype.app;
/** @public {string}  */
AmpViewerMessage.prototype.type;
/** @public {number}  */
AmpViewerMessage.prototype.requestid;
/** @public {string}  */
AmpViewerMessage.prototype.name;
/** @public {*}  */
AmpViewerMessage.prototype.data;
/** @public {boolean|undefined}  */
AmpViewerMessage.prototype.rsvp;
/** @public {string|undefined}  */
AmpViewerMessage.prototype.error;

// AMP-Analytics Cross-domain iframes
let AmpAnalytics3pReadyMessage;
let AmpAnalytics3pNewCreative;
let AmpAnalytics3pEvent;
let AmpAnalytics3pResponse;

// amp-viz-vega related externs.
/**
 * @typedef {{spec: function(!JsonObject, function())}}
 */
let VegaParser;
/**
 * @typedef {{parse: VegaParser}}
 */
let VegaObject;
/* @type {VegaObject} */
window.vg;

// Should have been defined in the closure compiler's extern file for
// IntersectionObserverEntry, but appears to have been omitted.
IntersectionObserverEntry.prototype.rootBounds;

// TODO (remove after we update closure compiler externs)
window.PerformancePaintTiming;
window.PerformanceObserver;
Object.prototype.entryTypes

// Externed explicitly because this private property is read across
// binaries.
Element.implementation_ = {};

/** @typedef {number}  */
var time;

/**
 * This type signifies a callback that can be called to remove the listener.
 * @typedef {function()}
 */
var UnlistenDef;


/**
 * Just an element, but used with AMP custom elements..
 * @typedef {!Element}
 */
var AmpElement;

// Temp until we figure out forward declarations
/** @constructor */
var AccessService = function() {};
/** @constructor @struct */
var UserNotificationManager = function() {};
UserNotificationManager.prototype.get;
/** @constructor @struct */
var Cid = function() {};
/** @constructor @struct */
var Activity = function() {};

// data
var data;
data.tweetid;
data.requestedHeight;
data.requestedWidth;
data.pageHidden;
data.changes;
data._context;
data.inViewport;
data.numposts;
data.orderBy;
data.colorscheme;

// 3p code
var twttr;
twttr.events;
twttr.events.bind;
twttr.widgets;
twttr.widgets.createTweet;

var FB;
FB.init;

var gist;
gist.gistid;

// Validator
var amp;
amp.validator;
amp.validator.validateUrlAndLog = function(string, doc, filter) {}

// Temporary Access types (delete when amp-access is compiled
// for type checking).
Activity.prototype.getTotalEngagedTime = function() {};
AccessService.prototype.getAccessReaderId = function() {};
AccessService.prototype.getAuthdataField = function(field) {};
// Same for amp-analytics
/**
 * The "get CID" parameters.
 * - createCookieIfNotPresent: Whether CID is allowed to create a cookie when.
 *   Default value is `false`.
 * @typedef {{
 *   scope: string,
 *   createCookieIfNotPresent: (boolean|undefined),
 * }}
 */
var GetCidDef;
/**
 * @param {string|!GetCidDef} externalCidScope Name of the fallback cookie
 *     for the case where this doc is not served by an AMP proxy. GetCidDef
 *     structure can also instruct CID to create a cookie if one doesn't yet
 *     exist in a non-proxy case.
 * @param {!Promise} consent Promise for when the user has given consent
 *     (if deemed necessary by the publisher) for use of the client
 *     identifier.
 * @param {!Promise=} opt_persistenceConsent Dedicated promise for when
 *     it is OK to persist a new tracking identifier. This could be
 *     supplied ONLY by the code that supplies the actual consent
 *     cookie.
 *     If this is given, the consent param should be a resolved promise
 *     because this call should be only made in order to get consent.
 *     The consent promise passed to other calls should then itself
 *     depend on the opt_persistenceConsent promise (and the actual
 *     consent, of course).
 * @return {!Promise<?string>} A client identifier that should be used
 *      within the current source origin and externalCidScope. Might be
 *      null if no identifier was found or could be made.
 *      This promise may take a long time to resolve if consent isn't
 *      given.
 */
Cid.prototype.get = function(
    externalCidScope, consent, opt_persistenceConsent) {}

var AMP = {};
window.AMP;
// Externed explicitly because we do not export Class shaped names
// by default.
/**
 * This uses the internal name of the type, because there appears to be no
 * other way to reference an ES6 type from an extern that is defined in
 * the app.
 * @constructor @struct
 * @extends {BaseElement$$module$src$base_element}
 */
AMP.BaseElement = class {
  /** @param {!AmpElement} element */
  constructor(element) {}
};

/**
 * This uses the internal name of the type, because there appears to be no
 * other way to reference an ES6 type from an extern that is defined in
 * the app.
 * @constructor @struct
 * @extends {AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler}
 */
AMP.AmpAdXOriginIframeHandler = class {
  /**
   * @param {!AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl|!AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a} baseInstance
   */
  constructor(baseInstance) {}
};

/**
 * This uses the internal name of the type, because there appears to be no
 * other way to reference an ES6 type from an extern that is defined in
 * the app.
 * @constructor @struct
 * @extends {AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui}
 */
AMP.AmpAdUIHandler = class {
  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  constructor(baseInstance) {}
};

/*
     \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  /  _____|
 \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
  \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
   \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
    \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|

  Any private property for BaseElement should be declared in
  build-system/amp.extern.js, this is so closure compiler doesn't rename
  the private properties of BaseElement since if it did there is a
  possibility that the private property's new symbol in the core compilation
  unit would collide with a renamed private property in the inheriting class
  in extensions.
 */
var SomeBaseElementLikeClass;
SomeBaseElementLikeClass.prototype.layout_;

/** @type {number} */
SomeBaseElementLikeClass.prototype.layoutWidth_;

/** @type {boolean} */
SomeBaseElementLikeClass.prototype.inViewport_;

SomeBaseElementLikeClass.prototype.actionMap_;

AMP.BaseTemplate;
