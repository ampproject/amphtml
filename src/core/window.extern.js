/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Externs for values expected to be on global self/window.
 * @externs
 */

/** @type {undefined} */
window.__AMP_ASSERTION_CHECK;

/** @type {boolean|undefined} */
window.IS_AMP_ALT;

/** @type {boolean|undefined} */
window.AMP_DEV_MODE;

/** @type {Object} */
window.__AMP_MODE = {};
window.__AMP_MODE.a4aId;
window.__AMP_MODE.development;
window.__AMP_MODE.esm;
window.__AMP_MODE.examiner;
window.__AMP_MODE.lite;
window.__AMP_MODE.localDev;
window.__AMP_MODE.log;
window.__AMP_MODE.minified;
window.__AMP_MODE.rtvVersion;
window.__AMP_MODE.runtime;
window.__AMP_MODE.test;
window.__AMP_MODE.version;

/** @type {Object} */
window.__AMP_LOG = {};
window.__AMP_LOG.user;
window.__AMP_LOG.dev;
window.__AMP_LOG.userForEmbed;

/** @type {boolean} */
window.ENABLE_LOG;

/** @type {!AmpConfigType}  */
window.AMP_CONFIG;

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

/** @type {boolean} */
var IS_ESM;

/** @type {string|undefined} */
window.origin;

/** @type {function(*, !Element=)|undefined} */
window.__AMP_REPORT_ERROR;

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

/** @type {?} */
window.AMP = {};
// window.AMP._ = {};
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

/** @type {?} */
window.AMP.viewport = {};
window.AMP.viewport.getScrollLeft;
window.AMP.viewport.getScrollWidth;
window.AMP.viewport.getWidth;

// Fullscreen methods
Document.prototype.cancelFullScreen = function () {};
Document.prototype.webkitExitFullscreen = function () {};
Element.prototype.cancelFullScreen = function () {};
Element.prototype.exitFullscreen = function () {};
Element.prototype.webkitExitFullscreen = function () {};
Element.prototype.webkitCancelFullScreen = function () {};
Element.prototype.mozCancelFullScreen = function () {};
Element.prototype.msExitFullscreen = function () {};
Element.prototype.requestFullscreen = function () {};
Element.prototype.requestFullScreen = function () {};
Element.prototype.webkitRequestFullscreen = function () {};
Element.prototype.webkitEnterFullscreen = function () {};
Element.prototype.msRequestFullscreen = function () {};
Element.prototype.mozRequestFullScreen = function () {};
/** @type {boolean|undefined} */
Element.prototype.webkitDisplayingFullscreen;
