import {Log, initLogConstructor, user} from '../../../../src/log';
import {registerServiceBuilderForDoc} from './service-helpers';
import ampdocImpl from './ampdoc-impl';

initLogConstructor();

export const AMP = new (class {
  /**
   * @param {Window} win
   */
  constructor(win) {
    /** @private @const {!Object<string, function(*)>} */
    this.services_ = Object.create(null);

    this.win = win;
  }

  /**
   * @param {string} unusedTag
   * @param {string} unusedVersion
   * @param {function(typeof this)} callback
   */
  extension(unusedTag, unusedVersion, callback) {
    callback(this);
  }

  /**
   * @param {string} name
   * @param {AMP.BaseElement} ctor
   */
  registerElement(name, ctor) {
    customElements.define(name, getCustomElement(ctor));
  }

  /**
   * @param {string} name
   * @param {function(*)} ctor
   */
  registerServiceForDoc(name, ctor) {
    registerServiceBuilderForDoc(this.element, name, ctor);
  }
})(self);

// TODO: Too similar to bento-ce.js

class BaseElement {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    /** @const {!Window} */
    this.win = self;

    /** @const {!Element} */
    this.element = element;
  }

  /**
   * @return {!typeof ampdocImpl}
   */
  getAmpDoc() {
    return this.element.getAmpDoc();
  }

  /**
   * @return {Log}
   */
  user() {
    return user();
  }

  /** */
  collapse() {
    this.element.setAttribute('hidden', '');
  }
}

AMP.BaseElement = BaseElement;

/**
 * @param {typeof BaseElement} Ctor
 * @return {!CustomElementConstructor}
 */
function getCustomElement(Ctor) {
  return class extends HTMLElement {
    /** */
    constructor() {
      super();

      /** @const {!BaseElement} */
      this.implementation = new Ctor(this);
    }

    /** */
    connectedCallback() {
      this.implementation.buildCallback();
      this.implementation.layoutCallback();
    }

    /** */
    disconnectedCallback() {
      this.implementation.detachedCallback();
    }

    /** @return {typeof ampdocImpl} */
    getAmpDoc() {
      return ampdocImpl;
    }
  };
}
