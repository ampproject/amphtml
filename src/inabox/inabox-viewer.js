/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {VisibilityState} from '../visibility-state';
import {fromClassForDoc} from '../service';

/**
 * A dummy Viewer implementation.
 * TODO: clean this up once the Viewer dependencies got cleared up. #6159
 */
class InaboxViewer {

  constructor() {}

  getParam() {
    return null;
  }

  hasCapability() {
    return false;
  }

  navigateTo() {}

  isEmbedded() {
    return false;
  }

  isRuntimeOn() {
    return true;
  }

  toggleRuntime() {}

  onRuntimeState() {
    return () => {};
  }

  isOvertakeHistory() {
    return false;
  }

  getVisibilityState() {
    return VisibilityState.VISIBLE;
  }

  isVisible() {
    return true;
  }

  hasBeenVisible() {
    return true;
  }

  whenFirstVisible() {
    return Promise.resolve();
  }

  getFirstVisibleTime() {
    return 0;
  }

  getPrerenderSize() {
    return 0;
  }

  getPaddingTop() {
    return 0;
  }

  getResolvedViewerUrl() {
    return '';
  }

  getViewerUrl() {
    return '';
  }

  maybeGetMessagingOrigin() {
    return '';
  }

  getUnconfirmedReferrerUrl() {
    return '';
  }

  getReferrerUrl() {
    return '';
  }

  isTrustedViewer() {
    return false;
  }

  getViewerOrigin() {
    return '';
  }

  onVisibilityChanged() {}

  onViewportEvent() {}

  onHistoryPoppedEvent() {}

  postDocumentReady() {}

  postPushHistory() {}

  postPopHistory() {}

  baseCid() {}

  getFragment() {}

  updateFragment() {}

  receiveMessage() {}

  setMessageDeliverer() {}

  sendMessage() {}

  sendMessageAwaitResponse() {
    return Promise.resolve();
  }

  broadcast() {}

  onBroadcast() {}

  whenMessagingReady() {
    return new Promise(() => {});
  }
}

export function installInaboxViewerService(ampdoc) {
  fromClassForDoc(ampdoc, 'viewer', InaboxViewer);
}
