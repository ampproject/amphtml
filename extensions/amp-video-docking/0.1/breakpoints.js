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

/** @typedef {{className: string, minWidth: number}} */
export let SyntheticBreakpointDef;

/**
 * @param {!Element} element
 * @param {number} width
 * @param {!Array<!SyntheticBreakpointDef>} breakpoints
 */
export function applyBreakpointClassname(element, width, breakpoints) {
  // sort by minWidth descending
  breakpoints = breakpoints.sort((a, b) => b.minWidth - a.minWidth);

  let maxBreakpoint = -1;
  breakpoints.forEach(({className, minWidth}) => {
    if (minWidth <= width && minWidth > maxBreakpoint) {
      element.classList.add(className);
      maxBreakpoint = minWidth;
    } else {
      element.classList.remove(className);
    }
  });
}
