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

// Node.js global
var process = {};
process.env;
process.end.NODE_ENV;

// Exposed to ads.
window.context = {};
window.context.amp3pSentinel;
window.context.clientId;
window.context.initialIntersection;

// Exposed to custom ad iframes.
/* @type {!Function} */
window.draw3p;

// AMP's globals
window.AMP_TEST;
window.AMP_TEST_IFRAME;
window.AMP_TAG;
window.AMP_CONFIG;
window.AMP = {};

// Should have been defined in the closure compiler's extern file for
// IntersectionObserverEntry, but appears to have been omitted.
IntersectionObserverEntry.prototype.rootBounds;

// Externed explicitly because we do not export Class shaped names
// by default.
/**
 * @constructor
 */
window.AMP.BaseElement = function(element) {};

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
window.AMP.BaseElement.prototype.layout_;

/** @type {number} */
window.AMP.BaseElement.prototype.layoutWidth_;

/** @type {boolean} */
window.AMP.BaseElement.prototype.inViewport_;

window.AMP.BaseElement.prototype.actionMap_;

window.AMP.BaseElement.prototype.resources_;

window.AMP.BaseTemplate;

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
/** @constructor */
var UserNotificationManager = function() {};
/** @constructor */
var Cid = function() {};
/** @constructor */
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


// 3p code
var twttr;
twttr.events;
twttr.events.bind;
twttr.widgets;
twttr.widgets.createTweet;

var FB;
FB.init;
