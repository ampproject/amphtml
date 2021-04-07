/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

var LightboxDef = {};

/**
 * @typedef {{
 *   id: (string),
 *   animation: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 *   closeButtonAs: (function:PreactDef.Renderable|undefined),
 *   scrollable: (boolean),
 *   initialOpen: (boolean),
 *   onBeforeOpen: (function|undefined),
 *   onAfterOpen: (function|undefined),
 *   onAfterClose: (function|undefined),
 * }}
 */
LightboxDef.Props;

/**
 * @typedef {{
 *   aria-label: (string),
 *   as: (function:PreactDef.Renderable|undefined),
 *   onClick: function,
 * }}
 */
LightboxDef.CloseButtonProps;

/** @interface */
Lightbox.LightboxApi = class {
  /** Open the lightbox */
  open() {}

  /** Close the lightbox */
  close() {}
};
