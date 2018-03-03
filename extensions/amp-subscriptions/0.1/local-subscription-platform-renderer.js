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

import {Entitlements} from '../../../third_party/subscriptions-project/apis';
import {evaluateExpr} from './expr';

/**
 * This implements the rendering methods for local platform.
 *
 */
export class LocalSubscriptionPlatformRenderer {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.document_ = this.ampdoc_.win.document;

  }

  /**
   *
   * @param {Entitlements} entitlements
   */
  render(entitlements) {
    this.renderActions_(entitlements);
  }

  /**
   *
   * @param {Entitlements} entitlements
   */
  renderActions_(entitlements) {
    return this.ampdoc_.whenReady().then(() => {
      // Find the first matching dialog.
      const actionCandidates =
          this.document_.querySelectorAll('[subscriptions-action]');
      for (let i = 0; i < actionCandidates.length; i++) {
        const candidate = actionCandidates[i];
        const expr = candidate.getAttribute('subscriptions-display');
        if (expr && evaluateExpr(expr, entitlements)) {
          candidate.setAttribute('i-amphtml-subs-display', '');
        }
      }
    });
  }
}
