import {isEsm} from '#core/mode';
import {getWin} from '#core/window';

/**
 * @param {T} klass
 * @return {T}
 * @template {Function} T
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
  class CeBaseElement {
    /**
     * @param {Element} element
     */
    constructor(element) {
      this.element = element;

      /** @type {Window} */
      this.win = getWin(element);
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

  BaseElement = /** @type {typeof AMP.BaseElement} */ (
    /** @type {?} */ (CeBaseElement)
  );
}

export {BaseElement};

/** @type {typeof HTMLElement} */
let ExtendableHTMLElement;
/** @type {typeof globalThis} */
let win;

/**
 * @param {typeof import('./base-element').PreactBaseElement} BaseElement
 * @param {typeof globalThis} _win
 * @return {typeof HTMLElement}
 * @template {{
 *   readyState?: string | undefined;
 *   pause?: (() => void) | undefined;
 * }} T */
function createBentoElementClass(BaseElement, _win = self) {
  if (!ExtendableHTMLElement || win !== _win) {
    win = _win;
    ExtendableHTMLElement = maybeWrapNativeSuper(win.HTMLElement);
  }

  return class CustomElement extends ExtendableHTMLElement {
    /** @override */
    constructor() {
      super();

      /**
       * @type {import('./base-element').PreactBaseElement<T>}
       */
      this.implementation = new BaseElement(
        /** @type {AmpElement} */ (/** @type {?} */ (this))
      );
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
 * @param {string} tag
 * @param {typeof import('./base-element').PreactBaseElement} BaseElement
 * @param {typeof globalThis} _win
 */
export function defineBentoElement(tag, BaseElement, _win = self) {
  _win.customElements.define(tag, createBentoElementClass(BaseElement, _win));
}
