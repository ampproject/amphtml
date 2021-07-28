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

/** @externs */

/** @const */
var FacebookDef = {};

/**
 * @typedef {{
 *   action: (string|undefined),
 *   colorscheme: (string|undefined),
 *   hideCta: (string|undefined),
 *   hideCover: (string|undefined),
 *   href: (string|undefined),
 *   loading: (string|undefined),
 *   kdSite: (boolean|undefined),
 *   locale: (string|undefined),
 *   layout: (string|undefined),
 *   numPosts: (number|undefined),
 *   orderBy: (string|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 *   refLabel: (string|undefined),
 *   requestResize: (function(number):*|undefined),
 *   share: (boolean|undefined),
 *   showFacepile: (string|undefined),
 *   size: (string|undefined),
 *   smallHeader: (string|undefined),
 *   tabs: (string|undefined),
 *   title: (string|undefined),
 * }}
 */
FacebookDef.Props;

/** @constructor */
FacebookDef.Api = function () {};

/** @type {string} */
FacebookDef.Api.prototype.readyState;
