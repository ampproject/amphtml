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

import {ActionTrust} from '../action-constants';
import {Layout, getLayoutClass} from '../layout';
import {Services} from '../services';
import {computedStyle, getStyle, toggle} from '../style';
import {dev, user} from '../log';
import {registerServiceBuilderForDoc} from '../service';
import {toWin} from '../types';
import {tryFocus} from '../dom';

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isShowable(element) {
  return getStyle(element, 'display') == 'none'
      || element.hasAttribute('hidden');
}

/** @const {string} */
const TAG = 'STANDARD-ACTIONS';

/** @const {Array<string>} */
const PERMITTED_POSITIONS = ['top','bottom','center'];


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
    this.actions_ = Services.actionServiceForDoc(ampdoc);

    /** @const @private {!./resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @const @private {!./viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    this.installActions_(this.actions_);
  }

  /** @override */
  adoptEmbedWindow(embedWin) {
    this.installActions_(Services.actionServiceForDoc(embedWin.document));
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
    actionService.addGlobalMethodHandler(
        'scrollTo', this.handleScrollTo.bind(this));
    actionService.addGlobalMethodHandler(
        'focus', this.handleFocus.bind(this));
  }

  /**
   * Handles global `AMP` actions.
   * See `amp-actions-and-events.md` for details.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @throws If the invocation method is unrecognized.
   */
  handleAmpTarget(invocation) {
    // All global `AMP` actions require high trust.
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    const {node, method, args} = invocation;
    const win = (node.ownerDocument || node).defaultView;
    switch (method) {
      case 'pushState':
      case 'setState':
        return Services.bindForDocOrNull(node).then(bind => {
          user().assert(bind, 'AMP-BIND is not installed.');
          return bind.invoke(invocation);
        });

      case 'navigateTo':
        Services.navigationForDoc(this.ampdoc).navigateTo(
            win, args['url'], `AMP.${method}`);
        return null;

      case 'goBack':
        Services.historyForDoc(this.ampdoc).goBack();
        return null;

      case 'print':
        win.print();
        return null;

      case 'optoutOfCid':
        return Services.cidForDoc(this.ampdoc)
            .then(cid => cid.optOut())
            .catch(reason => {
              dev().error(TAG, 'Failed to opt out of CID', reason);
            });
    }
    throw user().createError('Unknown AMP action ', method);
  }

  /**
   * Handles the `scrollTo` action where given an element, we smooth scroll to
   * it with the given animation duraiton
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   */
  handleScrollTo(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    const node = dev().assertElement(invocation.node);

    // Duration for scroll animation
    const duration = invocation.args
                     && invocation.args['duration']
                     && invocation.args['duration'] >= 0 ?
      invocation.args['duration'] : 500;

    // Position in the viewport at the end
    const pos = (invocation.args
                && invocation.args['position']
                && PERMITTED_POSITIONS.includes(invocation.args['position'])) ?
      invocation.args['position'] : 'top';

    // Animate the scroll
    this.viewport_.animateScrollIntoView(node, duration, 'ease-in', pos);

    return null;
  }

  /**
   * Handles the `focus` action where given an element, we give it focus
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   */
  handleFocus(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    const node = dev().assertElement(invocation.node);

    // Set focus
    tryFocus(node);

    return null;
  }

  /**
   * Handles "hide" action. This is a very simple action where "display: none"
   * is applied to the target element.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   */
  handleHide(invocation) {
    const target = dev().assertElement(invocation.node);

    this.resources_.mutateElement(target, () => {
      if (target.classList.contains('i-amphtml-element')) {
        target./*OK*/collapse();
      } else {
        toggle(target, false);
      }
    });

    return null;
  }

  /**
   * Handles "show" action. This is a very simple action where "display: none"
   * is removed from the target element.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   */
  handleShow(invocation) {
    const target = dev().assertElement(invocation.node);
    const ownerWindow = toWin(target.ownerDocument.defaultView);

    if (target.classList.contains(getLayoutClass(Layout.NODISPLAY))) {
      user().warn(
          TAG,
          'Elements with layout=nodisplay cannot be dynamically shown.',
          target);
      return null;
    }

    Services.vsyncFor(ownerWindow).measure(() => {
      if (computedStyle(ownerWindow, target).display == 'none' &&
          !isShowable(target)) {

        user().warn(
            TAG,
            'Elements can only be dynamically shown when they have the ' +
            '"hidden" attribute set or when they were dynamically hidden.',
            target);
      }
    });

    this.resources_.mutateElement(target, () => {
      if (target.classList.contains('i-amphtml-element')) {
        target./*OK*/expand();
      } else {
        toggle(target, true);
        target.removeAttribute('hidden');
      }
    });

    return null;
  }

  /**
   * Handles "toggle" action.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   */
  handleToggle(invocation) {
    if (isShowable(dev().assertElement(invocation.node))) {
      return this.handleShow(invocation);
    } else {
      return this.handleHide(invocation);
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
      /* opt_instantiate */ true);
}
