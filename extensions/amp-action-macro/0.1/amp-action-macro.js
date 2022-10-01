import {LayoutPriority_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-action-macro';

/**
 * The <amp-action-macro> element is used to define a reusable action.
 */
export class AmpActionMacro extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.actions_ = null;

    /** @private {!Array<string>} */
    this.arguments_ = [];
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    this.actions_ = Services.actionServiceForDoc(element);

    const argVarNames = element.getAttribute('arguments');
    if (argVarNames) {
      this.arguments_ = argVarNames.split(',').map((s) => s.trim());
    }

    this.registerAction('execute', this.execute_.bind(this));
  }

  /** @override */
  getLayoutPriority() {
    // Loads after other content.
    return LayoutPriority_Enum.METADATA;
  }

  /**
   * Invoke the action defined on the macro.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  execute_(invocation) {
    const {actionEventType, args, event, trust} = invocation;
    if (args && this.arguments_.length > 0) {
      // Verify that the argument variable names defined on the macro are used
      // in the caller invocation.
      for (const arg in args) {
        userAssert(
          this.arguments_.includes(arg),
          'Variable argument name "%s" is not defined in %s',
          arg,
          this.element
        );
      }
    }
    if (invocation.caller.tagName.toLowerCase() === TAG) {
      userAssert(
        this.isValidMacroReference_(invocation.caller),
        'Action macro with ID "%s" cannot reference itself or macros defined ' +
          'after it',
        this.element.getAttribute('id')
      );
    }
    // Trigger the macro's action.
    this.actions_.trigger(
      this.element,
      `${actionEventType}`,
      event,
      trust,
      args
    );
  }

  /** @override */
  renderOutsideViewport() {
    // We want the macro to be available wherever it is in the document.
    return true;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /**
   * Checks if the invoking element is defined after the action being invoked.
   * This constraint is to prevent possible recursive calls.
   * @param {!Element} invokingElement
   * @return {boolean}
   * @private
   */
  isValidMacroReference_(invokingElement) {
    return !!(
      this.element.compareDocumentPosition(invokingElement) &
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpActionMacro);
});
