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

import {adoptServiceForEmbedDoc} from '../service';
import {devAssert} from '../log';
import {installActionServiceForDoc} from './action-impl';
import {installBatchedXhrService} from './batched-xhr-impl';
import {installCidService} from './cid-impl';
import {installCryptoService} from './crypto-impl';
import {installDocumentInfoServiceForDoc} from './document-info-impl';
import {installGlobalNavigationHandlerForDoc} from './navigation';
import {installGlobalSubmitListenerForDoc} from '../document-submit';
import {installHiddenObserverForDoc} from './hidden-observer-impl';
import {installHistoryServiceForDoc} from './history-impl';
import {installImg} from '../../builtins/amp-img';
import {installInputService} from '../input';
import {installLayout} from '../../builtins/amp-layout';
import {installMutatorServiceForDoc} from './mutator-impl';
import {installOwnersServiceForDoc} from './owners-impl';
import {installPixel} from '../../builtins/amp-pixel';
import {installPlatformService} from './platform-impl';
import {installPreconnectService} from '../preconnect';
import {installResourcesServiceForDoc} from './resources-impl';
import {installStandardActionsForDoc} from './standard-actions-impl';
import {installStorageServiceForDoc} from './storage-impl';
import {installTemplatesService} from './template-impl';
import {installTimerService} from './timer-impl';
import {installUrlForDoc} from './url-impl';
import {installUrlReplacementsServiceForDoc} from './url-replacements-impl';
import {installViewerServiceForDoc} from './viewer-impl';
import {installViewportServiceForDoc} from './viewport/viewport-impl';
import {installVsyncService} from './vsync-impl';
import {installXhrService} from './xhr-impl';

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
  devAssert(!ampdoc.getParent());
  installAmpdocServicesInternal(ampdoc, /* isEmbedded */ false);
}

/**
 * Install ampdoc-level services for an embedded doc.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @restricted
 */
export function installAmpdocServicesForEmbed(ampdoc) {
  devAssert(!!ampdoc.getParent());
  installAmpdocServicesInternal(ampdoc, /* isEmbedded */ true);
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {boolean} isEmbedded
 */
function installAmpdocServicesInternal(ampdoc, isEmbedded) {
  // This function is constructed to DCE embedded-vs-non-embedded path when
  // a constant value passed in the `isEmbedded` arg.

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
