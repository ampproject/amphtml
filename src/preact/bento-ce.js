import {toWin} from '#core/window';

/** @type {typeof AMP.BaseElement} */
let BaseElement;

if (typeof AMP !== 'undefined' && AMP.BaseElement) {
  BaseElement = AMP.BaseElement;
} else {
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
      return class CustomElement extends HTMLElement {
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
