import {AmpAdNetworkDoubleclickImpl} from '../../amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl';

/**
 * Helper class to manage DoubleClick implementation integration
 */
export class DoubleClickHelper {
  /**
   * @param {!Object} impl - The AmpAdNetworkInsuradsImpl instance
   */
  constructor(impl) {
    /** @private {!Object} */
    this.impl_ = impl;

    /** @private {string} */
    this.prefix_ = 'doubleClick';

    /** @private {Array<string>} */
    this.exceptions_ = [
      'constructor',
      'buildCallback',
      'onCreativeRender',
      'refresh',
      'extractSize',
      'getAdUrl',
      'tearDownSlot',
    ];

    this.initializeDoubleClickMethods_();
  }

  /**
   * Initializes the DoubleClick methods on the implementation
   * @private
   */
  initializeDoubleClickMethods_() {
    const implProto = this.impl_.constructor.prototype;
    const dblProto = AmpAdNetworkDoubleclickImpl.prototype;

    this.exceptions_.forEach((methodName) => {
      implProto[this.getCapitalizedMethodWithPrefix_(methodName)] =
        dblProto[methodName];
    });

    for (const methodName in dblProto) {
      if (!this.exceptions_.includes(methodName)) {
        implProto[methodName] = dblProto[methodName];
      }
    }
  }

  /**
   * Returns capitalized method name with prefix
   * @param {string} methodName - The method name
   * @return {string} The prefixed method name
   * @private
   */
  getCapitalizedMethodWithPrefix_(methodName) {
    return (
      this.prefix_ + methodName.charAt(0).toUpperCase() + methodName.slice(1)
    );
  }

  /**
   * Calls a DoubleClick implementation method
   * @param {string} methodName - The name of the method to call
   * @param {...*} args - Arguments to pass to the method
   * @return {*} Result of the method call
   */
  callMethod(methodName, ...args) {
    const prefixedName = this.getCapitalizedMethodWithPrefix_(methodName);

    if (typeof this.impl_[prefixedName] === 'function') {
      try {
        return this.impl_[prefixedName](...args);
      } catch (error) {}
    }

    return null;
  }
}
