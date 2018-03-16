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

import {Services} from '../../../src/services';
import {evaluateExpr} from './expr';
import {renderActions} from './local-subscription-platform-renderer';

export class DialogRenderer {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!./dialog.Dialog} dialog
   */
  constructor(ampdoc, dialog) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!./dialog.Dialog} */
    this.dialog_ = dialog;

    /** @private @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(ampdoc.win);
  }

  /**
   * @param {!JsonObject} authResponse
   * @return {!Promise<boolean>}
   */
  render(authResponse) {
    // Make sure the document is fully parsed.
    return this.ampdoc_.whenReady().then(() => {
      // Find the first matching dialog.
      const candidates = this.ampdoc_.getRootNode()
          .querySelectorAll('[subscriptions-dialog][subscriptions-display]');
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const expr = candidate.getAttribute('subscriptions-display');
        if (expr && evaluateExpr(expr, authResponse)) {
          return candidate;
        }
      }
    }).then(candidate => {
      if (!candidate) {
        return;
      }
      if (candidate.tagName == 'TEMPLATE') {
        return this.templates_.renderTemplate(candidate, authResponse)
            .then(element =>
              renderActions(this.ampdoc_, authResponse, element));
      }
      const clone = candidate.cloneNode(true);
      clone.removeAttribute('subscriptions-dialog');
      clone.removeAttribute('subscriptions-display');
      return clone;
    }).then(element => {
      if (!element) {
        return;
      }
      return this.dialog_.open(element, /* showCloseButton */ true);
    });
  }
}
