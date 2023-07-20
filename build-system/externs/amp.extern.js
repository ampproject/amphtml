/** @externs */

/**
 * The "init" argument of the Fetch API. Externed due to being passes across
 * component/runtime boundary.
 *
 * For `credentials` property, only "include" is implemented.
 *
 * Custom properties:
 * - `ampCors === false` indicates that __amp_source_origin should not be
 * appended to the URL to allow for potential caching or response across pages.
 * - `bypassInterceptorForDev` disables XHR interception in local dev mode.
 * - `prerenderSafe` allows firing requests while viewer is not yet visible.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 *
 * @typedef {{
 *   responseType: (string|undefined),
 *   body: (!JsonObject|!FormData|!FormDataWrapperInterface|!Array|string|undefined|null),
 *   cache: (string|undefined),
 *   credentials: (string|undefined),
 *   headers: (!JsonObject|undefined),
 *   method: (string|undefined),
 *
 *   ampCors: (boolean|undefined),
 *   bypassInterceptorForDev: (boolean|undefined),
 *   prerenderSafe: (boolean|undefined),
 * }}
 */
let FetchInitDef;

// TODO: add MediaQueryListEvent to closure's builtin externs.
/**
 * @typedef {{
 *   matches: function():boolean,
 *   media: string
 * }}
 */
let MediaQueryListEvent;

/**
 * Externed due to being passed across component/runtime boundary.
 * @typedef {{xhrUrl: string, fetchOpt: !FetchInitDef}}
 */
let FetchRequestDef;

/** @constructor */
let FormDataWrapperInterface = function () {};

FormDataWrapperInterface.prototype.entries = function () {};
FormDataWrapperInterface.prototype.getFormData = function () {};

FormData.prototype.entries = function () {};

/**
 * Force the dataset property to be handled as a JsonObject.
 * @type {!JsonObject}
 */
Element.prototype.dataset;

/** Needed for partial shadow DOM polyfill used in shadow docs. */
Element.prototype.__AMP_SHADOW_ROOT;

/** @type {?ShadowRoot} */
Element.prototype.shadowRoot;

// Fullscreen methods
// TODO: upstream these types to closure.
Document.prototype.cancelFullScreen;
Document.prototype.webkitExitFullscreen;
Element.prototype.cancelFullScreen;
Element.prototype.exitFullscreen;
Element.prototype.webkitExitFullscreen;
Element.prototype.webkitCancelFullScreen;
Element.prototype.mozCancelFullScreen;
Element.prototype.msExitFullscreen;
Element.prototype.requestFullscreen;
Element.prototype.requestFullScreen;
Element.prototype.webkitRequestFullscreen;
Element.prototype.webkitEnterFullscreen;
Element.prototype.msRequestFullscreen;
Element.prototype.mozRequestFullScreen;

/** @type {boolean|undefined} */
Element.prototype.webkitDisplayingFullscreen;

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

/**
 * Extension name.
 * @type {string}
 */
ExtensionPayload.prototype.n;

/**
 * Extension version.
 * @type {string}
 */
ExtensionPayload.prototype.ev;

/**
 * Whether this extension version is the latest version.
 * @type {boolean}
 */
ExtensionPayload.prototype.l;

/**
 * Priority.
 * @type {string|undefined}
 */
ExtensionPayload.prototype.p;

/**
 * RTV (release) version.
 * @type {string}
 */
ExtensionPayload.prototype.v;

/**
 * If the value of "m" is 1 then the current extension is of type "module",
 * else it is of type "nomodule".
 * @type {number}
 */
ExtensionPayload.prototype.m;

/**
 * Install function.
 * @type {function(!Object,!Object)}
 */
ExtensionPayload.prototype.f;

/**
 * @typedef {?JsonObject|undefined|string|number|!Array<JsonValue>}
 */
let JsonValue;

/**
 * @constructor
 * @dict
 */
function VideoAnalyticsDetailsDef() {}
/** @type {boolean} */
VideoAnalyticsDetailsDef.prototype.autoplay;
/** @type {number} */
VideoAnalyticsDetailsDef.prototype.currentTime;
/** @type {number} */
VideoAnalyticsDetailsDef.prototype.duration;
/** @type {number} */
VideoAnalyticsDetailsDef.prototype.height;
/** @type {string} */
VideoAnalyticsDetailsDef.prototype.id;
/** @type {string} */
VideoAnalyticsDetailsDef.prototype.playedRangesJson;
/** @type {number} */
VideoAnalyticsDetailsDef.prototype.playedTotal;
/** @type {boolean} */
VideoAnalyticsDetailsDef.prototype.muted;
/** @type {string} */
VideoAnalyticsDetailsDef.prototype.state;
/** @type {number} */
VideoAnalyticsDetailsDef.prototype.width;

// Node.js global
let process = {};
process.env;
process.env.NODE_ENV;

// Exposed to ads.
// Preserve these filedNames so they can be accessed by 3p code.
window.context;
window.context.sentinel;
window.context.clientId;
window.context.initialLayoutRect;
window.context.initialIntersection;
window.context.sourceUrl;
window.context.experimentToggles;
window.context.master;
window.context.isMaster;
window.context.ampcontextVersion;
window.context.ampcontextFilepath;
window.context.canary;
window.context.canonicalUrl;
window.context.consentSharedData;
window.context.container;
window.context.domFingerprint;
window.context.hidden;
window.context.initialConsentState;
window.context.initialConsentValue;
window.context.location;
window.context.mode;
window.context.pageViewId;
window.context.referrer;
window.context.sourceUrl;
window.context.startTime;
window.context.tagName;

// Safeframe
// TODO(bradfrizzell) Move to its own extern. Not relevant to all AMP.
window.sf_;
window.sf_.cfg;

// Exposed to custom ad iframes.
/** @type {function(function(!Object, function(!Object)), !Array<string>=, !Array<string>=)} */
window.draw3p;

// AMP's globals
window.testLocation;
window.Location.originalHash;
window.__AMP_SERVICES;
window.__AMP_TEST;
window.__AMP_TEST_IFRAME;
window.__AMP_TAG;
window.__AMP_TOP;
window.__AMP_PARENT;
window.__AMP_WEAKREF_ID;
window.__AMP_URL_CACHE;
window.__AMP_LOG;

/** @type {undefined|boolean} */
window.ENABLE_LOG;

// TODO: uncomment line below when src/mode.js is added to typechecking.
// https://github.com/ampproject/amphtml/issues/34099

// /** @type {undefined|../../src/mode.ModeDef} */
window.__AMP_MODE;

/** @type {boolean|undefined} */
window.AMP_DEV_MODE;

window.AMP;
window.AMP._ = {};
window.AMP.addGlobalConsentListener;
window.AMP.addGranularConsentListener;
window.AMP.push;
window.AMP.title;
window.AMP.canonicalUrl;
window.AMP.extension;
window.AMP.ampdoc;
window.AMP.config;
window.AMP.config.urls;
window.AMP.BaseElement;
window.AMP.registerElement;
window.AMP.registerTemplate;
window.AMP.registerServiceForDoc;
window.AMP.isExperimentOn;
window.AMP.toggleExperiment;
window.AMP.setLogLevel;
window.AMP.setTickFunction;
window.AMP.viewer;
window.AMP.viewport;
window.AMP.viewport.getScrollLeft;
window.AMP.viewport.getScrollWidth;
window.AMP.viewport.getWidth;
/**
 * This symbol is exposed by bundles transformed by `scoped-require.js` to avoid
 * polluting the global namespace with `require`.
 * It allows AMP extensions to consume code injected into their binaries that
 * cannot be run through Closure Compiler, e.g. React code with JSX.
 * @type {!function(string):?}
 */
window.AMP.require;

/** @type {function(!HTMLElement, !Document, !string, Object)} */
window.AMP.attachShadowDoc = function (element, document, url, options) {};

/** @type {function(!HTMLElement, !string, Object)} */
window.AMP.attachShadowDocAsStream = function (element, url, options) {};

/** @constructor */
function AmpConfigType() {}

/* @public {string} */
AmpConfigType.prototype.thirdPartyUrl;
/* @public {string} */
AmpConfigType.prototype.thirdParty;
/* @public {string} */
AmpConfigType.prototype.thirdPartyFrameHost;
/* @public {string} */
AmpConfigType.prototype.thirdPartyFrameRegex;
/* @public {string} */
AmpConfigType.prototype.errorReporting;
/* @public {string} */
AmpConfigType.prototype.betaErrorReporting;
/* @public {string} */
AmpConfigType.prototype.cdn;
/* @public {string} */
AmpConfigType.prototype.cdnUrl;
/* @public {string} */
AmpConfigType.prototype.errorReportingUrl;
/* @public {string} */
AmpConfigType.prototype.betaErrorReportingUrl;
/* @public {string} */
AmpConfigType.prototype.localDev;
/* @public {string} */
AmpConfigType.prototype.v;
/* @public {string} */
AmpConfigType.prototype.type;
/* @public {boolean} */
AmpConfigType.prototype.canary;
/* @public {string} */
AmpConfigType.prototype.runtime;
/* @public {boolean} */
AmpConfigType.prototype.test;
/* @public {string|undefined} */
AmpConfigType.prototype.spt;
/* @public {boolean|undefined} */
AmpConfigType.prototype.esm;
/* @public {string} */
AmpConfigType.prototype.geoApi;
/* @public {string} */
AmpConfigType.prototype.geoApiUrl;

/** @type {!AmpConfigType} */
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
/** @public {string|undefined}  */
AmpViewerMessage.prototype.messagingToken;

// AMP-Analytics Cross-domain iframes
let IframeTransportEvent;

/** @constructor @struct */
function IframeTransportContext() {}
IframeTransportContext.onAnalyticsEvent;
IframeTransportContext.sendResponseToCreative;

// amp-date-picker externs
/**
 * @type {function(*)}
 */
let ReactRender = function () {};

/** @constructor */
let RRule;
/**
 * @param {Date} unusedDt
 * @param {boolean=} unusedInc
 * @return {?Date}
 */
RRule.prototype.before = function (unusedDt, unusedInc) {};
/**
 * @param {Date} unusedDt
 * @param {boolean=} unusedInc
 * @return {?Date}
 */
RRule.prototype.after = function (unusedDt, unusedInc) {};

/**
 * @dict
 */
let PropTypes = {};

/**
 * @dict
 */
let ReactDates;

/** @constructor */
ReactDates.DayPickerSingleDateController;

/** @dict */
ReactDates.DayPickerRangeController;

/** @type {function(*):boolean} */
ReactDates.isInclusivelyAfterDay;

/** @type {function(*):boolean} */
ReactDates.isInclusivelyBeforeDay;

/** @type {function(*,*):boolean} */
ReactDates.isSameDay;

/**
 * @dict
 */
let ReactDatesConstants = {};

/** @const {string} */
ReactDatesConstants.ANCHOR_LEFT;

/** @const {string} */
ReactDatesConstants.HORIZONTAL_ORIENTATION;

// amp-inputmask externs
/**
 * @constructor
 */
let Inputmask = class {};

/** @param {!Object} unusedOpts */
Inputmask.extendAliases = function (unusedOpts) {};

/** @param {!Object} unusedOpts */
Inputmask.extendDefaults = function (unusedOpts) {};

/** @param {!Element} unusedElement */
Inputmask.prototype.mask = function (unusedElement) {};

Inputmask.prototype.remove = function () {};

/** @dict */
window.AMP.dependencies = {};

/**
 * @param {!Element} unusedElement
 * @return {!Inputmask}
 */
window.AMP.dependencies.inputmaskFactory = function (unusedElement) {};

// TODO (remove after we update closure compiler externs)
window.PerformancePaintTiming;
window.PerformanceObserver;
Object.prototype.entryTypes;
Window.prototype.origin;
HTMLAnchorElement.prototype.origin;

/** @typedef {number}  */
let time;

/**
 * Just an element, but used with AMP custom elements..
 * @constructor @extends {HTMLElement}
 */

// Commented out segments below have been migrated into
// #core/dom/amp-element.extern, but are left here for now for easy access
// during migration

// let AmpElement = function () {};
// /** */
// AmpElement.prototype.pause = function () {};

// /** */
// AmpElement.prototype.unmount = function () {};

// *
//  * @param {number=} opt_parentPriority
//  * @return {!Promise}

// AmpElement.prototype.ensureLoaded = function (opt_parentPriority) {};

// /** @return {?Element} */
// AmpElement.prototype.getPlaceholder = function () {};

/** @return {boolean} */
AmpElement.prototype.R1 = function () {};

/** @return {boolean} */
AmpElement.prototype.deferredMount = function () {};

/** @return {!Signals} */
AmpElement.prototype.signals = function () {};

/** @param {boolean} show */
AmpElement.prototype.togglePlaceholder = function (show) {};

/** @return {{width: number, height: number}} */
AmpElement.prototype.getLayoutSize = function () {};

/**
 * TODO: remove this when typechecking is restored to AMP.BaseElement.
 * @typedef {*}
 */
let BaseElement;

/**
 * @param {boolean=} opt_waitForBuild
 * @return {!Promise<!BaseElement>}
 */
AmpElement.prototype.getImpl = function (opt_waitForBuild) {};

/** @return {!Promise} */
AmpElement.prototype.buildInternal = function () {};

/** @return {!Promise} */
AmpElement.prototype.mountInternal = function () {};

/** @return {boolean} */
AmpElement.prototype.isBuilt = function () {};

/** @return {boolean} */
AmpElement.prototype.isBuilding = function () {};

/** @return {number} */
AmpElement.prototype.getBuildPriority = function () {};

/** @return {number} */
AmpElement.prototype.getLayoutPriority = function () {};

/** @return {boolean} */
AmpElement.prototype.isRelayoutNeeded = function () {};

/** @return {boolean|number} */
AmpElement.prototype.renderOutsideViewport = function () {};

/** @return {boolean|number} */
AmpElement.prototype.idleRenderOutsideViewport = function () {};

/** @type {number|undefined} */
AmpElement.prototype.layoutScheduleTime;

/** @return {!Promise} */
AmpElement.prototype.layoutCallback = function () {};

/** */
AmpElement.prototype.unlayoutCallback = function () {};

/** @return {!Promise} */
AmpElement.prototype.whenLoaded = function () {};

/** @param {boolean} pretendDisconnected */
AmpElement.prototype.disconnect = function (pretendDisconnected) {};

/** @return {boolean} */
AmpElement.prototype.reconstructWhenReparented = function () {};

/** @return {boolean} */
AmpElement.prototype.isBuildRenderBlocking = function () {};

/** @return {boolean} */
AmpElement.prototype.prerenderAllowed = function () {};

/** @return {string} */
AmpElement.prototype.getLayout = function () {};

/**
 * @param {{width: number, height: number, top: number, bottom: number}} layoutBox
 * @param {boolean=} opt_sizeChanged
 */
AmpElement.prototype.updateLayoutBox = function (layoutBox, opt_sizeChanged) {};

/** */
AmpElement.prototype.collapsedCallback = function () {};

/** @return {boolean} */
AmpElement.prototype.isUpgraded = function () {};

/** @return {number} */
AmpElement.prototype.getUpgradeDelayMs = function () {};

/**
 * @param {boolean} overflown
 * @param {number|undefined} requestedHeight
 * @param {number|undefined} requestedWidth
 */
AmpElement.prototype.overflowCallback = function (
  overflown,
  requestedHeight,
  requestedWidth
) {};

/**
 * @param {number|undefined} newHeight
 * @param {number|undefined} newWidth
 * @param {?} opt_newMargins
 */
AmpElement.prototype.applySize = function (
  newHeight,
  newWidth,
  opt_newMargins
) {};

/** */
AmpElement.prototype.expand = function () {};

/** */
AmpElement.prototype.collapse = function () {};

let Signals = class {};
/**
 * @param {string} unusedName
 * @return {?number|?Error}
 */
Signals.prototype.get = function (unusedName) {};

/**
 * @param {string} unusedName
 * @return {!Promise<time>}
 */
Signals.prototype.whenSignal = function (unusedName) {};

/**
 * @param {string} unusedName
 * @param {time=} unusedOpt_time
 */
Signals.prototype.signal = function (unusedName, unusedOpt_time) {};

/**
 * @param {string} unusedName
 * @param {!Error} unusedError
 */
Signals.prototype.rejectSignal = function (unusedName, unusedError) {};

/** @param {string} unusedName */
Signals.prototype.reset = function (unusedName) {};

// Temp until we figure out forward declarations
/** @constructor */
let AccessService = function () {};
/** @constructor @struct */
let UserNotificationManager = function () {};
UserNotificationManager.prototype.get;
/** @constructor @struct */
let Cid = function () {};
/** @constructor @struct */
let Activity = function () {};
/** @constructor */
let AmpStoryVariableService = function () {};

// data
let data;
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
data.tabs;
data.hideCover;
data.hideCta;
data.smallHeader;
data.showFacepile;
data.showText;
data.productId;
data.imageUrl;
data.yotpoElementId;
data.backgroudColor;
data.reviewIds;
data.showBottomLine;
data.autoplayEnabled;
data.autoplaySpeed;
data.showNavigation;
data.layoutScroll;
data.spacing;
data.hoverColor;
data.hoverOpacity;
data.hoverIcon;
data.ctaText;
data.ctaColor;
data.appKey;
data.widgetType;
data.layoutRows;
data.demo;
data.uploadButton;
data.reviews;
data.headerText;
data.headerBackgroundColor;
data.bodyBackgroundColor;
data.data.fontColor;
data.width;
data.sitekey;
data.fortesting;

// 3p code
let twttr;
twttr.events;
twttr.events.bind;
twttr.widgets;
twttr.widgets.createTweet;
twttr.widgets.createMoment;
twttr.widgets.createTimeline;

let FB;
FB.init;

let gist;
gist.gistid;

let bodymovin;
bodymovin.loadAnimation;
let animationHandler;
animationHandler.play;
animationHandler.pause;
animationHandler.stop;
animationHandler.goToAndStop;
animationHandler.totalFrames;

let grecaptcha;
grecaptcha.execute;

// Validator
let amp;
amp.validator;
amp.validator.validateUrlAndLog = function (string, doc) {};

// Temporary Access types (delete when amp-access is compiled
// for type checking).
Activity.prototype.getTotalEngagedTime = function () {};
Activity.prototype.getIncrementalEngagedTime = function (name, reset) {};
AccessService.prototype.getAccessReaderId = function () {};
AccessService.prototype.getAuthdataField = function (field) {};
// Same for amp-analytics

/**
 * The "get CID" parameters.
 * - createCookieIfNotPresent: Whether CID is allowed to create a cookie when.
 *   Default value is `false`.
 * @typedef {{
 *   scope: string,
 *   createCookieIfNotPresent: (boolean|undefined),
 *   cookieName: (string|undefined),
 * }}
 */
let GetCidDef;
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
Cid.prototype.get = function (
  externalCidScope,
  consent,
  opt_persistenceConsent
) {};

AmpStoryVariableService.prototype.onStateChange = function (event) {};
AmpStoryVariableService.pageIndex;
AmpStoryVariableService.pageId;

// TODO: uncomment when typechecking restored to BaseElement.
// https://github.com/ampproject/amphtml/issues/34099

// // Externed explicitly because we do not export Class shaped names
// // by default.
// /**
//  * This uses the internal name of the type, because there appears to be no
//  * other way to reference an ES6 type from an extern that is defined in
//  * the app.
//  * @constructor @struct
//  * @extends {BaseElement$$module$src$base_element}
//  */
// AMP.BaseElement = class {
//   /** @param {!AmpElement} element */
//   constructor(element) {}
// };

// TODO: uncomment when typechecking restored to AmpAdXOriginIframeHandler.
// https://github.com/ampproject/amphtml/issues/34099

// /**
//  * This uses the internal name of the type, because there appears to be no
//  * other way to reference an ES6 type from an extern that is defined in
//  * the app.
//  * @constructor @struct
//  * @extends {AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler}
//  */
// AMP.AmpAdXOriginIframeHandler = class {
//   /**
//    * @param {!AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl|!AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a} baseInstance
//    */
//   constructor(baseInstance) {}
// };

// TODO: uncomment when typechecking is restored to AmpAdUIHandler.
// https://github.com/ampproject/amphtml/issues/34099

// /**
//  * This uses the internal name of the type, because there appears to be no
//  * other way to reference an ES6 type from an extern that is defined in
//  * the app.
//  * @constructor @struct
//  * @extends {AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui}
//  */
// AMP.AmpAdUIHandler = class {
//   /**
//    * @param {!AMP.BaseElement} baseInstance
//    */
//   constructor(baseInstance) {}
// };

/**
 * Actual filled values for this exists in
 * src/service/real-time-config/real-time-config-impl.js
 * @enum {string}
 */
const RTC_ERROR_ENUM = {};

/** @typedef {{
      response: (Object|undefined),
      rtcTime: number,
      callout: string,
      error: (RTC_ERROR_ENUM|undefined)}} */
let rtcResponseDef;

/**
 * TransitionDef function that accepts normtime, typically between 0 and 1 and
 * performs an arbitrary animation action. Notice that sometimes normtime can
 * dip above 1 or below 0. This is an acceptable case for some curves. The
 * second argument is a boolean value that equals "true" for the completed
 * transition and "false" for ongoing.
 * @typedef {function(number, boolean):?|function(number):?}
 */
let TransitionDef;

///////////////////
// amp-bind externs
///////////////////

/**
 * @typedef {{method: string, args: !Array, scope: number, id: number}}
 */
let ToWorkerMessageDef;

/**
 * @typedef {{method: string, returnValue: *, id: number}}
 */
let FromWorkerMessageDef;

/**
 * Structured cloneable representation of an <amp-bind-macro> element.
 * @typedef {{id: string, argumentNames: Array<string>, expressionString: string}}
 */
let BindMacroDef;

/**
 * Structured cloneable representation of a binding e.g. <p [text]="foo>.
 * @typedef {{tagName: string, property: string, expressionString: string}}
 */
let BindBindingDef;

/**
 * Structured cloneable representation of a JS error.
 * @typedef {{message: string, stack: string}}
 */
let BindEvaluatorErrorDef;

/**
 * Possible types of an amp-bind expression result.
 * @typedef {(null|boolean|string|number|Array|Object)}
 */
let BindExpressionResultDef;

/**
 * Structured cloneable return value for 'bind.evaluateBindings' API.
 * @typedef {{results: !{[key: string]: BindExpressionResultDef}, errors: !{[key: string]: !BindEvaluatorErrorDef}}}
 */
let BindEvaluateBindingsResultDef;

/**
 * Structured cloneable return value for 'bind.evaluateExpression' API.
 * @typedef {{result: BindExpressionResultDef, error: ?BindEvaluatorErrorDef}}
 */
let BindEvaluateExpressionResultDef;

/**
 * Options for Bind.rescan().
 * @typedef {{update: (boolean|string|undefined), fast: (boolean|undefined), timeout: (number|undefined)}}
 */
let BindRescanOptionsDef;

/**
 * Options bag used in Bind.setState().
 * @typedef {{
 *    skipEval: (boolean|undefined),
 *    skipAmpState: (boolean|undefined),
 *    constrain: (Array<!Element>|undefined),
 * }}
 */
let BindSetStateOptionsDef;

/////////////////////////////
////// Web Anmomation externs
/////////////////////////////
/**
 * @typedef {
 *   !WebMultiAnimationDef|
 *   !WebSwitchAnimationDef|
 *   !WebCompAnimationDef|
 *   !WebKeyframeAnimationDef
 * }
 */
let WebAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   animations: !Array<!WebAnimationDef>,
 * }}
 */
let WebMultiAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   switch: !Array<!WebAnimationDef>,
 * }}
 */
let WebSwitchAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   animation: string,
 * }}
 */
let WebCompAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   keyframes: (string|!WebKeyframesDef),
 * }}
 */
let WebKeyframeAnimationDef;

/**
 * @typedef {!{[key: string]: *}|!Array<!{[key: string]: *}>}
 */
let WebKeyframesDef;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffectTimingProperties
 *
 * @mixin
 * @typedef {{
 *   duration: (time|undefined),
 *   delay: (time|undefined),
 *   endDelay: (time|undefined),
 *   iterations: (number|string|undefined),
 *   iterationStart: (number|undefined),
 *   easing: (string|undefined),
 *   direction: (?|undefined),
 *   fill: (?|undefined),
 * }}
 */
let WebAnimationTimingDef;

/**
 * Indicates an extension to a type that allows specifying vars. Vars are
 * specified as properties with the name in the format of `--varName`.
 *
 * @mixin
 * @typedef {object}
 */
let WebAnimationVarsDef;

/**
 * Defines media parameters for an animation.
 *
 * @mixin
 * @typedef {{
 *   media: (string|undefined),
 *   supports: (string|undefined),
 * }}
 */
let WebAnimationConditionalDef;

/**
 * @typedef {{
 *   target: (!Element|undefined),
 *   selector: (string|undefined),
 *   subtargets: (!Array<!WebAnimationSubtargetDef>|undefined),
 * }}
 */
let WebAnimationSelectorDef;

/**
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @typedef {{
 *   matcher: (function(!Element, number):boolean|undefined),
 *   index: (number|undefined),
 *   selector: (string|undefined),
 * }}
 */
let WebAnimationSubtargetDef;

let ampInaboxPositionObserver;
ampInaboxPositionObserver.observe;
ampInaboxPositionObserver.getTargetRect;
ampInaboxPositionObserver.getViewportRect;

/**
 * TODO(dvoytenko): remove FeaturePolicy once it's added in Closure externs.
 * See https://developer.mozilla.org/en-US/docs/Web/API/FeaturePolicy.
 * @interface
 */
class FeaturePolicy {
  /**
   * @return {!Array<string>}
   */
  features() {}

  /**
   * @return {!Array<string>}
   */
  allowedFeatures() {}

  /**
   * @param {string} feature
   * @param {string=} opt_origin
   * @return {boolean}
   */
  allowsFeature(feature, opt_origin) {}

  /**
   * @param {string} feature
   * @return {!Array<string>}
   */
  getAllowlistForFeature(feature) {}
}

/**
 * Going through the standardization process now.
 *
 * See https://developers.google.com/web/updates/2019/02/constructable-stylesheets.
 *
 * @param {string} cssText
 */
CSSStyleSheet.prototype.replaceSync = function (cssText) {};

/** @type {!Array<!CSSStyleSheet>|undefined} */
ShadowRoot.prototype.adoptedStyleSheets;

/** @type {undefined|boolean} */
Error.prototype.expected;
