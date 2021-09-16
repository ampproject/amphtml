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

import {ActionTrust} from '../action-trust';
import {OBJECT_STRING_ARGS_KEY} from '../service/action-impl';
import {Layout, getLayoutClass} from '../layout';
import {Services} from '../services';
import {computedStyle, getStyle, toggle} from '../style';
import {dev, user} from '../log';
import {isProtocolValid} from '../url';
import {registerServiceBuilderForDoc} from '../service';
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

    /** @const @private {!./url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = Services.urlReplacementsForDoc(ampdoc);

    /** @const @private {!./viewport-impl.Viewport} */
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
   *
   * See `amp-actions-and-events.md` for documentation.
   *
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleAmpTarget(invocation) {
    switch (invocation.method) {
      case 'setState':
        this.handleAmpSetState_(invocation);
        return;
      case 'navigateTo':
        this.handleAmpNavigateTo_(invocation);
        return;
      case 'goBack':
        this.handleAmpGoBack_(invocation);
        return;
      case 'print':
        this.handleAmpPrint_(invocation);
        return;
    }
    throw user().createError('Unknown AMP action ', invocation.method);
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @private
   */
  handleAmpSetState_(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.MEDIUM)) {
      return;
    }
    Services.bindForDoc(invocation.target).then(bind => {
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
        user().error('AMP-BIND', 'Please use the object-literal syntax, '
            + 'e.g. "AMP.setState({foo: \'bar\'})" instead of '
            + '"AMP.setState(foo=\'bar\')".');
      }
    });
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @private
   */
  handleAmpNavigateTo_(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return;
    }
    const url = invocation.args['url'];
    if (!isProtocolValid(url)) {
      user().error(TAG, 'Cannot navigate to invalid protocol: ' + url);
      return;
    }
    const expandedUrl = this.urlReplacements_.expandUrlSync(url);
    const node = invocation.target;
    const win = (node.ownerDocument || node).defaultView;
    win.location = expandedUrl;
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @private
   */
  handleAmpGoBack_(invocation) {
    // TODO(choumx, #9699): HIGH.
    if (!invocation.satisfiesTrust(ActionTrust.MEDIUM)) {
      return;
    }
    Services.historyForDoc(this.ampdoc).goBack();
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @private
   */
  handleAmpPrint_(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return;
    }
    const node = invocation.target;
    const win = (node.ownerDocument || node).defaultView;
    win.print();
  }

  /**
   * Handles the `scrollTo` action where given an element, we smooth scroll to
   * it with the given animation duraiton
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleScrollTo(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.MEDIUM)) {
      return;
    }
    const node = dev().assertElement(invocation.target);

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
  }

  /**
   * Handles the `focus` action where given an element, we give it focus
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleFocus(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.MEDIUM)) {
      return;
    }
    const node = dev().assertElement(invocation.target);

    // Set focus
    tryFocus(node);
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
          TAG,
          'Elements with layout=nodisplay cannot be dynamically shown.',
          target);

      return;
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
      /* opt_instantiate */ true);
};
