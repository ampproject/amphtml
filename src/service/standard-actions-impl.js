/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {OBJECT_STRING_ARGS_KEY} from '../service/action-impl';
import {actionServiceForDoc} from '../action';
import {bindForDoc} from '../bind';
import {dev, user} from '../log';
import {fromClassForDoc} from '../service';
import {historyForDoc} from '../history';
import {installResourcesServiceForDoc} from './resources-impl';
import {toggle} from '../style';

/**
 * This service contains implementations of some of the most typical actions,
 * such as hiding DOM elements.
 * @implements {../service.EmbeddableService}
 * @private Visible for testing.
 */
export class StandardActions {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const @private {!./action-impl.ActionService} */
    this.actions_ = actionServiceForDoc(ampdoc);

    /** @const @private {!./resources-impl.Resources} */
    this.resources_ = installResourcesServiceForDoc(ampdoc);

    this.installActions_(this.actions_);
  }

  /** @override */
  adoptEmbedWindow(embedWin) {
    this.installActions_(actionServiceForDoc(embedWin.document));
  }

  /**
   * @param {!./action-impl.ActionService} actionService
   * @private
   */
  installActions_(actionService) {
    actionService.addGlobalTarget('AMP', this.handleAmpTarget.bind(this));
    actionService.addGlobalMethodHandler('hide', this.handleHide.bind(this));
  }

  /**
   * Handles global `AMP` actions.
   *
   * See `amp-actions-and-events.md` for documentation.
   *
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleAmpTarget(invocation) {
    switch (invocation.method) {
      case 'setState':
        bindForDoc(this.ampdoc).then(bind => {
          const args = invocation.args;
          const objectString = args[OBJECT_STRING_ARGS_KEY];
          if (objectString) {
            // Object string arg.
            const scope = Object.create(null);
            const event = invocation.event;
            if (event && event.detail) {
              scope['event'] = event.detail;
            }
            bind.setStateWithExpression(objectString, scope);
          } else {
            // Key-value args.
            bind.setState(args);
          }
        });
        return;
      case 'goBack':
        historyForDoc(this.ampdoc).goBack();
        return;
    }
    throw user().createError('Unknown AMP action ', invocation.method);
  }

  /**
   * Handles "hide" action. This is a very simple action where "display: none"
   * is applied to the target element.
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleHide(invocation) {
    const target = dev().assertElement(invocation.target);
    this.resources_.mutateElement(target, () => {
      if (target.classList.contains('i-amphtml-element')) {
        target./*OK*/collapse();
      } else {
        toggle(target, false);
      }
    });
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!StandardActions}
 */
export function installStandardActionsForDoc(ampdoc) {
  return fromClassForDoc(
      ampdoc, 'standard-actions', StandardActions);
};
