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

import {DialogRenderer} from './dialog-renderer';
import {Entitlement} from './entitlement';
import {evaluateExpr} from './expr';

/**
 * This implements the rendering methods for local platform.
 *
 */
export class LocalSubscriptionPlatformRenderer {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!./dialog.Dialog} dialog
   */
  constructor(ampdoc, dialog) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.rootNode_ = ampdoc.getRootNode();

    /** @private @const */
    this.dialogRenderer_ = new DialogRenderer(ampdoc, dialog);
  }

  /**
   *
   * @param {!./amp-subscriptions.RenderState} renderState
   */
  render(renderState) {
    this.renderActions_(renderState);
    this.dialogRenderer_.render(renderState);
  }

  /**
   *
   * @param {!./amp-subscriptions.RenderState} renderState
   */
  renderActions_(renderState) {
    return this.ampdoc_.whenReady().then(() => {
      // Find the matching actions and sections and make them visible if evalutes to true.
      const querySelectors =
          '[subscriptions-action], [subscriptions-section="actions"],'
              + ' [subscriptions-actions]';
      const actionCandidates =
          this.rootNode_.querySelectorAll(querySelectors);
      for (let i = 0; i < actionCandidates.length; i++) {
        const candidate = actionCandidates[i];
        const expr = candidate.getAttribute('subscriptions-display');
        if (expr && evaluateExpr(expr,
            /** @type {!JsonObject} */(renderState))) {
          candidate.setAttribute('i-amphtml-subs-display', '');
        }
      }
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
