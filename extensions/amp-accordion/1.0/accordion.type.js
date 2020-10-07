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
var AccordionDef = {};

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   expandSingleSection: (boolean|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
AccordionDef.Props;

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   headerAs: (string|PreactDef.FunctionalComponent|undefined),
 *   contentAs: (string|PreactDef.FunctionalComponent|undefined),
 *   expanded: (boolean|undefined),
 *   header: (!PreactDef.Renderable),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
AccordionDef.SectionProps;

/**
 * @typedef {{
 *   role: (string|undefined),
 *   onClick: (function()|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
AccordionDef.HeaderProps;

/**
 * @typedef {{
 *   registerSection: (function(string)|undefined),
 *   isExpanded: (function(string, boolean):boolean),
 *   toggleExpanded: (function(string)|undefined),
 * }}
 */
AccordionDef.ContextProps;
