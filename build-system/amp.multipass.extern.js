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

// Place externs here if they are only needed in legacy multi pass compilation.

var SomeBaseElementLikeClass;
SomeBaseElementLikeClass.prototype.layout_;

/** @type {number} */
SomeBaseElementLikeClass.prototype.layoutWidth_;

/** @type {boolean} */
SomeBaseElementLikeClass.prototype.inViewport_;

SomeBaseElementLikeClass.prototype.actionMap_;

SomeBaseElementLikeClass.prototype.defaultActionAlias_;

// Externed explicitly because this private property is read across
// binaries.
Element.prototype.implementation_ = {};

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
