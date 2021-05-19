/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

import * as coreError from '../src/core/error';
import {reportError} from '../src/error-reporting';
import {setReportError} from '../src/log';
import sinon from 'sinon'; // eslint-disable-line local/no-import

let rethrowAsyncSandbox;

/**
 * Initializes the stubs to prevent async errors from being thrown during tests.
 */
function stubAsyncErrorThrows() {
  rethrowAsyncSandbox = sinon.createSandbox();
  rethrowAsyncSandbox.stub(coreError, 'rethrowAsync').callsFake((...args) => {
    const error = coreError.createErrorVargs.apply(null, args);
    self.__AMP_REPORT_ERROR(error);
    throw error;
  });
}

/**
 * Resets async error behavior to its default.
 */
function restoreAsyncErrorThrows() {
  rethrowAsyncSandbox.restore();
}

/**
 * Used to prevent asynchronous throwing of errors during each test.
 */
export function preventAsyncErrorThrows() {
  self.stubAsyncErrorThrows = stubAsyncErrorThrows;
  self.restoreAsyncErrorThrows = restoreAsyncErrorThrows;
  setReportError(reportError);
  stubAsyncErrorThrows();
}
