import {Observable} from '#core/data-structures/observable';

import {devAssert} from '#utils/log';

import {registerServiceBuilderForDoc} from '../service-helpers';

/**
 * MutationObserverInit options to listen for mutations to the `hidden`
 * attribute.
 */
const OBSERVER_OPTIONS = {
  attributes: true,
  attributeFilter: ['hidden'],
  subtree: true,
};

/**
 * A document level service that will listen for mutations on the `hidden`
 * attribute and notify listeners. The `hidden` attribute is used to toggle
 * `display: none` on elements.
 * @implements {../service.Disposable}
 */
export class HiddenObserver {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!Document|!ShadowRoot} */
    this.root_ = ampdoc.getRootNode();
    const doc = this.root_.ownerDocument || this.root_;

    /** @const {!Window} */
    this.win_ = /** @type {!Window} */ (devAssert(doc.defaultView));

    /** @private {?MutationObserver} */
    this.mutationObserver_ = null;

    /** @private {?Observable<!Array<!MutationRecord>>} */
    this.observable_ = null;
  }

  /**
   * Adds the observer to this instance.
   * @param {function(!Array<!MutationRecord>)} handler Observer's handler.
   * @return {!UnlistenDef}
   */
  add(handler) {
    this.init_();

    const remove = this.observable_.add(handler);
    return () => {
      remove();
      if (this.observable_.getHandlerCount() === 0) {
        this.dispose();
      }
    };
  }

  /**
   * Initializes the mutation observer and observable.
   */
  init_() {
    if (this.mutationObserver_) {
      return;
    }
    this.observable_ = new Observable();

    const mo = new this.win_.MutationObserver((mutations) => {
      if (mutations) {
        this.observable_.fire(mutations);
      }
    });
    this.mutationObserver_ = mo;
    mo.observe(this.root_, OBSERVER_OPTIONS);
  }

  /**
   * Cleans up the all the mutation observer once the last listener stops
   * listening, or when the service's doc is disposing.
   */
  dispose() {
    if (!this.mutationObserver_) {
      return;
    }
    this.mutationObserver_.disconnect();
    this.observable_.removeAll();
    this.mutationObserver_ = null;
    this.observable_ = null;
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installHiddenObserverForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'hidden-observer', HiddenObserver);
}
