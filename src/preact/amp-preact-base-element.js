import {ActionTrust_Enum} from '#core/constants/action-constants';

import {PreactBaseElement} from './base-element';

/**
 * @param {Object} class1
 * @param {Object} class2
 * @return {Object}
 */
export function setSuperClass(class1, class2) {
  Object.setPrototypeOf(class1, class2);
  Object.setPrototypeOf(class1.prototype, class2.prototype);
  return class1;
}

export class AmpPreactBaseElement extends setSuperClass(
  PreactBaseElement,
  AMP.BaseElement
) {
  /** @override @nocollapse */
  static R1() {
    return true;
  }

  /** @override @nocollapse */
  static requiresShadowDom() {
    // eslint-disable-next-line local/no-static-this
    return this['usesShadowDom'];
  }

  /** @override @nocollapse */
  static usesLoading() {
    // eslint-disable-next-line local/no-static-this
    return this['loadable'];
  }

  /** @override @nocollapse */
  static prerenderAllowed() {
    // eslint-disable-next-line local/no-static-this
    return !this.usesLoading();
  }

  /**
   * Register an action for AMP documents to execute an API handler.
   *
   * This has no effect on Bento documents, since they lack an Actions system.
   * Instead, they should use `(await element.getApi()).action()`
   * @param {string} alias
   * @param {function(!API_TYPE, !../service/action-impl.ActionInvocation)} handler
   * @param {../action-constants.ActionTrust_Enum} minTrust
   * @protected
   */
  registerApiAction(alias, handler, minTrust = ActionTrust_Enum.DEFAULT) {
    this.registerAction?.(
      alias,
      (invocation) => handler(this.api(), invocation),
      minTrust
    );
  }
}
