import {isEsm} from '#core/mode';
import {toWin} from '#core/window';

/** @type {typeof AMP.BaseElement} */
let BaseElement;

/**
 * @param {K} unusedParent
 * @param {Array<*>} unusedArgs
 * @param {T} unusedKlass
 * @return {T}
 * @template T, K
 */
function construct(unusedParent, unusedArgs, unusedKlass) {
  if (isNativeReflectConstruct()) {
    construct = Reflect.construct;
  } else {
    construct = function _construct2(parent, args, klass) {
      const a3 = [null];
      a3.push.apply(a3, args);
      const Constructor = Function.bind.apply(parent, a3);
      const instance = new Constructor();
      if (klass) {
        Object.setPrototypeOf(instance, klass.prototype);
      }
      return instance;
    };
  }
  return construct.apply(null, arguments);
}

/** @return {boolean} */
function isNativeReflectConstruct() {
  if (typeof Reflect === 'undefined' || !Reflect.construct) {
    return false;
  }
  if (Reflect.construct.sham) {
    return false;
  }
  if (typeof Proxy === 'function') {
    return true;
  }
  try {
    Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {T} klass
 * @return {T}
 * @template T
 */
function maybeWrapNativeSuper(klass) {
  if (isEsm()) {
    return klass;
  }
  /**
   * @return {T}
   */
  function Wrapper() {
    return construct(klass, arguments, Object.getPrototypeOf(this).constructor);
  }
  Wrapper.prototype = Object.create(klass.prototype, {
    constructor: {
      value: Wrapper,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  return Object.setPrototypeOf(Wrapper, klass);
}

if (typeof AMP !== 'undefined' && AMP.BaseElement) {
  BaseElement = AMP.BaseElement;
} else {
  const ExtendableHTMLElement = maybeWrapNativeSuper(HTMLElement);
  class CeBaseElement {
    /**
     * @param {!Element} element
     */
    constructor(element) {
      /** @const {!Element} */
      this.element = element;

      /** @const {!Window} */
      this.win = toWin(element.ownerDocument.defaultView);
    }

    /**
     * @param {typeof CeBaseElement} BaseElement
     * @return {typeof HTMLElement}
     */
    static 'CustomElement'(BaseElement) {
      return class CustomElement extends ExtendableHTMLElement {
        /** */
        constructor() {
          super();

          /** @const {!CeBaseElement} */
          this.implementation = new BaseElement(this);
        }

        /** */
        connectedCallback() {
          this.implementation.mountCallback();
          this.implementation.buildCallback();
        }

        /** */
        disconnectedCallback() {
          this.implementation.unmountCallback();
        }

        /** @return {Promise<*>} */
        getApi() {
          return this.implementation.getApi();
        }
      };
    }

    /**
     * @param {function():undefined} cb
     */
    mutateElement(cb) {
      Promise.resolve().then(cb);
    }

    /** @return {boolean} */
    isLayoutSupported() {
      return true;
    }

    /** */
    mountCallback() {}

    /** */
    unmountCallback() {}

    /** */
    buildCallback() {}
  }

  BaseElement = /** @type {typeof AMP.BaseElement} */ (CeBaseElement);
}

export {BaseElement};
