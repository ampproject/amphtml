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
var AudioDef = {};

/**
 * @typedef {{
 *   album: (string),
 *   ariaDescribedBy: (string|undefined),
 *   ariaLabel: (string|undefined),
 *   ariaLabelledBy: (string|undefined),
 *   artist: (string),
 *   artwork: (string),
 *   autoplay: (boolean),
 *   controlsList: (boolean|undefined),,
 *   loop: (boolean),
 *   muted: (boolean),
 *   preload: (string|undefined),
 *   sources: (?PreactDef.Renderable|undefined),
 *   src: (string|undefined),
 *   title: (string),
 * }}
 */
AudioDef.Props;
