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
import {Layout, getLayoutClass} from '../layout';
import {actionServiceForDoc} from '../services';
import {bindForDoc} from '../services';
import {dev, user} from '../log';
import {registerServiceBuilderForDoc} from '../service';
import {historyForDoc} from '../services';
import {resourcesForDoc} from '../services';
import {computedStyle, getStyle, toggle} from '../style';
import {vsyncFor} from '../services';

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isShowable(element) {
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
    this.resources_ = resourcesForDoc(ampdoc);

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
      'toggleVisibility', this.handleToggle.bind(this));
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
            user().warn('AMP-BIND', `Key-value syntax for AMP.setState() will `
                + `be removed soon. Please use the object-literal syntax `
                + `instead, e.g. "AMP.setState({foo: 'bar'})" instead of `
                + `"AMP.setState(foo='bar')".`);
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

  /**
   * Handles "show" action. This is a very simple action where "display: none"
   * is removed from the target element.
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleShow(invocation) {
    const target = dev().assertElement(invocation.target);
    const ownerWindow = target.ownerDocument.defaultView;

    if (target.classList.contains(getLayoutClass(Layout.NODISPLAY))) {
      user().warn(
          'STANDARD-ACTIONS',
          'Elements with layout=nodisplay cannot be dynamically shown.',
          target);

      return;
    }

    vsyncFor(ownerWindow).measure(() => {
      if (computedStyle(ownerWindow, target).display == 'none' &&
          !isShowable(target)) {

        user().warn(
            'STANDARD-ACTIONS',
            'Elements can only be dynamically shown when they have the ' +
            '"hidden" attribute set or when they were dynamically hidden.',
            target);
      }
    });

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
    if (isShowable(dev().assertElement(invocation.target))) {
      this.handleShow(invocation);
    } else {
      this.handleHide(invocation);
    }
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installStandardActionsForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      'standard-actions',
      StandardActions,
      /* opt_factory */ undefined,
      /* opt_instantiate */ true);
};
