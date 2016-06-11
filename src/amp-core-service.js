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

import {installActionService, installActionServiceForShadowRoot} from './service/action-impl';
import {installFramerateService} from './service/framerate-impl';
import {installHistoryService} from './service/history-impl';
import {installResourcesService, installResourcesServiceForShadowRoot} from './service/resources-impl';
import {installStandardActions} from './service/standard-actions-impl';
import {installUrlReplacementsService, installUrlReplacementsServiceForShadowRoot} from './service/url-replacements-impl';
import {installViewerService, installViewerServiceForShadowRoot} from './service/viewer-impl';
import {installViewportService, installViewportServiceForShadowRoot} from './service/viewport-impl';
import {installVsyncService} from './service/vsync-impl';
import {installXhrService} from './service/xhr-impl';


/**
 * Services that can be assumed are always available in AMP.
 * They are installed in amp.js very early in the application lifecyle.
 * @param {!Window} window
 */
export function installCoreServices(window) {
  // XXX
  if (!window.AMP_SHADOW) {
    installViewerService(window);     // DOC
  }
  installVsyncService(window);      // SUPER
  if (!window.AMP_SHADOW) {
    installViewportService(window);   // DOC
  }
  installHistoryService(window);    // SUPER
  if (!window.AMP_SHADOW) {
    installActionService(window);     // DOC
    installResourcesService(window);  // DOC
    installStandardActions(window);   // DOC
  }
  installFramerateService(window);  // SUPER?
  if (!window.AMP_SHADOW) {
    installUrlReplacementsService(window);  // DOC
  }
  installXhrService(window);        // SUPER
}


/**
 * @param {!Window} window
 * @param {!ShadowRoot} shadowRoot
 */
export function installCoreServicesShadowRoot(window, shadowRoot) {
  installViewerServiceForShadowRoot(window, shadowRoot);     // DOC
  installViewportServiceForShadowRoot(window, shadowRoot);   // DOC
  installActionServiceForShadowRoot(window, shadowRoot);     // DOC
  installResourcesServiceForShadowRoot(window, shadowRoot);  // DOC
  //installStandardActions(window);   // DOC  // XXX
  installUrlReplacementsServiceForShadowRoot(window, shadowRoot);  // DOC
}
