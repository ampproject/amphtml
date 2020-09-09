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

/**
 * @typedef {{
 *   as: (string|!Function|undefined),
 *   wrapperClassName: (?string|undefined),
 *   wrapperStyle: (?Object|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
var WrapperComponentProps;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/contain
 *
 * @typedef {{
 *   as: (string|!Function|undefined),
 *   size: (boolean|undefined),
 *   layout: (boolean|undefined),
 *   paint: (boolean|undefined),
 *   wrapperClassName: (?string|undefined),
 *   wrapperStyle: (?Object|undefined),
 *   contentRef: ({current: ?}|function(!Element)|undefined),
 *   contentClassName: (?string|undefined),
 *   contentStyle: (?Object|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
var ContainWrapperComponentProps;
