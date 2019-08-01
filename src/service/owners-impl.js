/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/* eslint-disable no-unused-vars */
/**
 * TODO(lannka): migrate all methods from OwnersDef to here.
 *
 * @interface
 */
export class Owners {
  /**
   * Schedules unlayout for specified sub-elements that are children of the
   * parent element. The parent element can choose to send this signal when
   * it want to unload resources for its children.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   */
  scheduleUnlayout(parentElement, subElements) {}

  /**
   * A parent resource, especially in when it's an owner (see {@link setOwner}),
   * may request the Resources manager to update children's inViewport state.
   * A child's inViewport state is a logical AND between inLocalViewport
   * specified here and parent's own inViewport state.
   * @param {!Element} parentElement
   * @param {!Element|!Array<!Element>} subElements
   * @param {boolean} inLocalViewport
   */
  updateInViewport(parentElement, subElements, inLocalViewport) {}
}
/* eslint-enable no-unused-vars */
