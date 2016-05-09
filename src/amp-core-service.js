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

import {installActionService, uninstallActionService} from './service/action-impl';
import {installFramerateService, uninstallFramerateService} from './service/framerate-impl';
import {installHistoryService, uninstallHistoryService} from './service/history-impl';
import {installResourcesService, uninstallResourcesService} from './service/resources-impl';
import {installStandardActions, uninstallStandardActions} from './service/standard-actions-impl';
import {installUrlReplacementsService, uninstallUrlReplacementsService} from './service/url-replacements-impl';
import {installViewerService, uninstallViewerService} from './service/viewer-impl';
import {installViewportService, uninstallViewportService} from './service/viewport-impl';
import {installVsyncService, uninstallVsyncService} from './service/vsync-impl';
import {installXhrService, uninstallXhrService} from './service/xhr-impl';


/**
 * Services that can be assumed are always available in AMP.
 * They are installed in amp.js very early in the application lifecyle.
 * @param {!Window} window
 */
export function installCoreServices(window) {
  installViewerService(window);
  installViewportService(window);
  installHistoryService(window);
  installVsyncService(window);
  installActionService(window);
  installResourcesService(window);
  installStandardActions(window);
  installFramerateService(window);
  installUrlReplacementsService(window);
  installXhrService(window);
}

export function uninstallCoreServices(window) {
  uninstallViewerService(window);
  uninstallViewportService(window);
  uninstallHistoryService(window);
  uninstallVsyncService(window);
  uninstallActionService(window);
  uninstallResourcesService(window);
  uninstallStandardActions(window);
  uninstallFramerateService(window);
  uninstallUrlReplacementsService(window);
  uninstallXhrService(window);
}