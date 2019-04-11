/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * The entry point for AMP inabox lite runtime (amp4ads-lite-v0.js).
 */

import '../polyfills';
import {
  Navigation,
  installGlobalNavigationHandlerForDoc,
} from '../service/navigation';
import {Services} from '../services';
import {
  adopt,
  installBuiltins,
  installRuntimeServices,
} from '../runtime';
import {cssText} from '../../build/css';
import {fontStylesheetTimeout} from '../font-stylesheet-timeout';
import {getMode} from '../mode';
import {installDocService} from '../service/ampdoc-impl';
import {installErrorReporting} from '../error';
import {installIframeMessagingClient} from './inabox-iframe-messaging-client';
import {installInaboxViewportService} from './inabox-viewport';
import {installPerformanceService} from '../service/performance-impl';
import {
  installStylesForDoc,
  makeBodyVisible,
  makeBodyVisibleRecovery,
} from '../style-installer';
import {installViewerServiceForDoc} from '../service/viewer-impl';
import {registerIniLoadListener} from './utils';
import {stubElementsForDoc} from '../service/custom-element-registry';
import {version} from '../internal-version';

import {installActionServiceForDoc} from '../service/action-impl';
import {installCidService} from '../service/cid-impl';
import {installDocumentInfoServiceForDoc} from '../service/document-info-impl';
import {installGlobalSubmitListenerForDoc} from '../document-submit';
import {installHistoryServiceForDoc} from '../service/history-impl';
import {installResourcesServiceForDoc} from '../service/resources-impl';
import {installStandardActionsForDoc} from '../service/standard-actions-impl';
import {installStorageServiceForDoc} from '../service/storage-impl';
import {installUrlForDoc} from '../service/url-impl';
import {
  installUrlReplacementsServiceForDoc,
} from '../service/url-replacements-impl';

getMode(self).runtime = 'inabox';

/** @type {!../service/ampdoc-impl.AmpDocService} */
let ampdocService;
// We must under all circumstances call makeBodyVisible.
// It is much better to have AMP tags not rendered than having
// a completely blank page.
try {
  // Should happen first.
  installErrorReporting(self); // Also calls makeBodyVisibleRecovery on errors.

  // Declare that this runtime will support a single root doc. Should happen
  // as early as possible.
  installDocService(self, /* isSingleDoc */ true); // TODO: to be simplified
  ampdocService = Services.ampdocServiceFor(self);
} catch (e) {
  // In case of an error call this.
  makeBodyVisibleRecovery(self.document); // TODO: to be simplified
  throw e;
}

/** @const {!../service/ampdoc-impl.AmpDoc} */
const ampdoc = ampdocService.getAmpDoc(self.document);
installPerformanceService(self); // TODO: to be removed

self.document.documentElement.classList.add('i-amphtml-inabox');
const fullCss = cssText
    + 'html.i-amphtml-inabox{width:100%!important;height:100%!important}';
installStylesForDoc(ampdoc, fullCss, () => {
  // Core services.
  installRuntimeServices(self);
  fontStylesheetTimeout(self);
  installIframeMessagingClient(self); // TODO: to be removed
  installAmpdocServices(ampdoc);
  // We need the core services (viewer/resources) to start instrumenting
  registerIniLoadListener(ampdoc);

  // Builtins.
  installBuiltins(self);
  adopt(self);

  // Pre-stub already known elements.
  stubElementsForDoc(ampdoc);

  Navigation.installAnchorClickInterceptor(ampdoc, self);
  makeBodyVisible(self.document); // TODO: to be simplified

  Services.resourcesForDoc(ampdoc).ampInitComplete();
}, /* opt_isRuntimeCss */ true, /* opt_ext */ 'amp-runtime');

// Output a message to the console and add an attribute to the <html>
// tag to give some information that can be used in error reports.
// (At least by sophisticated users).
if (self.console) {
  (console.info || console.log).call(console,
      `Powered by AMP ⚡ HTML – Version ${version()}`,
      self.location.href);
}
self.document.documentElement.setAttribute('amp-version', version());

/**
 * Install ampdoc-level services.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Object<string, string>=} opt_initParams
 */
function installAmpdocServices(ampdoc, opt_initParams) {
  installUrlForDoc(ampdoc);
  installCidService(ampdoc); // TODO: to be simplified
  installDocumentInfoServiceForDoc(ampdoc);
  installViewerServiceForDoc(ampdoc, opt_initParams); // TODO: to be simplified
  installInaboxViewportService(ampdoc); // TODO: to be simplified
  installHistoryServiceForDoc(ampdoc);
  installResourcesServiceForDoc(ampdoc); // TODO: to be simplified
  installUrlReplacementsServiceForDoc(ampdoc);
  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);
  installStorageServiceForDoc(ampdoc); // TODO: to be simplified
  installGlobalNavigationHandlerForDoc(ampdoc);
  installGlobalSubmitListenerForDoc(ampdoc);
}
