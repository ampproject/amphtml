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

import {Entitlement} from './entitlement';
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {evaluateExpr} from './expr';

/**
 * This implements the rendering methods for local platform.
 *
 */
export class LocalSubscriptionPlatformRenderer {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!./dialog.Dialog} dialog
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, dialog, serviceAdapter) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.rootNode_ = ampdoc.getRootNode();

    /** @private @const {!./dialog.Dialog} */
    this.dialog_ = dialog;

    /** @private @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(ampdoc.win);

    /** @private @const {!./service-adapter.ServiceAdapter} */
    this.serviceAdapter_ = serviceAdapter;
  }

  /**
   *
   * @param {!JsonObject} renderState
   */
  render(renderState) {
    return Promise.all([
      this.renderActions_(renderState),
      this.renderDialog_(/** @type {!JsonObject} */ (renderState)),
    ]);
  }

  /**
   * Resets all the rendered content back to normal.
   * @return {!Promise}
   */
  reset() {
    // Close dialog. Ignored if the dialog is not currently open.
    this.dialog_.close();
    // Hide subscriptions sections.
    return this.renderActionsInNode_(dict(), this.rootNode_, () => false);
  }

  /**
   * @param {!JsonObject} renderState
   */
  renderActions_(renderState) {
    this.renderActionsInNode_(renderState, this.rootNode_, evaluateExpr);
  }

  /**
   * @param {!JsonObject} authResponse
   * @return {!Promise<boolean>}
   */
  renderDialog_(authResponse) {
    // Make sure the document is fully parsed.
    return this.ampdoc_
      .whenReady()
      .then(() => {
        // Find the first matching dialog.
        const candidates = this.ampdoc_
          .getRootNode()
          .querySelectorAll('[subscriptions-dialog][subscriptions-display]');
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const expr = candidate.getAttribute('subscriptions-display');
          if (expr && evaluateExpr(expr, authResponse)) {
            return candidate;
          }
        }
      })
      .then(candidate => {
        if (!candidate) {
          return;
        }
        if (candidate.tagName == 'TEMPLATE') {
          return this.templates_
            .renderTemplate(candidate, authResponse)
            .then(element => {
              const renderState = /** @type {!JsonObject} */ (authResponse);
              return this.renderActionsInNode_(
                renderState,
                element,
                evaluateExpr
              );
            });
        }
        const clone = candidate.cloneNode(true);
        clone.removeAttribute('subscriptions-dialog');
        clone.removeAttribute('subscriptions-display');
        return clone;
      })
      .then(element => {
        if (!element) {
          return;
        }
        return this.dialog_.open(element, /* showCloseButton */ true);
      });
  }

  /**
   * Renders actions inside a given node according to an authResponse
   * @param {!JsonObject} renderState
   * @param {!Node} rootNode
   * @param {function(string, !JsonObject):boolean} evaluateExpr
   * @return {!Promise<Node>}
   * @private
   */
  renderActionsInNode_(renderState, rootNode, evaluateExpr) {
    return this.ampdoc_.whenReady().then(() => {
      // Find the matching actions and sections and make them visible if
      // evalutes to true.
      const querySelectors =
        '[subscriptions-action], [subscriptions-section="actions"],' +
        ' [subscriptions-actions]';
      const actionCandidates = rootNode.querySelectorAll(querySelectors);
      for (let i = 0; i < actionCandidates.length; i++) {
        const candidate = actionCandidates[i];
        const expr = candidate.getAttribute('subscriptions-display');
        if (
          expr &&
          evaluateExpr(expr, /** @type {!JsonObject} */ (renderState))
        ) {
          candidate.classList.add('i-amphtml-subs-display');
          if (
            candidate.getAttribute('subscriptions-service') &&
            candidate.getAttribute('subscriptions-action') &&
            candidate.getAttribute('subscriptions-decorate') !== 'false' &&
            !candidate.hasAttribute('i-amphtml-subs-decorated')
          ) {
            this.serviceAdapter_.decorateServiceAction(
              candidate,
              candidate.getAttribute('subscriptions-service'),
              candidate.getAttribute('subscriptions-action'),
              null
            );
            candidate.setAttribute('i-amphtml-subs-decorated', true);
          }
        } else {
          candidate.classList.remove('i-amphtml-subs-display');
        }
      }
      return rootNode;
    });
  }
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @VisibleForTesting
 */
export function getEntitlementClassForTesting() {
  return Entitlement;
}
