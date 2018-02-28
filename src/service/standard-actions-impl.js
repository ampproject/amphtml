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
import {Layout, getLayoutClass} from '../layout';
import {OBJECT_STRING_ARGS_KEY} from '../service/action-impl';
import {Services} from '../services';
import {computedStyle, getStyle, toggle} from '../style';
import {dev, user} from '../log';
import {dict} from '../utils/object';
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

    /** @const @private {!./url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = Services.urlReplacementsForDoc(ampdoc);

    /** @const @private {!./viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {?Array<string>} */
    this.ampActionWhitelist_ = null;

    this.installActions_(this.actions_);
  }

  /**
   * Searches for a meta tag containing whitelist of actions on
   * the special AMP target, e.g.,
   * <meta name="amp-action-whitelist" content="AMP.setState,AMP.pushState">
   * @return {?Array<string>} the whitelist of actions on the special AMP target.
   * @private
   */
  getAmpActionWhitelist_() {
    if (this.ampActionWhitelist_) {
      return this.ampActionWhitelist_;
    }

    const head = this.ampdoc.getRootNode().head;
    if (!head) {
      return null;
    }
    // A meta[name="amp-action-whitelist"] tag, if present, contains,
    // in its content attribute, a whitelist of actions on the special AMP target.
    const meta =
      head.querySelector('meta[name="amp-action-whitelist"]');
    if (!meta) {
      return null;
    }

    this.ampActionWhitelist_ = meta.getAttribute('content').split(',')
        .map(action => action.trim());
    return this.ampActionWhitelist_;
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
   * @param {number=} opt_actionIndex
   * @param {!Array<!./action-impl.ActionInfoDef>=} opt_actionInfos
   * @return {?Promise}
   * @throws {Error} If action is not recognized or is not whitelisted.
   */
  handleAmpTarget(invocation, opt_actionIndex, opt_actionInfos) {
    const method = invocation.method;
    if (this.getAmpActionWhitelist_() &&
      !this.getAmpActionWhitelist_().includes(`AMP.${method}`)) {
      throw user().createError(`AMP.${method} is not whitelisted.`);
    }
    switch (method) {
      case 'pushState':
      case 'setState':
        const actions = /** @type {!Array} */ (dev().assert(opt_actionInfos));
        const index = dev().assertNumber(opt_actionIndex);
        // Allow one amp-bind state action per event.
        for (let i = 0; i < index; i++) {
          const action = actions[i];
          if (action.target == 'AMP' && action.method.indexOf('State') >= 0) {
            user().error('AMP-BIND', 'One state action allowed per event.');
            return null;
          }
        }
        return this.handleAmpBindAction_(invocation, method == 'pushState');

      case 'navigateTo':
        return this.handleAmpNavigateTo_(invocation);

      case 'goBack':
        return this.handleAmpGoBack_(invocation);

      case 'print':
        return this.handleAmpPrint_(invocation);
    }
    throw user().createError('Unknown AMP action ', method);
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @param {boolean} isPushState
   * @private
   */
  handleAmpBindAction_(invocation, isPushState) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    return Services.bindForDocOrNull(invocation.target).then(bind => {
      user().assert(bind, 'AMP-BIND is not installed.');

      const objectString = invocation.args[OBJECT_STRING_ARGS_KEY];
      if (objectString) {
        const scope = dict();
        const event = invocation.event;
        if (event && event.detail) {
          scope['event'] = event.detail;
        }
        if (isPushState) {
          return bind.pushStateWithExpression(objectString, scope);
        } else {
          return bind.setStateWithExpression(objectString, scope);
        }
      } else {
        user().error('AMP-BIND', 'Please use the object-literal syntax, '
            + 'e.g. "AMP.setState({foo: \'bar\'})" instead of '
            + '"AMP.setState(foo=\'bar\')".');
      }
    });
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  handleAmpNavigateTo_(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    const node = invocation.target;
    const win = (node.ownerDocument || node).defaultView;
    const url = invocation.args['url'];
    const requestedBy = `AMP.${invocation.method}`;
    Services.navigationForDoc(this.ampdoc).navigateTo(win, url, requestedBy);
    return null;
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @private
   */
  handleAmpGoBack_(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    Services.historyForDoc(this.ampdoc).goBack();
    return null;
  }

  /**
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  handleAmpPrint_(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    const node = invocation.target;
    const win = (node.ownerDocument || node).defaultView;
    win.print();
    return null;
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
    const node = dev().assertElement(invocation.target);

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
    const target = dev().assertElement(invocation.target);

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
    const target = dev().assertElement(invocation.target);
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

    return null;
  }

  /**
   * Handles "toggle" action.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   */
  handleToggle(invocation) {
    if (isShowable(dev().assertElement(invocation.target))) {
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
