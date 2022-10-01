import {ViewerInterface} from '#service/viewer-interface';

import {registerServiceBuilderForDoc} from '../service-helpers';

/**
 * A dummy impl of ViewerInterface for inabox.
 *
 * @implements {ViewerInterface}
 */
class InaboxViewer {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
  }

  /** @override */
  getAmpDoc() {
    return this.ampdoc_;
  }

  /** @override */
  getParam(name) {
    return this.ampdoc_.getParam(name);
  }

  /** @override */
  hasCapability() {
    return false;
  }

  /** @override */
  isEmbedded() {
    return false;
  }

  /** @override */
  isWebviewEmbedded() {
    return false;
  }

  /** @override */
  isCctEmbedded() {
    return false;
  }

  /** @override */
  isProxyOrigin() {
    return false;
  }

  /** @override */
  maybeUpdateFragmentForCct() {}

  /**
   * @return {boolean}
   */
  isRuntimeOn() {
    return true;
  }

  /** @override */
  toggleRuntime() {}

  /** @override */
  onRuntimeState() {
    return () => {};
  }

  /** @override */
  isOvertakeHistory() {
    return false;
  }

  /** @override */
  getResolvedViewerUrl() {
    return this.ampdoc_.win.location.href;
  }

  /** @override */
  maybeGetMessagingOrigin() {
    return null;
  }

  /** @override */
  getUnconfirmedReferrerUrl() {
    return this.ampdoc_.win.document.referrer;
  }

  /** @override */
  getReferrerUrl() {
    return Promise.resolve(this.getUnconfirmedReferrerUrl());
  }

  /** @override */
  isTrustedViewer() {
    return Promise.resolve(false);
  }

  /** @override */
  getViewerOrigin() {
    return Promise.resolve('');
  }

  /** @override */
  onMessage() {
    return () => {};
  }

  /** @override */
  onMessageRespond() {
    return () => {};
  }

  /** @override */
  receiveMessage() {}

  /** @override */
  setMessageDeliverer() {}

  /** @override */
  maybeGetMessageDeliverer() {
    return null;
  }

  /** @override */
  sendMessage() {}

  /** @override */
  sendMessageAwaitResponse() {
    return Promise.resolve();
  }

  /** @override */
  broadcast() {
    return Promise.resolve(false);
  }

  /** @override */
  onBroadcast() {
    return () => {};
  }

  /** @override */
  whenMessagingReady() {
    return null;
  }

  /** @override */
  replaceUrl() {}
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxViewerServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
    ampdoc,
    'viewer',
    InaboxViewer,
    /* opt_instantiate */ true
  );
}
