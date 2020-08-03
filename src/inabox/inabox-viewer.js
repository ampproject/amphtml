/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {ViewerInterface} from '../service/viewer-interface';
import {registerServiceBuilderForDoc} from '../service';

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
