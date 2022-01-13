import {isEsm} from '#core/mode';
import {getWin} from '#core/window';

/**
 * @param {T} klass
 * @return {T}
 * @template T
 */
function maybeWrapNativeSuper(klass) {
  if (isEsm() || typeof Reflect !== 'object' || !Reflect.construct) {
    return klass;
  }
  /**
   * @return {T}
   */
  function Wrapper() {
    return Reflect.construct(klass, arguments, this.constructor);
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

/** @type {typeof AMP.BaseElement} */
let BaseElement;

if (typeof AMP !== 'undefined' && AMP.BaseElement) {
  BaseElement = AMP.BaseElement;
} else {
  let ExtendableHTMLElement;
  class CeBaseElement {
    /**
     * @param {Element} element
     */
    constructor(element) {
      /** @const {Element} */
      this.element = element;

      /** @const {Window} */
      this.win = getWin(element);
    }

    /**
     * @param {typeof CeBaseElement} BaseElement
     * @return {typeof HTMLElement}
     */
    static 'CustomElement'(BaseElement) {
      if (!ExtendableHTMLElement) {
        ExtendableHTMLElement = maybeWrapNativeSuper(HTMLElement);
      }
      return class CustomElement extends ExtendableHTMLElement {
        /** */
        constructor() {
          super();

          /** @const {CeBaseElement} */
          this.implementation = new BaseElement(this);
        }

        /** */
        connectedCallback() {
          this.classList.add('i-amphtml-built');
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
