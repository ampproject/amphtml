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

/** @const */
var DateDisplayDef = {};

/**
 * @typedef {{
 *   children: (?PreactDef.Renderable|undefined),
 *   datetime: (string|undefined),
 *   displayIn: (string|undefined),
 *   locale: (string|undefined),
 *   render: (function(!JsonObject, (?PreactDef.Renderable|undefined)):PreactDef.Renderable),
 *   offsetSeconds: (number|undefined),
 *   timestampMs: (number|undefined),
 *   timestampSeconds: (number|undefined),
 * }}
 */
DateDisplayDef.Props;

/**
 * @typedef {{
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
DateDisplayDef.AsyncRenderProps;

/**
 * @typedef {{
 *   dom: !Element,
 *   host: !Element,
 * }}
 */
DateDisplayDef.RenderDomTreeProps;
