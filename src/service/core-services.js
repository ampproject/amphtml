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

import {adoptServiceForEmbedDoc} from '../service.js';
import {installActionServiceForDoc} from './action-impl.js';
import {installBatchedXhrService} from './batched-xhr-impl.js';
import {installCidService} from './cid-impl.js';
import {installCryptoService} from './crypto-impl.js';
import {installDocumentInfoServiceForDoc} from './document-info-impl.js';
import {installGlobalNavigationHandlerForDoc} from './navigation.js';
import {installGlobalSubmitListenerForDoc} from '../document-submit.js';
import {installHiddenObserverForDoc} from './hidden-observer-impl.js';
import {installHistoryServiceForDoc} from './history-impl.js';
import {installImg} from '../../builtins/amp-img.js';
import {installInputService} from '../input.js';
import {installLayout} from '../../builtins/amp-layout.js';
import {installMutatorServiceForDoc} from './mutator-impl.js';
import {installOwnersServiceForDoc} from './owners-impl.js';
import {installPixel} from '../../builtins/amp-pixel.js';
import {installPlatformService} from './platform-impl.js';
import {installPreconnectService} from '../preconnect.js';
import {installResourcesServiceForDoc} from './resources-impl.js';
import {installStandardActionsForDoc} from './standard-actions-impl.js';
import {installStorageServiceForDoc} from './storage-impl.js';
import {installTemplatesService} from './template-impl.js';
import {installTimerService} from './timer-impl.js';
import {installUrlForDoc} from './url-impl.js';
import {installUrlReplacementsServiceForDoc} from './url-replacements-impl.js';
import {installViewerServiceForDoc} from './viewer-impl.js';
import {installViewportServiceForDoc} from './viewport/viewport-impl.js';
import {installVsyncService} from './vsync-impl.js';
import {installXhrService} from './xhr-impl.js';

/**
 * Install builtins.
 * @param {!Window} win
 * @restricted
 */
export function installBuiltinElements(win) {
  installImg(win);
  installPixel(win);
  installLayout(win);
}

/**
 * Install runtime-level services.
 * @param {!Window} global Global scope to adopt.
 * @restricted
 */
export function installRuntimeServices(global) {
  installCryptoService(global);
  installBatchedXhrService(global);
  installPlatformService(global);
  installTemplatesService(global);
  installTimerService(global);
  installVsyncService(global);
  installXhrService(global);
  installInputService(global);
  installPreconnectService(global);
}

/**
 * Install ampdoc-level services.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @restricted
 */
export function installAmpdocServices(ampdoc) {
  const isEmbedded = !!ampdoc.getParent();

  // When making changes to this method:
  // 1. Order is important!
  // 2. Consider to install same services to amp-inabox.js
  installUrlForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'documentInfo')
    : installDocumentInfoServiceForDoc(ampdoc);
  // those services are installed in amp-inabox.js
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'cid')
    : installCidService(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'viewer')
    : installViewerServiceForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'viewport')
    : installViewportServiceForDoc(ampdoc);
  installHiddenObserverForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'history')
    : installHistoryServiceForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'resources')
    : installResourcesServiceForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'owners')
    : installOwnersServiceForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'mutator')
    : installMutatorServiceForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'url-replace')
    : installUrlReplacementsServiceForDoc(ampdoc);
  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'storage')
    : installStorageServiceForDoc(ampdoc);
  installGlobalNavigationHandlerForDoc(ampdoc);
  installGlobalSubmitListenerForDoc(ampdoc);
}
