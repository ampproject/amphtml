import {Services} from '#service';

import {dev} from '#utils/log';

import {Doc} from '#third_party/subscriptions-project/config';

/**
 * Adopts config document to ampdoc.
 * @implements {Doc}
 */
export class DocImpl {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc_);
  }

  /** @override */
  getWin() {
    return this.ampdoc_.win;
  }

  /** @override */
  getRootNode() {
    return this.ampdoc_.getRootNode();
  }

  /** @override */
  getRootElement() {
    const root = this.ampdoc_.getRootNode();
    return dev().assertElement(root.documentElement || root.body || root);
  }

  /** @override */
  getHead() {
    return dev().assertElement(this.ampdoc_.getHeadNode());
  }

  /** @override */
  getBody() {
    return this.ampdoc_.isBodyAvailable() ? this.ampdoc_.getBody() : null;
  }

  /** @override */
  isReady() {
    return this.ampdoc_.isReady();
  }

  /** @override */
  whenReady() {
    return this.ampdoc_.whenReady();
  }

  /** @override */
  addToFixedLayer(element) {
    return this.viewport_.addToFixedLayer(element, /* Force Transfer */ true);
  }
}

/**
 * @package Visible for testing only.
 * @return {typeof Doc}
 */
export function getDocClassForTesting() {
  return Doc;
}
