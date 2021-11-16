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

const ExtendableHTMLElement = maybeWrapNativeSuper(HTMLElement);

BENTO.BaseElement = class CeBaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    /** @const {!Element} */
    this.element = element;

    /** @const {!Window} */
    this.win = getWin(element);
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

  /** */
  mountCallback() {}

  /** */
  unmountCallback() {}

  /** */
  buildCallback() {}
};
