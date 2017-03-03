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

import {getMode} from '../mode';
import {calculateExtensionScriptUrl} from '../service/extension-location';
import {installWorkerErrorReporting} from '../worker-error-reporting';

installWorkerErrorReporting('sw');

/**
 * Import the "core" entry point for the AMP CDN Service Worker. This shell
 * file is kept intentionally small, so that checking if it has changed (and
 * thus, if a new SW must be installed) will be very fast.
 */
const url = calculateExtensionScriptUrl(self.location, 'cache-service-worker',
    getMode().localDev);
importScripts(url);
