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

import {installActionService} from './service/action-impl';
import {installFramerateService} from './service/framerate-impl';
import {installHistoryService} from './service/history-impl';
import {installResourcesService} from './service/resources-impl';
import {installStandardActions} from './service/standard-actions-impl';
import {installUrlReplacementsService} from './service/url-replacements-impl';
import {installViewerService} from './service/viewer-impl';
import {installViewportService} from './service/viewport-impl';
import {installVsyncService} from './service/vsync-impl';
import {installXhrService} from './service/xhr-impl';


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
