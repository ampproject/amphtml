import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
  function StandardActions(ampdoc) {
    _classCallCheck(this, StandardActions);

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
   */
  _createClass(StandardActions, [{
    key: "installActions_",
    value: function installActions_(actionService) {
      actionService.addGlobalTarget('AMP', this.handleAmpTarget_.bind(this));
      // All standard actions require high trust by default via
      // addGlobalMethodHandler.
      actionService.addGlobalMethodHandler('hide', this.handleHide_.bind(this));
      actionService.addGlobalMethodHandler('show', this.handleShow_.bind(this));
      actionService.addGlobalMethodHandler('toggleVisibility', this.handleToggle_.bind(this));
      actionService.addGlobalMethodHandler('scrollTo', this.handleScrollTo_.bind(this));
      actionService.addGlobalMethodHandler('focus', this.handleFocus_.bind(this));
      actionService.addGlobalMethodHandler('toggleClass', this.handleToggleClass_.bind(this));
    }
    /**
     * Handles global `AMP` actions.
     * See `amp-actions-and-events.md` for details.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @throws If the invocation method is unrecognized.
     * @private Visible to tests only.
     */

  }, {
    key: "handleAmpTarget_",
    value: function handleAmpTarget_(invocation) {
      // All global `AMP` actions require default trust.
      if (!invocation.satisfiesTrust(ActionTrust.DEFAULT)) {
        return null;
      }

      var args = invocation.args,
          method = invocation.method,
          node = invocation.node;
      var win = getWin(node);

      switch (method) {
        case 'pushState':
        case 'setState':
          var element = node.nodeType === Node.DOCUMENT_NODE ?
          /** @type {!Document} */
          node.documentElement : dev().assertElement(node);
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
          invocation.node = dev().assertElement(getAmpdoc(node).getElementById(args['id']), 'scrollTo element ID must exist on page');
          return this.handleScrollTo_(invocation);

        case 'goBack':
          Services.historyForDoc(this.ampdoc).goBack(
          /* navigate */
          !!(args && args['navigate'] === true));
          return null;

        case 'print':
          win.print();
          return null;

        case 'optoutOfCid':
          return Services.cidForDoc(this.ampdoc).then(function (cid) {
            return cid.optOut();
          }).catch(function (reason) {
            dev().error(TAG, 'Failed to opt out of CID', reason);
          });
      }

      throw user().createError('Unknown AMP action ', method);
    }
    /**
     * Handles the `navigateTo` action.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {!Promise}
     * @private Visible to tests only.
     */

  }, {
    key: "handleNavigateTo_",
    value: function handleNavigateTo_(invocation) {
      var _this = this;

      var args = invocation.args,
          caller = invocation.caller,
          method = invocation.method,
          node = invocation.node;
      var win = getWin(node);

      // Some components have additional constraints on allowing navigation.
      var permission = _resolvedPromise();

      if (caller.tagName.startsWith('AMP-')) {
        var ampElement =
        /** @type {!AmpElement} */
        caller;
        permission = ampElement.getImpl().then(function (impl) {
          if (typeof impl.throwIfCannotNavigate == 'function') {
            impl.throwIfCannotNavigate();
          }
        });
      }

      return permission.then(function () {
        Services.navigationForDoc(_this.ampdoc).navigateTo(win, args['url'], "AMP." + method, {
          target: args['target'],
          opener: args['opener']
        });
      },
      /* onrejected */
      function (e) {
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
     */

  }, {
    key: "handleCloseOrNavigateTo_",
    value: function handleCloseOrNavigateTo_(invocation) {
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
     */

  }, {
    key: "handleScrollTo_",
    value: function handleScrollTo_(invocation) {
      var node = dev().assertElement(invocation.node);
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
      return this.viewport_.animateScrollIntoView(node, posOrUndef, durationOrUndef);
    }
    /**
     * Handles the `focus` action where given an element, we give it focus
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */

  }, {
    key: "handleFocus_",
    value: function handleFocus_(invocation) {
      var node = dev().assertElement(invocation.node);
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
     */

  }, {
    key: "handleHide_",
    value: function handleHide_(invocation) {
      var target = dev().assertElement(invocation.node);

      if (target.classList.contains('i-amphtml-element')) {
        var ampElement =
        /** @type {!AmpElement} */
        target;
        this.mutator_.mutateElement(ampElement, function () {
          return ampElement.
          /*OK*/
          collapse();
        }, // It is safe to skip measuring, because `mutator-impl.collapseElement`
        // will set the size of the element as well as trigger a remeasure of
        // everything below the collapsed element.

        /* skipRemeasure */
        true);
      } else {
        this.mutator_.mutateElement(target, function () {
          return toggle(target, false);
        });
      }

      return null;
    }
    /**
     * Handles "show" action. This is a very simple action where "display: none"
     * is removed from the target element.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */

  }, {
    key: "handleShow_",
    value: function handleShow_(invocation) {
      var _this2 = this;

      var node = invocation.node;
      var target = dev().assertElement(node);
      var ownerWindow = toWin(target.ownerDocument.defaultView);

      if (target.classList.contains(getLayoutClass(Layout.NODISPLAY))) {
        user().warn(TAG, 'Elements with layout=nodisplay cannot be dynamically shown.', target);
        return null;
      }

      this.mutator_.measureElement(function () {
        if (computedStyle(ownerWindow, target).display == 'none' && !isShowable(target)) {
          user().warn(TAG, 'Elements can only be dynamically shown when they have the ' + '"hidden" attribute set or when they were dynamically hidden.', target);
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
     */

  }, {
    key: "handleShowSync_",
    value: function handleShowSync_(target, autofocusElOrNull) {
      if (target.classList.contains('i-amphtml-element')) {
        var ampElement =
        /** @type {!AmpElement} */
        target;
        ampElement.
        /*OK*/
        expand();
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
     */

  }, {
    key: "handleToggle_",
    value: function handleToggle_(invocation) {
      if (isShowable(dev().assertElement(invocation.node))) {
        return this.handleShow_(invocation);
      }

      return this.handleHide_(invocation);
    }
    /**
     * Handles "toggleClass" action.
     * @param {!./action-impl.ActionInvocation} invocation
     * @return {?Promise}
     * @private Visible to tests only.
     */

  }, {
    key: "handleToggleClass_",
    value: function handleToggleClass_(invocation) {
      var target = dev().assertElement(invocation.node);
      var args = invocation.args;
      var className = user().assertString(args['class'], "Argument 'class' must be a string.");

      // prevent toggling of amp internal classes
      if (AMP_CSS_RE.test(className)) {
        return null;
      }

      this.mutator_.mutateElement(target, function () {
        if (args['force'] !== undefined) {
          // must be boolean, won't do type conversion
          var shouldForce = user().assertBoolean(args['force'], "Optional argument 'force' must be a boolean.");
          target.classList.toggle(className, shouldForce);
        } else {
          target.classList.toggle(className);
        }
      });
      return null;
    }
  }]);

  return StandardActions;
}();

/**
 * @param {!Node} node
 * @return {!Window}
 */
function getWin(node) {
  return toWin((node.ownerDocument ||
  /** @type {!Document} */
  node).defaultView);
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installStandardActionsForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'standard-actions', StandardActions,
  /* opt_instantiate */
  true);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YW5kYXJkLWFjdGlvbnMtaW1wbC5qcyJdLCJuYW1lcyI6WyJBY3Rpb25UcnVzdCIsInRyeUZvY3VzIiwiTGF5b3V0IiwiZ2V0TGF5b3V0Q2xhc3MiLCJjb21wdXRlZFN0eWxlIiwidG9nZ2xlIiwiaXNGaW5pdGVOdW1iZXIiLCJ0b1dpbiIsIlNlcnZpY2VzIiwiZGV2IiwidXNlciIsInVzZXJBc3NlcnQiLCJnZXRBbXBkb2MiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiaXNTaG93YWJsZSIsImVsZW1lbnQiLCJoYXNBdHRyaWJ1dGUiLCJnZXRBdXRvZm9jdXNFbGVtZW50Rm9yU2hvd0FjdGlvbiIsInF1ZXJ5U2VsZWN0b3IiLCJUQUciLCJBTVBfQ1NTX1JFIiwiU3RhbmRhcmRBY3Rpb25zIiwiYW1wZG9jIiwiY29udGV4dCIsImdldEhlYWROb2RlIiwibXV0YXRvcl8iLCJtdXRhdG9yRm9yRG9jIiwidmlld3BvcnRfIiwidmlld3BvcnRGb3JEb2MiLCJpbnN0YWxsQWN0aW9uc18iLCJhY3Rpb25TZXJ2aWNlRm9yRG9jIiwiYWN0aW9uU2VydmljZSIsImFkZEdsb2JhbFRhcmdldCIsImhhbmRsZUFtcFRhcmdldF8iLCJiaW5kIiwiYWRkR2xvYmFsTWV0aG9kSGFuZGxlciIsImhhbmRsZUhpZGVfIiwiaGFuZGxlU2hvd18iLCJoYW5kbGVUb2dnbGVfIiwiaGFuZGxlU2Nyb2xsVG9fIiwiaGFuZGxlRm9jdXNfIiwiaGFuZGxlVG9nZ2xlQ2xhc3NfIiwiaW52b2NhdGlvbiIsInNhdGlzZmllc1RydXN0IiwiREVGQVVMVCIsImFyZ3MiLCJtZXRob2QiLCJub2RlIiwid2luIiwiZ2V0V2luIiwibm9kZVR5cGUiLCJOb2RlIiwiRE9DVU1FTlRfTk9ERSIsImRvY3VtZW50RWxlbWVudCIsImFzc2VydEVsZW1lbnQiLCJiaW5kRm9yRG9jT3JOdWxsIiwidGhlbiIsImludm9rZSIsImhhbmRsZU5hdmlnYXRlVG9fIiwiaGFuZGxlQ2xvc2VPck5hdmlnYXRlVG9fIiwiZ2V0RWxlbWVudEJ5SWQiLCJoaXN0b3J5Rm9yRG9jIiwiZ29CYWNrIiwicHJpbnQiLCJjaWRGb3JEb2MiLCJjaWQiLCJvcHRPdXQiLCJjYXRjaCIsInJlYXNvbiIsImVycm9yIiwiY3JlYXRlRXJyb3IiLCJjYWxsZXIiLCJwZXJtaXNzaW9uIiwidGFnTmFtZSIsInN0YXJ0c1dpdGgiLCJhbXBFbGVtZW50IiwiZ2V0SW1wbCIsImltcGwiLCJ0aHJvd0lmQ2Fubm90TmF2aWdhdGUiLCJuYXZpZ2F0aW9uRm9yRG9jIiwibmF2aWdhdGVUbyIsInRhcmdldCIsIm9wZW5lciIsImUiLCJoYXNQYXJlbnQiLCJwYXJlbnQiLCJjYW5CZUNsb3NlZCIsImlzU2luZ2xlRG9jIiwid2FzQ2xvc2VkIiwiY2xvc2UiLCJjbG9zZWQiLCJwb3NPclVuZGVmIiwiZHVyYXRpb25PclVuZGVmIiwiaW5jbHVkZXMiLCJ1bmRlZmluZWQiLCJhbmltYXRlU2Nyb2xsSW50b1ZpZXciLCJjbGFzc0xpc3QiLCJjb250YWlucyIsIm11dGF0ZUVsZW1lbnQiLCJjb2xsYXBzZSIsIm93bmVyV2luZG93Iiwib3duZXJEb2N1bWVudCIsImRlZmF1bHRWaWV3IiwiTk9ESVNQTEFZIiwid2FybiIsIm1lYXN1cmVFbGVtZW50IiwiZGlzcGxheSIsImF1dG9mb2N1c0VsT3JOdWxsIiwicGxhdGZvcm1Gb3IiLCJpc0lvcyIsImhhbmRsZVNob3dTeW5jXyIsImV4cGFuZCIsImNsYXNzTmFtZSIsImFzc2VydFN0cmluZyIsInRlc3QiLCJzaG91bGRGb3JjZSIsImFzc2VydEJvb2xlYW4iLCJpbnN0YWxsU3RhbmRhcmRBY3Rpb25zRm9yRG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxXQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLE1BQVIsRUFBZ0JDLGNBQWhCO0FBQ0Es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QnBFLElBQUksQ0FBQyxPQUFELENBRFksRUFFaEIsb0NBRmdCLENBQWxCOztBQUlBO0FBQ0EsVUFBSXpCLFVBQVUsQ0FBQzhGLElBQVgsQ0FBZ0JGLFNBQWhCLENBQUosRUFBZ0M7QUFDOUIsZUFBTyxJQUFQO0FBQ0Q7O0FBRUQsV0FBS3ZGLFFBQUwsQ0FBY3lFLGFBQWQsQ0FBNEJqQixNQUE1QixFQUFvQyxZQUFNO0FBQ3hDLFlBQUlwQyxJQUFJLENBQUMsT0FBRCxDQUFKLEtBQWtCaUQsU0FBdEIsRUFBaUM7QUFDL0I7QUFDQSxjQUFNcUIsV0FBVyxHQUFHekcsSUFBSSxHQUFHMEcsYUFBUCxDQUNsQnZFLElBQUksQ0FBQyxPQUFELENBRGMsRUFFbEIsOENBRmtCLENBQXBCO0FBSUFvQyxVQUFBQSxNQUFNLENBQUNlLFNBQVAsQ0FBaUIzRixNQUFqQixDQUF3QjJHLFNBQXhCLEVBQW1DRyxXQUFuQztBQUNELFNBUEQsTUFPTztBQUNMbEMsVUFBQUEsTUFBTSxDQUFDZSxTQUFQLENBQWlCM0YsTUFBakIsQ0FBd0IyRyxTQUF4QjtBQUNEO0FBQ0YsT0FYRDtBQWFBLGFBQU8sSUFBUDtBQUNEO0FBcFhIOztBQUFBO0FBQUE7O0FBdVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUy9ELE1BQVQsQ0FBZ0JGLElBQWhCLEVBQXNCO0FBQ3BCLFNBQU94QyxLQUFLLENBQ1YsQ0FBQ3dDLElBQUksQ0FBQ3NELGFBQUw7QUFBc0I7QUFBMEJ0RCxFQUFBQSxJQUFqRCxFQUF3RHVELFdBRDlDLENBQVo7QUFHRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNlLDRCQUFULENBQXNDL0YsTUFBdEMsRUFBOEM7QUFDbkRULEVBQUFBLDRCQUE0QixDQUMxQlMsTUFEMEIsRUFFMUIsa0JBRjBCLEVBRzFCRCxlQUgwQjtBQUkxQjtBQUFzQixNQUpJLENBQTVCO0FBTUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtBY3Rpb25UcnVzdH0gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2FjdGlvbi1jb25zdGFudHMnO1xuaW1wb3J0IHt0cnlGb2N1c30gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7TGF5b3V0LCBnZXRMYXlvdXRDbGFzc30gZnJvbSAnI2NvcmUvZG9tL2xheW91dCc7XG5pbXBvcnQge2NvbXB1dGVkU3R5bGUsIHRvZ2dsZX0gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7aXNGaW5pdGVOdW1iZXJ9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7dG9XaW59IGZyb20gJyNjb3JlL3dpbmRvdyc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcblxuaW1wb3J0IHtkZXYsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2dldEFtcGRvYywgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvY30gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1Nob3dhYmxlKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdoaWRkZW4nKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXV0b2ZvY3VzRWxlbWVudEZvclNob3dBY3Rpb24oZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2F1dG9mb2N1cycpKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cbiAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvcignW2F1dG9mb2N1c10nKTtcbn1cblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ1NUQU5EQVJELUFDVElPTlMnO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGlkZW50aWZpZXMgQU1QIENTUyBjbGFzc2VzIHdpdGggJ2ktYW1waHRtbC0nIHByZWZpeGVzLlxuICogQHR5cGUgeyFSZWdFeHB9XG4gKi9cbmNvbnN0IEFNUF9DU1NfUkUgPSAvXmktYW1waHRtbC0vO1xuXG4vKipcbiAqIFRoaXMgc2VydmljZSBjb250YWlucyBpbXBsZW1lbnRhdGlvbnMgb2Ygc29tZSBvZiB0aGUgbW9zdCB0eXBpY2FsIGFjdGlvbnMsXG4gKiBzdWNoIGFzIGhpZGluZyBET00gZWxlbWVudHMuXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIFN0YW5kYXJkQWN0aW9ucyB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICBjb25zdCBjb250ZXh0ID0gYW1wZG9jLmdldEhlYWROb2RlKCk7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshLi9tdXRhdG9yLWludGVyZmFjZS5NdXRhdG9ySW50ZXJmYWNlfSAqL1xuICAgIHRoaXMubXV0YXRvcl8gPSBTZXJ2aWNlcy5tdXRhdG9yRm9yRG9jKGFtcGRvYyk7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshLi92aWV3cG9ydC92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRJbnRlcmZhY2V9ICovXG4gICAgdGhpcy52aWV3cG9ydF8gPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhhbXBkb2MpO1xuXG4gICAgLy8gRXhwbGljaXRseSBub3Qgc2V0dGluZyBgQWN0aW9uYCBhcyBhIG1lbWJlciB0byBzY29wZSBpbnN0YWxsYXRpb24gdG8gb25lXG4gICAgLy8gbWV0aG9kIGFuZCBmb3IgYnVuZGxlIHNpemUgc2F2aW5ncy4g8J+SsFxuICAgIHRoaXMuaW5zdGFsbEFjdGlvbnNfKFNlcnZpY2VzLmFjdGlvblNlcnZpY2VGb3JEb2MoY29udGV4dCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYWN0aW9uLWltcGwuQWN0aW9uU2VydmljZX0gYWN0aW9uU2VydmljZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5zdGFsbEFjdGlvbnNfKGFjdGlvblNlcnZpY2UpIHtcbiAgICBhY3Rpb25TZXJ2aWNlLmFkZEdsb2JhbFRhcmdldCgnQU1QJywgdGhpcy5oYW5kbGVBbXBUYXJnZXRfLmJpbmQodGhpcykpO1xuXG4gICAgLy8gQWxsIHN0YW5kYXJkIGFjdGlvbnMgcmVxdWlyZSBoaWdoIHRydXN0IGJ5IGRlZmF1bHQgdmlhXG4gICAgLy8gYWRkR2xvYmFsTWV0aG9kSGFuZGxlci5cblxuICAgIGFjdGlvblNlcnZpY2UuYWRkR2xvYmFsTWV0aG9kSGFuZGxlcignaGlkZScsIHRoaXMuaGFuZGxlSGlkZV8uYmluZCh0aGlzKSk7XG5cbiAgICBhY3Rpb25TZXJ2aWNlLmFkZEdsb2JhbE1ldGhvZEhhbmRsZXIoJ3Nob3cnLCB0aGlzLmhhbmRsZVNob3dfLmJpbmQodGhpcykpO1xuXG4gICAgYWN0aW9uU2VydmljZS5hZGRHbG9iYWxNZXRob2RIYW5kbGVyKFxuICAgICAgJ3RvZ2dsZVZpc2liaWxpdHknLFxuICAgICAgdGhpcy5oYW5kbGVUb2dnbGVfLmJpbmQodGhpcylcbiAgICApO1xuXG4gICAgYWN0aW9uU2VydmljZS5hZGRHbG9iYWxNZXRob2RIYW5kbGVyKFxuICAgICAgJ3Njcm9sbFRvJyxcbiAgICAgIHRoaXMuaGFuZGxlU2Nyb2xsVG9fLmJpbmQodGhpcylcbiAgICApO1xuXG4gICAgYWN0aW9uU2VydmljZS5hZGRHbG9iYWxNZXRob2RIYW5kbGVyKCdmb2N1cycsIHRoaXMuaGFuZGxlRm9jdXNfLmJpbmQodGhpcykpO1xuXG4gICAgYWN0aW9uU2VydmljZS5hZGRHbG9iYWxNZXRob2RIYW5kbGVyKFxuICAgICAgJ3RvZ2dsZUNsYXNzJyxcbiAgICAgIHRoaXMuaGFuZGxlVG9nZ2xlQ2xhc3NfLmJpbmQodGhpcylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgZ2xvYmFsIGBBTVBgIGFjdGlvbnMuXG4gICAqIFNlZSBgYW1wLWFjdGlvbnMtYW5kLWV2ZW50cy5tZGAgZm9yIGRldGFpbHMuXG4gICAqIEBwYXJhbSB7IS4vYWN0aW9uLWltcGwuQWN0aW9uSW52b2NhdGlvbn0gaW52b2NhdGlvblxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHRocm93cyBJZiB0aGUgaW52b2NhdGlvbiBtZXRob2QgaXMgdW5yZWNvZ25pemVkLlxuICAgKiBAcHJpdmF0ZSBWaXNpYmxlIHRvIHRlc3RzIG9ubHkuXG4gICAqL1xuICBoYW5kbGVBbXBUYXJnZXRfKGludm9jYXRpb24pIHtcbiAgICAvLyBBbGwgZ2xvYmFsIGBBTVBgIGFjdGlvbnMgcmVxdWlyZSBkZWZhdWx0IHRydXN0LlxuICAgIGlmICghaW52b2NhdGlvbi5zYXRpc2ZpZXNUcnVzdChBY3Rpb25UcnVzdC5ERUZBVUxUKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHthcmdzLCBtZXRob2QsIG5vZGV9ID0gaW52b2NhdGlvbjtcbiAgICBjb25zdCB3aW4gPSBnZXRXaW4obm9kZSk7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgJ3B1c2hTdGF0ZSc6XG4gICAgICBjYXNlICdzZXRTdGF0ZSc6XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPVxuICAgICAgICAgIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfTk9ERVxuICAgICAgICAgICAgPyAvKiogQHR5cGUgeyFEb2N1bWVudH0gKi8gKG5vZGUpLmRvY3VtZW50RWxlbWVudFxuICAgICAgICAgICAgOiBkZXYoKS5hc3NlcnRFbGVtZW50KG5vZGUpO1xuICAgICAgICByZXR1cm4gU2VydmljZXMuYmluZEZvckRvY09yTnVsbChlbGVtZW50KS50aGVuKChiaW5kKSA9PiB7XG4gICAgICAgICAgdXNlckFzc2VydChiaW5kLCAnQU1QLUJJTkQgaXMgbm90IGluc3RhbGxlZC4nKTtcbiAgICAgICAgICByZXR1cm4gYmluZC5pbnZva2UoaW52b2NhdGlvbik7XG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICduYXZpZ2F0ZVRvJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlTmF2aWdhdGVUb18oaW52b2NhdGlvbik7XG5cbiAgICAgIGNhc2UgJ2Nsb3NlT3JOYXZpZ2F0ZVRvJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlQ2xvc2VPck5hdmlnYXRlVG9fKGludm9jYXRpb24pO1xuXG4gICAgICBjYXNlICdzY3JvbGxUbyc6XG4gICAgICAgIHVzZXJBc3NlcnQoYXJnc1snaWQnXSwgJ0FNUC5zY3JvbGxUbyBtdXN0IHByb3ZpZGUgZWxlbWVudCBJRCcpO1xuICAgICAgICBpbnZvY2F0aW9uLm5vZGUgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgICAgIGdldEFtcGRvYyhub2RlKS5nZXRFbGVtZW50QnlJZChhcmdzWydpZCddKSxcbiAgICAgICAgICAnc2Nyb2xsVG8gZWxlbWVudCBJRCBtdXN0IGV4aXN0IG9uIHBhZ2UnXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNjcm9sbFRvXyhpbnZvY2F0aW9uKTtcblxuICAgICAgY2FzZSAnZ29CYWNrJzpcbiAgICAgICAgU2VydmljZXMuaGlzdG9yeUZvckRvYyh0aGlzLmFtcGRvYykuZ29CYWNrKFxuICAgICAgICAgIC8qIG5hdmlnYXRlICovICEhKGFyZ3MgJiYgYXJnc1snbmF2aWdhdGUnXSA9PT0gdHJ1ZSlcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgIGNhc2UgJ3ByaW50JzpcbiAgICAgICAgd2luLnByaW50KCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICBjYXNlICdvcHRvdXRPZkNpZCc6XG4gICAgICAgIHJldHVybiBTZXJ2aWNlcy5jaWRGb3JEb2ModGhpcy5hbXBkb2MpXG4gICAgICAgICAgLnRoZW4oKGNpZCkgPT4gY2lkLm9wdE91dCgpKVxuICAgICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiB7XG4gICAgICAgICAgICBkZXYoKS5lcnJvcihUQUcsICdGYWlsZWQgdG8gb3B0IG91dCBvZiBDSUQnLCByZWFzb24pO1xuICAgICAgICAgIH0pO1xuICAgIH1cbiAgICB0aHJvdyB1c2VyKCkuY3JlYXRlRXJyb3IoJ1Vua25vd24gQU1QIGFjdGlvbiAnLCBtZXRob2QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGBuYXZpZ2F0ZVRvYCBhY3Rpb24uXG4gICAqIEBwYXJhbSB7IS4vYWN0aW9uLWltcGwuQWN0aW9uSW52b2NhdGlvbn0gaW52b2NhdGlvblxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGUgVmlzaWJsZSB0byB0ZXN0cyBvbmx5LlxuICAgKi9cbiAgaGFuZGxlTmF2aWdhdGVUb18oaW52b2NhdGlvbikge1xuICAgIGNvbnN0IHthcmdzLCBjYWxsZXIsIG1ldGhvZCwgbm9kZX0gPSBpbnZvY2F0aW9uO1xuICAgIGNvbnN0IHdpbiA9IGdldFdpbihub2RlKTtcbiAgICAvLyBTb21lIGNvbXBvbmVudHMgaGF2ZSBhZGRpdGlvbmFsIGNvbnN0cmFpbnRzIG9uIGFsbG93aW5nIG5hdmlnYXRpb24uXG4gICAgbGV0IHBlcm1pc3Npb24gPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBpZiAoY2FsbGVyLnRhZ05hbWUuc3RhcnRzV2l0aCgnQU1QLScpKSB7XG4gICAgICBjb25zdCBhbXBFbGVtZW50ID0gLyoqIEB0eXBlIHshQW1wRWxlbWVudH0gKi8gKGNhbGxlcik7XG4gICAgICBwZXJtaXNzaW9uID0gYW1wRWxlbWVudC5nZXRJbXBsKCkudGhlbigoaW1wbCkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGltcGwudGhyb3dJZkNhbm5vdE5hdmlnYXRlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpbXBsLnRocm93SWZDYW5ub3ROYXZpZ2F0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBlcm1pc3Npb24udGhlbihcbiAgICAgICgpID0+IHtcbiAgICAgICAgU2VydmljZXMubmF2aWdhdGlvbkZvckRvYyh0aGlzLmFtcGRvYykubmF2aWdhdGVUbyhcbiAgICAgICAgICB3aW4sXG4gICAgICAgICAgYXJnc1sndXJsJ10sXG4gICAgICAgICAgYEFNUC4ke21ldGhvZH1gLFxuICAgICAgICAgIHt0YXJnZXQ6IGFyZ3NbJ3RhcmdldCddLCBvcGVuZXI6IGFyZ3NbJ29wZW5lciddfVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIC8qIG9ucmVqZWN0ZWQgKi8gKGUpID0+IHtcbiAgICAgICAgdXNlcigpLmVycm9yKFRBRywgZSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBgaGFuZGxlQ2xvc2VPck5hdmlnYXRlVG9fYCBhY3Rpb24uXG4gICAqIFRoaXMgYWN0aW9uIHRyaWVzIHRvIGNsb3NlIHRoZSByZXF1ZXN0aW5nIHdpbmRvdyBpZiBhbGxvd2VkLCBvdGhlcndpc2VcbiAgICogbmF2aWdhdGVzIHRoZSB3aW5kb3cuXG4gICAqXG4gICAqIFdpbmRvdyBjYW4gYmUgY2xvc2VkIG9ubHkgZnJvbSB0b3AtbGV2ZWwgZG9jdW1lbnRzIHRoYXQgaGF2ZSBhbiBvcGVuZXIuXG4gICAqIFdpdGhvdXQgYW4gb3BlbmVyIG9yIGlmIGVtYmVkZGVkLCBpdCB3aWxsIGRlbnkgdGhlIGNsb3NlIG1ldGhvZC5cbiAgICogQHBhcmFtIHshLi9hY3Rpb24taW1wbC5BY3Rpb25JbnZvY2F0aW9ufSBpbnZvY2F0aW9uXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKiBAcHJpdmF0ZSBWaXNpYmxlIHRvIHRlc3RzIG9ubHkuXG4gICAqL1xuICBoYW5kbGVDbG9zZU9yTmF2aWdhdGVUb18oaW52b2NhdGlvbikge1xuICAgIGNvbnN0IHtub2RlfSA9IGludm9jYXRpb247XG4gICAgY29uc3Qgd2luID0gZ2V0V2luKG5vZGUpO1xuXG4gICAgLy8gRG9uJ3QgYWxsb3cgY2xvc2luZyBpZiBlbWJlZGRlZCBpbiBpZnJhbWUgb3IgZG9lcyBub3QgaGF2ZSBhbiBvcGVuZXIgb3JcbiAgICAvLyBlbWJlZGRlZCBpbiBhIG11bHRpLWRvYyBzaGFkb3dET00gY2FzZS5cbiAgICAvLyBOb3RlIHRoYXQgYnJvd3NlciBkZW5pZXMgd2luLmNsb3NlIGluIHNvbWUgb2YgdGhlc2UgY2FzZXMgYWxyZWFkeSBhbnl3YXksXG4gICAgLy8gc28gbm90IGV2ZXJ5IGNoZWNrIGhlcmUgaXMgc3RyaWN0bHkgbmVlZGVkIGJ1dCB3b3JrcyBhcyBhIHNob3J0LWNpcmN1aXQuXG4gICAgY29uc3QgaGFzUGFyZW50ID0gd2luLnBhcmVudCAhPSB3aW47XG4gICAgY29uc3QgY2FuQmVDbG9zZWQgPSB3aW4ub3BlbmVyICYmIHRoaXMuYW1wZG9jLmlzU2luZ2xlRG9jKCkgJiYgIWhhc1BhcmVudDtcblxuICAgIGxldCB3YXNDbG9zZWQgPSBmYWxzZTtcbiAgICBpZiAoY2FuQmVDbG9zZWQpIHtcbiAgICAgIC8vIEJyb3dzZXIgbWF5IHN0aWxsIGRlbnkgd2luLmNsb3NlKCkgY2FsbCwgdGhhdCB3b3VsZCBiZSByZWZsZWN0ZWRcbiAgICAgIC8vIHN5bmNocm9ub3VzbHkgaW4gd2luLmNsb3NlZFxuICAgICAgd2luLmNsb3NlKCk7XG4gICAgICB3YXNDbG9zZWQgPSB3aW4uY2xvc2VkO1xuICAgIH1cblxuICAgIGlmICghd2FzQ2xvc2VkKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVOYXZpZ2F0ZVRvXyhpbnZvY2F0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGBzY3JvbGxUb2AgYWN0aW9uIHdoZXJlIGdpdmVuIGFuIGVsZW1lbnQsIHdlIHNtb290aCBzY3JvbGwgdG9cbiAgICogaXQgd2l0aCB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGR1cmF0aW9uLlxuICAgKiBAcGFyYW0geyEuL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb259IGludm9jYXRpb25cbiAgICogQHJldHVybiB7P1Byb21pc2V9XG4gICAqIEBwcml2YXRlIFZpc2libGUgdG8gdGVzdHMgb25seS5cbiAgICovXG4gIGhhbmRsZVNjcm9sbFRvXyhpbnZvY2F0aW9uKSB7XG4gICAgY29uc3Qgbm9kZSA9IGRldigpLmFzc2VydEVsZW1lbnQoaW52b2NhdGlvbi5ub2RlKTtcbiAgICBjb25zdCB7YXJnc30gPSBpbnZvY2F0aW9uO1xuXG4gICAgLy8gRHVyYXRpb24gYW5kIHBvc2l0aW9uIGFyZSBvcHRpb25hbC5cbiAgICAvLyBEZWZhdWx0IHZhbHVlcyBhcmUgc2V0IGJ5IHRoZSB2aWV3cG9ydCBzZXJ2aWNlLCBzbyB0aGV5J3JlIHBhc3NlZCB0aHJvdWdoXG4gICAgLy8gd2hlbiB1bmRlZmluZWQgb3IgaW52YWxpZC5cbiAgICBsZXQgcG9zT3JVbmRlZiA9IGFyZ3MgJiYgYXJnc1sncG9zaXRpb24nXTtcbiAgICBsZXQgZHVyYXRpb25PclVuZGVmID0gYXJncyAmJiBhcmdzWydkdXJhdGlvbiddO1xuXG4gICAgaWYgKHBvc09yVW5kZWYgJiYgIVsndG9wJywgJ2JvdHRvbScsICdjZW50ZXInXS5pbmNsdWRlcyhwb3NPclVuZGVmKSkge1xuICAgICAgcG9zT3JVbmRlZiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoIWlzRmluaXRlTnVtYmVyKGR1cmF0aW9uT3JVbmRlZikpIHtcbiAgICAgIGR1cmF0aW9uT3JVbmRlZiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBBbmltYXRlIHRoZSBzY3JvbGxcbiAgICAvLyBTaG91bGQgcmV0dXJuIGEgcHJvbWlzZSBpbnN0ZWFkIG9mIG51bGxcbiAgICByZXR1cm4gdGhpcy52aWV3cG9ydF8uYW5pbWF0ZVNjcm9sbEludG9WaWV3KFxuICAgICAgbm9kZSxcbiAgICAgIHBvc09yVW5kZWYsXG4gICAgICBkdXJhdGlvbk9yVW5kZWZcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGBmb2N1c2AgYWN0aW9uIHdoZXJlIGdpdmVuIGFuIGVsZW1lbnQsIHdlIGdpdmUgaXQgZm9jdXNcbiAgICogQHBhcmFtIHshLi9hY3Rpb24taW1wbC5BY3Rpb25JbnZvY2F0aW9ufSBpbnZvY2F0aW9uXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAcHJpdmF0ZSBWaXNpYmxlIHRvIHRlc3RzIG9ubHkuXG4gICAqL1xuICBoYW5kbGVGb2N1c18oaW52b2NhdGlvbikge1xuICAgIGNvbnN0IG5vZGUgPSBkZXYoKS5hc3NlcnRFbGVtZW50KGludm9jYXRpb24ubm9kZSk7XG5cbiAgICAvLyBTZXQgZm9jdXNcbiAgICB0cnlGb2N1cyhub2RlKTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgXCJoaWRlXCIgYWN0aW9uLiBUaGlzIGlzIGEgdmVyeSBzaW1wbGUgYWN0aW9uIHdoZXJlIFwiZGlzcGxheTogbm9uZVwiXG4gICAqIGlzIGFwcGxpZWQgdG8gdGhlIHRhcmdldCBlbGVtZW50LlxuICAgKiBAcGFyYW0geyEuL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb259IGludm9jYXRpb25cbiAgICogQHJldHVybiB7P1Byb21pc2V9XG4gICAqIEBwcml2YXRlIFZpc2libGUgdG8gdGVzdHMgb25seS5cbiAgICovXG4gIGhhbmRsZUhpZGVfKGludm9jYXRpb24pIHtcbiAgICBjb25zdCB0YXJnZXQgPSBkZXYoKS5hc3NlcnRFbGVtZW50KGludm9jYXRpb24ubm9kZSk7XG5cbiAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLWVsZW1lbnQnKSkge1xuICAgICAgY29uc3QgYW1wRWxlbWVudCA9IC8qKiBAdHlwZSB7IUFtcEVsZW1lbnR9ICovICh0YXJnZXQpO1xuICAgICAgdGhpcy5tdXRhdG9yXy5tdXRhdGVFbGVtZW50KFxuICAgICAgICBhbXBFbGVtZW50LFxuICAgICAgICAoKSA9PiBhbXBFbGVtZW50Li8qT0sqLyBjb2xsYXBzZSgpLFxuICAgICAgICAvLyBJdCBpcyBzYWZlIHRvIHNraXAgbWVhc3VyaW5nLCBiZWNhdXNlIGBtdXRhdG9yLWltcGwuY29sbGFwc2VFbGVtZW50YFxuICAgICAgICAvLyB3aWxsIHNldCB0aGUgc2l6ZSBvZiB0aGUgZWxlbWVudCBhcyB3ZWxsIGFzIHRyaWdnZXIgYSByZW1lYXN1cmUgb2ZcbiAgICAgICAgLy8gZXZlcnl0aGluZyBiZWxvdyB0aGUgY29sbGFwc2VkIGVsZW1lbnQuXG4gICAgICAgIC8qIHNraXBSZW1lYXN1cmUgKi8gdHJ1ZVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tdXRhdG9yXy5tdXRhdGVFbGVtZW50KHRhcmdldCwgKCkgPT4gdG9nZ2xlKHRhcmdldCwgZmFsc2UpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIFwic2hvd1wiIGFjdGlvbi4gVGhpcyBpcyBhIHZlcnkgc2ltcGxlIGFjdGlvbiB3aGVyZSBcImRpc3BsYXk6IG5vbmVcIlxuICAgKiBpcyByZW1vdmVkIGZyb20gdGhlIHRhcmdldCBlbGVtZW50LlxuICAgKiBAcGFyYW0geyEuL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb259IGludm9jYXRpb25cbiAgICogQHJldHVybiB7P1Byb21pc2V9XG4gICAqIEBwcml2YXRlIFZpc2libGUgdG8gdGVzdHMgb25seS5cbiAgICovXG4gIGhhbmRsZVNob3dfKGludm9jYXRpb24pIHtcbiAgICBjb25zdCB7bm9kZX0gPSBpbnZvY2F0aW9uO1xuICAgIGNvbnN0IHRhcmdldCA9IGRldigpLmFzc2VydEVsZW1lbnQobm9kZSk7XG4gICAgY29uc3Qgb3duZXJXaW5kb3cgPSB0b1dpbih0YXJnZXQub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldyk7XG5cbiAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhnZXRMYXlvdXRDbGFzcyhMYXlvdXQuTk9ESVNQTEFZKSkpIHtcbiAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICBUQUcsXG4gICAgICAgICdFbGVtZW50cyB3aXRoIGxheW91dD1ub2Rpc3BsYXkgY2Fubm90IGJlIGR5bmFtaWNhbGx5IHNob3duLicsXG4gICAgICAgIHRhcmdldFxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMubXV0YXRvcl8ubWVhc3VyZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBjb21wdXRlZFN0eWxlKG93bmVyV2luZG93LCB0YXJnZXQpLmRpc3BsYXkgPT0gJ25vbmUnICYmXG4gICAgICAgICFpc1Nob3dhYmxlKHRhcmdldClcbiAgICAgICkge1xuICAgICAgICB1c2VyKCkud2FybihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ0VsZW1lbnRzIGNhbiBvbmx5IGJlIGR5bmFtaWNhbGx5IHNob3duIHdoZW4gdGhleSBoYXZlIHRoZSAnICtcbiAgICAgICAgICAgICdcImhpZGRlblwiIGF0dHJpYnV0ZSBzZXQgb3Igd2hlbiB0aGV5IHdlcmUgZHluYW1pY2FsbHkgaGlkZGVuLicsXG4gICAgICAgICAgdGFyZ2V0XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBhdXRvZm9jdXNFbE9yTnVsbCA9IGdldEF1dG9mb2N1c0VsZW1lbnRGb3JTaG93QWN0aW9uKHRhcmdldCk7XG5cbiAgICAvLyBpT1Mgb25seSBob25vcnMgZm9jdXMgaW4gc3luYyBvcGVyYXRpb25zLlxuICAgIGlmIChhdXRvZm9jdXNFbE9yTnVsbCAmJiBTZXJ2aWNlcy5wbGF0Zm9ybUZvcihvd25lcldpbmRvdykuaXNJb3MoKSkge1xuICAgICAgdGhpcy5oYW5kbGVTaG93U3luY18odGFyZ2V0LCBhdXRvZm9jdXNFbE9yTnVsbCk7XG4gICAgICB0aGlzLm11dGF0b3JfLm11dGF0ZUVsZW1lbnQodGFyZ2V0LCAoKSA9PiB7fSk7IC8vIGZvcmNlIGEgcmVtZWFzdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubXV0YXRvcl8ubXV0YXRlRWxlbWVudCh0YXJnZXQsICgpID0+IHtcbiAgICAgICAgdGhpcy5oYW5kbGVTaG93U3luY18odGFyZ2V0LCBhdXRvZm9jdXNFbE9yTnVsbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHs/RWxlbWVudH0gYXV0b2ZvY3VzRWxPck51bGxcbiAgICogQHByaXZhdGUgVmlzaWJsZSB0byB0ZXN0cyBvbmx5LlxuICAgKi9cbiAgaGFuZGxlU2hvd1N5bmNfKHRhcmdldCwgYXV0b2ZvY3VzRWxPck51bGwpIHtcbiAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLWVsZW1lbnQnKSkge1xuICAgICAgY29uc3QgYW1wRWxlbWVudCA9IC8qKiBAdHlwZSB7IUFtcEVsZW1lbnR9ICovICh0YXJnZXQpO1xuICAgICAgYW1wRWxlbWVudC4vKk9LKi8gZXhwYW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvZ2dsZSh0YXJnZXQsIHRydWUpO1xuICAgIH1cbiAgICBpZiAoYXV0b2ZvY3VzRWxPck51bGwpIHtcbiAgICAgIHRyeUZvY3VzKGF1dG9mb2N1c0VsT3JOdWxsKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBcInRvZ2dsZVwiIGFjdGlvbi5cbiAgICogQHBhcmFtIHshLi9hY3Rpb24taW1wbC5BY3Rpb25JbnZvY2F0aW9ufSBpbnZvY2F0aW9uXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKiBAcHJpdmF0ZSBWaXNpYmxlIHRvIHRlc3RzIG9ubHkuXG4gICAqL1xuICBoYW5kbGVUb2dnbGVfKGludm9jYXRpb24pIHtcbiAgICBpZiAoaXNTaG93YWJsZShkZXYoKS5hc3NlcnRFbGVtZW50KGludm9jYXRpb24ubm9kZSkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVTaG93XyhpbnZvY2F0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlSGlkZV8oaW52b2NhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBcInRvZ2dsZUNsYXNzXCIgYWN0aW9uLlxuICAgKiBAcGFyYW0geyEuL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb259IGludm9jYXRpb25cbiAgICogQHJldHVybiB7P1Byb21pc2V9XG4gICAqIEBwcml2YXRlIFZpc2libGUgdG8gdGVzdHMgb25seS5cbiAgICovXG4gIGhhbmRsZVRvZ2dsZUNsYXNzXyhpbnZvY2F0aW9uKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZGV2KCkuYXNzZXJ0RWxlbWVudChpbnZvY2F0aW9uLm5vZGUpO1xuICAgIGNvbnN0IHthcmdzfSA9IGludm9jYXRpb247XG4gICAgY29uc3QgY2xhc3NOYW1lID0gdXNlcigpLmFzc2VydFN0cmluZyhcbiAgICAgIGFyZ3NbJ2NsYXNzJ10sXG4gICAgICBcIkFyZ3VtZW50ICdjbGFzcycgbXVzdCBiZSBhIHN0cmluZy5cIlxuICAgICk7XG4gICAgLy8gcHJldmVudCB0b2dnbGluZyBvZiBhbXAgaW50ZXJuYWwgY2xhc3Nlc1xuICAgIGlmIChBTVBfQ1NTX1JFLnRlc3QoY2xhc3NOYW1lKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdG9yXy5tdXRhdGVFbGVtZW50KHRhcmdldCwgKCkgPT4ge1xuICAgICAgaWYgKGFyZ3NbJ2ZvcmNlJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBtdXN0IGJlIGJvb2xlYW4sIHdvbid0IGRvIHR5cGUgY29udmVyc2lvblxuICAgICAgICBjb25zdCBzaG91bGRGb3JjZSA9IHVzZXIoKS5hc3NlcnRCb29sZWFuKFxuICAgICAgICAgIGFyZ3NbJ2ZvcmNlJ10sXG4gICAgICAgICAgXCJPcHRpb25hbCBhcmd1bWVudCAnZm9yY2UnIG11c3QgYmUgYSBib29sZWFuLlwiXG4gICAgICAgICk7XG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSwgc2hvdWxkRm9yY2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoY2xhc3NOYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshTm9kZX0gbm9kZVxuICogQHJldHVybiB7IVdpbmRvd31cbiAqL1xuZnVuY3Rpb24gZ2V0V2luKG5vZGUpIHtcbiAgcmV0dXJuIHRvV2luKFxuICAgIChub2RlLm93bmVyRG9jdW1lbnQgfHwgLyoqIEB0eXBlIHshRG9jdW1lbnR9ICovIChub2RlKSkuZGVmYXVsdFZpZXdcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsU3RhbmRhcmRBY3Rpb25zRm9yRG9jKGFtcGRvYykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jKFxuICAgIGFtcGRvYyxcbiAgICAnc3RhbmRhcmQtYWN0aW9ucycsXG4gICAgU3RhbmRhcmRBY3Rpb25zLFxuICAgIC8qIG9wdF9pbnN0YW50aWF0ZSAqLyB0cnVlXG4gICk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/standard-actions-impl.js