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

import {installStylesForDoc} from '../../../src/style-installer';
import {dev, user} from '../../../src/log';
import {tryParseJson} from '../../../src/json';

/** @const */
const TAG = 'amp-subscription';

export class SubscriptionSubscription {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    const accessElement = ampdoc.getElementById('amp-subscriptions');

    /** @const @private {boolean} */
    this.enabled_ = !!accessElement;
    if (!this.enabled_) {
      return;
    }

    /** @const @private {!Element} */
    this.accessElement_ = dev().assertElement(accessElement);

    const configJson = tryParseJson(this.accessElement_.textContent, e => {
      throw user().createError('Failed to parse "amp-access" JSON: ' + e);
    });
  }

  /**
   * @return {!Element}
   * @private
   */
  getRootElement_() {
    const root = this.ampdoc.getRootNode();
    return dev().assertElement(root.documentElement || root.body || root);
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.enabled_;
  }

  /**
   * @return {!AccessService}
   * @private
   */
  start_() {
    if (!this.enabled_) {
      user().info(TAG,
          'Subscriptions is disabled - no "id=amp-subscriptions" element');
      return this;
    }
    this.startInternal_();
    return this;
  }

  startInternal_() {

  }

}

