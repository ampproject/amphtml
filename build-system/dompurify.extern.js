/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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


/** @constructor */
var DomPurifyConfigObject = function() {};

DomPurifyConfigObject.prototype.ALLOWED_TAGS;
DomPurifyConfigObject.prototype.ALLOWED_ATTR;
DomPurifyConfigObject.prototype.FORBID_TAGS;
DomPurifyConfigObject.prototype.FORBID_ATTR;
/** @type {?Object} */
DomPurifyConfigObject.prototype.USE_PROFILES = {};
/** @type {boolean} */
DomPurifyConfigObject.prototype.USE_PROFILES.html;
/** @type {boolean} */
DomPurifyConfigObject.prototype.USE_PROFILES.svg;
/** @type {boolean} */
DomPurifyConfigObject.prototype.USE_PROFILES.svgFilters;
/** @type {boolean} */
DomPurifyConfigObject.prototype.USE_PROFILES.mathMl;
DomPurifyConfigObject.prototype.ALLOW_ARIA_ATTR;
DomPurifyConfigObject.prototype.ALLOW_DATA_ATTR;
DomPurifyConfigObject.prototype.ALLOW_UNKNOWN_PROTOCOLS;
DomPurifyConfigObject.prototype.SAFE_FOR_JQUERY;
DomPurifyConfigObject.prototype.SAFE_FOR_TEMPLATES;
DomPurifyConfigObject.prototype.WHOLE_DOCUMENT;
DomPurifyConfigObject.prototype.RETURN_DOM;
DomPurifyConfigObject.prototype.RETURN_DOM_FRAGMENT;
DomPurifyConfigObject.prototype.RETURN_DOM_IMPORT;
DomPurifyConfigObject.prototype.FORCE_BODY;
DomPurifyConfigObject.prototype.SANITIZE_DOM;
DomPurifyConfigObject.prototype.KEEP_CONTENT;
DomPurifyConfigObject.prototype.IN_PLACE;
DomPurifyConfigObject.prototype.ALLOWED_URI_REGEXP;
DomPurifyConfigObject.prototype.ADD_TAGS;
DomPurifyConfigObject.prototype.ADD_ATTR;
DomPurifyConfigObject.prototype.ADD_URI_SAFE_ATTR;
