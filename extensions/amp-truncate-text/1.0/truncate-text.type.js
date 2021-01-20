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
var TruncateTextDef = {};

/**
 * @typedef {{
 *   slotCollapsed: (?PreactDef.VNode|undefined),
 *   slotExpanded: (?PreactDef.VNode|undefined),
 *   slotPersistent: (?PreactDef.VNode|undefined),
 * }}
 */
TruncateTextDef.Props;

/** @interface */
TruncateTextDef.TruncateTextApi = class {
  /** Expand the component, displaying the overflow */
  expand() {}
  /** Collapse the component, trucating its contents */
  collapse() {}
};
