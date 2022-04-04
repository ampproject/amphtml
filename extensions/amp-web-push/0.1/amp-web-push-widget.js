/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import {Layout_Enum} from '#core/dom/layout';

/**
 * @fileoverview
 * A <web-push-widget> that shows or hides based on the page user's subscription
 * state, and can be set to subscribe or unsubscribe the user.
 *
 * All widgets are initially invisible while their visibility is computed.
 */
export class WebPushWidget extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.FIXED;
  }

  /** @override */
  buildCallback() {
    // Hide the element
    this.element.classList.add('amp-invisible');
  }
}

/** @enum {string} */
export const WebPushWidgetVisibilities = {
  /*
   * Describes the state when the user is subscribed.
   */
  SUBSCRIBED: 'subscribed',
  /*
   * Describes the state when the user is not subscribed.
   */
  UNSUBSCRIBED: 'unsubscribed',
  /*
   * Widgets shown when the user has blocked permissions, or has tried
   * subscribing in Incognito mode.
   */
  BLOCKED: 'blocked',
};
