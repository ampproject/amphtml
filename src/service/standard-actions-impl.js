import {devAssertElement} from '#core/assert';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {tryFocus} from '#core/dom';
import {Layout_Enum, getLayoutClass} from '#core/dom/layout';
import {computedStyle, toggle} from '#core/dom/style';
import {isFiniteNumber} from '#core/types';
import {getWin} from '#core/window';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {dev, user, userAssert} from '#utils/log';

import {getAmpdoc, registerServiceBuilderForDoc} from '../service-helpers';

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
const TAG = 'STANDARD-ACTIONS';

/**
 * Regular expression that identifies AMP CSS classes with 'i-amphtml-' prefixes.
 * @type {!RegExp}
 */
const AMP_CSS_RE = /^i-amphtml-/;

/**
 * This service contains implementations of some of the most typical actions,
 * such as hiding DOM elements.
 * @visibleForTesting
 */
export class StandardActions {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    const context = ampdoc.getHeadNode();

    /** @const @private {!./mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    /** @const @private {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    // Explicitly not setting `Action` as a member to scope installation to one
    // method and for bundle size savings. 💰
    this.installActions_(Services.actionServiceForDoc(context));

    this.initThemeMode_();
  }

  /**
   * @param {!./action-impl.ActionService} actionService
   * @private
   */
  installActions_(actionService) {
    actionService.addGlobalTarget('AMP', this.handleAmpTarget_.bind(this));

    // All standard actions require high trust by default via
    // addGlobalMethodHandler.

    actionService.addGlobalMethodHandler('hide', this.handleHide_.bind(this));

    actionService.addGlobalMethodHandler('show', this.handleShow_.bind(this));

    actionService.addGlobalMethodHandler(
      'toggleVisibility',
      this.handleToggle_.bind(this)
    );

    actionService.addGlobalMethodHandler(
      'scrollTo',
      this.handleScrollTo_.bind(this)
    );

    actionService.addGlobalMethodHandler('focus', this.handleFocus_.bind(this));

    actionService.addGlobalMethodHandler(
      'toggleClass',
      this.handleToggleClass_.bind(this)
    );

    actionService.addGlobalMethodHandler('copy', this.handleCopy_.bind(this));

    actionService.addGlobalMethodHandler(
      'toggleChecked',
      this.handleToggleChecked_.bind(this)
    );
  }

  /**
   * Handles initiliazing the theme mode.
   *
   * This methode needs to be called on page load to set the `amp-dark-mode`
   * class on the body if the user prefers the dark mode.
   */
  initThemeMode_() {
    if (this.prefersDarkMode_()) {
      this.ampdoc.waitForBodyOpen().then((body) => {
        const darkModeClass =
          body.getAttribute('data-prefers-dark-mode-class') || 'amp-dark-mode';

        body.classList.add(darkModeClass);
      });
    }
  }

  /**
   * Checks whether the user prefers dark mode based on local storage and
   * user's operating systen settings.
   *
   * @return {boolean}
   */
  prefersDarkMode_() {
    try {
      const themeMode = this.ampdoc.win.localStorage.getItem('amp-dark-mode');

      if (themeMode) {
        return 'yes' === themeMode;
      }
    } catch (e) {}

    // LocalStorage may not be accessible
    return this.ampdoc.win.matchMedia?.('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Handles global `AMP` actions.
   * See `amp-actions-and-events.md` for details.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @throws If the invocation method is unrecognized.
   * @private Visible to tests only.
   */
  handleAmpTarget_(invocation) {
    // All global `AMP` actions require default trust.
    if (!invocation.satisfiesTrust(ActionTrust_Enum.DEFAULT)) {
      return null;
    }
    const {args, method, node} = invocation;
    const win = getWin(node);
    switch (method) {
      case 'pushState':
      case 'setState':
        const element =
          node.nodeType === Node.DOCUMENT_NODE
            ? /** @type {!Document} */ (node).documentElement
            : dev().assertElement(node);
        return Services.bindForDocOrNull(element).then((bind) => {
          userAssert(bind, 'AMP-BIND is not installed.');
          return bind.invoke(invocation);
        });

      case 'navigateTo':
        return this.handleNavigateTo_(invocation);

      case 'closeOrNavigateTo':
        return this.handleCloseOrNavigateTo_(invocation);

      case 'scrollTo':
        userAssert(args['id'], 'AMP.scrollTo must provide element ID');
        invocation.node = dev().assertElement(
          getAmpdoc(node).getElementById(args['id']),
          'scrollTo element ID must exist on page'
        );
        return this.handleScrollTo_(invocation);

      case 'goBack':
        Services.historyForDoc(this.ampdoc).goBack(
          /* navigate */ !!(args && args['navigate'] === true)
        );
        return null;

      case 'print':
        win.print();
        return null;

      case 'copy':
        return this.handleCopy_(invocation);

      case 'optoutOfCid':
        return Services.cidForDoc(this.ampdoc)
          .then((cid) => cid.optOut())
          .catch((reason) => {
            dev().error(TAG, 'Failed to opt out of CID', reason);
          });
      case 'toggleTheme':
        this.handleToggleTheme_();
        return null;
    }
    throw user().createError('Unknown AMP action ', method);
  }

  /**
   * Handles the copy to clipboard action
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleCopy_(invocation) {
    const {args, node} = invocation;
    const win = getWin(node);

    /** @enum {string} */
    const CopyEvents = {
      COPY_ERROR: 'copy-error',
      COPY_SUCCESS: 'copy-success',
    };
    let textToCopy;

    if (invocation.tagOrTarget === 'AMP') {
      //
      // Copy Static Text
      //  Example: AMP.copy(text='TextToCopy');
      //
      textToCopy = args['text'].trim();
    } else {
      //
      // Copy Target Element Text
      //  Example: targetId.copy();
      //
      const target = devAssertElement(invocation.node);
      textToCopy = (target.value ?? target.textContent).trim();
    }

    /**
     * Raises a status event for copy task result
     * @param {string} eventName
     * @param {string} eventResult
     * @param {!./action-impl.ActionInvocation} invocation
     */
    const triggerEvent = function (eventName, eventResult, invocation) {
      const eventValue = /** @type {!JsonObject} */ ({
        data: /** @type {!JsonObject} */ {type: eventResult},
      });
      const copyEvent = createCustomEvent(win, `${eventName}`, eventValue);

      const action_ = Services.actionServiceForDoc(invocation.caller);
      action_.trigger(
        invocation.caller,
        eventName,
        copyEvent,
        ActionTrust_Enum.HIGH
      );
    };

    //
    // Trigger Event based on copy action
    //  - If content got copied to the clipboard successfully, it will
    //    fire `copy-success` event with data type `success`.
    //  - If there's any error in copying, it will
    //    fire `copy-error` event with data type `error`.
    //  - If browser is not supporting the copy function/action, it
    //    will fire `copy-error` event with data type `browser`.
    //
    //  Example: <button on="tap:AMP.copy(text='Hello AMP');copy-success:copied.show()">Copy</button>
    //
    if (isCopyingToClipboardSupported(win.document)) {
      copyTextToClipboard(
        win,
        textToCopy,
        () => {
          triggerEvent(CopyEvents.COPY_SUCCESS, 'success', invocation);
        },
        () => {
          // Error encountered while copying.
          triggerEvent(CopyEvents.COPY_ERROR, 'error', invocation);
        }
      );
    } else {
      // Copy is disabled or not supported by user.
      triggerEvent(CopyEvents.COPY_ERROR, 'unsupported', invocation);
    }
  }

  /**
   * Handles the `navigateTo` action.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {!Promise}
   * @private Visible to tests only.
   */
  handleNavigateTo_(invocation) {
    const {args, caller, method, node} = invocation;
    const win = getWin(node);
    // Some components have additional constraints on allowing navigation.
    let permission = Promise.resolve();
    if (caller.tagName.startsWith('AMP-')) {
      const ampElement = /** @type {!AmpElement} */ (caller);
      permission = ampElement.getImpl().then((impl) => {
        if (typeof impl.throwIfCannotNavigate == 'function') {
          impl.throwIfCannotNavigate();
        }
      });
    }
    return permission.then(
      () => {
        Services.navigationForDoc(this.ampdoc).navigateTo(
          win,
          args['url'],
          `AMP.${method}`,
          {target: args['target'], opener: args['opener']}
        );
      },
      /* onrejected */ (e) => {
        user().error(TAG, e);
      }
    );
  }

  /**
   * Handles the `toggleTheme` action.
   *
   * This action sets the `amp-dark-mode` class on the body element and stores the the preference for dark mode in localstorage.
   */
  handleToggleTheme_() {
    this.ampdoc.waitForBodyOpen().then((body) => {
      try {
        const darkModeClass =
          body.getAttribute('data-prefers-dark-mode-class') || 'amp-dark-mode';

        if (this.prefersDarkMode_()) {
          body.classList.remove(darkModeClass);
          this.ampdoc.win.localStorage.setItem('amp-dark-mode', 'no');
        } else {
          body.classList.add(darkModeClass);
          this.ampdoc.win.localStorage.setItem('amp-dark-mode', 'yes');
        }
      } catch (e) {
        // LocalStorage may not be accessible.
      }
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
  handleCloseOrNavigateTo_(invocation) {
    const {node} = invocation;
    const win = getWin(node);

    // Don't allow closing if embedded in iframe or does not have an opener or
    // embedded in a multi-doc shadowDOM case.
    // Note that browser denies win.close in some of these cases already anyway,
    // so not every check here is strictly needed but works as a short-circuit.
    const hasParent = win.parent != win;
    const canBeClosed = win.opener && this.ampdoc.isSingleDoc() && !hasParent;

    let wasClosed = false;
    if (canBeClosed) {
      // Browser may still deny win.close() call, that would be reflected
      // synchronously in win.closed
      win.close();
      wasClosed = win.closed;
    }

    if (!wasClosed) {
      return this.handleNavigateTo_(invocation);
    }

    return Promise.resolve();
  }
  /**
   * Handles the `scrollTo` action where given an element, we smooth scroll to
   * it with the given animation duration.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private Visible to tests only.
   */
  handleScrollTo_(invocation) {
    const node = dev().assertElement(invocation.node);
    const {args} = invocation;

    // Duration and position are optional.
    // Default values are set by the viewport service, so they're passed through
    // when undefined or invalid.
    let posOrUndef = args && args['position'];
    let durationOrUndef = args && args['duration'];

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
      durationOrUndef
    );
  }

  /**
   * Handles the `focus` action where given an element, we give it focus
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private Visible to tests only.
   */
  handleFocus_(invocation) {
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
   * @private Visible to tests only.
   */
  handleHide_(invocation) {
    const target = dev().assertElement(invocation.node);

    if (target.classList.contains('i-amphtml-element')) {
      const ampElement = /** @type {!AmpElement} */ (target);
      this.mutator_.mutateElement(
        ampElement,
        () => ampElement./*OK*/ collapse(),
        // It is safe to skip measuring, because `mutator-impl.collapseElement`
        // will set the size of the element as well as trigger a remeasure of
        // everything below the collapsed element.
        /* skipRemeasure */ true
      );
    } else {
      this.mutator_.mutateElement(target, () => toggle(target, false));
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
  handleShow_(invocation) {
    const {node} = invocation;
    const target = dev().assertElement(node);
    const ownerWindow = getWin(target);

    if (target.classList.contains(getLayoutClass(Layout_Enum.NODISPLAY))) {
      user().warn(
        TAG,
        'Elements with layout=nodisplay cannot be dynamically shown.',
        target
      );
      return null;
    }

    this.mutator_.measureElement(() => {
      if (
        computedStyle(ownerWindow, target).display == 'none' &&
        !isShowable(target)
      ) {
        user().warn(
          TAG,
          'Elements can only be dynamically shown when they have the ' +
            '"hidden" attribute set or when they were dynamically hidden.',
          target
        );
      }
    });

    const autofocusElOrNull = getAutofocusElementForShowAction(target);

    // iOS only honors focus in sync operations.
    if (autofocusElOrNull && Services.platformFor(ownerWindow).isIos()) {
      this.handleShowSync_(target, autofocusElOrNull);
      this.mutator_.mutateElement(target, () => {}); // force a remeasure
    } else {
      this.mutator_.mutateElement(target, () => {
        this.handleShowSync_(target, autofocusElOrNull);
      });
    }

    return null;
  }

  /**
   * @param {!Element} target
   * @param {?Element} autofocusElOrNull
   * @private Visible to tests only.
   */
  handleShowSync_(target, autofocusElOrNull) {
    if (target.classList.contains('i-amphtml-element')) {
      const ampElement = /** @type {!AmpElement} */ (target);
      ampElement./*OK*/ expand();
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
  handleToggle_(invocation) {
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
  handleToggleClass_(invocation) {
    const target = dev().assertElement(invocation.node);
    const {args} = invocation;
    const className = user().assertString(
      args['class'],
      "Argument 'class' must be a string."
    );
    // prevent toggling of amp internal classes
    if (AMP_CSS_RE.test(className)) {
      return null;
    }

    this.mutator_.mutateElement(target, () => {
      if (args['force'] !== undefined) {
        // must be boolean, won't do type conversion
        const shouldForce = user().assertBoolean(
          args['force'],
          "Optional argument 'force' must be a boolean."
        );
        target.classList.toggle(className, shouldForce);
      } else {
        target.classList.toggle(className);
      }
    });

    return null;
  }

  /**
   * Handles "toggleChecked" action.
   * @param {!./action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private Visible to tests only.
   */
  handleToggleChecked_(invocation) {
    const target = dev().assertElement(invocation.node);
    const {args} = invocation;

    this.mutator_.mutateElement(target, () => {
      if (args?.['force'] !== undefined) {
        // must be boolean, won't do type conversion
        const shouldForce = user().assertBoolean(
          args['force'],
          "Optional argument 'force' must be a boolean."
        );
        target.checked = shouldForce;
      } else {
        if (target.checked === true) {
          target.checked = false;
        } else {
          target.checked = true;
        }
      }
    });

    return null;
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
    /* opt_instantiate */ true
  );
}
