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

import {actionServiceForDoc} from '../action';
import {bindForDoc} from '../bind';
import {dev, user} from '../log';
import {fromClassForDoc} from '../service';
import {historyForDoc} from '../history';
import {installResourcesServiceForDoc} from './resources-impl';
import {getStyle, toggle} from '../style';


/**
 * @param {!Element} element
 * @return {bool}
 */
function isHidden(element) {
  return getStyle(element, 'display') == 'none'
      || element.hasAttribute('hidden');
}


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
    actionService.addGlobalMethodHandler('show', this.handleShow.bind(this));
    actionService.addGlobalMethodHandler(
      'toggle', this.handleToggle.bind(this));
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
          bind.setState(invocation.args);
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
    // TODO(alanorozco, #7753) use 'hidden' attribute for AMP elements
    const target = dev().assertElement(invocation.target);

    this.resources_.mutateElement(target, () => {
      if (target.classList.contains('i-amphtml-element')) {
        target./*OK*/collapse();
      } else {
        toggle(target, false);
        target.setAttribute('hidden', '');
      }
    });
  }

  /**
   * Handles "show" action. This is a very simple action where "display: none"
   * is removed from the target element.
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleShow(invocation) {
    // TODO(alanorozco, #7753) use 'hidden' attribute for AMP elements
    const target = dev().assertElement(invocation.target);

    user().assert(isHidden(target),
        'Element can only be shown when it has the "hidden" attribute set or ' +
        'was previously hidden by an AMP action. %s',
        target);

    // deferMutate will only work on AMP elements
    if (target.classList.contains('i-amphtml-element')) {
      this.resources_.deferMutate(target, () => {
        target./*OK*/expand();
      });
    } else {
      this.resources_.mutateElement(target, () => {
        toggle(target, true);
        target.removeAttribute('hidden');
      });
    }
  }

  /**
   * Handles "toggle" action.
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleToggle(invocation) {
    if (isHidden(dev().assertElement(invocation.target))) {
      this.handleShow(invocation);
    } else {
      this.handleHide(invocation);
    }
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
