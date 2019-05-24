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

import {adoptServiceForEmbedDoc} from './service';
import {installActionServiceForDoc} from './service/action-impl';
import {installCidService} from './service/cid-impl';
import {installDocumentInfoServiceForDoc} from './service/document-info-impl';
import {installGlobalNavigationHandlerForDoc} from './service/navigation';
import {installGlobalSubmitListenerForDoc} from './document-submit';
import {installHiddenObserverForDoc} from './service/hidden-observer-impl';
import {installHistoryServiceForDoc} from './service/history-impl';
import {installResourcesServiceForDoc} from './service/resources-impl';
import {installStandardActionsForDoc} from './service/standard-actions-impl';
import {installStorageServiceForDoc} from './service/storage-impl';
import {installUrlForDoc} from './service/url-impl';
import {installUrlReplacementsServiceForDoc} from './service/url-replacements-impl';
import {installViewerServiceForDoc} from './service/viewer-impl';
import {installViewportServiceForDoc} from './service/viewport/viewport-impl';


/**
 * Install ampdoc-level services.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Object<string, string>=} opt_initParams
 */
export function install(ampdoc, opt_initParams) {
  // Order is important!

  // QQQQQQ: all service passthrough to embed are bad here. some are near-critical.
  // remove them asap.

  const isEmbedded = !!ampdoc.getEmbedder();

  installUrlForDoc(ampdoc);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'cid')
      : installCidService(ampdoc);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'documentInfo')
      : installDocumentInfoServiceForDoc(ampdoc);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'viewer')
      : installViewerServiceForDoc(ampdoc, opt_initParams);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'viewport')
      : installViewportServiceForDoc(ampdoc);

  installHiddenObserverForDoc(ampdoc);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'history')
      : installHistoryServiceForDoc(ampdoc);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'resources')
      : installResourcesServiceForDoc(ampdoc);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'url-replace')
      : installUrlReplacementsServiceForDoc(ampdoc);

  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);

  isEmbedded ? adoptServiceForEmbedDoc(ampdoc, 'storage')
      : installStorageServiceForDoc(ampdoc);

  installGlobalNavigationHandlerForDoc(ampdoc);
  installGlobalSubmitListenerForDoc(ampdoc);
}
