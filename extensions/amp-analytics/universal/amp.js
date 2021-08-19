import {initLogConstructor, user} from '../../../src/log';
import {registerServiceBuilderForDoc} from './service-helpers';
import ampdocImpl from './ampdoc-impl';

initLogConstructor();

self.AMP = self.AMP || [];

for (const cb of self.AMP) {
  cb();
}

self.AMP.push = (cb) => cb();
self.AMP.win = self;

/**
 * @param {string} unusedTag
 * @param {string} unusedVersion
 * @param {function(typeof self.AMP)} callback
 */
self.AMP.extension = function (unusedTag, unusedVersion, callback) {
  callback(self.AMP);
};

/**
 * @param {string} name
 * @param {AMP.BaseElement} ctor
 */
self.AMP.registerElement = function (name, ctor) {
  customElements.define(name, getCustomElement(ctor));
};

/**
 * @param {string} name
 * @param {function(*)} ctor
 */
self.AMP.registerServiceForDoc = function (name, ctor) {
  registerServiceBuilderForDoc(self.document, name, ctor);
};

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
   * @return {../../../src/log.Log}
   */
  user() {
    return user();
  }
  /** */
  collapse() {
    this.element.setAttribute('hidden', '');
  }
}

self.AMP.BaseElement = BaseElement;

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
