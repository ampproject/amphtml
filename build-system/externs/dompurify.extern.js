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
var DomPurifyConfig = function () {};

DomPurifyConfig.prototype.ALLOWED_TAGS;
DomPurifyConfig.prototype.ALLOWED_ATTR;
DomPurifyConfig.prototype.FORBID_TAGS;
DomPurifyConfig.prototype.FORBID_ATTR;
/** @type {?Object} */
DomPurifyConfig.prototype.USE_PROFILES = {};
/** @type {boolean} */
DomPurifyConfig.prototype.USE_PROFILES.html;
/** @type {boolean} */
DomPurifyConfig.prototype.USE_PROFILES.svg;
/** @type {boolean} */
DomPurifyConfig.prototype.USE_PROFILES.svgFilters;
/** @type {boolean} */
DomPurifyConfig.prototype.USE_PROFILES.mathMl;
DomPurifyConfig.prototype.ALLOW_ARIA_ATTR;
DomPurifyConfig.prototype.ALLOW_DATA_ATTR;
DomPurifyConfig.prototype.ALLOW_UNKNOWN_PROTOCOLS;
DomPurifyConfig.prototype.SAFE_FOR_JQUERY;
DomPurifyConfig.prototype.SAFE_FOR_TEMPLATES;
DomPurifyConfig.prototype.WHOLE_DOCUMENT;
DomPurifyConfig.prototype.RETURN_DOM;
DomPurifyConfig.prototype.RETURN_DOM_FRAGMENT;
DomPurifyConfig.prototype.RETURN_DOM_IMPORT;
DomPurifyConfig.prototype.FORCE_BODY;
DomPurifyConfig.prototype.SANITIZE_DOM;
DomPurifyConfig.prototype.KEEP_CONTENT;
DomPurifyConfig.prototype.IN_PLACE;
DomPurifyConfig.prototype.ALLOWED_URI_REGEXP;
DomPurifyConfig.prototype.ADD_TAGS;
DomPurifyConfig.prototype.ADD_ATTR;
DomPurifyConfig.prototype.ADD_URI_SAFE_ATTR;
