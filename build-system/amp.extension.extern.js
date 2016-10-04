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

var AMP = {};

window.AMP;
// Externed explicitly because we do not export Class shaped names
// by default.
/**
 * This uses the internal name of the type, because there appears to be no
 * other way to reference an ES6 type from an extern that is defined in
 * the app.
 * @constructor
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
 * @constructor
 * @extends {AmpAdApiHandler$$module$extensions$amp_ad$0_1$amp_ad_api_handler}
 */
AMP.AmpAdApiHandler = class {
  /**
   * @param {!AMP.BaseElement} baseInstance
   * @param {!Element} element
   * @param {function()=} opt_noContentCallback
   */
  constructor(baseInstance, element, opt_noContentCallback) {}
}

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
