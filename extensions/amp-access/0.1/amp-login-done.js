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

/**
 * @fileoverview The endpoint for returning Login dialog. It passes the return
 * code back to AMP runtime using window messaging.
 */

import '../../../src/polyfills';
import {LoginDoneDialog} from './amp-login-done-dialog';
import {bodyAlwaysVisible} from '../../../src/style-installer';
import {initLogConstructor, setReportError} from '../../../src/log';
import {onDocumentReady} from '../../../src/document-ready';
import {reportError} from '../../../src/error';

bodyAlwaysVisible(window);
initLogConstructor();
setReportError(reportError);

onDocumentReady(document, () => {
  new LoginDoneDialog(window).start();
});
