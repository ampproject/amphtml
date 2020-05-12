/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {installActionServiceForDoc} from '../service/action-impl.js';
import {installDocumentInfoServiceForDoc} from '../service/document-info-impl.js';
import {installGlobalNavigationHandlerForDoc} from '../service/navigation.js';
import {installGlobalSubmitListenerForDoc} from '../document-submit.js';
import {installHiddenObserverForDoc} from '../service/hidden-observer-impl.js';
import {installHistoryServiceForDoc} from '../service/history-impl.js';
import {installIframeMessagingClient} from './inabox-iframe-messaging-client.js';
import {installInaboxCidService} from './inabox-cid.js';
import {installInaboxMutatorServiceForDoc} from './inabox-mutator.js';
import {installInaboxResourcesServiceForDoc} from './inabox-resources.js';
import {installInaboxViewerServiceForDoc} from './inabox-viewer.js';
import {installInaboxViewportService} from './inabox-viewport.js';
import {installOwnersServiceForDoc} from '../service/owners-impl.js';
import {installStandardActionsForDoc} from '../service/standard-actions-impl.js';
import {installUrlForDoc} from '../service/url-impl.js';
import {installUrlReplacementsServiceForDoc} from '../service/url-replacements-impl.js';
import {rejectServicePromiseForDoc} from '../service.js';

/**
 * Install ampdoc-level services.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installAmpdocServicesForInabox(ampdoc) {
  // Order is important!
  installIframeMessagingClient(ampdoc.win); // this is an inabox-only service
  installUrlForDoc(ampdoc);
  installDocumentInfoServiceForDoc(ampdoc);
  installInaboxCidService(ampdoc);
  installInaboxViewerServiceForDoc(ampdoc);
  installInaboxViewportService(ampdoc);
  installHiddenObserverForDoc(ampdoc);
  installHistoryServiceForDoc(ampdoc);
  installInaboxResourcesServiceForDoc(ampdoc);
  installOwnersServiceForDoc(ampdoc);
  installInaboxMutatorServiceForDoc(ampdoc);
  installUrlReplacementsServiceForDoc(ampdoc);
  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);
  // For security, Storage is not installed in inabox.
  unsupportedService(ampdoc, 'storage');
  installGlobalNavigationHandlerForDoc(ampdoc);
  installGlobalSubmitListenerForDoc(ampdoc);
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} name
 */
function unsupportedService(ampdoc, name) {
  rejectServicePromiseForDoc(
    ampdoc,
    name,
    new Error('Un-supported service: ' + name)
  );
}
