import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { ActionTrust } from "../core/constants/action-constants";
import { tryFocus } from "../core/dom";
import { Layout, getLayoutClass } from "../core/dom/layout";
import { computedStyle, toggle } from "../core/dom/style";
import { isFiniteNumber } from "../core/types";
import { toWin } from "../core/window";

import { Services } from "./";

import { dev, user, userAssert } from "../log";
import { getAmpdoc, registerServiceBuilderForDoc } from "../service-helpers";

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isShowable(element) {
  return element.hasAttribute('hidden');
}

/**
 * @param {!Element} element
 * @return {?Element}
 * @visibleForTesting
 */
export function getAutofocusElementForShowAction(element) {
  if (element.hasAttribute('autofocus')) {
    return element;
  }
  return element.querySelector('[autofocus]');
}

/** @const {string} */
var TAG = 'STANDARD-ACTIONS';

/**
 * Regular expression that identifies AMP CSS classes with 'i-amphtml-' prefixes.
 * @type {!RegExp}
 */
var AMP_CSS_RE = /^i-amphtml-/;

/**
 * This service contains implementations of some of the most typical actions,
 * such as hiding DOM elements.
 * @visibleForTesting
 */
export var StandardActions = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function StandardActions(ampdoc) {_classCallCheck(this, StandardActions);
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    var context = ampdoc.getHeadNode();

    /** @const @private {!./mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    /** @const @private {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    // Explicitly not setting `Action` as a member to scope installation to one
    // method and for bundle size savings. 💰
    this.installActions_(Services.actionServiceForDoc(context));
  }

  /**
   * @param {!./action-impl.ActionService} actionService
   * @private
   */_createClass(StandardActions, [{ key: "installActions_", value:
    function installActions_(actionService) {
      actionService.addGlobalTarget('AMP', this.handleAmpTarget_.bind(this));

      // All standard actions require high trust by default via
      // addGlobalMethodHandler.

      actionService.addGlobalMethodHandler('hide', this.handleHide_.bind(this));

      actionService.addGlobalMethodHandler('show', this.handleShow_.bind(this));

      actionService.addGlobalMethodHandler(
      'toggleVisibility',
      this.handleToggle_.bind(this));


      actionService.addGlobalMethodHandler(
      'scrollTo',
      this.handleScrollTo_.bind(this));


      actionService.addGlobalMethodHandler('focus', this.handleFocus_.bind(this));

      actionService.addGlobalMethodHandler(
      'toggleClass',
      this.handleToggleClass_.bind(this));

    }

    /**
     * Handles global `AMP` actions.
     * See `amp-actions-and-events.md` for details.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @throws If the invocation method is unrecognized.
     * @private Visible to tests only.
     */ }, { key: "handleAmpTarget_", value:
    function handleAmpTarget_(invocation) {
      // All global `AMP` actions require default trust.
      if (!invocation.satisfiesTrust(ActionTrust.DEFAULT)) {
        return null;
      }
      var args = invocation.args,method = invocation.method,node = invocation.node;
      var win = getWin(node);
      switch (method) {
        case 'pushState':
        case 'setState':
          var element =
          node.nodeType === Node.DOCUMENT_NODE ?
          /** @type {!Document} */(node).documentElement : /** @type {!Element} */(
          node);
          return Services.bindForDocOrNull(element).then(function (bind) {
            userAssert(bind, 'AMP-BIND is not installed.');
            return bind.invoke(invocation);
          });

        case 'navigateTo':
          return this.handleNavigateTo_(invocation);

        case 'closeOrNavigateTo':
          return this.handleCloseOrNavigateTo_(invocation);

        case 'scrollTo':
          userAssert(args['id'], 'AMP.scrollTo must provide element ID');
          invocation.node = /** @type {!Element} */(
          getAmpdoc(node).getElementById(args['id']));


          return this.handleScrollTo_(invocation);

        case 'goBack':
          Services.historyForDoc(this.ampdoc).goBack(
          /* navigate */!!(args && args['navigate'] === true));

          return null;

        case 'print':
          win.print();
          return null;

        case 'optoutOfCid':
          return Services.cidForDoc(this.ampdoc).
          then(function (cid) {return cid.optOut();}).
          catch(function (reason) {
            dev().error(TAG, 'Failed to opt out of CID', reason);
          });}

      throw user().createError('Unknown AMP action ', method);
    }

    /**
     * Handles the `navigateTo` action.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {!Promise}
     * @private Visible to tests only.
     */ }, { key: "handleNavigateTo_", value:
    function handleNavigateTo_(invocation) {var _this = this;
      var args = invocation.args,caller = invocation.caller,method = invocation.method,node = invocation.node;
      var win = getWin(node);
      // Some components have additional constraints on allowing navigation.
      var permission = _resolvedPromise();
      if (caller.tagName.startsWith('AMP-')) {
        var ampElement = /** @type {!AmpElement} */(caller);
        permission = ampElement.getImpl().then(function (impl) {
          if (typeof impl.throwIfCannotNavigate == 'function') {
            impl.throwIfCannotNavigate();
          }
        });
      }
      return permission.then(
      function () {
        Services.navigationForDoc(_this.ampdoc).navigateTo(
        win,
        args['url'], "AMP.".concat(
        method),
        { target: args['target'], opener: args['opener'] });

      },
      /* onrejected */function (e) {
        user().error(TAG, e);
      });

    }

    /**
     * Handles the `handleCloseOrNavigateTo_` action.
     * This action tries to close the requesting window if allowed, otherwise
     * navigates the window.
     *
     * Window can be closed only from top-level documents that have an opener.
     * Without an opener or if embedded, it will deny the close method.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {!Promise}
     * @private Visible to tests only.
     */ }, { key: "handleCloseOrNavigateTo_", value:
    function handleCloseOrNavigateTo_(invocation) {
      var node = invocation.node;
      var win = getWin(node);

      // Don't allow closing if embedded in iframe or does not have an opener or
      // embedded in a multi-doc shadowDOM case.
      // Note that browser denies win.close in some of these cases already anyway,
      // so not every check here is strictly needed but works as a short-circuit.
      var hasParent = win.parent != win;
      var canBeClosed = win.opener && this.ampdoc.isSingleDoc() && !hasParent;

      var wasClosed = false;
      if (canBeClosed) {
        // Browser may still deny win.close() call, that would be reflected
        // synchronously in win.closed
        win.close();
        wasClosed = win.closed;
      }

      if (!wasClosed) {
        return this.handleNavigateTo_(invocation);
      }

      return _resolvedPromise2();
    }
    /**
     * Handles the `scrollTo` action where given an element, we smooth scroll to
     * it with the given animation duration.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */ }, { key: "handleScrollTo_", value:
    function handleScrollTo_(invocation) {
      var node = /** @type {!Element} */(invocation.node);
      var args = invocation.args;

      // Duration and position are optional.
      // Default values are set by the viewport service, so they're passed through
      // when undefined or invalid.
      var posOrUndef = args && args['position'];
      var durationOrUndef = args && args['duration'];

      if (posOrUndef && !['top', 'bottom', 'center'].includes(posOrUndef)) {
        posOrUndef = undefined;
      }

      if (!isFiniteNumber(durationOrUndef)) {
        durationOrUndef = undefined;
      }

      // Animate the scroll
      // Should return a promise instead of null
      return this.viewport_.animateScrollIntoView(
      node,
      posOrUndef,
      durationOrUndef);

    }

    /**
     * Handles the `focus` action where given an element, we give it focus
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */ }, { key: "handleFocus_", value:
    function handleFocus_(invocation) {
      var node = /** @type {!Element} */(invocation.node);

      // Set focus
      tryFocus(node);

      return null;
    }

    /**
     * Handles "hide" action. This is a very simple action where "display: none"
     * is applied to the target element.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */ }, { key: "handleHide_", value:
    function handleHide_(invocation) {
      var target = /** @type {!Element} */(invocation.node);

      if (target.classList.contains('i-amphtml-element')) {
        var ampElement = /** @type {!AmpElement} */(target);
        this.mutator_.mutateElement(
        ampElement,
        function () {return ampElement. /*OK*/collapse();},
        // It is safe to skip measuring, because `mutator-impl.collapseElement`
        // will set the size of the element as well as trigger a remeasure of
        // everything below the collapsed element.
        /* skipRemeasure */true);

      } else {
        this.mutator_.mutateElement(target, function () {return toggle(target, false);});
      }

      return null;
    }

    /**
     * Handles "show" action. This is a very simple action where "display: none"
     * is removed from the target element.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */ }, { key: "handleShow_", value:
    function handleShow_(invocation) {var _this2 = this;
      var node = invocation.node;
      var target = /** @type {!Element} */(node);
      var ownerWindow = toWin(target.ownerDocument.defaultView);

      if (target.classList.contains(getLayoutClass(Layout.NODISPLAY))) {
        user().warn(
        TAG,
        'Elements with layout=nodisplay cannot be dynamically shown.',
        target);

        return null;
      }

      this.mutator_.measureElement(function () {
        if (
        computedStyle(ownerWindow, target).display == 'none' &&
        !isShowable(target))
        {
          user().warn(
          TAG,
          'Elements can only be dynamically shown when they have the ' +
          '"hidden" attribute set or when they were dynamically hidden.',
          target);

        }
      });

      var autofocusElOrNull = getAutofocusElementForShowAction(target);

      // iOS only honors focus in sync operations.
      if (autofocusElOrNull && Services.platformFor(ownerWindow).isIos()) {
        this.handleShowSync_(target, autofocusElOrNull);
        this.mutator_.mutateElement(target, function () {});
      } else {
        this.mutator_.mutateElement(target, function () {
          _this2.handleShowSync_(target, autofocusElOrNull);
        });
      }

      return null;
    }

    /**
     * @param {!Element} target
     * @param {?Element} autofocusElOrNull
     * @private Visible to tests only.
     */ }, { key: "handleShowSync_", value:
    function handleShowSync_(target, autofocusElOrNull) {
      if (target.classList.contains('i-amphtml-element')) {
        var ampElement = /** @type {!AmpElement} */(target);
        ampElement. /*OK*/expand();
      } else {
        toggle(target, true);
      }
      if (autofocusElOrNull) {
        tryFocus(autofocusElOrNull);
      }
    }

    /**
     * Handles "toggle" action.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */ }, { key: "handleToggle_", value:
    function handleToggle_(invocation) {
      if (isShowable( /** @type {!Element} */(invocation.node))) {
        return this.handleShow_(invocation);
      }
      return this.handleHide_(invocation);
    }

    /**
     * Handles "toggleClass" action.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */ }, { key: "handleToggleClass_", value:
    function handleToggleClass_(invocation) {
      var target = /** @type {!Element} */(invocation.node);
      var args = invocation.args;
      var className = user().assertString(
      args['class'],
      "Argument 'class' must be a string.");

      // prevent toggling of amp internal classes
      if (AMP_CSS_RE.test(className)) {
        return null;
      }

      this.mutator_.mutateElement(target, function () {
        if (args['force'] !== undefined) {
          // must be boolean, won't do type conversion
          var shouldForce = user().assertBoolean(
          args['force'],
          "Optional argument 'force' must be a boolean.");

          target.classList.toggle(className, shouldForce);
        } else {
          target.classList.toggle(className);
        }
      });

      return null;
    } }]);return StandardActions;}();


/**
 * @param {!Node} node
 * @return {!Window}
 */
function getWin(node) {
  return toWin(
  (node.ownerDocument || /** @type {!Document} */(node)).defaultView);

}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installStandardActionsForDoc(ampdoc) {
  registerServiceBuilderForDoc(
  ampdoc,
  'standard-actions',
  StandardActions,
  /* opt_instantiate */true);

}
// /Users/mszylkowski/src/amphtml/src/service/standard-actions-impl.js