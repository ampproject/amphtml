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
var SocialShareDef = {};

/**
 * @typedef {{
 *   type: (string|undefined),
 *   endpoint: (string|undefined),
 *   params: (JsonObject|Object|undefined),
 *   target: (string|undefined),
 *   width: (number|string|undefined),
 *   height: (number|string|undefined),
 *   color: (string|undefined),
 *   background: (string|undefined),
 *   tabIndex: (number|string|undefined),
 *   style: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
SocialShareDef.Props;

/**
 * @typedef {{
 *   shareEndpont: string,
 *   defaultParams: Object<string, string>,
 *   defaultColor: string,
 *   defaultBackgroundColor: string,
 *   bindings: (!Array<string>|undefined),
 * }}
 */
SocialShareDef.Config;
